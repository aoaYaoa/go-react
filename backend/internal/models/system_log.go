package models

import (
	"time"

	"github.com/google/uuid"
)

// SystemLog 系统日志模型
type SystemLog struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserID    *uuid.UUID `json:"user_id" gorm:"type:uuid;index"`
	Action    string     `json:"action" gorm:"type:text;index"` // login, logout, create, update, delete, etc.
	Module    string     `json:"module" gorm:"type:text;index"` // user, role, menu, airport, etc.
	Method    string     `json:"method" gorm:"type:text"`       // GET, POST, PUT, DELETE
	Path      string     `json:"path" gorm:"type:text"`         // API路径
	IP        string     `json:"ip" gorm:"type:text"`
	UserAgent string     `json:"user_agent" gorm:"type:text"`
	Status    int        `json:"status" gorm:"type:integer"` // HTTP状态码
	Message   string     `json:"message" gorm:"type:text"`
	Details   string     `json:"details" gorm:"type:text"`    // JSON格式的详细信息
	Duration  int64      `json:"duration" gorm:"type:bigint"` // 请求耗时（毫秒）
	CreatedAt time.Time  `json:"created_at" gorm:"type:timestamptz;default:now();index"`

	// 关联
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID;references:ID"`
}

// TableName 指定表名
func (SystemLog) TableName() string {
	return "system_logs"
}
