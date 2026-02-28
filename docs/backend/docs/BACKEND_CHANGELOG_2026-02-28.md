# 后端变更记录（2026-02-28）

本文件记录本轮后端架构升级，便于联调与运维同步。

## 1. 可靠性

- Kafka 发布链路升级为：
  - `Outbox -> Async Retry -> Kafka`
- 登录事件不再直接同步写 Kafka，先持久化到 `event_outbox`
- Kafka 短暂异常时由 Outbox 自动重试补发

## 2. 安全

- JWT 改为使用 `JWT_SECRET` 初始化默认密钥
- PostgreSQL `sslmode` 改为配置项：`DATABASE_SSL_MODE`
- 签名加解密启用时，强制校验 `ENCRYPTION_AES_KEY`（16/24/32 字节）

## 3. 可观测性

- 新增 `/metrics` 指标导出（Prometheus 文本格式）
- 新增请求级指标：
  - `http_requests_total`
  - `http_request_duration_seconds_sum/count`
  - `http_inflight_requests`

## 4. 健康检查

- `/health` 与 `/api/health` 支持组件级状态：
  - `database`
  - `redis`
  - `kafka`
- 依赖异常返回 `503`

## 5. 工程化

- `backend/scripts/*.go` 重构为独立命令目录（`scripts/<name>/main.go`）
- 修复了 `go test ./...` 被多 `main` 冲突阻断的问题
- 新增 GitHub Actions：
  - 后端：`go test ./...`
  - 前端：`npm ci && npm run build`

## 6. 建议运维检查项

上线后建议重点关注：

1. `event_outbox` 中 `pending` 数量是否持续增长
2. `/health` 是否长期出现 `degraded`
3. `/metrics` 中请求时延与错误比例变化
