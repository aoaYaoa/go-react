package handlers

import (
	"backend/internal/services"
	"backend/pkg/utils/logger"
	"backend/pkg/utils/response"

	"github.com/gin-gonic/gin"
)

type HealthHandler interface {
	Check(c *gin.Context)
}

type healthHandler struct {
	service services.HealthService
}

// NewHealthHandler 创建健康检查处理器实例
func NewHealthHandler(service services.HealthService) HealthHandler {
	return &healthHandler{
		service: service,
	}
}

// Check 健康检查
func (h *healthHandler) Check(c *gin.Context) {
	logger.Info("执行健康检查请求")
	healthData := h.service.CheckHealth(c.Request.Context())

	response.Success(c, healthData)
}
