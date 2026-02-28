package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/logger"
	"fmt"
	"os"
)

func main() {
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

	// 查询角色
	var roles []models.Role
	db.Order("created_at").Find(&roles)

	fmt.Println("==========================================")
	fmt.Println("  角色列表")
	fmt.Println("==========================================")
	for _, role := range roles {
		fmt.Printf("- %s (%s): %s\n", role.Name, role.Code, role.Description)
	}

	// 查询菜单
	var menus []models.Menu
	db.Where("parent_id IS NULL").Order("sort").Find(&menus)

	fmt.Println("\n==========================================")
	fmt.Println("  一级菜单列表")
	fmt.Println("==========================================")
	for _, menu := range menus {
		fmt.Printf("%d. %s (%s)\n", menu.Sort, menu.Name, menu.Path)

		// 查询子菜单
		var children []models.Menu
		db.Where("parent_id = ?", menu.ID).Order("sort").Find(&children)
		for _, child := range children {
			fmt.Printf("   %d.%d %s (%s)\n", menu.Sort, child.Sort, child.Name, child.Path)
		}
	}

	// 统计角色菜单关联
	fmt.Println("\n==========================================")
	fmt.Println("  角色菜单关联统计")
	fmt.Println("==========================================")
	for _, role := range roles {
		var count int64
		db.Model(&models.RoleMenu{}).Where("role_id = ?", role.ID).Count(&count)
		fmt.Printf("- %s: %d 个菜单\n", role.Name, count)
	}
}
