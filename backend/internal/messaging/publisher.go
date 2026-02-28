package messaging

import "context"

// EventPublisher 统一事件发布接口。
type EventPublisher interface {
	Publish(ctx context.Context, key string, payload []byte) error
	Close() error
}
