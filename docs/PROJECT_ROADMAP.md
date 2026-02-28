# SkyTracker 项目规划文档

## 项目概述

**项目名称**: SkyTracker  
**项目定位**: 实时航班与无人机追踪及航空数据可视化平台  
**技术栈**: Go + Gin + PostgreSQL + React + TypeScript + Mapbox/Cesium  
**目标用户**: 航空爱好者、旅客、航空公司、机场运营方、无人机运营商、监管机构

## 核心价值

SkyTracker 旨在为用户提供全球航班和无人机实时追踪及航空数据分析服务，帮助：
- 旅客实时查看航班动态，掌握起降信息
- 航空爱好者追踪感兴趣的航班和机型
- 机场和航空公司监控运营数据
- 数据分析师研究航空运输趋势
- 无人机运营商管理飞行任务和设备
- 监管机构监控低空飞行活动
- 公共安全部门进行空域管理

---

## 已完成功能 (v0.2)

### 1. 基础架构
- ✅ 前后端分离架构
- ✅ JWT 认证体系
- ✅ RESTful API 设计
- ✅ Swagger API 文档
- ✅ 数据库自动迁移（21张表）
- ✅ 日志系统（按日期分割）
- ✅ 错误处理机制
- ✅ 依赖注入容器 (Wire)

### 2. 用户系统
- ✅ 用户注册（含验证码）
- ✅ 用户登录
- ✅ 密码加密 (Bcrypt)
- ✅ JWT Token 认证
- ✅ 用户信息管理
- ✅ 角色权限 (user/premium/admin)
- ✅ 角色管理（RBAC）
- ✅ 动态菜单权限

### 3. 安全体系
- ✅ AES-CBC 请求/响应加密
- ✅ HMAC-SHA256 API 签名验证
- ✅ RSA 非对称加密支持
- ✅ IP 黑白名单访问控制
- ✅ 请求限流 (Rate Limiting)
- ✅ 安全响应头 (Security Headers)
- ✅ CORS 跨域配置
- ✅ 图形验证码 (Captcha)
- ✅ 响应压缩 (Gzip)

### 4. 前端界面
- ✅ 响应式布局（多断点适配）
- ✅ 导航系统（二级菜单）
- ✅ 登录/注册页面
- ✅ 首页、关于页面
- ✅ API 文档页面
- ✅ 路由保护 (ProtectedRoute)
- ✅ 国际化 (i18next 中英文切换)
- ✅ 主题切换 (亮色/暗色)
- ✅ Zustand 状态管理（模块化 Slices）
- ✅ 屏幕尺寸响应式上下文

### 5. 管理后台（前端页面骨架）
- ✅ 用户管理
- ✅ 角色管理
- ✅ 菜单管理
- ✅ 机场管理
- ✅ 航空公司管理
- ✅ 飞机管理
- ✅ 无人机管理
- ✅ 运营商管理
- ✅ 禁飞区管理
- ✅ 系统日志

### 6. 业务页面（前端页面骨架）
- ✅ 实时地图 (/map)
- ✅ 航班列表 (/flights)
- ✅ 机场信息 (/airports)
- ✅ 无人机地图 (/drones/map)
- ✅ 无人机设备管理 (/drones/list)
- ✅ 无人机任务管理 (/drones/missions)
- ✅ 数据总览 (/analytics/overview)
- ✅ 航线分析 (/analytics/routes)
- ✅ 趋势分析 (/analytics/trends)
- ✅ 飞行分享 (/community/posts)
- ✅ 照片库 (/community/photos)

### 7. 数据模型（后端已定义）
- ✅ 用户相关：User, Role, Menu, UserRole, RoleMenu, SystemLog, Task
- ✅ 航空相关：Airport, Airline, Aircraft, Flight, FlightPosition, FlightRoute, FlightHistory
- ✅ 无人机相关：Drone, Operator, NoFlyZone, DroneMission, DronePosition, DroneFlightLog, DroneIncident

---

## 功能规划路线图

### Phase 1: 地图与航班展示 (v0.3) - 3周 [部分完成]

> 当前状态：前端页面骨架已完成（地图、航班列表、机场信息），后端数据模型已定义。待实现：实时数据接入、WebSocket 推送、地图图层交互。

#### 1.1 交互式地图
**业务价值**: 提供直观的航班可视化界面

**功能点**:
- 3D 地球视图
  - 基于 Mapbox GL JS / Cesium
  - 地图缩放、平移、旋转
  - 昼夜效果
  - 地形显示
  - 卫星图层切换
  
- 2D 平面地图
  - 多种地图样式
  - 航路显示
  - 机场标注
  - 空域边界
  
- 地图控件
  - 图层控制
  - 测距工具
  - 位置搜索
  - 全屏模式

**技术实现**:
```typescript
// 前端地图组件
interface MapConfig {
  center: [number, number]
  zoom: number
  pitch: number
  bearing: number
  style: 'satellite' | 'streets' | 'dark'
}

// 航班图层
interface FlightLayer {
  id: string
  type: 'symbol' | 'line'
  source: 'flights'
  paint: object
  layout: object
}
```

#### 1.2 实时航班数据
**业务价值**: 展示全球航班实时位置和状态

**功能点**:
- 航班实时追踪
  - 飞机位置更新 (每5-10秒)
  - 航迹显示
  - 飞行高度
  - 飞行速度
  - 航向角度
  
- 航班信息卡片
  - 航班号
  - 机型
  - 起降机场
  - 预计到达时间
  - 延误信息
  - 飞行状态

**数据库设计**:
```sql
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number VARCHAR(20) NOT NULL,
    callsign VARCHAR(20),
    aircraft_id UUID REFERENCES aircrafts(id),
    airline_id UUID REFERENCES airlines(id),
    departure_airport VARCHAR(4) NOT NULL,
    arrival_airport VARCHAR(4) NOT NULL,
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    scheduled_departure TIMESTAMP,
    scheduled_arrival TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flight_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude INT,
    speed INT,
    heading INT,
    vertical_speed INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE aircrafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration VARCHAR(20) UNIQUE NOT NULL,
    icao_code VARCHAR(10),
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    year_built INT,
    airline_id UUID REFERENCES airlines(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    iata_code VARCHAR(3) UNIQUE,
    icao_code VARCHAR(4) UNIQUE,
    callsign VARCHAR(50),
    country VARCHAR(100),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flights_status ON flights(status);
CREATE INDEX idx_flights_departure ON flights(departure_airport);
CREATE INDEX idx_flights_arrival ON flights(arrival_airport);
CREATE INDEX idx_flight_positions_flight_id ON flight_positions(flight_id);
CREATE INDEX idx_flight_positions_timestamp ON flight_positions(timestamp);
CREATE INDEX idx_aircrafts_registration ON aircrafts(registration);
CREATE INDEX idx_airports_iata ON airports(iata_code);
CREATE INDEX idx_airports_icao ON airports(icao_code);
```

#### 1.3 航班搜索与筛选
**业务价值**: 快速定位目标航班

**功能点**:
- 搜索功能
  - 航班号搜索
  - 机场搜索
  - 航空公司搜索
  - 机型搜索
  - 注册号搜索
  
- 筛选条件
  - 航空公司
  - 机型
  - 飞行状态
  - 高度范围
  - 速度范围
  - 起降机场

---

### Phase 2: 航班详情与历史 (v0.4) - 2周 [未开始]

> 当前状态：后端数据模型已定义（FlightHistory, FlightRoute）。待实现：前端详情页、历史记录展示、航迹回放。

#### 2.1 航班详细信息
**业务价值**: 提供完整的航班数据

**功能点**:
- 航班详情页
  - 基本信息
    - 航班号、机型、航空公司
    - 起降机场、航站楼、登机口
    - 计划时间、实际时间
    - 飞行时长
  
  - 实时数据
    - 当前位置
    - 飞行高度
    - 飞行速度
    - 剩余距离
    - 预计到达
  
  - 飞机信息
    - 注册号
    - 机龄
    - 座位配置
    - 飞机照片
  
  - 航路信息
    - 飞行航迹
    - 航路点
    - 飞越国家/地区

**数据库设计**:
```sql
CREATE TABLE flight_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    waypoint_name VARCHAR(50),
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude INT,
    sequence INT NOT NULL,
    estimated_time TIMESTAMP,
    actual_time TIMESTAMP
);

CREATE TABLE aircraft_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aircraft_id UUID REFERENCES aircrafts(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    photographer VARCHAR(100),
    taken_at TIMESTAMP,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 历史航班数据
**业务价值**: 分析航班历史表现

**功能点**:
- 航班历史记录
  - 历史航班列表
  - 准点率统计
  - 延误分析
  - 取消记录
  
- 航迹回放
  - 历史航迹播放
  - 播放速度控制
  - 时间轴显示
  - 关键事件标注

**数据库设计**:
```sql
CREATE TABLE flight_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number VARCHAR(20) NOT NULL,
    flight_date DATE NOT NULL,
    aircraft_id UUID REFERENCES aircrafts(id),
    departure_airport VARCHAR(4) NOT NULL,
    arrival_airport VARCHAR(4) NOT NULL,
    scheduled_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    scheduled_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    delay_minutes INT,
    status VARCHAR(20),
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flight_history_number_date ON flight_history(flight_number, flight_date);
CREATE INDEX idx_flight_history_date ON flight_history(flight_date);
```

---

### Phase 3: 机场信息 (v0.5) - 2周 [部分完成]

> 当前状态：前端机场列表页和管理后台机场管理页已完成，后端 Airport 模型已定义。待实现：机场详情页、天气数据、跑道信息、统计图表。

#### 3.1 机场详情
**业务价值**: 提供全面的机场信息

**功能点**:
- 机场基本信息
  - 机场名称、代码
  - 地理位置
  - 跑道信息
  - 航站楼布局
  - 联系方式
  
- 实时运营数据
  - 起降航班列表
  - 延误统计
  - 天气信息
  - 停机位使用情况
  
- 机场设施
  - 餐饮购物
  - 交通接驳
  - 停车信息
  - 贵宾室

**数据库设计**:
```sql
CREATE TABLE runways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airport_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL,
    length INT NOT NULL,
    width INT,
    surface VARCHAR(50),
    heading INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE airport_weather (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airport_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    temperature DECIMAL(5, 2),
    wind_speed INT,
    wind_direction INT,
    visibility INT,
    cloud_cover VARCHAR(50),
    conditions VARCHAR(100),
    metar TEXT,
    taf TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airport_id UUID REFERENCES airports(id) ON DELETE CASCADE,
    terminal VARCHAR(10),
    gate_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    current_flight_id UUID REFERENCES flights(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2 机场统计
**业务价值**: 了解机场运营状况

**功能点**:
- 流量统计
  - 每日起降架次
  - 客流量统计
  - 货运量统计
  - 繁忙时段分析
  
- 准点率分析
  - 整体准点率
  - 航空公司准点率
  - 延误原因分析
  - 趋势图表

---

### Phase 4: 用户个性化 (v0.6) - 2周 [未开始]

> 当前状态：用户 Profile 页面已有骨架。待实现：收藏、提醒、飞行日志、飞行统计等功能。

#### 4.1 航班追踪
**业务价值**: 让用户关注感兴趣的航班

**功能点**:
- 航班收藏
  - 收藏航班
  - 收藏机场
  - 收藏航空公司
  - 收藏机型
  
- 航班提醒
  - 起飞提醒
  - 降落提醒
  - 延误提醒
  - 登机口变更提醒
  - 邮件/短信通知

**数据库设计**:
```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    favorite_type VARCHAR(20) NOT NULL,
    favorite_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, favorite_type, favorite_id)
);

CREATE TABLE flight_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_flight_alerts_user_id ON flight_alerts(user_id);
CREATE INDEX idx_flight_alerts_is_sent ON flight_alerts(is_sent);
```

#### 4.2 个人飞行日志
**业务价值**: 记录个人飞行历史

**功能点**:
- 飞行记录
  - 添加飞行记录
  - 飞行统计
  - 访问过的机场
  - 乘坐过的机型
  - 飞行里程累计
  
- 飞行地图
  - 飞行航线可视化
  - 访问机场标注
  - 飞行足迹
  - 成就徽章

**数据库设计**:
```sql
CREATE TABLE user_flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    flight_number VARCHAR(20) NOT NULL,
    flight_date DATE NOT NULL,
    departure_airport VARCHAR(4) NOT NULL,
    arrival_airport VARCHAR(4) NOT NULL,
    aircraft_type VARCHAR(50),
    seat_number VARCHAR(10),
    cabin_class VARCHAR(20),
    notes TEXT,
    photos JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_flights INT DEFAULT 0,
    total_distance INT DEFAULT 0,
    total_airports INT DEFAULT 0,
    total_airlines INT DEFAULT 0,
    total_aircraft_types INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_flights_user_id ON user_flights(user_id);
```

---

### Phase 5: 数据分析与可视化 (v0.7) - 3周 [部分完成]

> 当前状态：前端数据分析三个页面骨架已完成（总览/航线/趋势）。待实现：后端统计 API、图表数据对接、数据导出。

#### 5.1 航空数据统计
**业务价值**: 提供行业洞察

**功能点**:
- 全球航班统计
  - 实时在飞航班数
  - 每日起降架次
  - 热门航线
  - 繁忙机场
  - 主要航空公司
  
- 趋势分析
  - 流量趋势
  - 准点率趋势
  - 季节性分析
  - 同比/环比分析
  
- 可视化图表
  - 热力图
  - 流向图
  - 时间序列图
  - 饼图/柱状图

**数据库设计**:
```sql
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL UNIQUE,
    total_flights INT DEFAULT 0,
    total_departures INT DEFAULT 0,
    total_arrivals INT DEFAULT 0,
    delayed_flights INT DEFAULT 0,
    cancelled_flights INT DEFAULT 0,
    average_delay_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE route_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    departure_airport VARCHAR(4) NOT NULL,
    arrival_airport VARCHAR(4) NOT NULL,
    flight_count INT DEFAULT 0,
    average_duration INT,
    average_delay INT,
    stat_period VARCHAR(20),
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2 高级筛选与分析
**业务价值**: 满足专业用户需求

**功能点**:
- 高级搜索
  - 多条件组合
  - 时间范围
  - 地理范围
  - 性能参数
  
- 数据导出
  - CSV 导出
  - JSON 导出
  - API 访问
  - 定制报表

---

### Phase 6: 社区与互动 (v0.8) - 2周 [部分完成]

> 当前状态：前端社区两个页面骨架已完成（飞行分享/照片库）。待实现：后端帖子/评论/点赞 API、图片上传、互动功能。

#### 6.1 航空社区
**业务价值**: 建立用户社区，提高粘性

**功能点**:
- 飞行分享
  - 发布飞行体验
  - 上传飞行照片
  - 分享航班信息
  - 点赞评论
  
- 航空资讯
  - 航空新闻
  - 机型介绍
  - 机场指南
  - 飞行知识

**数据库设计**:
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'experience',
    flight_id UUID REFERENCES user_flights(id),
    images JSONB,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES post_comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_likes (
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);
```

#### 6.2 航拍爱好者
**业务价值**: 聚集航空摄影爱好者

**功能点**:
- 飞机照片库
  - 上传飞机照片
  - 照片标签
  - 照片搜索
  - 摄影师排行
  
- 拍机地点
  - 推荐拍摄点
  - 地点评分
  - 拍摄攻略
  - 实时航班提醒

---

### Phase 6.5: 系统管理与运维 [已完成前端骨架]

> 当前状态：前端 10 个管理页面已完成骨架，后端用户列表 API 已实现。待实现：其余管理 CRUD API。

#### 6.5.1 系统管理后台
**业务价值**: 为管理员提供完整的数据管理和系统运维能力

**功能点**:
- 用户管理
  - 用户列表、搜索、筛选
  - 用户角色分配
  - 用户状态管理（启用/禁用）
  
- 角色与权限管理
  - 角色 CRUD
  - 菜单权限分配（RBAC）
  - 角色继承关系
  
- 动态菜单管理
  - 菜单树 CRUD
  - 菜单排序
  - 菜单与角色绑定
  
- 基础数据管理
  - 机场数据 CRUD
  - 航空公司数据 CRUD
  - 飞机数据 CRUD
  - 无人机数据 CRUD
  - 运营商数据 CRUD
  - 禁飞区数据 CRUD
  
- 系统日志
  - 操作日志查询
  - 日志筛选与导出

#### 6.5.2 国际化与主题
**业务价值**: 支持多语言用户和个性化体验

**功能点**:
- 国际化 (i18n)
  - 中英文切换
  - 语言偏好持久化
  - 后续可扩展更多语言
  
- 主题切换
  - 亮色/暗色模式
  - 主题偏好持久化
  - 组件级主题适配

---

### Phase 7: 无人机追踪系统 (v0.9) - 4周 [部分完成]

> 当前状态：后端全部 7 张数据模型已定义并自动迁移，前端无人机三个页面骨架已完成（地图/设备/任务），管理后台无人机/运营商/禁飞区管理页面已完成。待实现：后端 CRUD API、实时追踪 WebSocket、航线规划工具、合规检查等业务逻辑。

#### 7.1 无人机分类与管理
**业务价值**: 提供专业的无人机追踪和管理服务

**无人机分类体系**:

1. **按用途分类**
   - 消费级无人机
     - 航拍娱乐
     - 个人爱好
     - 教育培训
   
   - 商业级无人机
     - 物流配送
     - 农业植保
     - 电力巡检
     - 测绘勘探
     - 影视拍摄
   
   - 工业级无人机
     - 基础设施检查
     - 应急救援
     - 环境监测
     - 森林防火
   
   - 军用/警用无人机
     - 边境巡逻
     - 反恐侦察
     - 交通执法
     - 应急指挥

2. **按重量分类**
   - 微型 (< 250g)
   - 轻型 (250g - 7kg)
   - 小型 (7kg - 25kg)
   - 中型 (25kg - 150kg)
   - 大型 (> 150kg)

3. **按飞行方式分类**
   - 多旋翼 (四轴、六轴、八轴)
   - 固定翼
   - 垂直起降固定翼 (VTOL)
   - 直升机式
   - 混合翼

**数据库设计**:
```sql
-- 无人机设备表
CREATE TABLE drones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    
    -- 分类信息
    category VARCHAR(20) NOT NULL, -- consumer/commercial/industrial/military
    usage_type VARCHAR(50), -- delivery/agriculture/inspection/photography等
    weight_class VARCHAR(20), -- micro/light/small/medium/large
    flight_type VARCHAR(20), -- multirotor/fixed_wing/vtol/helicopter
    
    -- 技术参数
    max_takeoff_weight DECIMAL(8, 2), -- kg
    max_flight_time INT, -- 分钟
    max_speed INT, -- km/h
    max_altitude INT, -- 米
    max_range INT, -- km
    payload_capacity DECIMAL(8, 2), -- kg
    
    -- 设备信息
    battery_capacity INT, -- mAh
    camera_specs JSONB, -- 相机参数
    sensors JSONB, -- 传感器列表
    
    -- 注册信息
    registration_number VARCHAR(50) UNIQUE,
    registration_country VARCHAR(3),
    registration_date DATE,
    registration_expiry DATE,
    
    -- 所有者信息
    owner_id UUID REFERENCES users(id),
    operator_id UUID REFERENCES drone_operators(id),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- active/maintenance/retired/lost
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    -- 元数据
    photos JSONB,
    documents JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 无人机运营商表
CREATE TABLE drone_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    operator_type VARCHAR(20) NOT NULL, -- individual/company/government
    
    -- 联系信息
    email VARCHAR(200),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- 资质信息
    license_number VARCHAR(50) UNIQUE,
    license_type VARCHAR(50), -- Part 107/commercial/etc
    license_issue_date DATE,
    license_expiry_date DATE,
    certifications JSONB, -- 各类认证
    
    -- 保险信息
    insurance_provider VARCHAR(200),
    insurance_policy_number VARCHAR(100),
    insurance_coverage DECIMAL(12, 2),
    insurance_expiry_date DATE,
    
    -- 统计信息
    total_drones INT DEFAULT 0,
    total_flights INT DEFAULT 0,
    total_flight_hours DECIMAL(10, 2) DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 无人机飞行任务表
CREATE TABLE drone_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID REFERENCES drones(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES drone_operators(id),
    pilot_id UUID REFERENCES users(id),
    
    -- 任务信息
    mission_name VARCHAR(200) NOT NULL,
    mission_type VARCHAR(50) NOT NULL, -- delivery/inspection/survey/photography等
    mission_status VARCHAR(20) DEFAULT 'planned', -- planned/approved/in_progress/completed/cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low/normal/high/emergency
    
    -- 时间信息
    planned_start_time TIMESTAMP NOT NULL,
    planned_end_time TIMESTAMP NOT NULL,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    
    -- 位置信息
    departure_location JSONB NOT NULL, -- {lat, lng, name, address}
    arrival_location JSONB,
    waypoints JSONB, -- 航点列表
    flight_area JSONB, -- 飞行区域多边形
    
    -- 飞行参数
    planned_altitude INT, -- 米
    planned_speed INT, -- km/h
    planned_distance DECIMAL(10, 2), -- km
    
    -- 审批信息
    requires_approval BOOLEAN DEFAULT false,
    approval_status VARCHAR(20), -- pending/approved/rejected
    approved_by UUID REFERENCES users(id),
    approval_time TIMESTAMP,
    approval_notes TEXT,
    
    -- 空域信息
    airspace_class VARCHAR(10), -- G/E/D/C/B/A
    flight_authorization_number VARCHAR(100),
    notam_issued BOOLEAN DEFAULT false,
    
    -- 天气条件
    weather_conditions JSONB,
    wind_speed INT,
    visibility INT,
    
    -- 任务详情
    description TEXT,
    objectives TEXT,
    payload_info JSONB,
    special_requirements TEXT,
    
    -- 安全信息
    emergency_contact JSONB,
    backup_plan TEXT,
    risk_assessment JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 无人机实时位置表
CREATE TABLE drone_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID REFERENCES drones(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES drone_missions(id) ON DELETE CASCADE,
    
    -- 位置信息
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    altitude INT NOT NULL, -- 米 (AGL - Above Ground Level)
    altitude_msl INT, -- 米 (MSL - Mean Sea Level)
    
    -- 飞行状态
    speed INT, -- km/h
    heading INT, -- 度 (0-360)
    vertical_speed INT, -- m/s
    
    -- 设备状态
    battery_level INT, -- 百分比
    signal_strength INT, -- dBm
    gps_satellites INT,
    gps_accuracy DECIMAL(5, 2), -- 米
    
    -- 飞行模式
    flight_mode VARCHAR(20), -- manual/auto/rtl/loiter等
    
    -- 传感器数据
    temperature DECIMAL(5, 2), -- 摄氏度
    humidity INT, -- 百分比
    air_pressure DECIMAL(8, 2), -- hPa
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 无人机飞行日志表
CREATE TABLE drone_flight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID REFERENCES drones(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES drone_missions(id),
    
    -- 飞行信息
    flight_date DATE NOT NULL,
    takeoff_time TIMESTAMP NOT NULL,
    landing_time TIMESTAMP NOT NULL,
    flight_duration INT, -- 分钟
    
    -- 位置信息
    takeoff_location JSONB NOT NULL,
    landing_location JSONB NOT NULL,
    max_altitude INT,
    max_speed INT,
    total_distance DECIMAL(10, 2), -- km
    
    -- 飞行轨迹
    flight_path JSONB, -- 完整轨迹点数组
    
    -- 统计信息
    battery_consumed INT, -- 百分比
    average_speed INT,
    
    -- 事件记录
    events JSONB, -- 飞行中的事件列表
    warnings JSONB, -- 警告信息
    errors JSONB, -- 错误信息
    
    -- 飞行质量
    flight_quality_score INT, -- 0-100
    pilot_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 禁飞区表
CREATE TABLE no_fly_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    zone_type VARCHAR(50) NOT NULL, -- airport/military/government/prison/power_plant等
    
    -- 位置信息
    center_latitude DECIMAL(10, 7) NOT NULL,
    center_longitude DECIMAL(10, 7) NOT NULL,
    boundary JSONB NOT NULL, -- 多边形边界
    radius INT, -- 米 (圆形区域)
    
    -- 限制信息
    restriction_level VARCHAR(20) NOT NULL, -- prohibited/restricted/warning
    max_altitude INT, -- 允许的最大高度
    
    -- 时间限制
    is_permanent BOOLEAN DEFAULT true,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    time_restrictions JSONB, -- 特定时间段限制
    
    -- 详细信息
    description TEXT,
    authority VARCHAR(200), -- 设立机构
    contact_info JSONB,
    
    -- 审批流程
    requires_authorization BOOLEAN DEFAULT false,
    authorization_process TEXT,
    
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 无人机事件/事故表
CREATE TABLE drone_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drone_id UUID REFERENCES drones(id),
    mission_id UUID REFERENCES drone_missions(id),
    operator_id UUID REFERENCES drone_operators(id),
    
    -- 事件信息
    incident_type VARCHAR(50) NOT NULL, -- crash/flyaway/near_miss/violation/malfunction
    severity VARCHAR(20) NOT NULL, -- minor/moderate/serious/critical
    incident_date TIMESTAMP NOT NULL,
    
    -- 位置信息
    location JSONB NOT NULL,
    altitude INT,
    
    -- 事件描述
    description TEXT NOT NULL,
    cause TEXT,
    contributing_factors JSONB,
    
    -- 损失评估
    drone_damage VARCHAR(20), -- none/minor/major/total_loss
    property_damage BOOLEAN DEFAULT false,
    property_damage_description TEXT,
    injuries BOOLEAN DEFAULT false,
    injury_description TEXT,
    
    -- 调查信息
    investigation_status VARCHAR(20) DEFAULT 'pending',
    investigator_id UUID REFERENCES users(id),
    investigation_notes TEXT,
    root_cause TEXT,
    
    -- 纠正措施
    corrective_actions TEXT,
    preventive_measures TEXT,
    
    -- 报告信息
    reported_to_authority BOOLEAN DEFAULT false,
    authority_case_number VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_drones_owner ON drones(owner_id);
CREATE INDEX idx_drones_operator ON drones(operator_id);
CREATE INDEX idx_drones_category ON drones(category);
CREATE INDEX idx_drones_status ON drones(status);

CREATE INDEX idx_drone_missions_drone ON drone_missions(drone_id);
CREATE INDEX idx_drone_missions_operator ON drone_missions(operator_id);
CREATE INDEX idx_drone_missions_status ON drone_missions(mission_status);
CREATE INDEX idx_drone_missions_start_time ON drone_missions(planned_start_time);

CREATE INDEX idx_drone_positions_drone ON drone_positions(drone_id);
CREATE INDEX idx_drone_positions_mission ON drone_positions(mission_id);
CREATE INDEX idx_drone_positions_timestamp ON drone_positions(timestamp);

CREATE INDEX idx_drone_flight_logs_drone ON drone_flight_logs(drone_id);
CREATE INDEX idx_drone_flight_logs_date ON drone_flight_logs(flight_date);

CREATE INDEX idx_no_fly_zones_type ON no_fly_zones(zone_type);
CREATE INDEX idx_no_fly_zones_status ON no_fly_zones(status);

CREATE INDEX idx_drone_incidents_drone ON drone_incidents(drone_id);
CREATE INDEX idx_drone_incidents_type ON drone_incidents(incident_type);
CREATE INDEX idx_drone_incidents_date ON drone_incidents(incident_date);
```

#### 7.2 无人机实时追踪
**业务价值**: 提供实时的无人机位置和状态监控

**功能点**:
- 实时地图显示
  - 在飞无人机位置
  - 飞行轨迹
  - 飞行方向和速度
  - 高度显示
  - 电池电量
  
- 无人机图标差异化
  - 按类型显示不同图标
  - 按状态显示不同颜色
  - 按高度分层显示
  - 悬停显示详细信息
  
- 多无人机同时追踪
  - 支持追踪多架无人机
  - 分组管理
  - 批量操作
  - 对比分析

**技术实现**:
```typescript
// 无人机数据接口
interface DronePosition {
  droneId: string
  missionId: string
  latitude: number
  longitude: number
  altitude: number
  speed: number
  heading: number
  batteryLevel: number
  flightMode: string
  timestamp: Date
}

// 无人机图层配置
interface DroneLayer {
  id: string
  type: 'symbol'
  source: 'drones'
  layout: {
    'icon-image': string // 根据类型动态设置
    'icon-size': number
    'icon-rotate': ['get', 'heading']
  }
  paint: {
    'icon-color': string // 根据状态动态设置
  }
}
```

#### 7.3 飞行任务管理
**业务价值**: 帮助运营商规划和管理无人机任务

**功能点**:
- 任务创建
  - 任务基本信息
  - 起降点设置
  - 航点规划
  - 飞行区域绘制
  - 飞行参数设置
  - 时间安排
  
- 航线规划
  - 可视化航线编辑
  - 自动航线生成
  - 避障路径规划
  - 禁飞区检测
  - 航线优化
  
- 任务审批
  - 提交审批流程
  - 审批状态跟踪
  - 审批意见反馈
  - 自动合规检查
  
- 任务执行
  - 任务启动
  - 实时监控
  - 进度跟踪
  - 异常处理
  - 任务完成确认

#### 7.4 禁飞区管理
**业务价值**: 确保飞行安全和合规

**功能点**:
- 禁飞区显示
  - 地图上标注禁飞区
  - 不同级别不同颜色
  - 禁飞区详细信息
  - 临时禁飞区提醒
  
- 禁飞区检测
  - 实时位置检测
  - 航线规划检测
  - 违规预警
  - 自动避让建议
  
- 禁飞区管理
  - 添加/编辑禁飞区
  - 临时禁飞区设置
  - 禁飞区审批
  - 禁飞区通知

#### 7.5 设备管理
**业务价值**: 帮助运营商管理无人机设备

**功能点**:
- 设备档案
  - 设备基本信息
  - 技术参数
  - 注册信息
  - 维护记录
  - 设备照片
  
- 维护管理
  - 维护计划
  - 维护提醒
  - 维护记录
  - 配件更换
  - 维护成本统计
  
- 设备状态
  - 在线/离线状态
  - 电池健康度
  - 飞行时长统计
  - 故障记录
  - 设备寿命预测

#### 7.6 飞行日志与分析
**业务价值**: 提供飞行数据分析和优化建议

**功能点**:
- 飞行日志
  - 自动记录飞行数据
  - 飞行轨迹回放
  - 飞行参数分析
  - 事件时间线
  - 日志导出
  
- 统计分析
  - 飞行时长统计
  - 飞行距离统计
  - 电池使用分析
  - 飞行质量评分
  - 趋势分析
  
- 性能优化
  - 飞行效率分析
  - 电池优化建议
  - 航线优化建议
  - 维护建议

#### 7.7 安全与合规
**业务价值**: 确保飞行安全和法规合规

**功能点**:
- 资质管理
  - 飞行员证照
  - 运营商许可
  - 保险信息
  - 证照到期提醒
  
- 合规检查
  - 飞行前检查清单
  - 自动合规验证
  - 法规更新提醒
  - 合规报告生成
  
- 事件管理
  - 事件/事故报告
  - 事件调查
  - 根因分析
  - 纠正措施跟踪
  
- 风险评估
  - 飞行风险评估
  - 天气风险分析
  - 空域风险评估
  - 风险缓解措施

#### 7.8 数据集成与API
**业务价值**: 与第三方系统集成

**功能点**:
- 数据接口
  - 实时位置API
  - 飞行数据API
  - 设备信息API
  - 任务管理API
  
- 第三方集成
  - 气象数据集成
  - 空域管理系统
  - 物流管理系统
  - 监管平台对接
  
- 数据推送
  - WebSocket实时推送
  - Webhook事件通知
  - 数据订阅服务

---

### Phase 8: 高级功能 (v1.0) - 3周 [未开始]

#### 8.1 3D 航迹可视化
**业务价值**: 提供沉浸式体验

**功能点**:
- 3D 飞行视角
  - 驾驶舱视角
  - 跟随视角
  - 自由视角
  - VR 支持
  
- 地形渲染
  - 高精度地形
  - 建筑物 3D 模型
  - 天气效果
  - 光照效果

#### 8.2 航班预测
**业务价值**: 提供智能预测服务

**功能点**:
- 延误预测
  - 基于历史数据
  - 天气因素
  - 机场流量
  - 准确率评估
  
- 价格预测
  - 票价趋势
  - 最佳购买时机
  - 价格提醒

#### 8.3 API 服务
**业务价值**: 为开发者提供数据接口

**功能点**:
- RESTful API
  - 航班查询
  - 无人机查询
  - 实时位置
  - 历史数据
  - 统计数据
  
- WebSocket 推送
  - 实时位置更新
  - 状态变更通知
  - 自定义订阅

---

## 数据源集成

### 航班数据源
- ADS-B 数据接收
- FlightAware API
- FlightRadar24 数据
- 航空公司官方 API
- 机场运营数据

### 无人机数据源
- Remote ID 广播接收
- UTM (无人机交通管理) 系统
- 运营商API对接
- 飞控系统数据
- 地面站数据

### 地图数据源
- Mapbox
- OpenStreetMap
- Google Maps
- Cesium Ion

### 天气数据源
- METAR/TAF
- 气象雷达
- 卫星云图

---

## 技术架构

### 后端技术
- Go + Gin (API 服务)
- GORM (ORM 框架)
- PostgreSQL / Supabase (主数据库)
- Redis (缓存 + 实时数据，规划中)
- WebSocket (实时推送，规划中)
- PostGIS (空间数据，规划中)
- Wire (依赖注入)
- Swagger/swaggo (API 文档)
- Bcrypt + AES-CBC + RSA + HMAC-SHA256 (安全体系)

### 前端技术
- React 18 + TypeScript
- React Router v6
- Zustand (状态管理，模块化 Slices)
- Ant Design (UI 组件库)
- Tailwind CSS (样式)
- i18next (国际化，中英文)
- Axios (HTTP 客户端)
- Vite (构建工具)
- Mars3D / Cesium (3D 地图，规划中)
- ECharts (图表，规划中)

### 基础设施
- Docker + Kubernetes
- Nginx (反向代理)
- CDN (静态资源)
- MinIO (对象存储)

---

## 商业模式

> 注意：当前代码中实际使用的角色为 null/user/premium/admin 四种。drone_pro 和 enterprise 为远期规划角色，尚未在代码中实现。

### 免费版 (未登录)
- 基础航班追踪
- 有限历史数据
- 最多追踪3架无人机
- 广告支持

### 个人版 ($9.99/月)
- 无广告
- 完整历史数据
- 高级筛选
- 数据导出
- 航班提醒
- 最多追踪10架无人机
- 基础飞行日志

### 专业版 ($29.99/月)
- 个人版所有功能
- 无限无人机追踪
- 高级飞行分析
- 任务规划工具
- 禁飞区实时更新
- 团队协作 (最多5人)
- 优先技术支持

### 企业版 (定制)
- 专业版所有功能
- API 访问
- 数据分析
- 定制报表
- 多团队管理
- 合规管理工具
- 事件管理系统
- 专属客户经理
- SLA 保障

---

## 成功指标

### 用户指标
- 日活跃用户 (DAU) > 10,000
- 月活跃用户 (MAU) > 100,000
- 用户留存率 > 40%
- 付费转化率 > 5%

### 技术指标
- 数据更新延迟 < 10秒
- API 响应时间 < 200ms
- 系统可用性 > 99.9%
- 地图加载时间 < 3秒

### 数据指标
- 追踪航班数 > 50,000
- 追踪无人机数 > 10,000
- 覆盖机场数 > 5,000
- 注册运营商 > 1,000
- 历史数据 > 1年
- 数据准确率 > 95%

---

## 开发时间线

**已完成**: 基础架构 + 安全体系 + 管理后台骨架 + 全部前端页面骨架 + 全部后端数据模型
**Phase 1-3**: 2个月 (航班追踪核心 + 机场信息 - 需实现后端 API 和前端数据对接)
**Phase 4-6**: 2个月 (用户个性化 + 数据分析 + 社区 - 需实现业务逻辑)
**Phase 7**: 1个月 (无人机追踪 - 需实现后端 API 和实时追踪)
**Phase 8**: 1.5个月 (高级功能与优化)

**总计**: 约 6.5 个月（剩余工作量，基础架构已完成）
**团队规模**: 5-6人 (增加1名无人机领域专家)
**技术难度**: 高

---

## 总结

SkyTracker 通过实时航班追踪、数据可视化和社区互动，为航空爱好者和旅客提供全方位的航空信息服务。项目结合了地图技术、实时数据处理和数据分析，具有很高的技术挑战性和商业价值。


---

## 无人机功能特色

### 1. 智能任务规划
- AI 辅助航线规划
- 自动避障算法
- 最优路径计算
- 多机协同任务

### 2. 实时监控预警
- 电池低电量预警
- 信号弱预警
- 禁飞区入侵预警
- 异常行为检测
- 自动返航触发

### 3. 数据分析洞察
- 飞行效率分析
- 设备健康度评估
- 运营成本分析
- 合规性报告
- 趋势预测

### 4. 团队协作
- 多用户权限管理
- 任务分配与调度
- 实时通信
- 协同飞行
- 数据共享

### 5. 监管对接
- 自动报备系统
- 实时数据上报
- 合规性验证
- 电子围栏
- 远程ID广播

---

## 无人机应用场景

### 物流配送
- 最后一公里配送
- 医疗物资运输
- 紧急物资投送
- 路线优化
- 配送追踪

### 农业植保
- 精准喷洒
- 作物监测
- 病虫害识别
- 作业记录
- 效果评估

### 基础设施巡检
- 电力线路巡检
- 管道巡检
- 桥梁检测
- 建筑物检查
- 缺陷识别

### 应急救援
- 灾害评估
- 搜索救援
- 物资投送
- 通信中继
- 实时监控

### 影视航拍
- 航拍规划
- 镜头设计
- 实时预览
- 素材管理
- 后期协作

---

## 总结

SkyTracker 通过整合航班追踪和无人机管理功能，打造了一个全方位的空域监控与管理平台。项目不仅服务于传统航空领域，还积极拥抱低空经济的发展趋势，为无人机运营商、监管机构和公众提供专业的追踪、管理和分析服务。

通过实时数据处理、智能分析、3D可视化等技术手段，SkyTracker 将成为连接天空与地面、传统航空与新兴低空经济的重要桥梁，具有广阔的市场前景和社会价值。

---

## 当前开发重点

基础架构和安全体系已经比较完善，全部前端页面骨架和后端数据模型也已就位。当前最需要推进的工作：

1. **后端 CRUD API 补全** - 管理后台的 10 个模块目前只有用户列表 API，其余模块的增删改查 API 需要逐步实现
2. **地图功能落地** - 实时地图页面需要接入 Mars3D/Cesium，实现基础的地图交互
3. **WebSocket 实时推送** - 航班和无人机的实时位置更新是核心卖点，需要尽早验证技术方案
4. **数据源对接** - 航班数据（ADS-B）和气象数据的接入是业务功能的前提
