# 后端 API 开发指南

本文档详细说明如何在本项目中创建新的 API 接口。

## 目录

1. [架构概述](#架构概述)
2. [开发流程](#开发流程)
3. [分层详解](#分层详解)
4. [完整示例](#完整示例)
5. [最佳实践](#最佳实践)

---

## 架构概述

本项目采用经典的**分层架构**，遵循**依赖注入**和**接口抽象**原则：

```
请求流程：
Client → Router → Middleware → Handler → Service → Repository → Database
                                   ↓
                              Response
```

### 各层职责

| 层级 | 职责 | 文件位置 |
|------|------|----------|
| **Model** | 数据模型定义 | `internal/models/` |
| **DTO** | 数据传输对象（请求/响应） | `internal/dto/` |
| **Repository** | 数据访问层（CRUD） | `internal/repositories/` |
| **Service** | 业务逻辑层 | `internal/services/` |
| **Handler** | HTTP 处理层 | `internal/handlers/` |
| **Router** | 路由配置 | `internal/routes/` |
| **Middleware** | 中间件（认证、日志等） | `internal/middlewares/` |

---

## 开发流程

创建新接口的标准步骤：


### 步骤 1：定义数据模型（Model）

在 `internal/models/` 创建或修改模型文件。

**示例：** `internal/models/user.go`

```go
package models

type User struct {
    ID        uint   `json:"id" gorm:"primaryKey"`
    Username  string `json:"username" binding:"required,min=3,max=20" gorm:"uniqueIndex"`
    Email     string `json:"email" binding:"omitempty,email" gorm:"index"`
    Password  string `json:"-" binding:"required,min=6"`
    Role      string `json:"role" gorm:"default:'user'"`
    CreatedAt int64  `json:"created_at" gorm:"autoCreateTime:milli"`
    UpdatedAt int64  `json:"updated_at" gorm:"autoUpdateTime:milli"`
}

func (User) TableName() string {
    return "users"
}
```

**关键点：**
- 使用 GORM 标签定义数据库字段属性
- `json:"-"` 隐藏敏感字段（如密码）
- `binding` 标签用于请求验证
- `gorm:"autoCreateTime:milli"` 自动管理时间戳

---

### 步骤 2：定义 DTO（数据传输对象）

在 `internal/dto/` 创建请求和响应结构体。

**示例：** `internal/dto/user.go`

```go
package dto

// 注册请求
type RegisterRequest struct {
    Username string `json:"username" binding:"required,min=3,max=20"`
    Email    string `json:"email" binding:"omitempty,email"`
    Password string `json:"password" binding:"required,min=6"`
}

// 注册响应
type RegisterResponse struct {
    ID       uint   `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
    Role     string `json:"role"`
}

// 登录请求
type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

// 登录响应
type LoginResponse struct {
    User      RegisterResponse `json:"user"`
    Token     string           `json:"token"`
    TokenType string           `json:"token_type"`
    ExpiresIn int64            `json:"expires_in"`
}
```

**关键点：**
- 请求 DTO 使用 `binding` 标签进行参数验证
- 响应 DTO 只包含需要返回给客户端的字段
- 不要在响应中包含敏感信息（如密码）

---

### 步骤 3：创建 Repository（数据访问层）

在 `internal/repositories/` 创建接口和实现。

**接口定义：** `internal/repositories/user_repository.go`

```go
package repositories

import (
    "backend/internal/models"
    "context"
)

type UserRepository interface {
    Create(ctx context.Context, user *models.User) (*models.User, error)
    FindByID(ctx context.Context, id uint) (*models.User, error)
    FindByUsername(ctx context.Context, username string) (*models.User, error)
    FindByEmail(ctx context.Context, email string) (*models.User, error)
    Update(ctx context.Context, user *models.User) (*models.User, error)
    Delete(ctx context.Context, id uint) error
    List(ctx context.Context) ([]*models.User, error)
}
```

**数据库实现：** `internal/repositories/user_repository_db.go`

```go
package repositories

import (
    "backend/internal/models"
    "backend/pkg/utils/logger"
    "context"
    "errors"
    "gorm.io/gorm"
)

type DBUserRepository struct {
    db *gorm.DB
}

func NewDBUserRepository(db *gorm.DB) UserRepository {
    return &DBUserRepository{db: db}
}

func (r *DBUserRepository) Create(ctx context.Context, user *models.User) (*models.User, error) {
    if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
        logger.Errorf("创建用户失败: %v", err)
        return nil, errors.New("创建用户失败: " + err.Error())
    }
    logger.Infof("用户创建成功: ID=%d, Username=%s", user.ID, user.Username)
    return user, nil
}

func (r *DBUserRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
    var user models.User
    if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("用户不存在")
        }
        return nil, err
    }
    return &user, nil
}

// ... 其他方法实现
```

**关键点：**
- 使用接口定义，便于测试和替换实现
- 使用 `context.Context` 支持超时和取消
- 记录详细的日志信息
- 统一错误处理

---

### 步骤 4：创建 Service（业务逻辑层）

在 `internal/services/` 创建接口和实现。

**接口定义：** `internal/services/user_service.go`

```go
package services

import (
    "backend/internal/dto"
    "backend/internal/models"
    "context"
)

type UserService interface {
    Register(ctx context.Context, req *dto.RegisterRequest) (*dto.RegisterResponse, error)
    Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
    GetByID(ctx context.Context, id uint) (*models.User, error)
    List(ctx context.Context) ([]*models.User, error)
}
```

**实现：**

```go
package services

import (
    "backend/internal/dto"
    "backend/internal/models"
    "backend/internal/repositories"
    "backend/pkg/utils/crypto"
    "backend/pkg/utils/jwt"
    "backend/pkg/utils/logger"
    "context"
    "errors"
    "time"
)

type userService struct {
    repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) UserService {
    return &userService{repo: repo}
}

func (s *userService) Register(ctx context.Context, req *dto.RegisterRequest) (*dto.RegisterResponse, error) {
    // 1. 业务验证：检查用户名是否已存在
    if _, err := s.repo.FindByUsername(ctx, req.Username); err == nil {
        return nil, errors.New("用户名已存在")
    }

    // 2. 业务验证：检查邮箱是否已被使用（仅当提供了邮箱时）
    if req.Email != "" {
        if _, err := s.repo.FindByEmail(ctx, req.Email); err == nil {
            return nil, errors.New("邮箱已被使用")
        }
    }

    // 3. 数据处理：哈希密码
    hashedPassword, err := crypto.BcryptHash(req.Password, 10)
    if err != nil {
        logger.Errorf("[UserService] 密码哈希失败: %v", err)
        return nil, errors.New("注册失败")
    }

    // 4. 创建用户
    user := &models.User{
        Username: req.Username,
        Email:    req.Email,
        Password: hashedPassword,
        Role:     "user",
    }

    createdUser, err := s.repo.Create(ctx, user)
    if err != nil {
        logger.Errorf("[UserService] 创建用户失败: %v", err)
        return nil, errors.New("注册失败")
    }

    logger.Infof("[UserService] 用户注册成功: id=%d, username=%s", createdUser.ID, createdUser.Username)

    // 5. 返回响应
    return &dto.RegisterResponse{
        ID:       createdUser.ID,
        Username: createdUser.Username,
        Email:    createdUser.Email,
        Role:     createdUser.Role,
    }, nil
}

func (s *userService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
    // 1. 查找用户
    user, err := s.repo.FindByUsername(ctx, req.Username)
    if err != nil {
        return nil, errors.New("用户名或密码错误")
    }

    // 2. 验证密码
    if !crypto.BcryptVerify(user.Password, req.Password) {
        return nil, errors.New("用户名或密码错误")
    }

    // 3. 生成 Token
    token, err := jwt.GenerateToken(user.ID, user.Username, user.Role, "", 24*time.Hour)
    if err != nil {
        logger.Errorf("[UserService] 生成 Token 失败: %v", err)
        return nil, errors.New("登录失败")
    }

    logger.Infof("[UserService] 用户登录成功: id=%d, username=%s", user.ID, user.Username)

    return &dto.LoginResponse{
        User: dto.RegisterResponse{
            ID:       user.ID,
            Username: user.Username,
            Email:    user.Email,
            Role:     user.Role,
        },
        Token:     token,
        TokenType: "Bearer",
        ExpiresIn: 86400, // 24 小时（秒）
    }, nil
}
```

**关键点：**
- Service 层处理所有业务逻辑
- 不直接操作数据库，通过 Repository 访问
- 统一错误处理和日志记录
- 返回 DTO 而不是 Model

---

### 步骤 5：创建 Handler（HTTP 处理层）

在 `internal/handlers/` 创建接口和实现。

**接口定义：** `internal/handlers/handlers.go`

```go
package handlers

type UserHandler interface {
    Register(c *gin.Context)
    Login(c *gin.Context)
    GetProfile(c *gin.Context)
    ListUsers(c *gin.Context)
}
```

**实现：** `internal/handlers/user_handler.go`

```go
package handlers

import (
    "backend/internal/dto"
    "backend/internal/services"
    "backend/pkg/utils/logger"
    "backend/pkg/utils/response"
    "net/http"
    "github.com/gin-gonic/gin"
)

type userHandler struct {
    userService services.UserService
}

func NewUserHandler(userService services.UserService) UserHandler {
    return &userHandler{userService: userService}
}

func (h *userHandler) Register(c *gin.Context) {
    var req dto.RegisterRequest

    // 1. 绑定请求数据
    if err := c.ShouldBindJSON(&req); err != nil {
        logger.Warnf("[UserHandler] 注册请求参数错误: %v", err)
        response.Error(c, "请求参数错误", http.StatusBadRequest)
        return
    }

    // 2. 调用服务层
    user, err := h.userService.Register(c.Request.Context(), &req)
    if err != nil {
        logger.Warnf("[UserHandler] 注册失败: %v", err)
        response.Error(c, err.Error(), http.StatusBadRequest)
        return
    }

    // 3. 返回成功响应
    response.SuccessWithData(c, "注册成功", user)
}

func (h *userHandler) Login(c *gin.Context) {
    var req dto.LoginRequest

    if err := c.ShouldBindJSON(&req); err != nil {
        logger.Warnf("[UserHandler] 登录请求参数错误: %v", err)
        response.Error(c, "请求参数错误", http.StatusBadRequest)
        return
    }

    result, err := h.userService.Login(c.Request.Context(), &req)
    if err != nil {
        logger.Warnf("[UserHandler] 登录失败: %v", err)
        response.Error(c, err.Error(), http.StatusUnauthorized)
        return
    }

    response.SuccessWithData(c, "登录成功", result)
}

func (h *userHandler) GetProfile(c *gin.Context) {
    // 从 Context 中获取用户 ID（由认证中间件设置）
    userID, exists := c.Get("user_id")
    if !exists {
        response.Error(c, "未认证", http.StatusUnauthorized)
        return
    }

    uid, ok := userID.(uint)
    if !ok {
        response.Error(c, "用户信息错误", http.StatusInternalServerError)
        return
    }

    user, err := h.userService.GetByID(c.Request.Context(), uid)
    if err != nil {
        logger.Warnf("[UserHandler] 获取用户信息失败: %v", err)
        response.Error(c, "用户不存在", http.StatusNotFound)
        return
    }

    response.SuccessWithData(c, "获取成功", dto.ToUserResponse(user))
}
```

**关键点：**
- Handler 只负责 HTTP 请求处理
- 使用 `c.ShouldBindJSON()` 绑定和验证请求
- 调用 Service 层处理业务逻辑
- 使用统一的响应格式（`response` 包）
- 记录日志

---

### 步骤 6：注册路由

在 `internal/routes/routes.go` 注册路由。

```go
func (r *Router) SetupRoutes(engine *gin.Engine) {
    // ... 中间件配置 ...

    api := engine.Group("/api")
    {
        // 认证路由（公开访问）
        auth := api.Group("/auth")
        {
            auth.POST("/register", r.handlers.User.Register)
            auth.POST("/login", r.handlers.User.Login)
        }

        // 需要认证的路由
        user := api.Group("/user")
        user.Use(middlewares.AuthMiddleware())
        {
            user.GET("/profile", r.handlers.User.GetProfile)
        }

        // 管理员路由
        admin := api.Group("/admin")
        admin.Use(
            middlewares.AuthMiddleware(),
            middlewares.RoleBasedAuth([]string{"admin"}),
        )
        {
            admin.GET("/users", r.handlers.User.ListUsers)
        }
    }
}
```

**关键点：**
- 使用路由组组织相关接口
- 根据需要应用中间件（认证、权限等）
- 遵循 RESTful 规范

---

### 步骤 7：依赖注入配置

在 `internal/container/providers.go` 注册依赖。

```go
func (c *Container) ProvideUserRepository() repositories.UserRepository {
    return repositories.NewDBUserRepository(c.db)
}

func (c *Container) ProvideUserService() services.UserService {
    return services.NewUserService(c.ProvideUserRepository())
}

func (c *Container) ProvideUserHandler() handlers.UserHandler {
    return handlers.NewUserHandler(c.ProvideUserService())
}
```

在 `internal/handlers/handlers.go` 注册 Handler：

```go
type Handlers struct {
    Health HealthHandler
    User   UserHandler
    Task   TaskHandler
}

func NewHandlers(container *container.Container) *Handlers {
    return &Handlers{
        Health: NewHealthHandler(),
        User:   container.ProvideUserHandler(),
        Task:   container.ProvideTaskHandler(),
    }
}
```

---

## 分层详解

### Repository 层

**职责：**
- 数据库 CRUD 操作
- 数据查询和过滤
- 事务管理

**规范：**
- 使用接口定义，便于测试
- 方法命名：`Create`, `FindByXXX`, `Update`, `Delete`, `List`
- 返回错误时使用友好的错误信息
- 记录详细的操作日志

### Service 层

**职责：**
- 业务逻辑处理
- 数据验证和转换
- 调用多个 Repository
- 事务协调

**规范：**
- 不直接操作数据库
- 接收和返回 DTO
- 统一错误处理
- 记录业务日志

### Handler 层

**职责：**
- HTTP 请求处理
- 参数绑定和验证
- 调用 Service 层
- 返回 HTTP 响应

**规范：**
- 不包含业务逻辑
- 使用 `c.ShouldBindJSON()` 验证请求
- 使用统一的响应格式
- 适当的 HTTP 状态码

---

## 完整示例

以下是创建一个"获取任务列表"接口的完整示例。

### 1. Model

```go
// internal/models/task.go
package models

type Task struct {
    ID          uint   `json:"id" gorm:"primaryKey"`
    Title       string `json:"title" binding:"required"`
    Description string `json:"description"`
    Completed   bool   `json:"completed" gorm:"default:false"`
    UserID      uint   `json:"user_id"`
    CreatedAt   int64  `json:"created_at" gorm:"autoCreateTime:milli"`
    UpdatedAt   int64  `json:"updated_at" gorm:"autoUpdateTime:milli"`
}

func (Task) TableName() string {
    return "tasks"
}
```

### 2. DTO

```go
// internal/dto/task.go
package dto

type CreateTaskRequest struct {
    Title       string `json:"title" binding:"required"`
    Description string `json:"description"`
}

type UpdateTaskRequest struct {
    Title       string `json:"title"`
    Description string `json:"description"`
    Completed   bool   `json:"completed"`
}

type TaskResponse struct {
    ID          uint   `json:"id"`
    Title       string `json:"title"`
    Description string `json:"description"`
    Completed   bool   `json:"completed"`
    UserID      uint   `json:"user_id"`
    CreatedAt   int64  `json:"created_at"`
    UpdatedAt   int64  `json:"updated_at"`
}
```

### 3. Repository

```go
// internal/repositories/task_repository.go
package repositories

import (
    "backend/internal/models"
    "context"
)

type TaskRepository interface {
    Create(ctx context.Context, task *models.Task) (*models.Task, error)
    FindByID(ctx context.Context, id uint) (*models.Task, error)
    FindByUserID(ctx context.Context, userID uint) ([]*models.Task, error)
    Update(ctx context.Context, task *models.Task) (*models.Task, error)
    Delete(ctx context.Context, id uint) error
    List(ctx context.Context) ([]*models.Task, error)
}
```

```go
// internal/repositories/task_repository_db.go
package repositories

import (
    "backend/internal/models"
    "backend/pkg/utils/logger"
    "context"
    "errors"
    "gorm.io/gorm"
)

type DBTaskRepository struct {
    db *gorm.DB
}

func NewDBTaskRepository(db *gorm.DB) TaskRepository {
    return &DBTaskRepository{db: db}
}

func (r *DBTaskRepository) List(ctx context.Context) ([]*models.Task, error) {
    var tasks []*models.Task
    if err := r.db.WithContext(ctx).Find(&tasks).Error; err != nil {
        logger.Errorf("获取任务列表失败: %v", err)
        return nil, errors.New("获取任务列表失败")
    }
    return tasks, nil
}

func (r *DBTaskRepository) FindByUserID(ctx context.Context, userID uint) ([]*models.Task, error) {
    var tasks []*models.Task
    if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&tasks).Error; err != nil {
        logger.Errorf("获取用户任务失败: %v", err)
        return nil, errors.New("获取用户任务失败")
    }
    return tasks, nil
}
```

### 4. Service

```go
// internal/services/task_service.go
package services

import (
    "backend/internal/dto"
    "backend/internal/models"
    "backend/internal/repositories"
    "context"
)

type TaskService interface {
    GetAllTasks(ctx context.Context) ([]*models.Task, error)
    GetUserTasks(ctx context.Context, userID uint) ([]*models.Task, error)
    CreateTask(ctx context.Context, req *dto.CreateTaskRequest, userID uint) (*models.Task, error)
}

type taskService struct {
    repo repositories.TaskRepository
}

func NewTaskService(repo repositories.TaskRepository) TaskService {
    return &taskService{repo: repo}
}

func (s *taskService) GetAllTasks(ctx context.Context) ([]*models.Task, error) {
    return s.repo.List(ctx)
}

func (s *taskService) GetUserTasks(ctx context.Context, userID uint) ([]*models.Task, error) {
    return s.repo.FindByUserID(ctx, userID)
}
```

### 5. Handler

```go
// internal/handlers/task_handler.go
package handlers

import (
    "backend/internal/services"
    "backend/pkg/utils/response"
    "net/http"
    "github.com/gin-gonic/gin"
)

type TaskHandler interface {
    GetAllTasks(c *gin.Context)
    GetUserTasks(c *gin.Context)
}

type taskHandler struct {
    taskService services.TaskService
}

func NewTaskHandler(taskService services.TaskService) TaskHandler {
    return &taskHandler{taskService: taskService}
}

func (h *taskHandler) GetAllTasks(c *gin.Context) {
    tasks, err := h.taskService.GetAllTasks(c.Request.Context())
    if err != nil {
        response.Error(c, "获取任务列表失败", http.StatusInternalServerError)
        return
    }
    response.SuccessWithData(c, "获取成功", tasks)
}
```

### 6. 路由注册

```go
// internal/routes/routes.go
tasks := api.Group("/tasks")
{
    tasks.GET("", r.handlers.Task.GetAllTasks)
    tasks.POST("", r.handlers.Task.CreateTask)
    tasks.GET("/:id", r.handlers.Task.GetTask)
    tasks.PUT("/:id", r.handlers.Task.UpdateTask)
    tasks.DELETE("/:id", r.handlers.Task.DeleteTask)
}
```

---

## 最佳实践

### 1. 错误处理

```go
// 业务错误：返回友好的错误信息
if user == nil {
    return nil, errors.New("用户不存在")
}

// 系统错误：记录详细日志，返回通用错误
if err != nil {
    logger.Errorf("[Service] 操作失败: %v", err)
    return nil, errors.New("操作失败")
}
```

### 2. 日志记录

```go
// 使用统一的日志格式
logger.Infof("[UserService] 用户注册成功: id=%d, username=%s", user.ID, user.Username)
logger.Warnf("[UserHandler] 登录失败: %v", err)
logger.Errorf("[Repository] 数据库操作失败: %v", err)
```

### 3. 参数验证

```go
// 使用 binding 标签进行基础验证
type RegisterRequest struct {
    Username string `json:"username" binding:"required,min=3,max=20"`
    Email    string `json:"email" binding:"omitempty,email"`
    Password string `json:"password" binding:"required,min=6"`
}

// 在 Service 层进行业务验证
if _, err := s.repo.FindByUsername(ctx, req.Username); err == nil {
    return nil, errors.New("用户名已存在")
}
```

### 4. 响应格式

使用统一的响应格式（`pkg/utils/response/response.go`）：

```go
// 成功响应
response.Success(c, "操作成功")
response.SuccessWithData(c, "获取成功", data)

// 错误响应
response.Error(c, "操作失败", http.StatusBadRequest)
```

### 5. 中间件使用

```go
// 认证中间件
user.Use(middlewares.AuthMiddleware())

// 权限中间件
admin.Use(
    middlewares.AuthMiddleware(),
    middlewares.RoleBasedAuth([]string{"admin"}),
)

// 自定义中间件
api.Use(middlewares.RateLimit(100, 200))
```

### 6. Context 使用

```go
// 传递 Context
user, err := h.userService.Register(c.Request.Context(), &req)

// 从 Context 获取用户信息
userID, exists := c.Get("user_id")
```

### 7. 数据库事务

```go
// 在 Service 层处理事务
func (s *userService) TransferPoints(ctx context.Context, fromID, toID uint, points int) error {
    return s.repo.Transaction(ctx, func(tx *gorm.DB) error {
        // 扣除积分
        if err := tx.Model(&models.User{}).Where("id = ?", fromID).
            Update("points", gorm.Expr("points - ?", points)).Error; err != nil {
            return err
        }
        
        // 增加积分
        if err := tx.Model(&models.User{}).Where("id = ?", toID).
            Update("points", gorm.Expr("points + ?", points)).Error; err != nil {
            return err
        }
        
        return nil
    })
}
```

---

## 常用工具

### JWT 认证

```go
import "backend/pkg/utils/jwt"

// 生成 Token
token, err := jwt.GenerateToken(userID, username, role, "", 24*time.Hour)

// 验证 Token
claims, err := jwt.ValidateToken(token, "")

// 从请求中提取 Token
token, err := jwt.ExtractToken(c)
```

### 密码加密

```go
import "backend/pkg/utils/crypto"

// 哈希密码
hashedPassword, err := crypto.BcryptHash(password, 10)

// 验证密码
isValid := crypto.BcryptVerify(hashedPassword, password)
```

### 日志记录

```go
import "backend/pkg/utils/logger"

logger.Debugf("调试信息: %v", data)
logger.Infof("信息: %s", message)
logger.Warnf("警告: %v", err)
logger.Errorf("错误: %v", err)
```

---

## 测试

### 单元测试示例

```go
// internal/services/user_service_test.go
package services

import (
    "backend/internal/dto"
    "backend/internal/models"
    "context"
    "testing"
)

type mockUserRepository struct{}

func (m *mockUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
    return nil, errors.New("用户不存在")
}

func TestRegister(t *testing.T) {
    repo := &mockUserRepository{}
    service := NewUserService(repo)
    
    req := &dto.RegisterRequest{
        Username: "testuser",
        Password: "password123",
    }
    
    _, err := service.Register(context.Background(), req)
    if err != nil {
        t.Errorf("注册失败: %v", err)
    }
}
```

---

## 总结

创建新接口的核心步骤：

1. **Model** - 定义数据模型
2. **DTO** - 定义请求/响应结构
3. **Repository** - 实现数据访问
4. **Service** - 实现业务逻辑
5. **Handler** - 实现 HTTP 处理
6. **Router** - 注册路由
7. **Container** - 配置依赖注入

遵循这个流程，可以保证代码的可维护性、可测试性和可扩展性。
