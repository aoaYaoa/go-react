package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DronePosition 无人机实时位置模型
type DronePosition struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	DroneID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"droneId"`
	MissionID *uuid.UUID `gorm:"type:uuid;index" json:"missionId"`

	// 位置信息
	Latitude    float64 `gorm:"type:decimal(10,7);not null" json:"latitude"`
	Longitude   float64 `gorm:"type:decimal(10,7);not null" json:"longitude"`
	Altitude    int     `gorm:"not null" json:"altitude"` // 米 (AGL - Above Ground Level)
	AltitudeMSL *int    `json:"altitudeMsl"`              // 米 (MSL - Mean Sea Level)

	// 飞行状态
	Speed         *int `json:"speed"`         // km/h
	Heading       *int `json:"heading"`       // 度 (0-360)
	VerticalSpeed *int `json:"verticalSpeed"` // m/s

	// 设备状态
	BatteryLevel   *int     `json:"batteryLevel"`   // 百分比
	SignalStrength *int     `json:"signalStrength"` // dBm
	GpsSatellites  *int     `json:"gpsSatellites"`
	GpsAccuracy    *float64 `gorm:"type:decimal(5,2)" json:"gpsAccuracy"` // 米

	// 飞行模式
	FlightMode *string `gorm:"type:varchar(20)" json:"flightMode"` // manual/auto/rtl/loiter等

	// 传感器数据
	Temperature *float64 `gorm:"type:decimal(5,2)" json:"temperature"` // 摄氏度
	Humidity    *int     `json:"humidity"`                             // 百分比
	AirPressure *float64 `gorm:"type:decimal(8,2)" json:"airPressure"` // hPa

	Timestamp time.Time `gorm:"default:CURRENT_TIMESTAMP;index" json:"timestamp"`

	// 关联
	Drone   Drone         `gorm:"foreignKey:DroneID" json:"drone,omitempty"`
	Mission *DroneMission `gorm:"foreignKey:MissionID" json:"mission,omitempty"`
}

// TableName 指定表名
func (DronePosition) TableName() string {
	return "drone_positions"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (p *DronePosition) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
