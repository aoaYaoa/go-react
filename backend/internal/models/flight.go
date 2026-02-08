package models

import (
	"time"

	"github.com/google/uuid"
)

// Flight 航班模型
type Flight struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	FlightNumber  string     `json:"flight_number" binding:"required" gorm:"type:text;index"`
	AirlineID     *uuid.UUID `json:"airline_id" gorm:"type:uuid;index"`
	AircraftID    *uuid.UUID `json:"aircraft_id" gorm:"type:uuid;index"`
	DepartureID   *uuid.UUID `json:"departure_id" gorm:"type:uuid;index"` // 起飞机场ID
	ArrivalID     *uuid.UUID `json:"arrival_id" gorm:"type:uuid;index"`   // 到达机场ID
	DepartureTime time.Time  `json:"departure_time" gorm:"type:timestamptz;index"`
	ArrivalTime   time.Time  `json:"arrival_time" gorm:"type:timestamptz"`
	Status        string     `json:"status" gorm:"type:text;default:'scheduled';index"` // scheduled, boarding, departed, arrived, delayed, cancelled
	Gate          string     `json:"gate" gorm:"type:text"`                             // 登机口
	Terminal      string     `json:"terminal" gorm:"type:text"`                         // 航站楼
	Altitude      float64    `json:"altitude" gorm:"type:double precision"`             // 当前高度（米）
	Speed         float64    `json:"speed" gorm:"type:double precision"`                // 当前速度（km/h）
	Latitude      *float64   `json:"latitude" gorm:"type:double precision"`             // 当前纬度
	Longitude     *float64   `json:"longitude" gorm:"type:double precision"`            // 当前经度
	DelayMinutes  int        `json:"delay_minutes" gorm:"type:integer;default:0"`       // 延误分钟数
	CreatedAt     time.Time  `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt     time.Time  `json:"updated_at" gorm:"type:timestamptz;default:now()"`

	// 关联
	Airline   *Airline  `json:"airline,omitempty" gorm:"foreignKey:AirlineID;references:ID"`
	Aircraft  *Aircraft `json:"aircraft,omitempty" gorm:"foreignKey:AircraftID;references:ID"`
	Departure *Airport  `json:"departure,omitempty" gorm:"foreignKey:DepartureID;references:ID"`
	Arrival   *Airport  `json:"arrival,omitempty" gorm:"foreignKey:ArrivalID;references:ID"`
}

// TableName 指定表名
func (Flight) TableName() string {
	return "flights"
}
