package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FlightPosition 航班实时位置模型
type FlightPosition struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FlightID uuid.UUID `gorm:"type:uuid;not null;index" json:"flightId"`

	// 位置信息
	Latitude  float64 `gorm:"type:decimal(10,7);not null" json:"latitude"`
	Longitude float64 `gorm:"type:decimal(10,7);not null" json:"longitude"`
	Altitude  *int    `json:"altitude"` // 英尺

	// 飞行状态
	Speed         *int `json:"speed"`         // 节
	Heading       *int `json:"heading"`       // 度 (0-360)
	VerticalSpeed *int `json:"verticalSpeed"` // 英尺/分钟

	Timestamp time.Time `gorm:"default:CURRENT_TIMESTAMP;index" json:"timestamp"`

	// 关联
	Flight Flight `gorm:"foreignKey:FlightID;constraint:OnDelete:CASCADE" json:"flight,omitempty"`
}

// TableName 指定表名
func (FlightPosition) TableName() string {
	return "flight_positions"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (p *FlightPosition) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
