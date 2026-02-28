# API 文档

## 概览

- **基础 URL**: `/api`
- **Content-Type**: `application/json`
- **响应格式**:
    ```json
    {
      "code": 200,     // HTTP 状态码
      "message": "...", // 可读消息
      "data": { ... },  // 响应载荷
      "requestId": "..." // 追踪 ID
    }
    ```

## 接口列表

### 身份验证 (Authentication)

- **POST** `/api/auth/register`
    - 注册新用户。
- **POST** `/api/auth/login`
    - 登录并获取 JWT 令牌。

### 用户 (User)

- **GET** `/api/user/profile`
    - 获取当前用户资料。
    - **认证**: 需要。

### 任务 (Tasks)

- **GET** `/api/tasks`
    - 获取所有任务列表。
- **POST** `/api/tasks`
    - 创建新任务。
- **PUT** `/api/tasks/:id`
    - 更新任务。
- **DELETE** `/api/tasks/:id`
    - 删除任务。

### 系统 (System)

- **GET** `/health`
    - 健康检查端点。

## Swagger UI

如需交互式文档，请访问：
http://localhost:8080/swagger/index.html
