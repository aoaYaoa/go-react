package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FlightRoute 航班航线模型
type FlightRoute struct {
	ID       uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FlightID uuid.UUID `gorm:"type:uuid;not null;index" json:"flightId"`

	// 航点信息
	WaypointName string  `gorm:"type:varchar(50)" json:"waypointName"`
	Latitude     float64 `gorm:"type:decimal(10,7);not null" json:"latitude"`
	Longitude    float64 `gorm:"type:decimal(10,7);not null" json:"longitude"`
	Altitude     *int    `json:"altitude"`                 // 英尺
	Sequence     int     `gorm:"not null" json:"sequence"` // 航点顺序

	// 时间信息
	EstimatedTime *time.Time `json:"estimatedTime"`
	ActualTime    *time.Time `json:"actualTime"`

	// 关联
	Flight Flight `gorm:"foreignKey:FlightID;constraint:OnDelete:CASCADE" json:"flight,omitempty"`
}

// TableName 指定表名
func (FlightRoute) TableName() string {
	return "flight_routes"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (r *FlightRoute) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
