# Supabase Session Pooler Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `go-react` 生产数据库连接切到 Supabase session pooler，以降低 direct connection 带来的网络不稳定问题。

**Architecture:** 保持现有 PostgreSQL 配置结构和 GORM 初始化逻辑，只替换生产环境中的 Supabase 连接参数，并补充本地示例配置说明。上线后通过服务重启和接口访问验证数据库连接正常。

**Tech Stack:** Go, Gin, GORM, PostgreSQL, Supabase

---

### Task 1: 确认 session pooler 连接信息

**Files:**
- Check: `/Users/aay/自有项目/go-react/backend/.env`
- Check: `/opt/apps/go-react/backend/.env`

**Step 1: 核对官方连接方式**

Run: `open https://supabase.com/docs/guides/database/connecting-to-postgres`
Expected: 文档明确持久化客户端可使用 pooler session mode。

**Step 2: 确认项目的 pooler host / user / port**

Run: 从 Supabase Dashboard 的 Connect 面板获取 Session pooler 连接串。
Expected: 获得精确的 `host`、`port`、`user`。

### Task 2: 修改项目示例配置与说明

**Files:**
- Modify: `/Users/aay/自有项目/go-react/backend/.env.example`

**Step 1: 更新注释示例**

将 Supabase 示例从 direct connection 改为 session pooler 示例，并说明 host 不要带 `https://`。

**Step 2: 保存示例配置**

Expected: 后续维护时不会再把 direct host 或 URL 写错。

### Task 3: 修改生产配置并验证

**Files:**
- Modify: `/opt/apps/go-react/backend/.env`

**Step 1: 更新生产数据库配置**

只替换 `DATABASE_HOST`、必要时替换 `DATABASE_PORT`、`DATABASE_USER`。

**Step 2: 重启 go-react 服务**

Run: `docker compose -f /opt/apps/go-react/docker-compose.prod.yml up -d --build`
Expected: 容器正常启动。

**Step 3: 查看日志与接口**

Run: 检查容器日志和线上接口。
Expected: 数据库初始化成功，关键接口可访问。
