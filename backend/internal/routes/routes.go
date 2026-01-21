package routes

import (
	"backend/internal/config"
	"backend/internal/handlers"
	"backend/internal/middlewares"

	"github.com/gin-gonic/gin"
)

type Router struct {
	handlers *handlers.Handlers
}

// NewRouter 创建路由实例
func NewRouter(h *handlers.Handlers) *Router {
	return &Router{
		handlers: h,
	}
}

// SetupRoutes 设置路由
func (r *Router) SetupRoutes(engine *gin.Engine) {
	// 初始化IP访问控制
	middlewares.InitIPAccessConfig(&middlewares.IPAccessConfig{
		Whitelist:       config.GetIPWhitelist(),
		Blacklist:       config.GetIPBlacklist(),
		EnableWhitelist: config.AppConfig.EnableIPWhitelist,
		EnableBlacklist: config.AppConfig.EnableIPBlacklist,
	})

	// 构建全局中间件列表
	globalMiddlewares := []gin.HandlerFunc{
		middlewares.RequestID(),                        // 1. 生成请求ID
		middlewares.Logger(),                           // 2. 记录日志
		middlewares.Recovery(),                         // 3. 错误恢复
		middlewares.CORS(config.AppConfig.CORSOrigins), // 4. 跨域支持
		middlewares.Security(),                         // 5. 安全响应头
		middlewares.NoCache(),                          // 6. 禁用缓存（API接口）
		middlewares.ContentType(),                      // 7. 内容类型检查
		middlewares.RateLimit(100, 200),                // 8. 限流：100 req/s, burst 200
	}

	// 根据配置添加IP访问控制中间件
	if config.AppConfig.EnableIPWhitelist || config.AppConfig.EnableIPBlacklist {
		globalMiddlewares = append(globalMiddlewares, middlewares.IPAccessMiddleware()) // 9. IP访问控制
	}

	globalMiddlewares = append(globalMiddlewares, middlewares.Compression()) // 响应压缩

	// 根据配置添加签名验证中间件
	if config.AppConfig.EnableSignature {
		globalMiddlewares = append(globalMiddlewares,
			middlewares.DecryptionMiddleware(), // 请求解密
			middlewares.SignatureMiddleware(),  // API 签名验证
			middlewares.EncryptionMiddleware(), // 响应加密
		)
	}

	// 应用全局中间件
	engine.Use(globalMiddlewares...)

	// 健康检查路由
	engine.GET("/health", r.handlers.Health.Check)

	// API 路由组
	api := engine.Group("/api")
	{
		// 健康检查
		api.GET("/health", r.handlers.Health.Check)

		// 认证路由（公开访问）
		auth := api.Group("/auth")
		{
			auth.POST("/register", r.handlers.User.Register)
			auth.POST("/login", r.handlers.User.Login)
		}

		// 任务管理路由（公开访问，无需认证）
		tasks := api.Group("/tasks")
		{
			tasks.GET("", r.handlers.Task.GetAllTasks)
			tasks.GET("/:id", r.handlers.Task.GetTask)
			tasks.POST("", r.handlers.Task.CreateTask)
			tasks.PUT("/:id", r.handlers.Task.UpdateTask)
			tasks.DELETE("/:id", r.handlers.Task.DeleteTask)
			tasks.PATCH("/:id/toggle", r.handlers.Task.ToggleTask)
		}

		// 需要认证的路由
		user := api.Group("/user")
		user.Use(middlewares.AuthMiddleware())
		{
			user.GET("/profile", r.handlers.User.GetProfile)
		}

		// 管理员路由
		admin := api.Group("/admin")
		admin.Use(
			middlewares.AuthMiddleware(),
			middlewares.RoleBasedAuth([]string{"admin"}),
		)
		{
			admin.GET("/users", r.handlers.User.ListUsers)
		}
	}

	// 404 处理
	engine.NoRoute(func(c *gin.Context) {
		requestID := middlewares.GetRequestID(c)
		c.JSON(404, gin.H{
			"success":   false,
			"error":     "路由不存在",
			"requestID": requestID,
		})
	})
}
