//go:build wireinject
// +build wireinject

package container

import (
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/routes"
	"backend/internal/services"

	"github.com/google/wire"
)

var RepositorySet = wire.NewSet(
	ProvideTaskRepository,
	ProvideUserRepository,
)

var ServiceSet = wire.NewSet(
	services.NewTaskService,
	services.NewUserService,
	services.NewHealthService,
)

var HandlerSet = wire.NewSet(
	handlers.NewTaskHandler,
	handlers.NewUserHandler,
	handlers.NewHealthHandler,
	wire.Struct(new(handlers.Handlers), "*"),
)

var RouterSet = wire.NewSet(
	routes.NewRouter,
)

// InitializeContainer 初始化容器
func InitializeContainer(manager *database.Manager) (*Container, error) {
	wire.Build(
		RepositorySet,
		ServiceSet,
		HandlerSet,
		RouterSet,
		wire.Struct(new(Container), "*"),
	)
	return &Container{}, nil
}
