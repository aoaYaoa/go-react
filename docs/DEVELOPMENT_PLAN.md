# SkyTracker 开发计划

## 一、开发阶段规划

### Sprint 1: 基础架构 (2周) - 已完成 ✅

**目标**: 搭建项目基础框架

**后端任务**:
- ✅ Go + Gin 项目初始化
- ✅ PostgreSQL 数据库连接
- ✅ JWT 认证中间件
- ✅ 用户注册/登录 API
- ✅ Swagger 文档集成
- ✅ 日志系统
- ✅ 错误处理机制

**前端任务**:
- ✅ React + TypeScript 项目初始化
- ✅ 路由系统 (React Router)
- ✅ 用户认证流程
- ✅ 基础布局组件
- ✅ 登录/注册页面
- ✅ API 文档页面

**数据库**:
- ✅ users 表

---

### Sprint 2: 地图基础 (2周)

**目标**: 实现基础地图功能

**后端任务**:
- 机场数据 API (CRUD)
- 航空公司数据 API
- 基础数据导入脚本

**前端任务**:
- 集成 Mapbox GL JS / Cesium
- 地图组件开发
- 地图控件 (缩放、图层切换)
- 机场标注显示
- 地图样式切换

**数据库**:
- airports 表
- airlines 表

**前端路由新增**:
```
/map - 地图主页 (公开访问)
```

---

### Sprint 3: 航班追踪核心 (3周)

**目标**: 实现航班实时追踪功能

**后端任务**:
- 航班数据模型设计
- 航班 CRUD API
- 飞机数据 API
- 航班位置更新 API
- WebSocket 实时推送
- 航班搜索 API

**前端任务**:
- 航班列表组件
- 航班搜索组件
- 航班详情侧边栏
- 地图上显示航班
- 实时位置更新
- 航班筛选功能

**数据库**:
- flights 表
- aircrafts 表
- flight_positions 表

**前端路由新增**:
```
/flights - 航班列表
/flights/:id - 航班详情
```

---

### Sprint 4: 航班历史与详情 (2周)

**目标**: 完善航班信息展示

**后端任务**:
- 航班历史记录 API
- 航线数据 API
- 飞机照片管理 API
- 航迹回放数据 API

**前端任务**:
- 航班详情页完善
- 航班历史记录展示
- 航迹回放功能
- 飞机信息展示
- 照片画廊组件

**数据库**:
- flight_history 表
- flight_routes 表
- aircraft_photos 表

**前端路由新增**:
```
/flights/:id/history - 航班历史
/flights/:id/playback - 航迹回放
/aircraft/:id - 飞机详情
```

---

### Sprint 5: 机场信息 (2周)

**目标**: 完善机场信息系统

**后端任务**:
- 机场详情 API
- 跑道信息 API
- 机场天气 API
- 登机口管理 API
- 机场统计 API

**前端任务**:
- 机场列表页
- 机场详情页
- 机场天气组件
- 起降航班列表
- 机场统计图表

**数据库**:
- runways 表
- airport_weather 表
- gates 表

**前端路由新增**:
```
/airports - 机场列表
/airports/:id - 机场详情
/airports/:id/flights - 机场航班
/airports/:id/stats - 机场统计
```

---

### Sprint 6: 用户个性化 (2周)

**目标**: 实现用户个性化功能

**后端任务**:
- 收藏功能 API
- 航班提醒 API
- 通知系统 API
- 用户飞行日志 API
- 用户统计 API

**前端任务**:
- 个人中心页面
- 收藏管理
- 提醒设置
- 飞行日志
- 飞行统计
- 飞行地图

**数据库**:
- user_favorites 表
- flight_alerts 表
- user_notifications 表
- user_flights 表
- user_stats 表

**前端路由新增**:
```
/profile - 个人中心
/profile/favorites - 我的收藏
/profile/alerts - 我的提醒
/profile/flights - 飞行日志
/profile/stats - 飞行统计
/profile/map - 飞行地图
```

---

### Sprint 7: 数据分析 (2周)

**目标**: 实现数据统计与可视化

**后端任务**:
- 全局统计 API
- 航线统计 API
- 趋势分析 API
- 数据导出 API

**前端任务**:
- 数据大屏
- 统计图表
- 热力图
- 流向图
- 趋势分析
- 数据导出功能

**数据库**:
- daily_stats 表
- route_stats 表

**前端路由新增**:
```
/analytics - 数据分析
/analytics/overview - 总览
/analytics/routes - 航线分析
/analytics/airports - 机场分析
/analytics/trends - 趋势分析
```

---

### Sprint 8: 无人机基础 (2周)

**目标**: 搭建无人机管理基础

**后端任务**:
- 无人机数据模型
- 无人机 CRUD API
- 运营商管理 API
- 设备管理 API

**前端任务**:
- 无人机列表页
- 无人机详情页
- 设备管理页
- 运营商管理页

**数据库**:
- drones 表
- drone_operators 表

**前端路由新增**:
```
/drones - 无人机管理
/drones/list - 无人机列表
/drones/:id - 无人机详情
/drones/operators - 运营商管理
```

---

### Sprint 9: 无人机任务管理 (3周)

**目标**: 实现无人机任务系统

**后端任务**:
- 飞行任务 API
- 任务审批流程 API
- 航线规划 API
- 禁飞区管理 API
- 实时位置追踪 API

**前端任务**:
- 任务创建页面
- 航线规划工具
- 任务列表
- 任务详情
- 地图上显示无人机
- 禁飞区显示
- 实时追踪

**数据库**:
- drone_missions 表
- drone_positions 表
- no_fly_zones 表

**前端路由新增**:
```
/drones/missions - 任务管理
/drones/missions/create - 创建任务
/drones/missions/:id - 任务详情
/drones/map - 无人机地图
/drones/no-fly-zones - 禁飞区管理
```

---

### Sprint 10: 无人机日志与安全 (2周)

**目标**: 完善无人机安全管理

**后端任务**:
- 飞行日志 API
- 事件/事故管理 API
- 合规检查 API
- 统计分析 API

**前端任务**:
- 飞行日志页面
- 日志回放
- 事件管理
- 合规检查
- 统计报表

**数据库**:
- drone_flight_logs 表
- drone_incidents 表

**前端路由新增**:
```
/drones/logs - 飞行日志
/drones/logs/:id - 日志详情
/drones/incidents - 事件管理
/drones/compliance - 合规管理
/drones/analytics - 无人机统计
```

---

### Sprint 11: 社区功能 (2周)

**目标**: 建立用户社区

**后端任务**:
- 帖子管理 API
- 评论系统 API
- 点赞功能 API
- 照片管理 API

**前端任务**:
- 社区首页
- 发布帖子
- 帖子详情
- 评论互动
- 照片分享

**数据库**:
- posts 表
- post_comments 表
- post_likes 表

**前端路由新增**:
```
/community - 社区
/community/posts - 帖子列表
/community/posts/:id - 帖子详情
/community/create - 发布帖子
/community/photos - 照片库
```

---

### Sprint 12: 高级功能 (3周)

**目标**: 实现高级特性

**后端任务**:
- 3D 数据 API
- 预测算法
- API 服务完善
- 性能优化

**前端任务**:
- 3D 可视化
- 预测功能
- VR 支持
- 性能优化

**前端路由新增**:
```
/3d-view - 3D 视图
/predictions - 预测分析
```

---

## 二、完整前端路由结构

### 1. 公开路由 (无需登录)

```typescript
// 首页与基础页面
/ - 首页
/about - 关于我们
/login - 登录
/register - 注册

// 地图与追踪 (只读)
/map - 实时地图
/flights - 航班列表 (只读)
/flights/:id - 航班详情 (只读)
/airports - 机场列表
/airports/:id - 机场详情
```

### 2. 用户路由 (需要登录 - user 角色)

```typescript
// 个人中心
/profile - 个人资料
/profile/favorites - 我的收藏
  /profile/favorites/flights - 收藏的航班
  /profile/favorites/airports - 收藏的机场
  /profile/favorites/airlines - 收藏的航空公司
/profile/alerts - 我的提醒
/profile/flights - 飞行日志
/profile/stats - 飞行统计
/profile/map - 飞行地图
/profile/settings - 账号设置

// 航班追踪 (完整功能)
/flights/search - 高级搜索
/flights/:id/track - 追踪航班
/flights/:id/history - 航班历史
/flights/:id/playback - 航迹回放

// 机场信息
/airports/:id/flights - 机场航班
/airports/:id/stats - 机场统计

// 飞机信息
/aircraft - 飞机列表
/aircraft/:id - 飞机详情

// 社区
/community - 社区首页
/community/posts - 帖子列表
/community/posts/:id - 帖子详情
/community/create - 发布帖子
/community/photos - 照片库
/community/my-posts - 我的帖子
```


### 3. 专业版路由 (需要 premium 角色)

```typescript
// 数据分析
/analytics - 数据分析首页
/analytics/overview - 总览
/analytics/routes - 航线分析
/analytics/airports - 机场分析
/analytics/airlines - 航空公司分析
/analytics/trends - 趋势分析
/analytics/export - 数据导出

// 高级功能
/3d-view - 3D 视图
/predictions - 预测分析
/predictions/delays - 延误预测
/predictions/prices - 价格预测

// 无人机基础 (最多10架)
/drones - 无人机管理首页
/drones/list - 无人机列表
/drones/:id - 无人机详情
/drones/map - 无人机地图
```

### 4. 无人机专业版路由 (需要 drone_pro 角色)

```typescript
// 无人机管理
/drones/operators - 运营商管理
/drones/operators/:id - 运营商详情

// 任务管理
/drones/missions - 任务列表
/drones/missions/create - 创建任务
/drones/missions/:id - 任务详情
/drones/missions/:id/edit - 编辑任务
/drones/missions/:id/track - 追踪任务

// 航线规划
/drones/planner - 航线规划工具
/drones/no-fly-zones - 禁飞区管理

// 飞行日志
/drones/logs - 飞行日志
/drones/logs/:id - 日志详情
/drones/logs/:id/playback - 日志回放

// 安全与合规
/drones/incidents - 事件管理
/drones/incidents/:id - 事件详情
/drones/compliance - 合规检查
/drones/compliance/licenses - 证照管理
/drones/compliance/insurance - 保险管理

// 统计分析
/drones/analytics - 无人机统计
/drones/analytics/performance - 性能分析
/drones/analytics/efficiency - 效率分析
/drones/analytics/costs - 成本分析
```

### 5. 管理员路由 (需要 admin 角色)

```typescript
// 系统管理
/admin - 管理后台首页
/admin/users - 用户管理
/admin/users/:id - 用户详情
/admin/roles - 角色权限管理

// 数据管理
/admin/data - 数据管理
/admin/data/airports - 机场数据
/admin/data/airlines - 航空公司数据
/admin/data/aircraft - 飞机数据

// 无人机管理
/admin/drones - 无人机审核
/admin/operators - 运营商审核
/admin/missions - 任务审批
/admin/no-fly-zones - 禁飞区管理

// 系统设置
/admin/settings - 系统设置
/admin/logs - 系统日志
/admin/api-docs - API 文档

// 统计报表
/admin/reports - 报表中心
/admin/reports/users - 用户报表
/admin/reports/flights - 航班报表
/admin/reports/drones - 无人机报表
```

---

## 三、前端菜单配置

### 导航栏菜单结构

```typescript
export const menuConfig: MenuConfig[] = [
  // 1. 首页 (公开)
  {
    key: 'home',
    path: '/',
    label: '首页',
    requiredRole: null,
    icon: <HomeIcon />
  },

  // 2. 实时追踪 (公开，登录后功能更多)
  {
    key: 'tracking',
    label: '实时追踪',
    requiredRole: null,
    icon: <RadarIcon />,
    children: [
      {
        key: 'map',
        path: '/map',
        label: '实时地图',
        requiredRole: null
      },
      {
        key: 'flights',
        path: '/flights',
        label: '航班列表',
        requiredRole: null
      },
      {
        key: 'airports',
        path: '/airports',
        label: '机场信息',
        requiredRole: null
      },
      {
        key: 'aircraft',
        path: '/aircraft',
        label: '飞机信息',
        requiredRole: 'user'
      }
    ]
  },

  // 3. 无人机 (需要登录)
  {
    key: 'drones',
    label: '无人机',
    requiredRole: 'user',
    icon: <DroneIcon />,
    children: [
      {
        key: 'drone-map',
        path: '/drones/map',
        label: '无人机地图',
        requiredRole: 'user'
      },
      {
        key: 'drone-list',
        path: '/drones/list',
        label: '设备管理',
        requiredRole: 'user'
      },
      {
        key: 'drone-missions',
        path: '/drones/missions',
        label: '任务管理',
        requiredRole: 'drone_pro'
      },
      {
        key: 'drone-logs',
        path: '/drones/logs',
        label: '飞行日志',
        requiredRole: 'drone_pro'
      },
      {
        key: 'drone-compliance',
        path: '/drones/compliance',
        label: '合规管理',
        requiredRole: 'drone_pro'
      }
    ]
  },

  // 4. 数据分析 (需要 premium)
  {
    key: 'analytics',
    label: '数据分析',
    requiredRole: 'premium',
    icon: <ChartIcon />,
    children: [
      {
        key: 'analytics-overview',
        path: '/analytics/overview',
        label: '数据总览',
        requiredRole: 'premium'
      },
      {
        key: 'analytics-routes',
        path: '/analytics/routes',
        label: '航线分析',
        requiredRole: 'premium'
      },
      {
        key: 'analytics-trends',
        path: '/analytics/trends',
        label: '趋势分析',
        requiredRole: 'premium'
      },
      {
        key: 'drone-analytics',
        path: '/drones/analytics',
        label: '无人机统计',
        requiredRole: 'drone_pro'
      }
    ]
  },

  // 5. 社区 (需要登录)
  {
    key: 'community',
    label: '社区',
    requiredRole: 'user',
    icon: <CommunityIcon />,
    children: [
      {
        key: 'community-posts',
        path: '/community/posts',
        label: '飞行分享',
        requiredRole: 'user'
      },
      {
        key: 'community-photos',
        path: '/community/photos',
        label: '照片库',
        requiredRole: 'user'
      },
      {
        key: 'community-my-posts',
        path: '/community/my-posts',
        label: '我的帖子',
        requiredRole: 'user'
      }
    ]
  },

  // 6. 系统管理 (管理员)
  {
    key: 'admin',
    label: '系统管理',
    requiredRole: 'admin',
    icon: <SettingsIcon />,
    children: [
      {
        key: 'admin-users',
        path: '/admin/users',
        label: '用户管理',
        requiredRole: 'admin'
      },
      {
        key: 'admin-drones',
        path: '/admin/drones',
        label: '无人机审核',
        requiredRole: 'admin'
      },
      {
        key: 'admin-data',
        path: '/admin/data',
        label: '数据管理',
        requiredRole: 'admin'
      },
      {
        key: 'admin-api-docs',
        path: '/system/api-docs',
        label: 'API 文档',
        requiredRole: 'admin'
      }
    ]
  },

  // 7. 关于
  {
    key: 'about',
    path: '/about',
    label: '关于',
    requiredRole: null,
    icon: <InfoIcon />
  }
]
```

---

## 四、用户角色权限体系

### 角色定义

```typescript
type UserRole = 
  | null              // 未登录用户
  | 'user'            // 普通用户 (免费版)
  | 'premium'         // 高级用户 (个人版 $9.99/月)
  | 'drone_pro'       // 无人机专业版 ($29.99/月)
  | 'enterprise'      // 企业版 (定制)
  | 'admin'           // 管理员

// 角色继承关系
// admin > enterprise > drone_pro > premium > user > null
```

### 功能权限矩阵

| 功能模块 | 未登录 | user | premium | drone_pro | enterprise | admin |
|---------|--------|------|---------|-----------|------------|-------|
| 查看地图 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 查看航班 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 收藏航班 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 航班提醒 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 飞行日志 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 历史数据 | 7天 | 30天 | 无限 | 无限 | 无限 | 无限 |
| 数据分析 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 数据导出 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 3D 视图 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 预测功能 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 无人机追踪 | ❌ | 3架 | 10架 | 无限 | 无限 | 无限 |
| 任务管理 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 航线规划 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 飞行日志 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 合规管理 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 团队协作 | ❌ | ❌ | ❌ | 5人 | 无限 | 无限 |
| API 访问 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 系统管理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 五、开发优先级

### P0 (必须完成 - MVP)
1. ✅ 用户认证系统
2. 地图基础功能
3. 航班列表与搜索
4. 航班实时追踪
5. 基础数据管理

### P1 (重要功能)
1. 航班详情与历史
2. 机场信息
3. 用户收藏与提醒
4. 飞行日志
5. 无人机基础管理

### P2 (增值功能)
1. 数据分析
2. 无人机任务管理
3. 社区功能
4. 3D 可视化

### P3 (优化功能)
1. 预测功能
2. VR 支持
3. 高级分析
4. API 服务

---

## 六、技术栈详细说明

### 后端技术栈
```
- 语言: Go 1.26+
- Web 框架: Gin
- 数据库: PostgreSQL 15+ (Supabase)
- ORM: GORM
- 认证: JWT
- 文档: Swagger (swaggo)
- 日志: 自定义日志系统
- 缓存: Redis (后期)
- 实时通信: WebSocket
- 空间数据: PostGIS (后期)
```

### 前端技术栈
```
- 语言: TypeScript 5+
- 框架: React 18
- 路由: React Router v6
- UI 库: Ant Design
- 3D地图: Mars3D (基于 Cesium 封装)
- 2D地图: Mapbox GL JS (可选，用于2D视图)
- 图表: ECharts
- 状态管理: Context API (后期可升级 Zustand)
- HTTP 客户端: Axios
- 构建工具: Vite
- 样式: Tailwind CSS
```

### 开发工具
```
- 版本控制: Git
- 代码编辑器: VS Code
- API 测试: Postman / Swagger UI
- 数据库管理: DBeaver / pgAdmin
- 容器化: Docker (可选)
```

---

## 七、当前开发状态 (Sprint 1 完成)

### 已完成功能 ✅

**后端**:
- [x] Go + Gin 项目初始化
- [x] PostgreSQL (Supabase) 连接
- [x] 用户模型 (UUID 主键)
- [x] 用户注册 API
- [x] 用户登录 API
- [x] JWT Token 生成与验证
- [x] 认证中间件
- [x] Swagger 文档集成
- [x] 日志系统
- [x] 错误处理机制
- [x] CORS 配置

**前端**:
- [x] React + TypeScript 项目初始化
- [x] React Router 配置
- [x] 主布局组件 (MainLayout)
- [x] 空白布局组件 (BlankLayout)
- [x] 导航栏组件 (Navbar)
- [x] 登录页面
- [x] 注册页面
- [x] 首页
- [x] 关于页面
- [x] API 文档页面 (Swagger UI 集成)
- [x] 路由保护 (ProtectedRoute)
- [x] 用户认证服务
- [x] HTTP 请求封装
- [x] 响应式布局

**数据库**:
- [x] users 表 (UUID, username, email, password, role)

### 当前路由结构

**公开路由**:
- `/` - 首页
- `/about` - 关于
- `/login` - 登录
- `/register` - 注册

**需要认证的路由**:
- `/profile` - 个人资料
- `/system/api-docs` - API 文档 (需要 user 角色)

---

## 八、下一步开发计划 (Sprint 2)

### 目标: 实现地图基础功能

### 后端任务清单

1. **机场数据管理**
   - [ ] 创建 airports 表
   - [ ] 机场 CRUD API
   - [ ] 机场搜索 API
   - [ ] 导入初始机场数据

2. **航空公司数据管理**
   - [ ] 创建 airlines 表
   - [ ] 航空公司 CRUD API
   - [ ] 导入初始航空公司数据

3. **API 端点**
```go
// 机场相关
GET    /api/airports          // 获取机场列表
GET    /api/airports/:id      // 获取机场详情
POST   /api/airports          // 创建机场 (admin)
PUT    /api/airports/:id      // 更新机场 (admin)
DELETE /api/airports/:id      // 删除机场 (admin)
GET    /api/airports/search   // 搜索机场

// 航空公司相关
GET    /api/airlines          // 获取航空公司列表
GET    /api/airlines/:id      // 获取航空公司详情
POST   /api/airlines          // 创建航空公司 (admin)
PUT    /api/airlines/:id      // 更新航空公司 (admin)
DELETE /api/airlines/:id      // 删除航空公司 (admin)
```

### 前端任务清单

1. **地图组件开发**
   - [ ] 安装 Mars3D
   - [ ] 创建 Map3D 组件
   - [ ] 地图初始化配置
   - [ ] 地图控件 (缩放、旋转、全屏、罗盘)
   - [ ] 地图底图切换 (天地图、高德、谷歌等)
   - [ ] 2D/3D 视图切换

2. **机场展示**
   - [ ] 机场标注组件
   - [ ] 机场信息弹窗
   - [ ] 机场列表侧边栏
   - [ ] 机场搜索功能

3. **页面开发**
   - [ ] 地图主页 (`/map`)
   - [ ] 机场列表页 (`/airports`)
   - [ ] 机场详情页 (`/airports/:id`)

4. **类型定义**
```typescript
// 机场类型
interface Airport {
  id: string
  name: string
  iataCode: string
  icaoCode: string
  city: string
  country: string
  latitude: number
  longitude: number
  elevation: number
  timezone: string
  createdAt: string
}

// 航空公司类型
interface Airline {
  id: string
  name: string
  iataCode: string
  icaoCode: string
  callsign: string
  country: string
  logoUrl: string
  createdAt: string
}
```

### 前端路由更新

```typescript
// 新增路由
{
  path: '/map',
  element: <MapPage />,
  requiredRole: null,
  meta: { title: '实时地图' }
},
{
  path: '/airports',
  element: <AirportList />,
  requiredRole: null,
  meta: { title: '机场列表' }
},
{
  path: '/airports/:id',
  element: <AirportDetail />,
  requiredRole: null,
  meta: { title: '机场详情' }
}
```

### 菜单配置更新

```typescript
{
  key: 'map',
  path: '/map',
  label: '实时地图',
  requiredRole: null,
  icon: <MapIcon />
},
{
  key: 'airports',
  path: '/airports',
  label: '机场',
  requiredRole: null,
  icon: <AirportIcon />
}
```

---

## 九、数据库迁移计划

### Sprint 2 数据库变更

```sql
-- 机场表
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    iata_code VARCHAR(3) UNIQUE,
    icao_code VARCHAR(4) UNIQUE,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    elevation INT,
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_airports_iata ON airports(iata_code);
CREATE INDEX idx_airports_icao ON airports(icao_code);
CREATE INDEX idx_airports_country ON airports(country);

-- 航空公司表
CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    iata_code VARCHAR(3) UNIQUE,
    icao_code VARCHAR(4) UNIQUE,
    callsign VARCHAR(50),
    country VARCHAR(100),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_airlines_iata ON airlines(iata_code);
CREATE INDEX idx_airlines_icao ON airlines(icao_code);
CREATE INDEX idx_airlines_country ON airlines(country);
```

---

## 十、开发规范与最佳实践

### 代码提交规范

```bash
# 功能开发
git commit -m "feat: 添加机场列表页面"

# Bug 修复
git commit -m "fix: 修复地图缩放问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 代码重构
git commit -m "refactor: 重构用户服务层"

# 性能优化
git commit -m "perf: 优化地图渲染性能"
```

### 分支管理

```
main - 生产环境分支
develop - 开发环境分支
feature/* - 功能分支
bugfix/* - Bug 修复分支
hotfix/* - 紧急修复分支
```

### 代码审查检查清单

**后端**:
- [ ] 代码格式化 (gofmt)
- [ ] 错误处理完整
- [ ] 日志记录适当
- [ ] API 文档更新
- [ ] 数据验证
- [ ] 权限检查

**前端**:
- [ ] TypeScript 类型完整
- [ ] 组件命名规范
- [ ] 样式使用 scoped
- [ ] 无 console.log
- [ ] 响应式设计
- [ ] 错误处理

---

## 十一、测试策略

### 后端测试

```go
// 单元测试示例
func TestUserService_Register(t *testing.T) {
    tests := []struct {
        name    string
        input   dto.RegisterRequest
        wantErr bool
    }{
        {
            name: "成功注册",
            input: dto.RegisterRequest{
                Username: "testuser",
                Password: "password123",
            },
            wantErr: false,
        },
        {
            name: "用户名已存在",
            input: dto.RegisterRequest{
                Username: "existinguser",
                Password: "password123",
            },
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // 测试逻辑
        })
    }
}
```

### 前端测试

```typescript
// 组件测试示例
describe('Navbar', () => {
  it('应该显示项目名称', () => {
    render(<Navbar />)
    expect(screen.getByText('SkyTracker')).toBeInTheDocument()
  })
  
  it('未登录时应该显示登录按钮', () => {
    render(<Navbar />)
    expect(screen.getByText('登录')).toBeInTheDocument()
  })
})
```

---

## 十二、部署计划

### 开发环境
- 前端: `http://localhost:5173`
- 后端: `http://localhost:8080`
- 数据库: Supabase (云端)

### 生产环境 (未来)
- 前端: Vercel / Netlify
- 后端: Railway / Fly.io
- 数据库: Supabase (生产实例)
- CDN: Cloudflare

---

## 十三、性能优化目标

### 前端性能
- 首屏加载时间 < 2秒
- 地图初始化 < 1秒
- 路由切换 < 300ms
- API 请求响应 < 500ms

### 后端性能
- API 响应时间 < 200ms
- 数据库查询 < 100ms
- 并发支持 > 1000 req/s

---

## 总结

本开发计划提供了 SkyTracker 项目从当前状态到完整功能的清晰路径。通过循序渐进的 Sprint 规划，我们将逐步构建一个功能完善的航班与无人机追踪平台。

**当前状态**: Sprint 1 完成 (基础架构)  
**下一步**: Sprint 2 (地图基础功能)  
**预计完成时间**: 8个月 (12个 Sprint)

每个 Sprint 都有明确的目标、任务清单和验收标准，确保项目按计划推进。
