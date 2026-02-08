package models

import (
	"time"

	"github.com/google/uuid"
)

// Airline 航空公司模型
type Airline struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Code        string    `json:"code" binding:"required" gorm:"type:text;uniqueIndex"` // IATA代码
	Name        string    `json:"name" binding:"required" gorm:"type:text"`
	NameEn      string    `json:"name_en" gorm:"type:text"`
	Country     string    `json:"country" gorm:"type:text"`
	Logo        string    `json:"logo" gorm:"type:text"`
	Website     string    `json:"website" gorm:"type:text"`
	Callsign    string    `json:"callsign" gorm:"type:text"`                 // 呼号
	Type        string    `json:"type" gorm:"type:text;default:'passenger'"` // passenger, cargo, charter
	Status      string    `json:"status" gorm:"type:text;default:'active'"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"type:timestamptz;default:now()"`
}

// TableName 指定表名
func (Airline) TableName() string {
	return "airlines"
}
