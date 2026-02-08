package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DroneFlightLog 无人机飞行日志模型
type DroneFlightLog struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	DroneID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"droneId"`
	MissionID *uuid.UUID `gorm:"type:uuid;index" json:"missionId"`

	// 飞行信息
	FlightDate     time.Time `gorm:"not null;index" json:"flightDate"`
	TakeoffTime    time.Time `gorm:"not null" json:"takeoffTime"`
	LandingTime    time.Time `gorm:"not null" json:"landingTime"`
	FlightDuration *int      `json:"flightDuration"` // 分钟

	// 位置信息
	TakeoffLocation string   `gorm:"type:jsonb;not null" json:"takeoffLocation"`
	LandingLocation string   `gorm:"type:jsonb;not null" json:"landingLocation"`
	MaxAltitude     *int     `json:"maxAltitude"`
	MaxSpeed        *int     `json:"maxSpeed"`
	TotalDistance   *float64 `gorm:"type:decimal(10,2)" json:"totalDistance"` // km

	// 飞行轨迹
	FlightPath *string `gorm:"type:jsonb" json:"flightPath"` // 完整轨迹点数组

	// 统计信息
	BatteryConsumed *int `json:"batteryConsumed"` // 百分比
	AverageSpeed    *int `json:"averageSpeed"`

	// 事件记录
	Events   *string `gorm:"type:jsonb" json:"events"`   // 飞行中的事件列表
	Warnings *string `gorm:"type:jsonb" json:"warnings"` // 警告信息
	Errors   *string `gorm:"type:jsonb" json:"errors"`   // 错误信息

	// 飞行质量
	FlightQualityScore *int    `json:"flightQualityScore"` // 0-100
	PilotNotes         *string `gorm:"type:text" json:"pilotNotes"`

	CreatedAt time.Time `json:"createdAt"`

	// 关联
	Drone   Drone         `gorm:"foreignKey:DroneID" json:"drone,omitempty"`
	Mission *DroneMission `gorm:"foreignKey:MissionID" json:"mission,omitempty"`
}

// TableName 指定表名
func (DroneFlightLog) TableName() string {
	return "drone_flight_logs"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (l *DroneFlightLog) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}
