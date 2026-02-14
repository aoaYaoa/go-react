package middlewares

import (
	"backend/pkg/utils/crypto"
	"backend/pkg/utils/logger"
	"backend/pkg/utils/response"
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
)

const (
	// AES 默认密钥（从配置获取）
	// TODO: 从环境变量读取
	defaultAESKey = "1234567890123456" // 16 字节

	// AES 默认 IV
	defaultAESIV = "abcdefghijklmnop" // 16 字节

	// 加密数据标识字段
	encryptedField = "encrypted"
	dataField      = "data"
)

var (
	// 加密接口列表（支持通配符）
	encryptedEndpoints = []string{
		// "/api/tasks",
		// "/api/tasks/*",
	}

	// 解密接口列表
	decryptedEndpoints = []string{
		// "/api/user/info",
		// "/api/orders/*",
	}

	// 缓存已解析的路径
	encryptedCache = make(map[string]bool)
	decryptedCache = make(map[string]bool)
	cacheMutex     sync.RWMutex
)

// DecryptionMiddleware 请求解密中间件
//
// 自动检测并解密加密的请求体
// 前端发送格式：{ "encrypted": true, "data": "<base64加密数据>" }
//
// 使用示例：
//
//	router.Use(middlewares.DecryptionMiddleware())
//
// 配置说明：
//
//	在 encryptedEndpoints 中添加需要解密的接口路径
//	支持通配符匹配，例如："/api/tasks/*"
func DecryptionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 检查是否需要解密
		if !shouldDecryptRequest(c.Request.URL.Path) {
			c.Next()
			return
		}

		// 读取请求体
		bodyBytes, err := io.ReadAll(c.Request.Body)
		if err != nil {
			logger.Errorf("[Decryption] 读取请求体失败: %v", err)
			response.Error(c, "读取请求失败", http.StatusBadRequest)
			c.Abort()
			return
		}

		// 重置请求体
		c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

		// 检查请求体是否为空
		if len(bodyBytes) == 0 {
			c.Next()
			return
		}

		// 解析 JSON
		var requestData map[string]any
		if err := json.Unmarshal(bodyBytes, &requestData); err != nil {
			// 不是 JSON 格式，跳过解密
			c.Next()
			return
		}

		// 检查是否是加密格式
		encrypted, isEncrypted := requestData[encryptedField].(bool)
		if !isEncrypted || !encrypted {
			// 未加密，继续处理
			c.Next()
			return
		}

		// 获取加密数据
		encryptedData, ok := requestData[dataField].(string)
		if !ok || encryptedData == "" {
			logger.Warn("[Decryption] 加密数据为空")
			response.Error(c, "加密数据无效", http.StatusBadRequest)
			c.Abort()
			return
		}

		// 解密数据
		decryptedStr, err := crypto.AESDecryptString(defaultAESKey, encryptedData)
		if err != nil {
			logger.Errorf("[Decryption] 解密失败: %v", err)
			response.Error(c, "数据解密失败", http.StatusBadRequest)
			c.Abort()
			return
		}

		logger.Debugf("[Decryption] 请求解密成功: %s", decryptedStr[:min(len(decryptedStr), 32)]+"...")

		// 替换请求体为解密后的数据
		c.Request.Body = io.NopCloser(bytes.NewBufferString(decryptedStr))
		c.Request.ContentLength = int64(len(decryptedStr))

		c.Next()
	}
}

// EncryptionMiddleware 响应加密中间件
//
// 自动加密响应数据
// 响应格式：{ "encrypted": true, "data": "<base64加密数据>" }
//
// 使用示例：
//
//	router.Use(middlewares.EncryptionMiddleware())
//
// 配置说明：
//
//	在 decryptedEndpoints 中添加需要加密响应的接口路径
func EncryptionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 检查是否需要加密响应
		if !shouldEncryptResponse(c.Request.URL.Path) {
			c.Next()
			return
		}

		// 使用 writer 包装器捕获响应
		writer := &responseWriter{
			ResponseWriter: c.Writer,
			buffer:         bytes.NewBuffer(nil),
		}
		c.Writer = writer

		// 处理请求
		c.Next()

		// 获取响应数据
		if writer.status == 0 {
			return // 没有响应
		}

		// 跳过错误响应
		if writer.status >= 400 {
			return
		}

		// 获取响应体
		responseData := writer.buffer.Bytes()

		// 检查是否是 JSON
		if !isJSON(responseData) {
			return // 非 JSON，不加密
		}

		// 解析响应数据
		var data map[string]any
		if err := json.Unmarshal(responseData, &data); err != nil {
			return // 解析失败，不加密
		}

		// 检查是否已经是加密格式
		if encrypted, ok := data[encryptedField].(bool); ok && encrypted {
			return // 已经加密，跳过
		}

		// 转换为 JSON 字符串
		jsonStr, err := json.Marshal(data)
		if err != nil {
			logger.Errorf("[Encryption] 序列化响应失败: %v", err)
			return
		}

		// 加密数据
		encryptedData, err := crypto.AESEncryptString(defaultAESKey, string(jsonStr))
		if err != nil {
			logger.Errorf("[Encryption] 加密失败: %v", err)
			return
		}

		logger.Debugf("[Encryption] 响应加密成功: %s", encryptedData[:min(len(encryptedData), 32)]+"...")

		// 构建加密响应
		encryptedResponse := map[string]any{
			encryptedField: true,
			dataField:      encryptedData,
		}

		// 序列化加密响应
		encryptedJSON, err := json.Marshal(encryptedResponse)
		if err != nil {
			logger.Errorf("[Encryption] 序列化加密响应失败: %v", err)
			return
		}

		// 写入加密响应
		c.Header("Content-Type", "application/json; charset=utf-8")
		c.Header("Content-Length", string(rune(len(encryptedJSON))))
		c.Status(writer.status)
		c.Writer.Write(encryptedJSON)
	}
}

// shouldDecryptRequest 检查请求是否需要解密
func shouldDecryptRequest(path string) bool {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()

	// 检查缓存
	if cached, ok := encryptedCache[path]; ok {
		return cached
	}

	// 检查匹配
	shouldDecrypt := matchPattern(path, encryptedEndpoints)

	// 缓存结果
	cacheMutex.Lock()
	encryptedCache[path] = shouldDecrypt
	cacheMutex.Unlock()

	return shouldDecrypt
}

// shouldEncryptResponse 检查响应是否需要加密
func shouldEncryptResponse(path string) bool {
	cacheMutex.RLock()
	defer cacheMutex.RUnlock()

	// 检查缓存
	if cached, ok := decryptedCache[path]; ok {
		return cached
	}

	// 检查匹配
	shouldEncrypt := matchPattern(path, decryptedEndpoints)

	// 缓存结果
	cacheMutex.Lock()
	decryptedCache[path] = shouldEncrypt
	cacheMutex.Unlock()

	return shouldEncrypt
}

// matchPattern 检查路径是否匹配模式列表
func matchPattern(path string, patterns []string) bool {
	for _, pattern := range patterns {
		if pattern == path {
			return true // 精确匹配
		}

		// 通配符匹配
		if strings.HasSuffix(pattern, "/*") {
			prefix := strings.TrimSuffix(pattern, "/*")
			if strings.HasPrefix(path, prefix) || path == prefix {
				return true
			}
		}
	}
	return false
}

// isJSON 检查是否是 JSON 数据
func isJSON(data []byte) bool {
	return bytes.HasPrefix(bytes.TrimSpace(data), []byte("{"))
}

// responseWriter 包装器
// 用于捕获和修改响应数据
type responseWriter struct {
	gin.ResponseWriter
	buffer *bytes.Buffer
	status int
}

// Write 实现 io.Writer 接口
func (w *responseWriter) Write(b []byte) (int, error) {
	return w.buffer.Write(b)
}

// WriteHeader 实现 http.ResponseWriter 接口
func (w *responseWriter) WriteHeader(statusCode int) {
	w.status = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

// 字符串转换函数（解决 bytes.BufferString 的不兼容问题）
func bytesBufferToString(b *bytes.Buffer) string {
	return b.String()
}
