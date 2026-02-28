# 加密功能使用指南

## 概述

本项目提供了完整的加密解密工具集，支持前后端数据的安全传输和存储。

## 后端加密工具

### 模块结构

```
backend/utils/crypto/
├── aes.go      # AES 加密解密
├── rsa.go      # RSA 非对称加密
├── hash.go     # 哈希和签名
└── bcrypt.go   # 密码哈希
```

### AES 加密（对称加密）

适用于加密大量数据，性能较高。

#### 加密和解密

```go
import "backend/utils/crypto"

// 字符串加密
key := "16-byte-key-123" // 必须是 16, 24, 或 32 字节
plaintext := "Hello, World!"
ciphertext, err := crypto.AESEncryptString(key, plaintext)

// 字符串解密
decrypted, err := crypto.AESDecryptString(key, ciphertext)
```

#### AES-GCM 加密（更安全）

```go
// 使用 AES-GCM 模式
key := make([]byte, 32) // AES-256
ciphertext, err := crypto.AESGCMEncrypt(key, []byte(plaintext))
plaintext, err := crypto.AESGCMDecrypt(key, ciphertext)
```

#### 生成密钥

```go
// 生成 AES 密钥
key, err := crypto.GenerateAESKey(32) // 32 字节 = AES-256
```

### RSA 加密（非对称加密）

适用于密钥交换、数字签名等场景。

#### 生成密钥对

```go
// 生成 RSA 密钥对（2048 或 4096 位）
privateKey, publicKey, err := crypto.RSAGenerateKeyPair(2048)

// 转换为 PEM 格式
privateKeyPEM := crypto.RSAPrivateKeyToPEM(privateKey)
publicKeyPEM := crypto.RSAPublicKeyToPEM(publicKey)

// 保存到文件
os.WriteFile("private.pem", privateKeyPEM, 0600)
os.WriteFile("public.pem", publicKeyPEM, 0644)
```

#### 加密和解密

```go
// 使用公钥加密
ciphertext, err := crypto.RSAEncrypt(publicKey, []byte(plaintext))

// 使用私钥解密
plaintext, err := crypto.RSADecrypt(privateKey, ciphertext)
```

#### 签名和验证

```go
// 使用私钥签名
signature, err := crypto.RSASign(privateKey, []byte(message))

// 使用公钥验证
valid := crypto.RSAVerify(publicKey, []byte(message), sigBytes)
```

### 哈希函数

#### 计算哈希值

```go
import "backend/utils/crypto"

// MD5（不推荐用于安全场景）
md5Hash := crypto.MD5("Hello")

// SHA256（推荐）
sha256Hash := crypto.SHA256("Hello")

// SHA512
sha512Hash := crypto.SHA512("Hello")
```

#### HMAC 签名

```go
// HMAC-SHA256
signature := crypto.HMACSHA256("secret-key", "data")

// HMAC-SHA512
signature := crypto.HMACSHA512("secret-key", "data")
```

#### Base64 编码

```go
// 编码
encoded := crypto.Base64Encode("Hello, World!")

// 解码
decoded, err := crypto.Base64Decode(encoded)
```

### 密码哈希

使用 bcrypt 哈希密码，适合密码存储。

```go
import "backend/utils/crypto"

// 哈希密码
hashedPassword, err := crypto.BcryptHash("myPassword123", 10)

// 验证密码
isValid := crypto.BcryptVerify(hashedPassword, "myPassword123")
```

## 前端加密工具

### 安装依赖

```bash
npm install crypto-js
```

### 导入工具

```javascript
import {
  AESEncrypt,
  AESDecrypt,
  MD5,
  SHA256,
  SHA512,
  HMACSHA256,
  Base64Encode,
  Base64Decode,
  GenerateRandomKey,
  GenerateUUID,
  Hash
} from '../utils/crypto'
```

### AES 加密解密

```javascript
// 加密（ECB 模式）
const key = '16-byte-key-123'
const plaintext = 'Hello, World!'
const ciphertext = AESEncrypt(plaintext, key)

// 解密
const decrypted = AESDecrypt(ciphertext, key)
console.log(decrypted) // "Hello, World!"
```

### CBC 模式加密（更安全）

```javascript
// 加密（CBC 模式）
const key = '16-byte-key-123'
const iv = '16-byte-init-vect'
const ciphertext = AESEncrypt(plaintext, key, iv)

// 解密
const decrypted = AESDecrypt(ciphertext, key, iv)
```

### 哈希函数

```javascript
// MD5
const md5Hash = MD5('Hello')

// SHA256
const sha256Hash = SHA256('Hello')

// SHA512
const sha512Hash = SHA512('Hello')

// 通用哈希函数
const hash = Hash('Hello', 'sha256')
```

### HMAC 签名

```javascript
// HMAC-SHA256
const signature = HMACSHA256('secret-key', 'data')

// HMAC-SHA512
const signature = HMACSHA512('secret-key', 'data')
```

### Base64 编码

```javascript
// 编码
const encoded = Base64Encode('Hello, World!')

// 解码
const decoded = Base64Decode(encoded)
```

### 密钥生成

```javascript
// 生成随机密钥
const randomKey = GenerateRandomKey(32) // 32 字节
console.log(randomKey) // Hex 格式

// 生成 UUID
const uuid = GenerateUUID()
```

## 使用场景

### 1. 密码存储

**后端：**
```go
// 用户注册时
hashedPassword, _ := crypto.BcryptHash("userPassword", 10)

// 用户登录时
isValid := crypto.BcryptVerify(hashedPassword, "userPassword")
```

### 2. 敏感数据传输

**前端加密：**
```javascript
const apiKey = 'my-secret-api-key'
const key = 'encryption-key-16'
const encrypted = AESEncrypt(apiKey, key)

// 发送到后端
api.send({ data: encrypted })
```

**后端解密：**
```go
key := []byte("encryption-key-16")
decrypted, _ := crypto.AESDecryptString(key, encryptedData)
```

### 3. API 签名验证

**前端：**
```javascript
const data = { timestamp: Date.now() }
const secret = 'api-secret-key'
const signature = HMACSHA256(secret, JSON.stringify(data))

// 发送请求
api.send({ ...data, signature })
```

**后端验证：**
```go
// 验证签名
expectedSignature := crypto.HMACSHA256("api-secret-key", jsonData)
if receivedSignature != expectedSignature {
    // 拒绝请求
}
```

### 4. RSA 密钥交换

```go
// 服务器端生成密钥对
privateKey, publicKey, _ := crypto.RSAGenerateKeyPair(2048)
publicKeyPEM := crypto.RSAPublicKeyToPEM(publicKey)

// 客户端获取公钥并加密数据
ciphertext, _ := crypto.RSAEncrypt(publicKey, []byte("secret"))

// 服务器端用私钥解密
plaintext, _ := crypto.RSADecrypt(privateKey, ciphertext)
```

## 安全建议

### 1. 密钥管理
- ✅ 使用环境变量存储密钥
- ✅ 定期轮换密钥
- ✅ 不要在代码中硬编码密钥
- ✅ 使用不同的密钥用于不同的用途

### 2. 加密算法选择
- **密码存储**：使用 bcrypt
- **数据传输**：使用 AES-256-GCM
- **密钥交换**：使用 RSA-4096
- **哈希计算**：使用 SHA-256 或 SHA-512

### 3. 密钥长度
```
AES:  16 字节 (AES-128), 24 字节 (AES-192), 32 字节 (AES-256)
RSA:  2048 位 (推荐), 4096 位 (更安全)
Bcrypt Cost: 10-12（平衡安全性和性能）
```

### 4. 常见错误
- ❌ 使用 ECB 模式（不安全）
- ❌ 密钥长度不足
- ❌ 重复使用 IV
- ❌ 不验证加密数据的完整性
- ❌ 在客户端存储明文密钥

## 配置示例

### 环境变量

```bash
# 加密配置
ENCRYPTION_KEY=your-32-byte-encryption-key
JWT_SECRET=your-jwt-secret-key
API_SIGN_SECRET=your-api-signing-secret

# RSA 密钥路径
RSA_PRIVATE_KEY_PATH=/path/to/private.pem
RSA_PUBLIC_KEY_PATH=/path/to/public.pem
```

### 配置加载

```go
import "os"

var (
    EncryptionKey = os.Getenv("ENCRYPTION_KEY")
    JWTSecret     = os.Getenv("JWT_SECRET")
)
```

## 性能优化

### 1. 密钥缓存
```go
// 缓存解析后的密钥
var cachedKey []byte

func GetKey() []byte {
    if cachedKey == nil {
        cachedKey = []byte(os.Getenv("ENCRYPTION_KEY"))
    }
    return cachedKey
}
```

### 2. 批量加密
```go
// 对于大量数据，考虑使用更高效的方式
func EncryptBatch(data []string, key []byte) ([]string, error) {
    results := make([]string, len(data))
    for i, d := range data {
        encrypted, err := AESEncrypt(key, []byte(d))
        if err != nil {
            return nil, err
        }
        results[i] = encrypted
    }
    return results, nil
}
```

## 测试

### 后端测试

```go
import "testing"

func TestAESEncryptDecrypt(t *testing.T) {
    key := "16-byte-key-123"
    plaintext := "Hello, World!"

    ciphertext, err := AESEncryptString(key, plaintext)
    if err != nil {
        t.Fatal(err)
    }

    decrypted, err := AESDecryptString(key, ciphertext)
    if err != nil {
        t.Fatal(err)
    }

    if decrypted != plaintext {
        t.Errorf("Expected %s, got %s", plaintext, decrypted)
    }
}
```

### 前端测试

```javascript
import { AESEncrypt, AESDecrypt } from '../utils/crypto'

describe('Crypto Utils', () => {
  test('AES encrypt and decrypt', () => {
    const key = '16-byte-key-123'
    const plaintext = 'Hello, World!'

    const ciphertext = AESEncrypt(plaintext, key)
    const decrypted = AESDecrypt(ciphertext, key)

    expect(decrypted).toBe(plaintext)
  })
})
```

## 故障排查

### 常见问题

**问题：解密失败**
```
Error: cipher: message authentication failed
```
**解决方案：** 检查密钥是否正确，确保使用相同的加密模式和 IV。

**问题：密钥长度错误**
```
Error: crypto/aes: invalid key size 24
```
**解决方案：** 确保密钥长度为 16, 24, 或 32 字节。

**问题：Base64 解码失败**
```
Error: illegal base64 data at input byte 0
```
**解决方案：** 确保输入是有效的 Base64 字符串。

## 依赖

### 后端
- `crypto/aes` - 标准 AES 实现
- `crypto/rsa` - 标准 RSA 实现
- `crypto/hmac` - HMAC 实现
- `crypto/sha256` - SHA256 实现
- `golang.org/x/crypto/bcrypt` - Bcrypt 实现

### 前端
- `crypto-js` - JavaScript 加密库

## 参考资料

- [Go 加密包文档](https://pkg.go.dev/crypto)
- [CryptoJS 文档](https://cryptojs.gitbook.io/docs/)
- [NIST 加密标准](https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines)
