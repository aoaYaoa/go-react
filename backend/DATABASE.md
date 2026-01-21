# 数据库文档

后端通过 GORM (用于 SQL) 和自定义接口 (用于 NoSQL) 抽象，支持多种数据库后端。

## 支持的数据库

- **MySQL**: 生产环境标准。
- **SQLite**: 开发环境默认 (零配置)。
- **MoonDB**: 自定义数据库解决方案。
- **MongoDB**: 文档存储支持。

## 配置

在 `.env` 中设置 `DATABASE_TYPE`：

```ini
# 选项: mysql, sqlite, moondb, mgdb
DATABASE_TYPE=sqlite
```

## 数据库结构 (Schema)

### 用户表 (`users`)

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| ID | uint | 主键 |
| Username | string | 唯一，索引 |
| Email | string | 唯一，索引 |
| Password | string | Bcrypt 哈希 |
| Role | string | 'user' 或 'admin' |
| CreatedAt | int64 | Unix 时间戳 |
| UpdatedAt | int64 | Unix 时间戳 |

### 任务表 (`tasks`)

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| ID | string | UUID |
| Title | string | 任务标题 |
| Description | string | 任务详情 |
| Status | int | 0: 待办, 1: 已完成 |
| CreatedAt | time.Time | 创建时间 |
| UpdatedAt | time.Time | 更新时间 |

## 数据库迁移

数据库迁移通过 `dbManager.Migrate()` 在应用程序启动时自动运行。
这确保了数据库结构始终与代码保持同步。

## 开发数据库

对于本地开发，推荐使用 **SQLite**。
数据库文件存储在 `backend/moondb_appdb.db` (或类似路径，取决于配置名称)。
**注意**: `*.db` 文件已在 `.gitignore` 中忽略。
