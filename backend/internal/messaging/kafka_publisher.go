package messaging

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/segmentio/kafka-go"
)

// KafkaConfig 定义 Kafka 发布配置。
type KafkaConfig struct {
	Brokers      []string
	Topic        string
	CAFile       string
	CertFile     string
	KeyFile      string
	RequireTLS   bool
	WriteTimeout time.Duration
}

type kafkaPublisher struct {
	writer *kafka.Writer
}

// NewKafkaPublisher 创建 Kafka 发布器。
func NewKafkaPublisher(cfg KafkaConfig) (EventPublisher, error) {
	if len(cfg.Brokers) == 0 {
		return nil, errors.New("kafka brokers is empty")
	}
	if strings.TrimSpace(cfg.Topic) == "" {
		return nil, errors.New("kafka topic is empty")
	}

	transport := &kafka.Transport{}
	if cfg.RequireTLS {
		tlsConfig, err := loadTLSConfig(cfg.CAFile, cfg.CertFile, cfg.KeyFile)
		if err != nil {
			return nil, err
		}
		transport.TLS = tlsConfig
	}

	timeout := cfg.WriteTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}

	writer := &kafka.Writer{
		Addr:         kafka.TCP(cfg.Brokers...),
		Topic:        cfg.Topic,
		RequiredAcks: kafka.RequireAll,
		Balancer:     &kafka.Hash{},
		Transport:    transport,
		WriteTimeout: timeout,
	}

	return &kafkaPublisher{writer: writer}, nil
}

func (p *kafkaPublisher) Publish(ctx context.Context, key string, payload []byte) error {
	if ctx == nil {
		ctx = context.Background()
	}

	msg := kafka.Message{
		Key:   []byte(key),
		Value: payload,
		Time:  time.Now().UTC(),
	}
	return p.writer.WriteMessages(ctx, msg)
}

func (p *kafkaPublisher) Close() error {
	return p.writer.Close()
}

func loadTLSConfig(caFile, certFile, keyFile string) (*tls.Config, error) {
	if strings.TrimSpace(caFile) == "" || strings.TrimSpace(certFile) == "" || strings.TrimSpace(keyFile) == "" {
		return nil, errors.New("kafka TLS files are required when TLS is enabled")
	}

	caPEM, err := os.ReadFile(caFile)
	if err != nil {
		return nil, fmt.Errorf("read kafka ca file failed: %w", err)
	}

	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return nil, fmt.Errorf("load kafka client cert/key failed: %w", err)
	}

	pool := x509.NewCertPool()
	if ok := pool.AppendCertsFromPEM(caPEM); !ok {
		return nil, errors.New("parse kafka ca file failed")
	}

	return &tls.Config{
		MinVersion:   tls.VersionTLS12,
		RootCAs:      pool,
		Certificates: []tls.Certificate{cert},
	}, nil
}
