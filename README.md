# SkyTracker

实时航班追踪与航空数据可视化平台，基于 Go + React 全栈开发。

## 项目概览

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| 后端 | Go 1.26 + Gin + GORM | RESTful API 服务 |
| 前端 | React 18 + TypeScript + Vite | SPA 单页应用 |
| 数据库 | PostgreSQL (Supabase) / MySQL / MongoDB | 多数据库支持 |
| 缓存 | Redis | 验证码存储 |
| 消息队列 | Kafka | 登录事件异步处理 |
| 部署 | Render (Docker) | 自动部署 |

## 功能模块

### 后端 API
- 用户注册、登录（JWT + 图形验证码）
- 任务管理 CRUD
- 用户资料 / 管理员用户列表
- 健康检查 (`/health`, `/api/health`)
- Prometheus 指标 (`/metrics`)
- Swagger 文档 (`/swagger/index.html`)

### 前端页面
- 首页、地图（Mars3D / Cesium）
- 航班列表、机场列表
- 无人机：地图、列表、任务
- 数据分析：概览、航线、趋势
- 社区：帖子、照片
- 管理后台：用户、角色、菜单、机场、航空公司、飞机、无人机、运营商、禁飞区、系统日志
- 国际化（i18n）支持

## 快速开始

### 后端

```bash
cd backend
cp .env.example .env   # 配置数据库、JWT、Redis 等
make dev               # 热重载开发模式（需要 Air）
# 或
make run               # 标准运行
```

### 前端

```bash
cd frontend
cp .env.example .env   # 配置 VITE_API_BASE_URL
npm install
npm run dev
```

### Docker Compose（本地全栈）

```bash
docker compose up
```

默认使用 MongoDB，后端端口 8080，前端开发端口 5173。

## 项目结构

```
go-react/
├── backend/                  # Go 后端
│   ├── cmd/server/main.go    # 程序入口
│   ├── internal/
│   │   ├── config/           # 配置加载（.env + 环境变量）
│   │   ├── container/        # 手动依赖注入容器
│   │   ├── database/         # 数据库连接与迁移
│   │   ├── handlers/         # HTTP 处理层
│   │   ├── middlewares/      # Gin 中间件
│   │   ├── models/           # GORM 数据模型
│   │   ├── repositories/     # 数据访问层
│   │   ├── routes/           # 路由注册
│   │   └── services/         # 业务逻辑层
│   └── pkg/utils/            # 公共工具（JWT、日志、验证码等）
├── frontend/                 # React 前端
│   └── src/
│       ├── components/       # 公共组件
│       ├── layouts/          # 布局组件
│       ├── pages/            # 页面组件
│       ├── router/           # 路由配置
│       ├── services/         # API 调用
│       ├── store/            # Zustand 状态管理
│       └── utils/            # 工具函数
├── docs/                     # 项目文档
├── docker-compose.yml        # 本地 Docker 编排
└── render.yaml               # Render 云部署配置
```

## 部署

项目通过 `render.yaml` 配置在 [Render](https://render.com) 自动部署：

- 后端：Docker 容器，健康检查路径 `/health`
- 前端：静态站点，SPA 路由重写

推送到 `main` 分支后自动触发部署。

## 文档

- [后端架构](docs/backend/ARCHITECTURE.md)
- [API 文档](docs/backend/API.md)
- [数据库设计](docs/backend/DATABASE.md)
- [安全配置](docs/SECURITY_CONFIG.md)
- [加密方案](docs/CRYPTO.md)
- [认证集成](docs/AUTHENTICATION_INTEGRATION.md)
