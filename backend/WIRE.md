# 依赖注入指南

本项目使用**手动依赖注入 (Manual Dependency Injection)**。我们采用**分层初始化**的模式，以保持代码的整洁和可维护性，避免主初始化函数过于臃肿。

## 目录结构

依赖注入相关的代码主要位于 `internal/container` 目录：

| 文件 | 说明 |
|------|------|
| `container.go` | **核心文件**。定义了 `Container` 结构体和分层初始化流程。 |
| `providers.go` | **辅助 Provider**。包含一些复杂的构造逻辑（如根据配置选择数据库实现）。 |

## 核心设计：分层初始化

为了避免 `InitializeContainer` 函数随着项目增长而变得不可维护，我们将初始化过程拆分为三个阶段，并使用内部的 **Holder 结构体** 来传递层级间的依赖。

1.  **Repositories** (`initRepositories`) -> 返回 `repositoriesHolder`
2.  **Services** (`initServices`) -> 依赖 `repositoriesHolder`，返回 `servicesHolder`
3.  **Handlers** (`initHandlers`) -> 依赖 `servicesHolder`，返回最终的 `handlers.Handlers`

```go
// internal/container/container.go 示意
func InitializeContainer(manager *database.Manager) (*Container, error) {
    repos := initRepositories(manager) // 1. 初始化所有 Repo
    svcs := initServices(repos)        // 2. 初始化所有 Service (注入 Repo)
    h := initHandlers(svcs)            // 3. 初始化所有 Handler (注入 Service)
    
    router := routes.NewRouter(h)      // 4. 组装 Router
    return &Container{Router: router}, nil
}
```

## 开发工作流

### 场景：添加一个新的功能模块

假设你需要添加一个新的 `Order` 模块，包含 Repository, Service 和 Handler。

#### 第一步：编写组件代码

确保每个组件都有一个构造函数（通常以 `New` 开头）。

#### 第二步：更新 `Container` (分层添加)

打开 `internal/container/container.go`，按照层级依次添加。

**1. 添加 Repository**
*   在 `repositoriesHolder` 结构体中添加字段。
*   在 `initRepositories` 函数中初始化。

```go
type repositoriesHolder struct {
    Task  repositories.TaskRepository
    User  repositories.UserRepository
    Order repositories.OrderRepository // <--- [新增]
}

func initRepositories(manager *database.Manager) *repositoriesHolder {
    return &repositoriesHolder{
        Task:  ProvideTaskRepository(manager),
        User:  ProvideUserRepository(manager),
        Order: repositories.NewOrderRepository(manager.GetDB()), // <--- [新增]
    }
}
```

**2. 添加 Service**
*   在 `servicesHolder` 结构体中添加字段。
*   在 `initServices` 函数中初始化（从 `repos` 参数中获取依赖）。

```go
type servicesHolder struct {
    Task  services.TaskService
    User  services.UserService
    Order services.OrderService // <--- [新增]
}

func initServices(repos *repositoriesHolder) *servicesHolder {
    return &servicesHolder{
        Task:  services.NewTaskService(repos.Task),
        // ...
        Order: services.NewOrderService(repos.Order), // <--- [新增] 注入 Repo
    }
}
```

**3. 添加 Handler**
*   在 `initHandlers` 函数中初始化（从 `svcs` 参数中获取依赖）。
*   注意：Handler 是直接组装进 `handlers.Handlers` (这是公开的结构体)，不需要内部 Holder。

```go
func initHandlers(svcs *servicesHolder) *handlers.Handlers {
    return &handlers.Handlers{
        Task:  handlers.NewTaskHandler(svcs.Task),
        // ...
        Order: handlers.NewOrderHandler(svcs.Order), // <--- [新增] 注入 Service
    }
}
```

当然，别忘了在 `internal/handlers/handlers.go` 的公开结构体中也添加对应的字段。

#### 第三步：重启服务

```bash
go run cmd/server/main.go
```
