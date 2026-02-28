# Redis + Kafka + Outbox 联调手册

本文用于本项目后端在本地/测试环境联调 Redis、Kafka 与 Outbox 的快速操作与排障。

## 1. `.env` 最小配置

在 `backend/.env` 配置：

```env
# Redis（验证码缓存）
REDIS_ADDR=your-redis-host:port
REDIS_USERNAME=default
REDIS_PASSWORD=your-password
REDIS_DB=0
REDIS_TLS=false
REDIS_KEY_PREFIX=captcha:

# Kafka（登录事件）
KAFKA_BROKERS=your-kafka-host:port
KAFKA_TOPIC=user.login
KAFKA_SECURITY_PROTOCOL=SSL
KAFKA_SSL_CA_FILE=./certs/kafka/ca.pem
KAFKA_SSL_CERT_FILE=./certs/kafka/service.cert
KAFKA_SSL_KEY_FILE=./certs/kafka/service.key
```

说明：

- `REDIS_TLS` 必须和服务端端口匹配
- `KAFKA_TOPIC` 必须先在 Kafka 平台创建
- Kafka 启用后会自动启用：
  - 异步重试发布
  - Outbox（表：`event_outbox`）

## 2. 启动成功日志（判定标准）

启动后出现以下日志，表示链路可用：

- Redis：`[captcha] 使用 Redis 存储验证码: ...`
- Kafka：`Kafka 事件发布已启用(异步重试+Outbox): ...`
- Outbox：`Kafka Outbox 已启用: table=event_outbox`

若 Redis 回退到内存，会看到：

- `[captcha] REDIS_ADDR 未配置，使用内存存储`
- `[captcha] Redis 初始化失败，回退内存存储: ...`

## 3. Redis 验证步骤

1. 启动后端并触发验证码：`GET /api/auth/captcha`
2. 在 Redis Insight 搜索：`captcha:*`
3. 打开 key，确认 TTL 递减

若搜不到：

1. 检查日志是否显示“使用 Redis 存储验证码”
2. 检查 Redis Insight 是否连接到正确实例
3. 检查 `REDIS_KEY_PREFIX` 是否被改动

## 4. Kafka + Outbox 验证步骤

1. 使用正确验证码登录：`POST /api/auth/login`
2. 检查后端日志，确认无持续 `发布登录事件失败` 警告
3. 在 Kafka 控制台或消费者查看 `KAFKA_TOPIC` 是否收到 `user.login` 事件
4. 查看数据库 `event_outbox`：
   - 正常情况下事件会逐步从 `pending` 变为 `sent`
   - Kafka 暂时不可达时，会留在 `pending` 并累积 `attempts`
   - 达到最大投递次数后会转为 `failed`

## 5. 健康检查与指标

- 健康检查：`GET /health` 或 `GET /api/health`
  - 返回组件状态：`database` / `redis` / `kafka`
  - 异常时返回 `503`
- 指标：`GET /metrics`
  - 包含请求计数、时延、并发数
  - 包含运行时指标：goroutines、内存、进程 uptime
- 链路追踪头：
  - `X-Trace-ID` 可由网关/上游传入
  - 未传入时后端自动生成并回传

## 6. 常见问题

### 6.1 `tls: first record does not look like a TLS handshake`

原因：Redis 客户端使用 TLS，但连接了非 TLS 端口。

处理：改用正确端口或将 `REDIS_TLS=false`。

### 6.2 `Unknown Topic Or Partition`

原因：Kafka topic 不存在或名称不一致。

处理：先创建 topic，并核对 `KAFKA_TOPIC`。

### 6.3 登录成功但 Kafka 暂时没有消息

原因：可能进入 Outbox 重试队列。

处理：

1. 检查 `event_outbox` 是否为 `pending`
2. 检查 Kafka 连通性与证书
3. 恢复后观察 Outbox 是否自动补发为 `sent`

### 6.4 Outbox 出现 `failed` 事件

原因：事件已达到最大投递次数。

处理：

1. 检查 `last_error`，定位 Kafka 凭据/网络/Topic 配置问题
2. 修复后按需做人工重放（重新入队）或补偿处理
3. 观察新事件是否正常进入 `sent`

### 6.5 `event_outbox` 表持续增长

说明：系统会定时清理历史 `sent` 事件；若增长异常，通常是：

1. 清理周期尚未到达
2. 大量事件停留在 `pending/failed`

处理：

1. 先看状态分布（`pending/sent/failed`）
2. 优先处理 `pending/failed` 的根因
3. 必要时增加数据库归档/清理任务

## 7. 相关代码位置

- Redis 验证码存储：`backend/pkg/utils/captcha/redis_store.go`
- Kafka 发布器：`backend/internal/messaging/kafka_publisher.go`
- 异步发布器：`backend/internal/messaging/async_publisher.go`
- Outbox 发布器：`backend/internal/messaging/outbox_publisher.go`
- Outbox 存储（GORM）：`backend/internal/messaging/outbox_gorm_store.go`
- 启动接入：`backend/cmd/server/main.go`
