# Render 部署说明（前后端）

本文档对应仓库根目录 `render.yaml`，用于在 Render 一次性创建：
- 后端：`go-react-backend`（Docker Web Service）
- 前端：`go-react-frontend`（Static Site）

## 1. 前置准备

部署前需要准备可公网访问的依赖（本机 `localhost` 无法被 Render 访问）：
- PostgreSQL（可用 Supabase / Neon / Render Postgres）
- Redis（你当前使用的 Redis Cloud 可继续使用）
- Kafka（你当前使用的 Aiven Kafka 可继续使用）

## 2. 使用 Blueprint 创建服务

1. 打开 Render 控制台，`New` -> `Blueprint`
2. 选择当前 GitHub 仓库
3. Render 会自动识别根目录 `render.yaml`
4. 点击创建，等待 `go-react-backend` 与 `go-react-frontend` 初始化完成

## 3. 需要手动填写的后端环境变量

`render.yaml` 中带 `sync: false` 的变量需要在 Render 控制台补齐：
- `DATABASE_HOST`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASS`
- `CORS_ORIGIN`（先留空，前端首次成功后再填）
- `REDIS_ADDR`
- `REDIS_USERNAME`
- `REDIS_PASSWORD`
- `KAFKA_BROKERS`
- `KAFKA_TOPIC`
- `KAFKA_SSL_CA_FILE`
- `KAFKA_SSL_CERT_FILE`
- `KAFKA_SSL_KEY_FILE`
- `ENCRYPTION_AES_KEY`（仅在 `ENABLE_SIGNATURE=true` 时必填）

说明：
- `JWT_SECRET`、`SIGNATURE_SECRET` 会由 Render 自动生成。
- 后端已支持 `SERVER_PORT` 优先，未设置时自动读取平台 `PORT`。

## 4. CORS 正确设置顺序

1. 先让前端服务成功部署，拿到前端域名（例如 `https://go-react-frontend.onrender.com`）
2. 将后端 `CORS_ORIGIN` 设置为该前端域名
3. 手动触发后端一次 `Deploy latest commit`

## 5. 验收清单

后端：
- 打开 `https://<backend-domain>/health`，应返回 `status=ok` 或 `degraded` JSON
- 打开 `https://<backend-domain>/metrics`，应返回 Prometheus 文本指标

前端：
- 打开前端域名，能进入登录页
- 登录后不再出现跨域报错

Kafka / Redis：
- 登录一次后，后端日志不应再出现 `Unknown Topic Or Partition`
- Redis Insight 能看到 `captcha:*` 键写入与 TTL 递减
