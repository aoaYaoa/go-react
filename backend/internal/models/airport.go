package models

import (
	"time"

	"github.com/google/uuid"
)

// Airport 机场模型
type Airport struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Code        string    `json:"code" binding:"required" gorm:"type:text;uniqueIndex"` // IATA代码
	Name        string    `json:"name" binding:"required" gorm:"type:text"`
	NameEn      string    `json:"name_en" gorm:"type:text"`
	City        string    `json:"city" gorm:"type:text"`
	Country     string    `json:"country" gorm:"type:text"`
	Latitude    float64   `json:"latitude" gorm:"type:double precision"`
	Longitude   float64   `json:"longitude" gorm:"type:double precision"`
	Altitude    float64   `json:"altitude" gorm:"type:double precision"` // 海拔高度（米）
	Timezone    string    `json:"timezone" gorm:"type:text"`
	Type        string    `json:"type" gorm:"type:text;default:'civil'"` // civil, military, mixed
	Status      string    `json:"status" gorm:"type:text;default:'active'"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"type:timestamptz;default:now()"`
}

// TableName 指定表名
func (Airport) TableName() string {
	return "airports"
}
