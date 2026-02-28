# 前端认证功能测试指南

## 已完成的修改

### 1. 更新登录页面 (`src/pages/Login.tsx`)
- ✅ 移除了 Supabase 的 `AuthContext` 依赖
- ✅ 使用 `userService.login()` 调用后端 JWT 认证接口
- ✅ 改为使用用户名登录（而不是邮箱）
- ✅ 登录成功后自动保存 token 到 localStorage
- ✅ 登录成功后跳转到首页

### 2. 更新注册页面 (`src/pages/Register.tsx`)
- ✅ 移除了 Supabase 的 `AuthContext` 依赖
- ✅ 使用 `userService.register()` 调用后端注册接口
- ✅ 添加了可选的邮箱字段
- ✅ 用户名长度验证（3-20个字符）
- ✅ 注册成功后跳转到登录页

### 3. 更新 App.tsx
- ✅ 移除了 `AuthProvider`（已删除）
- ✅ 保留了 `ScreenSizeProvider`

### 4. 更新类型定义 (`src/types/index.ts`)
- ✅ 更新了 `User` 类型以匹配后端返回的数据结构
- ✅ 移除了旧的 `AuthContextType`

## 测试步骤

### 前置条件

1. **启动后端服务**
   ```bash
   cd backend
   make run
   # 或
   go run cmd/server/main.go
   ```
   后端应该运行在 `http://localhost:8080`

2. **启动前端服务**
   ```bash
   cd frontend
   npm run dev
   ```
   前端应该运行在 `http://localhost:5173`

### 测试注册功能

1. 访问 `http://localhost:5173/register`
2. 填写表单：
   - 用户名：`testuser`（3-20个字符）
   - 邮箱：`test@example.com`（可选）
   - 密码：`password123`（至少6个字符）
   - 确认密码：`password123`
3. 点击"创建账户"按钮
4. **预期结果**：
   - 显示"注册成功！请登录"消息
   - 1.5秒后自动跳转到登录页

### 测试登录功能

1. 访问 `http://localhost:5173/login`
2. 填写表单：
   - 用户名：`testuser`
   - 密码：`password123`
3. 点击"登录"按钮
4. **预期结果**：
   - 显示"登录成功！"消息
   - 控制台输出用户信息
   - 0.5秒后跳转到首页
   - localStorage 中保存了 `auth_token` 和 `user_info`

### 验证 Token 存储

打开浏览器开发者工具（F12）：

1. **Application/Storage** 标签页
2. **Local Storage** → `http://localhost:5173`
3. 应该看到：
   - `auth_token`: JWT token 字符串
   - `user_info`: 用户信息 JSON 字符串

### 测试错误处理

#### 注册错误

1. **用户名已存在**
   - 使用已注册的用户名
   - 预期：显示"用户名已存在"错误

2. **用户名太短**
   - 输入少于3个字符的用户名
   - 预期：表单验证失败，显示"用户名长度至少为 3 个字符"

3. **密码太短**
   - 输入少于6个字符的密码
   - 预期：表单验证失败，显示"密码长度至少为 6 个字符"

4. **密码不一致**
   - 确认密码与密码不同
   - 预期：表单验证失败，显示"两次输入的密码不一致"

5. **邮箱格式错误**
   - 输入无效的邮箱格式
   - 预期：表单验证失败，显示"请输入有效的邮箱地址"

#### 登录错误

1. **用户名或密码错误**
   - 输入错误的用户名或密码
   - 预期：显示"用户名或密码错误"

2. **必填字段为空**
   - 不填写用户名或密码
   - 预期：表单验证失败

## API 接口说明

### 注册接口

**请求：**
```
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

### 登录接口

**请求：**
```
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

## 调试技巧

### 查看网络请求

1. 打开开发者工具（F12）
2. 切换到 **Network** 标签页
3. 执行登录或注册操作
4. 查看 `/api/auth/register` 或 `/api/auth/login` 请求
5. 检查：
   - 请求头（Request Headers）
   - 请求体（Request Payload）
   - 响应状态码（Status Code）
   - 响应数据（Response）

### 查看控制台日志

1. 打开开发者工具（F12）
2. 切换到 **Console** 标签页
3. 登录成功后应该看到：`登录成功: {user info}`
4. 注册成功后应该看到：`注册成功: {user info}`

### 常见问题

#### 1. 跨域错误（CORS）

**错误信息：**
```
Access to fetch at 'http://localhost:8080/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**解决方案：**
- 检查后端 CORS 配置（`backend/internal/config/config.go`）
- 确保 `CORS_ORIGINS` 包含 `http://localhost:5173`

#### 2. 网络请求失败

**错误信息：**
```
Failed to fetch
```

**解决方案：**
- 确认后端服务正在运行
- 检查 `frontend/.env` 中的 `VITE_API_BASE_URL` 配置
- 检查 `frontend/vite.config.ts` 中的代理配置

#### 3. Token 未保存

**问题：**
登录成功但 localStorage 中没有 token

**解决方案：**
- 检查 `userService.login()` 方法是否正确保存 token
- 查看浏览器控制台是否有错误信息

## 下一步

完成认证功能测试后，可以：

1. **添加受保护的路由**
   - 创建路由守卫，检查用户是否已登录
   - 未登录用户访问受保护页面时跳转到登录页

2. **添加用户信息显示**
   - 在导航栏显示当前登录用户
   - 添加登出按钮

3. **添加 Token 刷新机制**
   - Token 过期前自动刷新
   - Token 过期后跳转到登录页

4. **添加权限控制**
   - 根据用户角色显示/隐藏功能
   - 管理员功能的权限检查
