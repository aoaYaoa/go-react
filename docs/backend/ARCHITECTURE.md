# 后端架构

本文档描述当前后端（`backend/`）的实际运行架构与关键链路。

## 1. 分层结构

项目采用分层设计：

- `internal/handlers`：HTTP 处理层，负责参数绑定、调用 Service、组装响应
- `internal/services`：业务层，负责业务规则和跨仓储逻辑
- `internal/repositories`：数据访问层，负责数据库 CRUD
- `internal/models`：GORM 模型定义
- `internal/container`：依赖装配（Repository/Service/Handler/Router）

请求路径：

`Client -> Router -> Middleware -> Handler -> Service -> Repository -> DB`

## 2. 中间件管道（当前顺序）

全局中间件在 `internal/routes/routes.go` 注册，顺序如下：

1. `RequestID`：设置 `X-Request-ID`
2. `Metrics`：采集请求计数、时延、并发数
3. `Logger`：请求日志
4. `Recovery`：panic 恢复
5. `CORS`
6. `Security`
7. `NoCache`
8. `ContentType`
9. `RateLimit`
10. `IPAccess`（按配置可选）
11. `Compression`
12. `Decryption` + `Signature` + `Encryption`（`ENABLE_SIGNATURE=true` 时启用）

## 3. 认证与安全

- JWT：使用 `JWT_SECRET` 初始化默认签名密钥
- 签名加解密：
  - 开启条件：`ENABLE_SIGNATURE=true`
  - 必填：`ENCRYPTION_AES_KEY`（长度必须是 16/24/32 字节）
  - 未配置或长度非法时，服务启动直接失败

## 4. 缓存与消息链路

### 4.1 Redis（验证码）

- 验证码存储优先使用 Redis（`REDIS_*`）
- Redis 不可用时自动回退内存存储
- 健康检查会标记 Redis 组件状态（`up/down/disabled`）

### 4.2 Kafka（登录事件）

登录成功后会发布 `user.login` 事件，链路如下：

`UserService -> OutboxPublisher -> AsyncPublisher -> KafkaPublisher`

- `OutboxPublisher`：先写 DB 表 `event_outbox`（持久化）
- `AsyncPublisher`：后台 worker 异步重试，避免阻塞登录主链路
- `KafkaPublisher`：最终投递到 Kafka topic

优势：

- 进程重启后，`event_outbox` 未发送事件仍可继续补发
- 临时网络抖动由异步重试吸收

## 5. 健康检查与可观测性

### 5.1 健康检查

- `GET /health`
- `GET /api/health`

返回包含组件状态：

- `database`
- `redis`
- `kafka`

当任一启用组件异常时，接口返回 `503`。

### 5.2 指标

- `GET /metrics`
- Prometheus 文本格式
- 当前指标：
  - `http_requests_total`
  - `http_request_duration_seconds_sum/count`
  - `http_inflight_requests`

## 6. 启动流程（关键步骤）

`cmd/server/main.go` 启动顺序要点：

1. 加载配置
2. 初始化日志
3. 初始化 JWT 默认密钥
4. 校验签名加密配置（可选）
5. 初始化验证码存储（Redis/内存）
6. 初始化数据库
7. 初始化 Kafka 发布器（含 Async + Outbox）
8. 组装容器并启动路由

## 7. CI 回归

仓库已配置 GitHub Actions 工作流：`.github/workflows/ci.yml`

- 后端：`go test ./...`
- 前端：`npm ci && npm run build`

用于保证提交与 PR 的基础回归质量。
