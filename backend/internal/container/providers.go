package container

import (
	"backend/internal/database"
	"backend/internal/repositories"
)

// ProvideTaskRepository 根据数据库类型提供 TaskRepository
func ProvideTaskRepository(manager *database.Manager) repositories.TaskRepository {
	if manager.IsMoonDB() || manager.IsMySQL() {
		return repositories.NewDBTaskRepository(manager.GetDB())
	}
	return repositories.NewTaskRepository()
}

// ProvideUserRepository 根据数据库类型提供 UserRepository
func ProvideUserRepository(manager *database.Manager) repositories.UserRepository {
	if manager.IsMoonDB() || manager.IsMySQL() {
		return repositories.NewDBUserRepository(manager.GetDB())
	}
	return repositories.NewUserRepository()
}
