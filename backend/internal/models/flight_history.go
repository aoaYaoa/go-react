package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FlightHistory 航班历史记录模型
type FlightHistory struct {
	ID           uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FlightNumber string     `gorm:"type:varchar(20);not null;index" json:"flightNumber"`
	FlightDate   time.Time  `gorm:"type:date;not null;index" json:"flightDate"`
	AircraftID   *uuid.UUID `gorm:"type:uuid;index" json:"aircraftId"`

	// 机场信息
	DepartureAirport string `gorm:"type:varchar(4);not null" json:"departureAirport"`
	ArrivalAirport   string `gorm:"type:varchar(4);not null" json:"arrivalAirport"`

	// 时间信息
	ScheduledDeparture *time.Time `json:"scheduledDeparture"`
	ActualDeparture    *time.Time `json:"actualDeparture"`
	ScheduledArrival   *time.Time `json:"scheduledArrival"`
	ActualArrival      *time.Time `json:"actualArrival"`

	// 延误信息
	DelayMinutes *int `json:"delayMinutes"`

	// 状态信息
	Status             string  `gorm:"type:varchar(20)" json:"status"` // scheduled/departed/arrived/cancelled/diverted
	CancellationReason *string `gorm:"type:text" json:"cancellationReason"`

	CreatedAt time.Time `json:"createdAt"`

	// 关联
	Aircraft *Aircraft `gorm:"foreignKey:AircraftID" json:"aircraft,omitempty"`
}

// TableName 指定表名
func (FlightHistory) TableName() string {
	return "flight_history"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (h *FlightHistory) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}
