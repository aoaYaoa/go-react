package models

import (
	"time"

	"github.com/google/uuid"
)

// Drone 无人机模型
type Drone struct {
	ID             uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	SerialNumber   string     `json:"serial_number" binding:"required" gorm:"type:text;uniqueIndex"`
	Name           string     `json:"name" binding:"required" gorm:"type:text"`
	OperatorID     *uuid.UUID `json:"operator_id" gorm:"type:uuid;index"`
	Model          string     `json:"model" gorm:"type:text"`
	Manufacturer   string     `json:"manufacturer" gorm:"type:text"`
	MaxAltitude    float64    `json:"max_altitude" gorm:"type:double precision"` // 最大飞行高度（米）
	MaxSpeed       float64    `json:"max_speed" gorm:"type:double precision"`    // 最大速度（m/s）
	MaxRange       float64    `json:"max_range" gorm:"type:double precision"`    // 最大航程（米）
	BatteryLife    int        `json:"battery_life" gorm:"type:integer"`          // 续航时间（分钟）
	Weight         float64    `json:"weight" gorm:"type:double precision"`       // 重量（克）
	CameraModel    string     `json:"camera_model" gorm:"type:text"`
	Status         string     `json:"status" gorm:"type:text;default:'idle'"` // idle, flying, maintenance, offline
	LastLatitude   *float64   `json:"last_latitude" gorm:"type:double precision"`
	LastLongitude  *float64   `json:"last_longitude" gorm:"type:double precision"`
	LastAltitude   *float64   `json:"last_altitude" gorm:"type:double precision"`
	LastUpdateTime *time.Time `json:"last_update_time" gorm:"type:timestamptz"`
	Description    string     `json:"description" gorm:"type:text"`
	CreatedAt      time.Time  `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt      time.Time  `json:"updated_at" gorm:"type:timestamptz;default:now()"`

	// 关联
	Operator *Operator `json:"operator,omitempty" gorm:"foreignKey:OperatorID;references:ID"`
}

// TableName 指定表名
func (Drone) TableName() string {
	return "drones"
}
