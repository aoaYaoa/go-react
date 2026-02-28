# 后端架构

本项目遵循 **整洁架构 (Clean Architecture)** 原则和 **Go 标准项目布局 (Standard Go Project Layout)**。

## 架构分层

### 1. 处理器层 / Handler Layer (`internal/handlers`)
- **职责**: 处理 HTTP 请求，解析输入，验证参数，并格式化响应。
- **依赖**: 依赖于 `Service Layer`。
- **输入/输出**: 接收 `*gin.Context`，通过 `pkg/utils/response` 返回 JSON 响应。
- **DTOs**: 使用 `internal/dto` 进行请求绑定和响应格式化。

### 2. 服务层 / Service Layer (`internal/services`)
- **职责**: 包含业务逻辑。独立于 HTTP 或数据库细节。
- **依赖**: 依赖于 `Repository Layer`。
- **上下文**: 传递 `context.Context` 以进行取消和超时控制。

### 3. 仓储层 / Repository Layer (`internal/repositories`)
- **职责**: 处理数据访问和持久化。
- **依赖**: 依赖于 `GORM` 或数据库驱动。
- **上下文**: 所有数据库操作均使用 `WithContext(ctx)`。

### 4. 模型层 / Model Layer (`internal/models`)
- **职责**: 定义数据库模式和实体结构。

## 依赖注入

我们使用 **容器** 模式 (`internal/container`) 来管理依赖关系。

- `NewContainer(dbManager)` 初始化所有的 Repositories, Services 和 Handlers。
- 这确保了松耦合，并使测试变得更容易。

## 中间件管道

请求流经以下中间件：

1.  **Logger**: 记录请求 ID、方法、路径、延迟（支持每日轮转和彩色控制台输出）。
2.  **Recovery**: 从 panic 中恢复并返回 500 内部服务器错误。
3.  **CORS**: 处理跨域资源共享。
4.  **Security**: 添加安全头 (XSS, HSTS 等)。
5.  **RequestID**: 生成或传递 `X-Request-ID`。
6.  **IPAccess** (可选): 检查 IP 白名单/黑名单。
7.  **Signature** (可选): 验证 HMAC 请求签名。
8.  **Auth** (可选): 验证受保护路由的 JWT 令牌。

## 错误处理

- **统一响应**: 所有 API 返回标准结构：
    ```json
    {
      "code": 200,
      "message": "成功",
      "data": { ... },
      "requestId": "..."
    }
    ```
- **优雅关闭**: 服务器处理 `SIGINT` 和 `SIGTERM` 信号，在关闭前完成活动请求。
