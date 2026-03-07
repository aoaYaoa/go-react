# Supabase Session Pooler Design

**Goal:** 将 `go-react` 生产后端从 Supabase direct connection 切换为 session pooler，尽量不改代码，只调整配置与说明文档。

**Architecture:** 保持现有 `postgres + sslmode=require` 接入方式不变，只替换 `DATABASE_HOST`、必要时替换 `DATABASE_USER` 和 `DATABASE_PORT` 为 Supabase dashboard 提供的 session pooler 值。应用代码继续复用现有 GORM PostgreSQL 连接逻辑，不引入新的 DSN 解析层。

**Scope:** 仅修改数据库连接配置，不变更 Kafka、Redis、业务代码与数据库结构。

**Validation:** 修改后重启新机 `go-react` 服务，检查数据库初始化日志与关键业务接口可用性。
