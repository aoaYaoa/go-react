package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/pkg/utils/logger"
	"log"
)

func main() {
	log.Println("检查数据库表...")

	// 加载配置
	config.Init()
	cfg := config.AppConfig

	// 初始化日志
	logger.Init()

	// 初始化数据库
	dbManager, err := database.NewManager(cfg)
	if err != nil {
		log.Fatalf("初始化数据库失败: %v", err)
	}
	defer dbManager.Close()

	db := dbManager.GetDB()

	// 查询所有表
	var tables []string
	db.Raw("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename").Scan(&tables)

	log.Println("\n==========================================")
	log.Println("  数据库表列表")
	log.Println("==========================================")
	for i, table := range tables {
		log.Printf("%d. %s", i+1, table)
	}
	log.Printf("\n总计: %d 个表", len(tables))
	log.Println("==========================================")
}
