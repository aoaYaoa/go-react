package models

import (
	"time"

	"github.com/google/uuid"
)

// Aircraft 飞机模型
type Aircraft struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Registration string     `json:"registration" binding:"required" gorm:"type:text;uniqueIndex"` // 注册号
	AirlineID    *uuid.UUID `json:"airline_id" gorm:"type:uuid;index"`
	Model        string     `json:"model" gorm:"type:text"`        // 机型，如 Boeing 737-800
	Manufacturer string     `json:"manufacturer" gorm:"type:text"` // 制造商
	SerialNumber string     `json:"serial_number" gorm:"type:text"`
	YearBuilt    int        `json:"year_built" gorm:"type:integer"`
	Capacity     int        `json:"capacity" gorm:"type:integer"`     // 载客量
	MaxRange     int        `json:"max_range" gorm:"type:integer"`    // 最大航程（公里）
	CruiseSpeed  int        `json:"cruise_speed" gorm:"type:integer"` // 巡航速度（km/h）
	EngineType   string     `json:"engine_type" gorm:"type:text"`
	EngineCount  int        `json:"engine_count" gorm:"type:integer"`
	Status       string     `json:"status" gorm:"type:text;default:'active'"` // active, maintenance, retired
	Description  string     `json:"description" gorm:"type:text"`
	CreatedAt    time.Time  `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt    time.Time  `json:"updated_at" gorm:"type:timestamptz;default:now()"`

	// 关联
	Airline *Airline `json:"airline,omitempty" gorm:"foreignKey:AirlineID;references:ID"`
}

// TableName 指定表名
func (Aircraft) TableName() string {
	return "aircraft"
}
