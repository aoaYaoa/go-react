# Redis + Kafka 接入与验证手册

本文用于当前项目后端在本地联调 Redis（验证码缓存）和 Kafka（登录事件）时的快速操作与排障。

## 1. `.env` 最小配置

以下字段放在 `backend/.env`：

```env
# Redis
REDIS_ADDR=your-redis-host:port
REDIS_USERNAME=default
REDIS_PASSWORD=your-password
REDIS_DB=0
REDIS_TLS=false
REDIS_KEY_PREFIX=captcha:

# Kafka
KAFKA_ENABLED=true
KAFKA_BROKERS=your-kafka-host:port
KAFKA_TOPIC_USER_LOGIN=user.login
KAFKA_CLIENT_ID=go-react-backend
KAFKA_USERNAME=your-username
KAFKA_PASSWORD=your-password
KAFKA_SASL_MECHANISM=PLAIN
KAFKA_SECURITY_PROTOCOL=SASL_SSL
KAFKA_INSECURE_SKIP_VERIFY=false
```

说明：

- `REDIS_TLS` 必须与服务端端口一致；如果端口不是 TLS 端口，必须设为 `false`
- `KAFKA_TOPIC_USER_LOGIN` 对应的 topic 必须提前创建

## 2. 启动成功日志（判定标准）

启动后看到以下日志，表示接入成功：

- Redis：`[captcha] 使用 Redis 存储验证码: ...`
- Kafka：`Kafka 事件发布已启用: brokers=... topic=...`

如果看到以下日志，表示 Redis 已回退到内存：

- `[captcha] REDIS_ADDR 未配置，使用内存存储`
- `[captcha] Redis 初始化失败，回退内存存储: ...`

## 3. Redis 验证步骤

1. 启动后端，访问登录页，触发验证码接口 `GET /api/auth/captcha`
2. 在 Redis Insight 查询：`captcha:*`
3. 打开任意 key，确认 `TTL` 在递减

若搜索不到：

- 确认服务端日志确实是“使用 Redis 存储验证码”
- 确认连接的是与 `REDIS_ADDR` 同一个实例
- 确认 key 前缀是否被改成了非 `captcha:`

## 4. Kafka 验证步骤

1. 使用正确验证码登录一次（`POST /api/auth/login`）
2. 观察后端日志：
   - 无 `发布登录事件失败` 警告，则说明发送成功
3. 在 Kafka 控制台或消费者查看 `KAFKA_TOPIC_USER_LOGIN`（如 `user.login`）是否有新消息

## 5. 常见问题与处理

### 5.1 `tls: first record does not look like a TLS handshake`

原因：Redis 客户端按 TLS 连接，但服务端端口不是 TLS。

处理：

- 改成 Public endpoint 对应的正确端口
- 或把 `REDIS_TLS=false`

### 5.2 `Unknown Topic Or Partition`

原因：Kafka topic 不存在，或名称写错。

处理：

- 在 Kafka 平台先创建 topic
- 校对 `KAFKA_TOPIC_USER_LOGIN` 与平台中的 topic 名完全一致

### 5.3 Redis Insight 连上但搜不到 key

原因通常是请求没真正打到后端 Redis，或还没触发写入。

处理：

1. 先请求一次 `GET /api/auth/captcha`
2. 再搜 `captcha:*`
3. 核对日志是否显示 Redis 已启用

## 6. 当前项目实现位置

- Redis 验证码存储：`backend/pkg/utils/captcha/redis_store.go`
- 验证码初始化入口：`backend/cmd/server/main.go`
- Kafka 发布器：`backend/internal/messaging/kafka_publisher.go`
- 登录发布事件：`backend/internal/services/user_service.go`
