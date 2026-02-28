# API 文档

## 概览

- 基础路径：`/api`
- Content-Type：`application/json`
- Swagger：`http://localhost:8080/swagger/index.html`

## 响应格式

当前项目统一响应结构为：

```json
{
  "success": true,
  "code": 200,
  "message": "可选",
  "data": {},
  "error": "失败时返回"
}
```

说明：

- 成功时主要使用 `success=true` + `data`
- 失败时主要使用 `success=false` + `error`
- `X-Request-ID` 在响应头中返回

## 核心接口

### 认证

- `GET /api/auth/captcha`：获取验证码图片与 `captcha_id`
- `POST /api/auth/register`：注册
- `POST /api/auth/login`：登录（成功后返回 Token）

### 用户

- `GET /api/user/profile`：获取当前用户资料（需 JWT）

### 管理员

- `GET /api/admin/users`：用户列表（需 JWT + `admin` 角色）

### 任务

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle`

## 系统与运维接口

- `GET /health`：健康检查（包含依赖状态）
- `GET /api/health`：同上
- `GET /metrics`：Prometheus 指标导出

健康检查在依赖异常时返回 `503`，并在 `data.components` 中标记异常组件。
