# 前后端认证集成完成

## 概述

已成功将前端的登录和注册功能与后端 JWT 认证接口集成。移除了所有 Supabase 依赖，使用自建的后端认证系统。

## 完成的工作

### 1. 后端接口（已存在）

- ✅ `POST /api/auth/register` - 用户注册
- ✅ `POST /api/auth/login` - 用户登录
- ✅ `GET /api/user/profile` - 获取用户信息（需要认证）
- ✅ `GET /api/admin/users` - 列出所有用户（需要管理员权限）

### 2. 前端服务层（已完善）

**文件：** `frontend/src/services/user.ts`

封装的方法：
- `register()` - 注册用户
- `login()` - 登录用户（自动保存 token）
- `logout()` - 登出用户
- `getProfile()` - 获取用户信息
- `getToken()` - 获取本地 token
- `getLocalUserInfo()` - 获取本地用户信息
- `isAuthenticated()` - 检查是否已登录
- `listUsers()` - 列出所有用户（管理员）

### 3. 前端页面更新

#### 登录页面 (`frontend/src/pages/Login.tsx`)

**修改内容：**
- ❌ 移除 `AuthContext` 依赖
- ✅ 使用 `userService.login()` 调用后端接口
- ✅ 改为使用用户名登录（而不是邮箱）
- ✅ 登录成功后自动保存 token 到 localStorage
- ✅ 登录成功后跳转到首页

**表单字段：**
- 用户名（必填，3-20个字符）
- 密码（必填，至少6个字符）

#### 注册页面 (`frontend/src/pages/Register.tsx`)

**修改内容：**
- ❌ 移除 `AuthContext` 依赖
- ✅ 使用 `userService.register()` 调用后端接口
- ✅ 添加可选的邮箱字段
- ✅ 用户名长度验证（3-20个字符）
- ✅ 注册成功后跳转到登录页

**表单字段：**
- 用户名（必填，3-20个字符）
- 邮箱（可选，需要有效格式）
- 密码（必填，至少6个字符）
- 确认密码（必填，需要与密码一致）

### 4. 类型定义更新

**文件：** `frontend/src/types/index.ts`

- ✅ 更新 `User` 类型以匹配后端返回的数据结构
- ❌ 移除旧的 `AuthContextType`
- ✅ 表单类型定义移到各自组件内部

### 5. App.tsx 更新

**文件：** `frontend/src/App.tsx`

- ❌ 移除 `AuthProvider`（已删除）
- ✅ 保留 `ScreenSizeProvider`

## 认证流程

### 注册流程

```
用户填写表单
    ↓
前端验证（用户名、密码、邮箱格式）
    ↓
调用 userService.register()
    ↓
POST /api/auth/register
    ↓
后端验证（用户名唯一性、邮箱唯一性）
    ↓
密码加密（Bcrypt）
    ↓
保存到数据库
    ↓
返回用户信息
    ↓
前端显示成功消息
    ↓
跳转到登录页
```

### 登录流程

```
用户填写表单
    ↓
前端验证（用户名、密码）
    ↓
调用 userService.login()
    ↓
POST /api/auth/login
    ↓
后端验证（用户名存在、密码正确）
    ↓
生成 JWT Token（24小时有效期）
    ↓
返回 Token 和用户信息
    ↓
前端保存到 localStorage
    - auth_token: JWT token
    - user_info: 用户信息 JSON
    ↓
前端显示成功消息
    ↓
跳转到首页
```

### 认证请求流程

```
用户访问受保护的接口
    ↓
从 localStorage 获取 token
    ↓
添加到请求头：Authorization: Bearer {token}
    ↓
后端中间件验证 Token
    ↓
验证成功：继续处理请求
验证失败：返回 401 未认证
```

## 数据存储

### LocalStorage

登录成功后，以下数据会保存到 localStorage：

```javascript
// Token
localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')

// 用户信息
localStorage.setItem('user_info', JSON.stringify({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'user'
}))
```

### Token 格式

JWT Token 包含以下信息：

```json
{
  "user_id": 1,
  "username": "testuser",
  "role": "user",
  "iat": 1706745600,
  "exp": 1706832000
}
```

## 测试

### 自动化测试脚本

运行后端接口测试：

```bash
./test_auth_api.sh
```

这个脚本会测试：
1. 健康检查接口
2. 注册接口
3. 登录接口
4. 获取用户信息接口
5. 错误情况：用户名已存在
6. 错误情况：密码错误

### 手动测试

详细的测试步骤请参考：`frontend/TEST_AUTH.md`

## 配置

### 后端配置

**文件：** `backend/.env`

```env
# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET=your-jwt-secret-key-change-me

# CORS 配置
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 前端配置

**文件：** `frontend/.env`

```env
# API 基础 URL
VITE_API_BASE_URL=http://localhost:8080
```

**文件：** `frontend/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

## API 文档

### 注册接口

**请求：**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",  // 可选
  "password": "password123"
}
```

**响应（成功）：**
```json
{
  "code": 200,
  "success": true,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  }
}
```

**响应（失败）：**
```json
{
  "code": 400,
  "success": false,
  "error": "用户名已存在"
}
```

### 登录接口

**请求：**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应（成功）：**
```json
{
  "code": 200,
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400
  }
}
```

**响应（失败）：**
```json
{
  "code": 401,
  "success": false,
  "error": "用户名或密码错误"
}
```

### 获取用户信息接口

**请求：**
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应（成功）：**
```json
{
  "code": 200,
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "created_at": 1706745600000,
    "updated_at": 1706745600000
  }
}
```

## 安全性

### 已实现的安全措施

1. **密码加密**
   - 使用 Bcrypt 加密密码
   - 密码不会以明文存储或传输

2. **JWT Token**
   - 使用 HMAC-SHA256 签名
   - Token 有效期 24 小时
   - Token 包含用户 ID、用户名、角色信息

3. **参数验证**
   - 前端表单验证
   - 后端使用 Gin 的 binding 标签验证
   - 业务逻辑验证（用户名唯一性等）

4. **CORS 配置**
   - 限制允许的来源
   - 配置在后端 `.env` 文件中

5. **中间件保护**
   - 认证中间件验证 Token
   - 角色中间件验证权限

### 建议的改进

1. **Token 刷新机制**
   - 实现 Refresh Token
   - Token 过期前自动刷新

2. **密码强度要求**
   - 要求包含大小写字母、数字、特殊字符
   - 最小长度 8 个字符

3. **登录限制**
   - 实现登录失败次数限制
   - 账户锁定机制

4. **HTTPS**
   - 生产环境使用 HTTPS
   - 防止中间人攻击

5. **XSS 防护**
   - 输入内容转义
   - Content Security Policy

## 下一步

### 推荐的功能扩展

1. **路由守卫**
   - 创建 ProtectedRoute 组件
   - 未登录用户自动跳转到登录页

2. **用户信息显示**
   - 在导航栏显示当前用户
   - 添加用户下拉菜单

3. **登出功能**
   - 添加登出按钮
   - 清除 localStorage
   - 跳转到登录页

4. **Token 过期处理**
   - 拦截 401 响应
   - 自动跳转到登录页
   - 提示用户重新登录

5. **个人中心**
   - 查看和编辑个人信息
   - 修改密码
   - 头像上传

6. **管理员功能**
   - 用户管理页面
   - 角色权限管理
   - 系统设置

## 相关文档

- [后端 API 开发指南](backend/API_DEVELOPMENT_GUIDE.md)
- [前端认证测试指南](frontend/TEST_AUTH.md)
- [后端架构文档](backend/ARCHITECTURE.md)
- [数据库设计文档](backend/DATABASE.md)

## 技术栈

### 后端
- Go 1.26+
- Gin Web Framework
- GORM (ORM)
- PostgreSQL / MySQL / SQLite
- JWT (JSON Web Token)
- Bcrypt (密码加密)

### 前端
- React 18
- TypeScript
- React Router v6
- Ant Design
- Vite
- Tailwind CSS

## 联系方式

如有问题或建议，请查看相关文档或提交 Issue。
