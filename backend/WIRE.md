# Google Wire 依赖注入指南

本项目使用 [Google Wire](https://github.com/google/wire) 实现**编译时依赖注入**。

相比于运行时依赖注入（反射），Wire 的优势在于：
1. **类型安全**：依赖关系在编译时检查，如果缺少依赖，编译会报错。
2. **易于调试**：生成的代码是标准、可读的 Go 代码，没有黑魔法。
3. **无运行时开销**。

## 目录结构

依赖注入相关的代码主要位于 `internal/container` 目录：

| 文件 | 说明 |
|------|------|
| `wire.go` | **定义文件**。包含 Injector 签名和 Provider Set 定义。包含 `//go:build wireinject` 标签。 |
| `wire_gen.go` | **自动生成的文件**。Wire 根据 `wire.go` 生成的实际组装代码。**请勿手动修改**。 |
| `providers.go` | **自定义 Provider**。包含一些复杂的构造逻辑（如根据配置选择数据库实现）。 |
| `types.go` | **容器类型定义**。定义了 `Container` 结构体，用于持有应用程序的顶层依赖（如 Router）。 |

## 快速开始

### 1. 安装 Wire 工具

确保你安装了 Wire 的命令行工具：

```bash
go install github.com/google/wire/cmd/wire@latest
```

### 2. 重新通过 Wire 生成代码

每当你修改了依赖关系（例如添加了新的 Service、Repository 或 Handler），都需要重新生成 `wire_gen.go`。

在 `backend` 根目录下运行：

```bash
wire ./internal/container
```

成功后，你会看到 `internal/container/wire_gen.go` 文件被更新。

## 开发工作流

### 场景：添加一个新的功能模块

假设你需要添加一个新的 `Order` 模块，包含 Repository, Service 和 Handler。

#### 第一步：编写组件代码

确保每个组件都有一个构造函数（通常以 `New` 开头）。

**Repository (`internal/repositories/order_repository.go`)**:
```go
func NewOrderRepository(db *gorm.DB) OrderRepository { ... }
```

**Service (`internal/services/order_service.go`)**:
```go
func NewOrderService(repo repositories.OrderRepository) OrderService { ... }
```

**Handler (`internal/handlers/order_handler.go`)**:
```go
func NewOrderHandler(svc services.OrderService) OrderHandler { ... }
```

#### 第二步：注册 Provider

打开 `internal/container/wire.go`，将新的构造函数添加到对应的 `wire.NewSet` 中。

```go
// internal/container/wire.go

var RepositorySet = wire.NewSet(
    ProvideTaskRepository,
    ProvideUserRepository,
    repositories.NewOrderRepository, // <--- 添加 Repository
)

var ServiceSet = wire.NewSet(
    services.NewTaskService,
    services.NewUserService,
    services.NewOrderService, // <--- 添加 Service
)

var HandlerSet = wire.NewSet(
    handlers.NewTaskHandler,
    handlers.NewUserHandler,
    handlers.NewOrderHandler, // <--- 添加 Handler
    wire.Struct(new(handlers.Handlers), "*"), // 确保自动填充到 Handlers 结构体
)
```

> **注意**：如果不使用 `wire.Struct` 自动注入字段，你需要手动更新 `handlers.Handlers` 结构体并在 HandlerSet 中显式处理，但在这里我们使用了 `wire.Struct(new(handlers.Handlers), "*")`，只要 `handlers.Handlers` 结构体中添加了 `Order` 字段，且类型匹配，Wire 就会自动注入。

别忘了在 `internal/handlers/handlers.go` 的结构体中添加字段：
```go
type Handlers struct {
    Task   TaskHandler
    User   UserHandler
    Order  OrderHandler // <--- 添加字段
    Health HealthHandler
}
```

#### 第三步：生成代码

```bash
wire ./internal/container
```

#### 第四步：重启服务

```bash
go run cmd/server/main.go
```

## 常见问题

### 1. `wire: command not found`
请确保 `$GOPATH/bin` 在你的系统 `PATH` 环境变量中。

### 2. `injectors declaration not found`
这意味着 Wire 没有在指定目录找到带有 `//go:build wireinject` 的文件。请确保你是在项目根目录下运行 `wire ./internal/container`，或者进入到 `internal/container` 目录运行 `wire`。

### 3. 生成代码失败：`missing provider for ...`
这说明某个组件需要的依赖没有被提供。
*   检查是否在 `wire.go` 中注册了对应的 `New` 函数。
*   检查函数签名的参数类型和返回类型是否一致（例如：一个需要接口，一个返回结构体指针，且没有做 Bind）。

### 4. 为什么有两个文件 `wire.go` 和 `wire_gen.go`？
*   `wire.go` 是给 Wire 工具看的“食谱”，它告诉 Wire 哪些组件可用。它包含构建标签 `//go:build wireinject`，所以**不会**被 Go 编译器编译。
*   `wire_gen.go` 是 Wire 工具根据食谱做出的“菜”，它是实际的 Go 代码，包含了完整的依赖初始化逻辑。它包含构建标签 `//go:build !wireinject`，所以**会**被 Go 编译器编译。
