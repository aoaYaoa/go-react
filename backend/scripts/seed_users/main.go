package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/models"
	"backend/pkg/utils/crypto"
	"backend/pkg/utils/logger"
	"log"

	"github.com/google/uuid"
)

func main() {
	log.Println("开始创建测试账号...")

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

	// 查询角色
	var roles []models.Role
	db.Find(&roles)
	roleMap := make(map[string]uuid.UUID)
	for _, role := range roles {
		roleMap[role.Code] = role.ID
	}

	// 定义测试账号
	testUsers := []struct {
		Username string
		Email    string
		Password string
		RoleCode string
	}{
		{
			Username: "guest",
			Email:    "guest@skytracker.com",
			Password: "guest123",
			RoleCode: "guest",
		},
		{
			Username: "user",
			Email:    "user@skytracker.com",
			Password: "user123",
			RoleCode: "user",
		},
		{
			Username: "premium",
			Email:    "premium@skytracker.com",
			Password: "premium123",
			RoleCode: "premium",
		},
		{
			Username: "admin",
			Email:    "admin@skytracker.com",
			Password: "admin123",
			RoleCode: "admin",
		},
	}

	log.Println("创建测试账号...")
	for _, testUser := range testUsers {
		// 检查用户是否已存在
		var existingUser models.User
		result := db.Where("username = ?", testUser.Username).First(&existingUser)

		var user models.User
		if result.Error == nil {
			log.Printf("用户 %s 已存在，检查角色分配", testUser.Username)
			user = existingUser
		} else {

			// 加密密码
			hashedPassword, err := crypto.BcryptHash(testUser.Password, 10)
			if err != nil {
				log.Printf("密码加密失败 %s: %v", testUser.Username, err)
				continue
			}

			// 创建用户
			user = models.User{
				ID:       uuid.New(),
				Username: testUser.Username,
				Email:    testUser.Email,
				Password: hashedPassword,
				Status:   "active",
			}

			if err := db.Create(&user).Error; err != nil {
				log.Printf("创建用户失败 %s: %v", testUser.Username, err)
				continue
			}

			log.Printf("创建用户成功: %s (密码: %s)", testUser.Username, testUser.Password)
		}

		// 分配角色
		roleID, exists := roleMap[testUser.RoleCode]
		if !exists {
			log.Printf("角色 %s 不存在", testUser.RoleCode)
			continue
		}

		// 检查是否已经分配了该角色
		var existingUserRole models.UserRole
		result = db.Where("user_id = ? AND role_id = ?", user.ID, roleID).First(&existingUserRole)
		if result.Error == nil {
			log.Printf("用户 %s 已分配角色 %s，跳过", testUser.Username, testUser.RoleCode)
			continue
		}

		userRole := models.UserRole{
			ID:     uuid.New(),
			UserID: user.ID,
			RoleID: roleID,
		}

		if err := db.Create(&userRole).Error; err != nil {
			log.Printf("分配角色失败 %s: %v", testUser.Username, err)
			continue
		}

		log.Printf("分配角色成功: %s -> %s", testUser.Username, testUser.RoleCode)
	}

	log.Println("\n==========================================")
	log.Println("  测试账号创建完成")
	log.Println("==========================================")
	log.Println("账号列表：")
	log.Println("1. 游客账号")
	log.Println("   用户名: guest")
	log.Println("   密码: guest123")
	log.Println("")
	log.Println("2. 普通用户")
	log.Println("   用户名: user")
	log.Println("   密码: user123")
	log.Println("")
	log.Println("3. 高级用户")
	log.Println("   用户名: premium")
	log.Println("   密码: premium123")
	log.Println("")
	log.Println("4. 管理员")
	log.Println("   用户名: admin")
	log.Println("   密码: admin123")
	log.Println("==========================================")
}
