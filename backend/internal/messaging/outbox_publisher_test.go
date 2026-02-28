package messaging

import (
	"backend/pkg/utils/logger"
	"context"
	"errors"
	"sync"
	"testing"
	"time"
)

type memoryOutboxStore struct {
	mu     sync.Mutex
	events []OutboxEvent
}

func (s *memoryOutboxStore) Enqueue(ctx context.Context, event OutboxEvent) (OutboxEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	event.ID = "id-1"
	s.events = append(s.events, event)
	return event, nil
}

func (s *memoryOutboxStore) ListPending(ctx context.Context, now time.Time, limit int) ([]OutboxEvent, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]OutboxEvent, len(s.events))
	copy(out, s.events)
	return out, nil
}

func (s *memoryOutboxStore) MarkSent(ctx context.Context, id string) error {
	return nil
}

func (s *memoryOutboxStore) MarkRetry(ctx context.Context, id string, nextRetryAt time.Time, lastErr string) error {
	return nil
}

func (s *memoryOutboxStore) HealthCheck(ctx context.Context) error {
	return nil
}

type flakyOutboxTarget struct {
	mu       sync.Mutex
	calls    int
	failures int
}

func (f *flakyOutboxTarget) Publish(ctx context.Context, key string, payload []byte) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.calls++
	if f.calls <= f.failures {
		return errors.New("temporary publish failure")
	}
	return nil
}

func (f *flakyOutboxTarget) HealthCheck(ctx context.Context) error { return nil }
func (f *flakyOutboxTarget) Close() error                          { return nil }

func TestOutboxPublisher_PersistThenRetryUntilSuccess(t *testing.T) {
	logger.Init()

	store := &memoryOutboxStore{}
	target := &flakyOutboxTarget{failures: 2}

	pub := NewOutboxPublisher(store, target, OutboxPublisherConfig{
		PollInterval:    20 * time.Millisecond,
		BatchSize:       10,
		PublishTimeout:  200 * time.Millisecond,
		MaxRetries:      3,
		RetryBackoff:    10 * time.Millisecond,
		ShutdownTimeout: time.Second,
	})
	defer pub.Close()

	if err := pub.Publish(context.Background(), "user-1", []byte("payload")); err != nil {
		t.Fatalf("expected enqueue success, got error: %v", err)
	}

	deadline := time.Now().Add(1500 * time.Millisecond)
	for time.Now().Before(deadline) {
		target.mu.Lock()
		calls := target.calls
		target.mu.Unlock()
		if calls >= 3 {
			return
		}
		time.Sleep(20 * time.Millisecond)
	}

	target.mu.Lock()
	calls := target.calls
	target.mu.Unlock()
	t.Fatalf("expected at least 3 publish attempts, got %d", calls)
}
