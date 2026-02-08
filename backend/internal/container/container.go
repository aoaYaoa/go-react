package container

import (
	"backend/internal/database"
	"backend/internal/handlers"
	"backend/internal/repositories"
	"backend/internal/routes"
	"backend/internal/services"
)

// Container 依赖注入容器
type Container struct {
	Router *routes.Router
}

// ModuleHolders 内部结构，用于在初始化过程中传递模块
type repositoriesHolder struct {
	Task repositories.TaskRepository
	User repositories.UserRepository
	Menu repositories.MenuRepository
}

type servicesHolder struct {
	Task   services.TaskService
	User   services.UserService
	Health services.HealthService
}

// InitializeContainer 初始化容器
// 采用分层初始化的方式，避免主函数过于臃肿
func InitializeContainer(manager *database.Manager) (*Container, error) {
	// 1. 初始化 Repositories
	repos := initRepositories(manager)

	// 2. 初始化 Services
	svcs := initServices(repos)

	// 3. 初始化 Handlers
	h := initHandlers(svcs)

	// 4. 初始化 Router
	router := routes.NewRouter(h)

	return &Container{
		Router: router,
	}, nil
}

// initRepositories 初始化所有 Repository
func initRepositories(manager *database.Manager) *repositoriesHolder {
	return &repositoriesHolder{
		Task: ProvideTaskRepository(manager),
		User: ProvideUserRepository(manager),
		Menu: ProvideMenuRepository(manager),
	}
}

// initServices 初始化所有 Service
func initServices(repos *repositoriesHolder) *servicesHolder {
	return &servicesHolder{
		Task:   services.NewTaskService(repos.Task),
		User:   services.NewUserService(repos.User, repos.Menu),
		Health: services.NewHealthService(),
	}
}

// initHandlers 初始化所有 Handler 并组装成 Handlers 结构体
func initHandlers(svcs *servicesHolder) *handlers.Handlers {
	return &handlers.Handlers{
		Task:    handlers.NewTaskHandler(svcs.Task),
		User:    handlers.NewUserHandler(svcs.User),
		Health:  handlers.NewHealthHandler(svcs.Health),
		Captcha: handlers.NewCaptchaHandler(),
	}
}
