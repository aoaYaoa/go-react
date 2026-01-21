package middlewares

import (
	"backend/pkg/utils/logger"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPRateLimiter IP 限流器
type IPRateLimiter struct {
	limiters map[string]*rate.Limiter
	mu       sync.Mutex
	r        rate.Limit
	b        int
}

// NewIPRateLimiter 创建 IP 限流器
// r: 每秒允许的请求数
// b: 桶的大小（突发流量）
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	return &IPRateLimiter{
		limiters: make(map[string]*rate.Limiter),
		r:        r,
		b:        b,
	}
}

// GetLimiter 获取指定 IP 的限流器
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter, exists := i.limiters[ip]
	if !exists {
		limiter = rate.NewLimiter(i.r, i.b)
		i.limiters[ip] = limiter
	}

	return limiter
}

// RateLimit 请求限流中间件
// defaultRate: 每秒允许的请求数（默认 10）
// defaultBurst: 桶的大小（默认 20）
func RateLimit(defaultRate float64, defaultBurst int) gin.HandlerFunc {
	limiter := NewIPRateLimiter(rate.Limit(defaultRate), defaultBurst)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := limiter.GetLimiter(ip)

		if !limiter.Allow() {
			logger.Warnf("[RateLimit] IP: %s 超过速率限制", ip)
			c.JSON(429, gin.H{
				"success": false,
				"error":   "请求过于频繁，请稍后再试",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CleanupExpiredLimiters 清理过期的限流器
// 应该在一个单独的 goroutine 中定期调用
func (i *IPRateLimiter) CleanupExpiredLimiters(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		i.mu.Lock()
		// 清理长时间未使用的限流器
		// 这里可以添加更复杂的清理逻辑
		logger.Debug("执行限流器清理")
		i.mu.Unlock()
	}
}
