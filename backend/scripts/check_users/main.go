package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/logger"
	"log"
)

func main() {
	log.Println("检查用户和角色关联...")

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

	// 查询所有用户及其角色
	var users []models.User
	db.Preload("Roles").Find(&users)

	log.Println("\n==========================================")
	log.Println("  用户和角色关联情况")
	log.Println("==========================================")

	for _, user := range users {
		log.Printf("\n用户: %s (ID: %s)", user.Username, user.ID)
		log.Printf("  邮箱: %s", user.Email)
		log.Printf("  状态: %s", user.Status)

		if len(user.Roles) == 0 {
			log.Printf("  角色: 无")
		} else {
			log.Printf("  角色:")
			for _, role := range user.Roles {
				log.Printf("    - %s (%s)", role.Name, role.Code)
			}
		}
	}

	// 统计
	var userCount, userRoleCount int64
	db.Model(&models.User{}).Count(&userCount)
	db.Model(&models.UserRole{}).Count(&userRoleCount)

	log.Println("\n==========================================")
	log.Printf("总用户数: %d", userCount)
	log.Printf("总角色关联数: %d", userRoleCount)
	log.Println("==========================================")
}
