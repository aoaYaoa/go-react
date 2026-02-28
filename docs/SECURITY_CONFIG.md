# 安全配置说明

本文档说明前后端的安全配置，包括签名验证和IP黑白名单配置。

## 目录
- [签名配置](#签名配置)
- [IP黑白名单配置](#ip黑白名单配置)
- [使用示例](#使用示例)

---

## 签名配置

签名验证用于确保API请求的完整性和真实性，防止请求被篡改和重放攻击。

### 后端配置

在 `backend/.env` 文件中配置：

```bash
# 签名密钥（前后端必须相同）
SIGNATURE_SECRET=your-api-signing-secret-change-me

# 是否启用签名验证
ENABLE_SIGNATURE=false
```

### 前端配置

在 `frontend/src/config/cryptoConfig.js` 文件中配置：

```javascript
export const cryptoConfig = {
  // 请求签名配置
  request: {
    // 是否启用请求签名
    signEnabled: false,  // 与后端 ENABLE_SIGNATURE 保持一致
  },
  // HMAC 密钥（与后端相同）
  hmac: {
    key: 'your-api-signing-secret-change-me',
  },
}
```

### 签名机制

签名算法：HMAC-SHA256

签名规则：`HMAC-SHA256(method + url + body + timestamp)`

请求头：
- `X-Signature`: 签名字符串
- `X-Timestamp`: Unix时间戳（毫秒）

签名有效期：5分钟（防止重放攻击）

### 启用签名

1. 后端启用：
   ```bash
   # backend/.env
   ENABLE_SIGNATURE=true
   ```

2. 前端启用：
   ```javascript
   // frontend/src/config/cryptoConfig.js
   request: {
     signEnabled: true,
   }
   ```

3. 重启前后端服务

---

## IP黑白名单配置

### 白名单模式

只允许白名单中的IP地址访问API。

**支持格式：**
- 完整IP：`192.168.1.1`
- CIDR格式：`192.168.1.0/24`
- IP段：`192.168.1`（匹配 192.168.1.*）

### 黑名单模式

禁止黑名单中的IP地址访问API。

**支持格式：** 与白名单相同

### 配置示例

#### 示例1：启用白名单

```bash
# backend/.env
ENABLE_IP_WHITELIST=true
IP_WHITELIST=127.0.0.1,192.168.1.0/24,10.0.0.0/8
```

#### 示例2：启用黑名单

```bash
# backend/.env
ENABLE_IP_BLACKLIST=true
IP_BLACKLIST=192.168.2.100,10.0.0.50
```

#### 示例3：同时启用黑白名单

黑名单优先级高于白名单。如果一个IP同时在黑白名单中，将被拒绝访问。

```bash
# backend/.env
ENABLE_IP_WHITELIST=true
IP_WHITELIST=192.168.1.0/24
ENABLE_IP_BLACKLIST=true
IP_BLACKLIST=192.168.2.100
```

### IP获取逻辑

中间件会按以下顺序获取客户端IP：

1. `X-Real-IP` 请求头
2. `X-Forwarded-For` 请求头（取第一个IP）
3. `RemoteAddr`（直接连接IP）

### 获取真实IP配置

如果使用反向代理（如Nginx），需要配置代理传递真实IP：

**Nginx配置示例：**

```nginx
location /api {
    proxy_pass http://localhost:8080;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
}
```

---

## 使用示例

### 场景1：开发环境（无签名，无IP限制）

```bash
# backend/.env
ENABLE_SIGNATURE=false
ENABLE_IP_WHITELIST=false
ENABLE_IP_BLACKLIST=false
```

```javascript
// frontend/src/config/cryptoConfig.js
request: {
  signEnabled: false,
}
```

### 场景2：生产环境（启用签名）

```bash
# backend/.env
SIGNATURE_SECRET=your-very-strong-secret-key-here
ENABLE_SIGNATURE=true
ENABLE_IP_WHITELIST=false
ENABLE_IP_BLACKLIST=false
```

```javascript
// frontend/src/config/cryptoConfig.js
hmac: {
  key: 'your-very-strong-secret-key-here',
},
request: {
  signEnabled: true,
}
```

### 场景3：内网部署（启用白名单）

```bash
# backend/.env
ENABLE_SIGNATURE=false
ENABLE_IP_WHITELIST=true
IP_WHITELIST=192.168.0.0/16,10.0.0.0/8,127.0.0.1
ENABLE_IP_BLACKLIST=false
```

### 场景4：生产环境（签名+白名单+黑名单）

```bash
# backend/.env
SIGNATURE_SECRET=your-very-strong-secret-key-here
ENABLE_SIGNATURE=true
ENABLE_IP_WHITELIST=true
IP_WHITELIST=10.0.0.0/8,192.168.1.0/24
ENABLE_IP_BLACKLIST=true
IP_BLACKLIST=10.0.0.50,192.168.2.100
```

```javascript
// frontend/src/config/cryptoConfig.js
hmac: {
  key: 'your-very-strong-secret-key-here',
},
request: {
  signEnabled: true,
}
```

---

## 中间件顺序

后端中间件按以下顺序执行：

1. RequestID - 生成请求ID
2. Logger - 记录日志
3. Recovery - 错误恢复
4. CORS - 跨域支持
5. Security - 安全响应头
6. NoCache - 禁用缓存
7. ContentType - 内容类型检查
8. RateLimit - 请求限流
9. **IPAccessMiddleware** - IP访问控制（如果启用）
10. Compression - 响应压缩
11. DecryptionMiddleware - 请求解密（如果签名启用）
12. **SignatureMiddleware** - API签名验证（如果启用）
13. EncryptionMiddleware - 响应加密（如果签名启用）

---

## 错误处理

### 签名相关错误

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| 缺少签名 | 前端未发送X-Signature请求头 | 检查前端signEnabled配置 |
| 缺少时间戳 | 前端未发送X-Timestamp请求头 | 检查前端代码 |
| 签名已过期 | 时间戳超过5分钟 | 检查系统时间 |
| 签名验证失败 | 签名不匹配 | 检查前后端密钥是否一致 |

### IP访问控制错误

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| 访问被拒绝 | IP在黑名单或不在白名单 | 检查IP配置 |

---

## 测试

### 测试签名验证

```bash
# 1. 启用签名
# 2. 重启服务
# 3. 不带签名的请求应该失败
curl http://localhost:8080/api/tasks
# 返回: {"success": false, "error": "缺少签名"}

# 4. 带签名的请求应该成功（需要前端自动添加签名）
```

### 测试IP白名单

```bash
# 1. 启用白名单（只允许127.0.0.1）
# 2. 重启服务
# 3. 从127.0.0.1访问应该成功
curl http://localhost:8080/api/tasks
# 返回: {"success": true, "data": [...]}

# 4. 从其他IP访问应该失败
curl http://<其他IP>:8080/api/tasks
# 返回: {"success": false, "error": "访问被拒绝"}
```

### 测试IP黑名单

```bash
# 1. 启用黑名单（禁止192.168.1.100）
# 2. 重启服务
# 3. 从192.168.1.100访问应该失败
curl http://192.168.1.100:8080/api/tasks
# 返回: {"success": false, "error": "访问被拒绝"}
```

---

## 注意事项

1. **密钥安全**：
   - 生产环境必须更换默认密钥
   - 建议使用环境变量存储密钥
   - 密钥长度至少32字节

2. **IP配置**：
   - 支持CIDR格式（如：192.168.1.0/24）
   - 支持IP段（如：192.168.1 匹配 192.168.1.*）
   - 黑名单优先级高于白名单

3. **签名验证**：
   - 时间戳有效期为5分钟
   - 确保前后端系统时间同步
   - 签名会验证method、url、body和timestamp

4. **代理配置**：
   - 使用反向代理时，需要配置X-Real-IP和X-Forwarded-For
   - 确保代理正确传递客户端IP

5. **调试**：
   - 查看后端日志了解详细的中间件执行情况
   - 前端会记录签名相关的日志到控制台

---

## 相关文件

- 后端配置：`backend/.env`
- 后端中间件：`backend/middlewares/signature.go`, `backend/middlewares/ip_access.go`
- 前端配置：`frontend/src/config/cryptoConfig.js`
- 前端请求拦截器：`frontend/src/utils/request.js`
- 后端路由：`backend/routes/routes.go`
