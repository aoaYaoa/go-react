package models

import (
	"time"

	"github.com/google/uuid"
)

// NoFlyZone 禁飞区模型
type NoFlyZone struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name        string     `json:"name" binding:"required" gorm:"type:text"`
	Type        string     `json:"type" gorm:"type:text;default:'permanent'"` // permanent, temporary, conditional
	Geometry    string     `json:"geometry" gorm:"type:text"`                 // GeoJSON格式的几何数据
	MinAltitude float64    `json:"min_altitude" gorm:"type:double precision"` // 最低限制高度（米）
	MaxAltitude float64    `json:"max_altitude" gorm:"type:double precision"` // 最高限制高度（米）
	StartTime   *time.Time `json:"start_time" gorm:"type:timestamptz"`        // 临时禁飞区开始时间
	EndTime     *time.Time `json:"end_time" gorm:"type:timestamptz"`          // 临时禁飞区结束时间
	Reason      string     `json:"reason" gorm:"type:text"`                   // 禁飞原因
	Authority   string     `json:"authority" gorm:"type:text"`                // 发布机构
	Status      string     `json:"status" gorm:"type:text;default:'active'"`  // active, expired, cancelled
	Description string     `json:"description" gorm:"type:text"`
	CreatedAt   time.Time  `json:"created_at" gorm:"type:timestamptz;default:now()"`
	UpdatedAt   time.Time  `json:"updated_at" gorm:"type:timestamptz;default:now()"`
}

// TableName 指定表名
func (NoFlyZone) TableName() string {
	return "no_fly_zones"
}
