package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/pkg/utils/logger"
	"fmt"
	"os"
)

// 数据库迁移脚本
// 用于创建或更新数据库表结构
func main() {
	fmt.Println("==========================================")
	fmt.Println("  数据库迁移脚本")
	fmt.Println("==========================================")
	fmt.Println()

	// 初始化配置
	config.Init()
	cfg := config.AppConfig

	// 初始化日志
	logger.Init()

	fmt.Printf("📋 数据库配置:\n")
	fmt.Printf("   类型: %s\n", cfg.DatabaseType)
	fmt.Printf("   主机: %s\n", cfg.DatabaseHost)
	fmt.Printf("   端口: %s\n", cfg.DatabasePort)
	fmt.Printf("   数据库: %s\n", cfg.DatabaseName)
	fmt.Printf("   用户: %s\n", cfg.DatabaseUser)
	fmt.Println()

	// 创建数据库管理器
	fmt.Println("🔌 连接数据库...")
	dbManager, err := database.NewManager(cfg)
	if err != nil {
		fmt.Printf("❌ 数据库连接失败: %v\n", err)
		os.Exit(1)
	}
	defer dbManager.Close()

	fmt.Println("✅ 数据库连接成功")
	fmt.Println()

	// 执行迁移
	fmt.Println("🚀 开始执行数据库迁移...")
	fmt.Println()

	if err := dbManager.Migrate(); err != nil {
		fmt.Printf("❌ 数据库迁移失败: %v\n", err)
		os.Exit(1)
	}

	fmt.Println()
	fmt.Println("==========================================")
	fmt.Println("  ✅ 数据库迁移完成！")
	fmt.Println("==========================================")
	fmt.Println()
	fmt.Println("已创建/更新的表:")
	fmt.Println("  用户与权限:")
	fmt.Println("    - users (用户表)")
	fmt.Println("    - roles (角色表)")
	fmt.Println("    - menus (菜单表)")
	fmt.Println("    - user_roles (用户角色关联表)")
	fmt.Println("    - role_menus (角色菜单关联表)")
	fmt.Println("    - system_logs (系统日志表)")
	fmt.Println()
	fmt.Println("  航班追踪:")
	fmt.Println("    - airports (机场表)")
	fmt.Println("    - airlines (航空公司表)")
	fmt.Println("    - aircrafts (飞机表)")
	fmt.Println("    - flights (航班表)")
	fmt.Println("    - flight_positions (航班实时位置表)")
	fmt.Println("    - flight_routes (航班航线表)")
	fmt.Println("    - flight_history (航班历史记录表)")
	fmt.Println()
	fmt.Println("  无人机管理:")
	fmt.Println("    - operators (运营商表)")
	fmt.Println("    - drones (无人机设备表)")
	fmt.Println("    - drone_missions (无人机飞行任务表)")
	fmt.Println("    - drone_positions (无人机实时位置表)")
	fmt.Println("    - drone_flight_logs (无人机飞行日志表)")
	fmt.Println("    - drone_incidents (无人机事件/事故表)")
	fmt.Println("    - no_fly_zones (禁飞区表)")
	fmt.Println()
	fmt.Println("  其他:")
	fmt.Println("    - tasks (任务表)")
	fmt.Println()
}
