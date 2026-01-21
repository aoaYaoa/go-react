package services

import (
	"context"
	"time"
)

type HealthService interface {
	CheckHealth(ctx context.Context) map[string]interface{}
}

type healthServiceImpl struct{}

// NewHealthService 创建健康检查服务实例
func NewHealthService() HealthService {
	return &healthServiceImpl{}
}

func (s *healthServiceImpl) CheckHealth(ctx context.Context) map[string]interface{} {
	return map[string]interface{}{
		"status":    "ok",
		"message":   "服务器运行正常",
		"service":   "go-gin-api",
		"timestamp": time.Now().Format(time.RFC3339),
	}
}
