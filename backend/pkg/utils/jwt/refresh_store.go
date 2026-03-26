package jwt

import (
	"bufio"
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"math"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"
)

// RefreshStore refresh token 持久化接口。
// 实现：Redis（生产）或内存（降级/测试）。
type RefreshStore interface {
	// Save 保存 refresh token，ttl 为有效期。
	Save(ctx context.Context, token string, userID string, ttl time.Duration) error
	// Get 查询 userID，token 不存在或已过期时返回 ""。
	Get(ctx context.Context, token string) (userID string, err error)
	// Delete 主动吊销 token。
	Delete(ctx context.Context, token string) error
}

// ---- Redis 实现 ----

const (
	defaultRefreshKeyPrefix = "refresh:"
	redisRefreshTimeout     = 5 * time.Second
)

type redisRefreshStore struct {
	addr      string
	username  string
	password  string
	db        int
	useTLS    bool
	keyPrefix string
}

// RefreshStoreConfig Redis 配置。
type RefreshStoreConfig struct {
	Addr      string
	Username  string
	Password  string
	DB        int
	UseTLS    bool
	KeyPrefix string // 默认 "refresh:"
}

// NewRedisRefreshStore 创建 Redis refresh token 存储。
// addr 为空时返回 error，调用方应回退到内存存储。
func NewRedisRefreshStore(cfg RefreshStoreConfig) (RefreshStore, error) {
	if strings.TrimSpace(cfg.Addr) == "" {
		return nil, errors.New("redis address is required")
	}
	prefix := cfg.KeyPrefix
	if prefix == "" {
		prefix = defaultRefreshKeyPrefix
	}
	s := &redisRefreshStore{
		addr:      cfg.Addr,
		username:  cfg.Username,
		password:  cfg.Password,
		db:        cfg.DB,
		useTLS:    cfg.UseTLS,
		keyPrefix: prefix,
	}
	if err := s.ping(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *redisRefreshStore) key(token string) string {
	return s.keyPrefix + token
}

func (s *redisRefreshStore) Save(_ context.Context, token, userID string, ttl time.Duration) error {
	ms := int64(math.Ceil(float64(ttl) / float64(time.Millisecond)))
	if ms < 1 {
		ms = 1
	}
	_, err := s.exec("SET", s.key(token), userID, "PX", strconv.FormatInt(ms, 10))
	return err
}

func (s *redisRefreshStore) Get(_ context.Context, token string) (string, error) {
	resp, err := s.exec("GET", s.key(token))
	if err != nil {
		return "", err
	}
	if resp.isNil {
		return "", nil
	}
	return resp.str, nil
}

func (s *redisRefreshStore) Delete(_ context.Context, token string) error {
	_, err := s.exec("DEL", s.key(token))
	return err
}

func (s *redisRefreshStore) ping() error {
	_, err := s.exec("PING")
	return err
}

func (s *redisRefreshStore) dial() (net.Conn, error) {
	if s.useTLS {
		//nolint:gosec
		return tls.DialWithDialer(
			&net.Dialer{Timeout: redisRefreshTimeout},
			"tcp", s.addr,
			&tls.Config{},
		)
	}
	return net.DialTimeout("tcp", s.addr, redisRefreshTimeout)
}

func (s *redisRefreshStore) exec(args ...string) (*refreshRedisResp, error) {
	conn, err := s.dial()
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	conn.SetDeadline(time.Now().Add(redisRefreshTimeout)) //nolint:errcheck

	var sb strings.Builder
	if s.password != "" {
		if s.username != "" {
			writeRefreshCmd(&sb, "AUTH", s.username, s.password)
		} else {
			writeRefreshCmd(&sb, "AUTH", s.password)
		}
	}
	if s.db != 0 {
		writeRefreshCmd(&sb, "SELECT", strconv.Itoa(s.db))
	}
	writeRefreshCmd(&sb, args...)

	if _, err := fmt.Fprint(conn, sb.String()); err != nil {
		return nil, err
	}

	reader := bufio.NewReader(conn)
	if s.password != "" {
		if _, err := readRefreshResp(reader); err != nil {
			return nil, err
		}
	}
	if s.db != 0 {
		if _, err := readRefreshResp(reader); err != nil {
			return nil, err
		}
	}
	return readRefreshResp(reader)
}

func writeRefreshCmd(sb *strings.Builder, args ...string) {
	fmt.Fprintf(sb, "*%d\r\n", len(args))
	for _, a := range args {
		fmt.Fprintf(sb, "$%d\r\n%s\r\n", len(a), a)
	}
}

type refreshRedisResp struct {
	str   string
	isNil bool
}

func readRefreshResp(reader *bufio.Reader) (*refreshRedisResp, error) {
	line, err := reader.ReadString('\n')
	if err != nil {
		return nil, err
	}
	if len(line) < 3 || !strings.HasSuffix(line, "\r\n") {
		return nil, errors.New("invalid redis response")
	}
	prefix := line[0]
	payload := strings.TrimSuffix(line[1:], "\r\n")
	switch prefix {
	case '+', ':':
		return &refreshRedisResp{str: payload}, nil
	case '-':
		return nil, errors.New(payload)
	case '$':
		sz, err := strconv.Atoi(payload)
		if err != nil {
			return nil, err
		}
		if sz == -1 {
			return &refreshRedisResp{isNil: true}, nil
		}
		buf := make([]byte, sz+2)
		if _, err := io.ReadFull(reader, buf); err != nil {
			return nil, err
		}
		return &refreshRedisResp{str: string(buf[:sz])}, nil
	default:
		return nil, fmt.Errorf("unsupported redis response type: %q", string(prefix))
	}
}

// ---- 内存实现（Redis 不可用时降级）----

type memRefreshStore struct {
	mu    sync.RWMutex
	items map[string]memRefreshEntry
}

type memRefreshEntry struct {
	userID    string
	expiredAt time.Time
}

// NewMemRefreshStore 创建内存 refresh token 存储（测试/降级用）。
func NewMemRefreshStore() RefreshStore {
	return &memRefreshStore{items: make(map[string]memRefreshEntry)}
}

func (m *memRefreshStore) Save(_ context.Context, token, userID string, ttl time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[token] = memRefreshEntry{userID: userID, expiredAt: time.Now().Add(ttl)}
	return nil
}

func (m *memRefreshStore) Get(_ context.Context, token string) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	entry, ok := m.items[token]
	if !ok || time.Now().After(entry.expiredAt) {
		return "", nil
	}
	return entry.userID, nil
}

func (m *memRefreshStore) Delete(_ context.Context, token string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.items, token)
	return nil
}
