package jwt

import (
	"backend/pkg/utils/logger"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	// TokenHeader 认证头
	TokenHeader = "Authorization"

	// BearerPrefix Bearer 前缀
	BearerPrefix = "Bearer "

	// 默认签名密钥（从环境变量读取）
	defaultSecret = "your-jwt-secret-key-change-me"

	// 默认过期时间
	defaultExpDuration = 24 * time.Hour

	// Issuer 签发者
	Issuer = "go-gin-backend"
)

// Claims JWT 声明（Payload）
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	IssuedAt int64  `json:"iat"`
	ExpiresAt int64  `json:"exp"`
}

// TokenResponse Token 响应结构
type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int64  `json:"expires_in"`
}

// GenerateToken 生成 JWT Token
//
// 简化的 JWT 实现（Base64 编码 Header 和 Payload，HMAC 签名）
// 生产环境建议使用 github.com/golang-jwt/jwt 库
//
// @param userID   用户 ID
// @param username  用户名
// @param role     用户角色
// @param secret   签名密钥（可选，默认使用 defaultSecret）
// @param duration 过期时间（可选，默认 24 小时）
//
// @return Token 字符串
// @return 错误信息
func GenerateToken(userID uint, username string, role string, secret string, duration time.Duration) (string, error) {
	// 使用默认密钥
	if secret == "" {
		secret = defaultSecret
	}

	// 使用默认过期时间
	if duration == 0 {
		duration = defaultExpDuration
	}

	// 获取当前时间
	now := time.Now()

	// 构建声明
	claims := Claims{
		UserID:   userID,
		Username:  username,
		Role:      role,
		IssuedAt: now.Unix(),
		ExpiresAt: now.Add(duration).Unix(),
	}

	// 构建 Header
	header := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}

	// 编码 Header
	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", fmt.Errorf("编码 Header 失败: %w", err)
	}
	encodedHeader := base64.URLEncoding.EncodeToString(headerJSON)

	// 编码 Payload
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", fmt.Errorf("编码 Payload 失败: %w", err)
	}
	encodedPayload := base64.URLEncoding.EncodeToString(claimsJSON)

	// 生成签名
	signatureInput := encodedHeader + "." + encodedPayload
	signature := generateSignature(signatureInput, secret)

	// 构建 Token
	token := signatureInput + "." + signature

	logger.Debugf("[JWT] 生成 Token: user_id=%d, username=%s", userID, username)

	return token, nil
}

// GenerateTokenResponse 生成完整的 Token 响应
func GenerateTokenResponse(userID uint, username string, role string, secret string, duration time.Duration) (*TokenResponse, error) {
	token, err := GenerateToken(userID, username, role, secret, duration)
	if err != nil {
		return nil, err
	}

	// 计算过期时间（秒）
	var expiresIn int64
	if duration == 0 {
		expiresIn = int64(defaultExpDuration / time.Second)
	} else {
		expiresIn = int64(duration / time.Second)
	}

	return &TokenResponse{
		AccessToken: token,
		TokenType:   "Bearer",
		ExpiresIn:   expiresIn,
	}, nil
}

// ValidateToken 验证 JWT Token
//
// @param token  Token 字符串
// @param secret 签名密钥（可选，默认使用 defaultSecret）
//
// @return 声明信息
// @return 错误信息
func ValidateToken(token string, secret string) (*Claims, error) {
	// 使用默认密钥
	if secret == "" {
		secret = defaultSecret
	}

	// 分割 Token
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, errors.New("无效的 Token 格式")
	}

	encodedHeader := parts[0]
	encodedPayload := parts[1]
	signature := parts[2]

	// 验证签名
	signatureInput := encodedHeader + "." + encodedPayload
	expectedSignature := generateSignature(signatureInput, secret)
	if signature != expectedSignature {
		logger.Warnf("[JWT] 签名验证失败")
		return nil, errors.New("Token 签名验证失败")
	}

	// 解码 Header
	_, err := base64.URLEncoding.DecodeString(encodedHeader)
	if err != nil {
		return nil, fmt.Errorf("解码 Header 失败: %w", err)
	}

	// 解码 Payload
	payloadBytes, err := base64.URLEncoding.DecodeString(encodedPayload)
	if err != nil {
		return nil, fmt.Errorf("解码 Payload 失败: %w", err)
	}

	// 解析 Claims
	var claims Claims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, fmt.Errorf("解析 Claims 失败: %w", err)
	}

	// 验证过期时间
	now := time.Now().Unix()
	if claims.ExpiresAt < now {
		logger.Warnf("[JWT] Token 已过期: exp=%d, now=%d", claims.ExpiresAt, now)
		return nil, errors.New("Token 已过期")
	}

	// 验证签发者
	// if claims.Issuer != Issuer {
	//     return "", errors.New("无效的 Token 签发者")
	// }

	logger.Debugf("[JWT] Token 验证成功: user_id=%d, username=%s", claims.UserID, claims.Username)

	return &claims, nil
}

// generateSignature 生成 HMAC-SHA256 签名
func generateSignature(input string, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(input))
	signature := h.Sum(nil)
	return base64.URLEncoding.EncodeToString(signature)
}

// ExtractToken 从请求中提取 Token
//
// @param c Gin 上下文
//
// @return Token 字符串
// @return 错误信息
func ExtractToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader(TokenHeader)
	if authHeader == "" {
		return "", errors.New("未提供认证令牌")
	}

	// 检查 Bearer 前缀
	if !strings.HasPrefix(authHeader, BearerPrefix) {
		return "", errors.New("无效的认证令牌格式")
	}

	// 提取 Token
	token := strings.TrimPrefix(authHeader, BearerPrefix)
	if token == "" {
		return "", errors.New("认证令牌不能为空")
	}

	return token, nil
}

// GetUserID 从请求中获取用户 ID
//
// 从 Token 中提取用户 ID
//
// @param c Gin 上下文
//
// @return 用户 ID
// @return 错误信息
func GetUserID(c *gin.Context) (uint, error) {
	// 从 Context 中获取（如果已由中间件设置）
	if userID, exists := c.Get("user_id"); exists {
		if uid, ok := userID.(uint); ok {
			return uid, nil
		}
	}

	// 从 Token 中提取
	token, err := ExtractToken(c)
	if err != nil {
		return 0, err
	}

	// 验证 Token
	claims, err := ValidateToken(token, "")
	if err != nil {
		return 0, err
	}

	// 将用户信息存储到 Context 中
	c.Set("user_id", claims.UserID)
	c.Set("username", claims.Username)
	c.Set("role", claims.Role)

	return claims.UserID, nil
}

// GetClaims 从请求中获取完整的声明信息
//
// @param c Gin 上下文
//
// @return 声明信息
// @return 错误信息
func GetClaims(c *gin.Context) (*Claims, error) {
	// 从 Token 中提取
	token, err := ExtractToken(c)
	if err != nil {
		return nil, err
	}

	// 验证 Token
	claims, err := ValidateToken(token, "")
	if err != nil {
		return nil, err
	}

	// 将用户信息存储到 Context 中
	c.Set("user_id", claims.UserID)
	c.Set("username", claims.Username)
	c.Set("role", claims.Role)

	return claims, nil
}

// SetTokenCookie 将 Token 设置到 Cookie
//
// @param c     Gin 上下文
// @param token  Token 字符串
// @param maxAge 最大年龄（秒）
func SetTokenCookie(c *gin.Context, token string, maxAge int) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		token,
		maxAge,
		"/",
		"",
		true,  // HttpOnly
		false, // Secure（生产环境应为 true）
	)
}

// ClearTokenCookie 清除 Token Cookie
func ClearTokenCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		true,
		false,
	)
}
