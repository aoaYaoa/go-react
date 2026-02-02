package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config 应用配置结构
type Config struct {
	// 服务器配置
	ServerPort  string
	ServerMode  string
	CORSOrigins []string

	// 数据库配置
	DatabaseType string
	DatabaseHost string
	DatabasePort int
	DatabaseName string
	DatabaseUser string
	DatabasePass string

	// JWT配置
	JWTSecret string

	// 签名配置
	SignatureSecret string
	EnableSignature bool

	// IP访问控制配置
	EnableIPWhitelist bool
	IPWhitelist       string // 逗号分隔的IP列表
	EnableIPBlacklist bool
	IPBlacklist       string // 逗号分隔的IP列表
}

var AppConfig *Config

// LoadConfig 加载配置
// 从.env文件和环境变量读取配置，如果未设置则使用默认值
func LoadConfig() *Config {
	// 加载.env文件
	if err := godotenv.Load(); err != nil {
		log.Printf("警告: 未找到.env文件，使用默认配置: %v", err)
	}

	return &Config{
		ServerPort:  getEnv("SERVER_PORT", "8080"),
		ServerMode:  getEnv("SERVER_MODE", "debug"),
		CORSOrigins: []string{getEnv("CORS_ORIGIN", "http://localhost:5173")},

		// 数据库配置
		DatabaseType: getEnv("DATABASE_TYPE", "mysql"),
		DatabaseHost: getEnv("DATABASE_HOST", "localhost"),
		DatabasePort: getEnvAsInt("DATABASE_PORT", 3306),
		DatabaseName: getEnv("DATABASE_NAME", "appdb"),
		DatabaseUser: getEnv("DATABASE_USER", "root"),
		DatabasePass: getEnv("DATABASE_PASS", ""),

		// JWT配置
		JWTSecret: getEnv("JWT_SECRET", "your-secret-key-change-in-production"),

		// 签名配置
		SignatureSecret: getEnv("SIGNATURE_SECRET", "your-api-signing-secret-change-me"),
		EnableSignature: getEnvAsBool("ENABLE_SIGNATURE", false),

		// IP访问控制配置
		EnableIPWhitelist: getEnvAsBool("ENABLE_IP_WHITELIST", false),
		IPWhitelist:       getEnv("IP_WHITELIST", ""),
		EnableIPBlacklist: getEnvAsBool("ENABLE_IP_BLACKLIST", false),
		IPBlacklist:       getEnv("IP_BLACKLIST", ""),
	}
}

// Init 初始化配置
func Init() {
	AppConfig = LoadConfig()
	log.Printf("配置加载成功:")
	log.Printf("  - Port: %s", AppConfig.ServerPort)
	log.Printf("  - Mode: %s", AppConfig.ServerMode)
	log.Printf("  - Database: %s@%s:%d/%s", AppConfig.DatabaseType, AppConfig.DatabaseHost, AppConfig.DatabasePort, AppConfig.DatabaseName)
	log.Printf("  - 签名验证: %v", AppConfig.EnableSignature)
	log.Printf("  - IP白名单: %v (启用: %v)", AppConfig.IPWhitelist, AppConfig.EnableIPWhitelist)
	log.Printf("  - IP黑名单: %v (启用: %v)", AppConfig.IPBlacklist, AppConfig.EnableIPBlacklist)
}

// GetIPWhitelist 获取IP白名单
func GetIPWhitelist() []string {
	if !AppConfig.EnableIPWhitelist || AppConfig.IPWhitelist == "" {
		return []string{}
	}
	whitelist := strings.Split(AppConfig.IPWhitelist, ",")
	for i := range whitelist {
		whitelist[i] = strings.TrimSpace(whitelist[i])
	}
	return whitelist
}

// GetIPBlacklist 获取IP黑名单
func GetIPBlacklist() []string {
	if !AppConfig.EnableIPBlacklist || AppConfig.IPBlacklist == "" {
		return []string{}
	}
	blacklist := strings.Split(AppConfig.IPBlacklist, ",")
	for i := range blacklist {
		blacklist[i] = strings.TrimSpace(blacklist[i])
	}
	return blacklist
}

// getEnv 从环境变量获取值，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsInt 从环境变量获取整数值
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

// getEnvAsBool 从环境变量获取布尔值
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}
