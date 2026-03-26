# 安全配置说明

前后端安全配置参考，包括签名验证和 IP 黑白名单。

---

## 签名验证

签名算法：`HMAC-SHA256(method + url + body + timestamp)`，有效期 5 分钟（防重放）。

**后端 `backend/.env`：**

```bash
SIGNATURE_SECRET=your-api-signing-secret-change-me  # 至少32字节
ENABLE_SIGNATURE=false
ENCRYPTION_AES_KEY=your-32-byte-aes-key-here  # 长度必须是 16/24/32 字节，否则启动失败
```

**前端 `frontend/src/config/cryptoConfig.js`：**

```javascript
export const cryptoConfig = {
  request: { signEnabled: false },  // 与 ENABLE_SIGNATURE 保持一致
  hmac: { key: 'your-api-signing-secret-change-me' },
}
```

请求头：`X-Signature`（签名值）、`X-Timestamp`（Unix 毫秒时间戳）

---

## IP 黑白名单

**支持格式：** 完整 IP（`192.168.1.1`）、CIDR（`192.168.1.0/24`）、IP 段（`192.168.1`）

黑名单优先级高于白名单。

```bash
# 白名单模式
ENABLE_IP_WHITELIST=true
IP_WHITELIST=127.0.0.1,192.168.1.0/24,10.0.0.0/8

# 黑名单模式
ENABLE_IP_BLACKLIST=true
IP_BLACKLIST=192.168.2.100,10.0.0.50
```

---

## 注意事项

- 生产环境必须更换所有默认密钥
- 使用反向代理时需正确传递 `X-Real-IP` / `X-Forwarded-For`
- 前后端系统时间需同步（签名 5 分钟有效期）

---

## 相关文件

- 后端中间件：`backend/internal/middlewares/signature.go`、`backend/internal/middlewares/ip_access.go`
- 前端配置：`frontend/src/config/cryptoConfig.js`
- 前端拦截器：`frontend/src/utils/request.js`
