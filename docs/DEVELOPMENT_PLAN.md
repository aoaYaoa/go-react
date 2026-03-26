# SkyTracker 开发计划

> 最后更新：2026-03-26

## 当前状态总览

**已完成（主干功能）**：基础架构、认证体系、任务管理、多数据库支持、Kafka 事件总线、Redis 验证码、安全中间件体系、前端页面框架（含地图、无人机、分析、社区、管理后台路由）、自动部署。

**进行中**：各业务模块后端 API 实现（机场、航班、无人机等数据接口）。

---

## 一、开发阶段规划

### Sprint 1: 基础架构 - 已完成 ✅

**后端**:
- ✅ Go + Gin 项目初始化（标准项目布局）
- ✅ 多数据库支持（MySQL / PostgreSQL / MongoDB）+ GORM
- ✅ JWT 认证中间件
- ✅ 用户注册 / 登录 API（含图形验证码）
- ✅ Swagger 文档集成
- ✅ 结构化日志（每日轮转 + 彩色输出）
- ✅ 统一错误处理（AppError + 业务错误码）
- ✅ 手动依赖注入容器（替代 Wire）
- ✅ 优雅关闭

**前端**:
- ✅ React 18 + TypeScript + Vite
- ✅ React Router v6 路由系统
- ✅ Zustand 状态管理
- ✅ Ant Design 组件库
- ✅ 用户认证流程（JWT + Cookie）
- ✅ 国际化（i18n）
- ✅ 基础布局（Navbar、Footer、侧边栏）
- ✅ 登录 / 注册页面

**数据库**:
- ✅ users 表
- ✅ roles / user_roles / menus / role_menus 表
- ✅ tasks 表

**运维**:
- ✅ Docker + docker-compose（本地全栈）
- ✅ Render 自动部署（render.yaml）
- ✅ GitHub Actions CI（后端 go test + 前端 build）

---

### Sprint 2: 安全与可观测性 - 已完成 ✅

- ✅ 请求签名（HMAC-SHA256）+ AES 加解密中间件
- ✅ IP 白名单 / 黑名单
- ✅ CORS、安全响应头
- ✅ 限流中间件
- ✅ 请求 ID / Trace ID 透传
- ✅ Prometheus 指标端点（`/metrics`）
- ✅ 健康检查（`/health`，含 DB / Redis / Kafka 组件状态）
- ✅ Redis 验证码存储（自动回退内存）
- ✅ Kafka 登录事件总线（Outbox 模式，异步重试）

---

### Sprint 3: 前端页面框架 - 已完成 ✅

前端路由已全部定义，页面骨架已建立：

| 路径 | 页面 | 状态 |
|------|------|------|
| `/` | 首页 | ✅ |
| `/map` | 地图（Mars3D / Cesium） | ✅ 框架 |
| `/flights` | 航班列表 | ✅ 框架 |
| `/airports` | 机场列表 | ✅ 框架 |
| `/drones/map` | 无人机地图 | ✅ 框架 |
| `/drones/list` | 无人机列表 | ✅ 框架 |
| `/drones/missions` | 无人机任务 | ✅ 框架 |
| `/analytics/*` | 数据分析（概览/航线/趋势） | ✅ 框架 |
| `/community/*` | 社区（帖子/照片） | ✅ 框架 |
| `/admin/*` | 管理后台（用户/角色/菜单/机场/航空公司/飞机/无人机/运营商/禁飞区/日志） | ✅ 框架 |
| `/login` | 登录 | ✅ |
| `/register` | 注册 | ✅ |

---

### Sprint 4: 业务 API 实现 - 进行中 🚧

**目标**: 实现各业务模块完整后端 API

数据模型已定义（`internal/models/`）：
- `aircraft.go`, `airline.go`, `airport.go`
- `drone.go`, `drone_flight_log.go`, `drone_incident.go`
- `flight_history.go`, `flight_position.go`, `flight_route.go`
- `no_fly_zone.go`, `operator.go`
- `system_log.go`

待实现（Repository → Service → Handler → Route）：
- [ ] 机场 CRUD API
- [ ] 航空公司 CRUD API
- [ ] 飞机 CRUD API
- [ ] 航班列表 / 搜索 / 详情 API
- [ ] 航班位置更新 API
- [ ] 无人机管理 API
- [ ] 无人机飞行日志 API
- [ ] 禁飞区管理 API
- [ ] 系统日志查询 API
- [ ] 运营商管理 API

---

### Sprint 5: 实时功能 - 待开始 📋

- [ ] WebSocket 实时航班位置推送
- [ ] 无人机实时轨迹
- [ ] 前端地图实时数据渲染

---

### Sprint 6: 数据对接与完善 - 待开始 📋

- [ ] 外部航班数据源接入（OpenSky / AviationStack）
- [ ] 航迹回放功能
- [ ] 数据分析图表（后端聚合接口）
- [ ] 社区功能（帖子 / 照片 API）

---

## 二、后端 API 现状

### 已实现

```
GET  /health              健康检查
GET  /api/health          健康检查（API前缀）
GET  /metrics             Prometheus 指标
GET  /swagger/*           Swagger UI

GET  /api/auth/captcha    获取验证码
POST /api/auth/register   注册
POST /api/auth/login      登录（返回 access token 15min + refresh token 7d）
POST /api/auth/refresh    刷新 access token（token rotation）
POST /api/auth/logout     登出（吊销 refresh token）

GET  /api/user/profile    当前用户资料（需 JWT）

GET  /api/admin/users     用户列表（需 JWT + admin 角色）

GET    /api/tasks         任务列表
GET    /api/tasks/:id     任务详情
POST   /api/tasks         创建任务
PUT    /api/tasks/:id     更新任务
DELETE /api/tasks/:id     删除任务
PATCH  /api/tasks/:id/toggle 切换任务状态
```

### 待实现

详见 Sprint 4 任务列表。

---

## 三、技术债与优化项

- [ ] 前端各页面骨架补充真实 API 对接
- [ ] 管理后台权限精细化（当前仅 admin 角色）
- [ ] 前端错误边界完善
- [ ] E2E 测试
- [ ] 生产环境 Kafka / Redis 监控告警

### 架构改进（2026-03-26 完成）

- ✅ **14.1** golang-migrate 版本化迁移（`migrations/` 目录 + `RunMigrations`）
- ✅ **14.2** `/metrics` IP 访问控制（`METRICS_ALLOWED_IPS` 环境变量）
- ✅ **14.3** Swagger 仅非 release 模式开放
- ✅ **14.4** 集成测试骨架（testcontainers-go，UserRepository，`-tags=integration`）
- ✅ **14.5** Outbox Worker 优雅关闭（WaitGroup + stopCh）
- ✅ **14.6** JWT Refresh Token（access 15min + refresh 7d，Redis 存储，token rotation，`/auth/refresh` + `/auth/logout`）
- ✅ **14.7** 认证接口 IP 级限流（`/api/auth` 独立 5 req/s）
