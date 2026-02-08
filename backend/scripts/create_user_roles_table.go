package main

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/pkg/utils/logger"
	"log"
)

func main() {
	log.Println("手动创建 user_roles 表...")

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

	// 手动创建 user_roles 表
	sql := `
	CREATE TABLE IF NOT EXISTS user_roles (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL,
		role_id UUID NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
	);

	CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
	CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
	CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id, role_id);
	`

	if err := db.Exec(sql).Error; err != nil {
		log.Fatalf("创建表失败: %v", err)
	}

	log.Println("✅ user_roles 表创建成功！")
}
