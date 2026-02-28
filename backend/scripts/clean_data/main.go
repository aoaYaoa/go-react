package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/pkg/utils/logger"
	"fmt"
	"os"
)

func main() {
	fmt.Println("==========================================")
	fmt.Println("  清空数据表")
	fmt.Println("==========================================")
	fmt.Println()

	config.Init()
	cfg := config.AppConfig

	logger.Init()

	dbManager, err := database.NewManager(cfg)
	if err != nil {
		fmt.Printf("数据库连接失败: %v\n", err)
		os.Exit(1)
	}
	defer dbManager.Close()

	db := dbManager.GetDB()

	// 清空表（保留用户和菜单相关表）
	tables := []string{
		"no_fly_zones",
		"drone_incidents",
		"drone_flight_logs",
		"drone_missions",
		"drone_positions",
		"drones",
		"operators",
		"flight_histories",
		"flight_positions",
		"flight_routes",
		"flights",
		"aircrafts",
		"airlines",
		"airports",
	}

	for _, table := range tables {
		fmt.Printf("清空表: %s...\n", table)
		if err := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table)).Error; err != nil {
			fmt.Printf("  警告: %v\n", err)
		} else {
			fmt.Printf("  完成\n")
		}
	}

	fmt.Println()
	fmt.Println("==========================================")
	fmt.Println("  清空完成！")
	fmt.Println("==========================================")
}
