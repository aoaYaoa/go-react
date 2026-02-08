package models

import (
	"time"

	"github.com/google/uuid"
)

// Operator 运营商模型（无人机运营商）
type Operator struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Code        string    `json:"code" binding:"required" gorm:"type:text;uniqueIndex"`
	Name        string    `json:"name" binding:"required" gorm:"type:text"`
	LicenseNo   string    `json:"license_no" gorm:"type:text"` // 许可证号
	Contact     string    `json:"contact" gorm:"type:text"`
	Phone       string    `json:"phone" gorm:"type:text"`
	Email       string    `json:"email" gorm:"type:text"`
	Address     string    `json:"address" gorm:"type:text"`
	Type        string    `json:"type" gorm:"type:text;default:'commercial'"` // commercial, government, personal
	Status      string    `json:"status" gorm:"type:text;default:'active'"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"type:timestamptz;default:now()"`
}

// TableName 指定表名
func (Operator) TableName() string {
	return "operators"
}
