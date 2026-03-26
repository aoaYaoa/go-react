package database

import (
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// RunMigrations 使用 golang-migrate 执行版本化 SQL 迁移。
// migrationsPath 为迁移文件目录路径（如 "migrations"），databaseURL 为 PostgreSQL DSN。
func RunMigrations(migrationsPath, databaseURL string) error {
	source := fmt.Sprintf("file://%s", migrationsPath)
	m, err := migrate.New(source, databaseURL)
	if err != nil {
		return fmt.Errorf("初始化迁移失败: %w", err)
	}
	defer m.Close()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("执行迁移失败: %w", err)
	}
	return nil
}
