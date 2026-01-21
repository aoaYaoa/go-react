package main

import (
	"backend/internal/config"
	"backend/internal/container"
	"backend/internal/database"
	"backend/pkg/utils/logger"
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

// @title Go React App API
// @version 1.0
// @description This is a sample server for Go React App.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization

func main() {
	// 初始化配置
	config.Init()

	// 初始化日志
	logger.Init()

	// 设置 Gin 模式
	gin.SetMode(config.AppConfig.ServerMode)

	// 创建 Gin 引擎
	r := gin.New()

	// 初始化数据库
	dbManager, err := database.NewManager(config.AppConfig)
	if err != nil {
		logger.Errorf("数据库初始化失败: %v", err)
		panic(err)
	}
	defer dbManager.Close() // 确保程序退出时关闭数据库连接

	// 执行数据库迁移（自动创建表结构）
	if err := dbManager.Migrate(); err != nil {
		logger.Errorf("数据库迁移失败: %v", err)
		panic(err)
	}

	// 初始化依赖容器
	appContainer, err := container.InitializeContainer(dbManager)
	if err != nil {
		logger.Errorf("依赖注入容器初始化失败: %v", err)
		panic(err)
	}
	appContainer.Router.SetupRoutes(r)

	// 配置可信代理 (消除启动警告)
	// 在生产环境中，应该设置为实际的负载均衡器或反向代理的 IP
	// 这里设置为 nil 表示不信任任何代理，或者设置为 "*" 信任所有（仅限内网安全环境）
	if err := r.SetTrustedProxies(nil); err != nil {
		logger.Warnf("设置可信代理失败: %v", err)
	}

	// 启动服务器配置
	addr := ":" + config.AppConfig.ServerPort
	srv := &http.Server{
		Addr:    addr,
		Handler: r,
	}

	// 在 goroutine 中启动服务器
	go func() {
		logger.Infof("服务器启动在 http://localhost%s", addr)
		logger.Infof("数据库类型: %s", dbManager.GetDatabaseType())
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Errorf("服务器启动失败: %v", err)
			panic(err)
		}
	}()

	// 等待中断信号以优雅地关闭服务器（设置 5 秒的超时时间）
	quit := make(chan os.Signal, 1)
	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can't be caught, so don't need to add it
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("正在关闭服务器...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Errorf("服务器强制关闭: %v", err)
	}

	logger.Info("服务器已退出")
}
