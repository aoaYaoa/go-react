package messaging

import (
	"context"
	"time"
)

type OutboxEvent struct {
	ID          string
	Key         string
	Payload     []byte
	Attempts    int
	NextRetryAt time.Time
	LastError   string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	SentAt      *time.Time
}

type OutboxStore interface {
	Enqueue(ctx context.Context, event OutboxEvent) (OutboxEvent, error)
	ListPending(ctx context.Context, now time.Time, limit int) ([]OutboxEvent, error)
	MarkSent(ctx context.Context, id string) error
	MarkRetry(ctx context.Context, id string, nextRetryAt time.Time, lastErr string) error
	HealthCheck(ctx context.Context) error
}
