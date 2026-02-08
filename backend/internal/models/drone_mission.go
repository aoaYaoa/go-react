package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DroneMission 无人机飞行任务模型
type DroneMission struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	DroneID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"droneId"`
	OperatorID uuid.UUID  `gorm:"type:uuid;index" json:"operatorId"`
	PilotID    *uuid.UUID `gorm:"type:uuid;index" json:"pilotId"`

	// 任务信息
	MissionName   string `gorm:"type:varchar(200);not null" json:"missionName"`
	MissionType   string `gorm:"type:varchar(50);not null" json:"missionType"`            // delivery/inspection/survey/photography等
	MissionStatus string `gorm:"type:varchar(20);default:'planned'" json:"missionStatus"` // planned/approved/in_progress/completed/cancelled
	Priority      string `gorm:"type:varchar(20);default:'normal'" json:"priority"`       // low/normal/high/emergency

	// 时间信息
	PlannedStartTime time.Time  `gorm:"not null" json:"plannedStartTime"`
	PlannedEndTime   time.Time  `gorm:"not null" json:"plannedEndTime"`
	ActualStartTime  *time.Time `json:"actualStartTime"`
	ActualEndTime    *time.Time `json:"actualEndTime"`

	// 位置信息 (JSON格式)
	DepartureLocation string  `gorm:"type:jsonb;not null" json:"departureLocation"` // {lat, lng, name, address}
	ArrivalLocation   *string `gorm:"type:jsonb" json:"arrivalLocation"`
	Waypoints         *string `gorm:"type:jsonb" json:"waypoints"`  // 航点列表
	FlightArea        *string `gorm:"type:jsonb" json:"flightArea"` // 飞行区域多边形

	// 飞行参数
	PlannedAltitude *int     `json:"plannedAltitude"`                           // 米
	PlannedSpeed    *int     `json:"plannedSpeed"`                              // km/h
	PlannedDistance *float64 `gorm:"type:decimal(10,2)" json:"plannedDistance"` // km

	// 审批信息
	RequiresApproval bool       `gorm:"default:false" json:"requiresApproval"`
	ApprovalStatus   *string    `gorm:"type:varchar(20)" json:"approvalStatus"` // pending/approved/rejected
	ApprovedBy       *uuid.UUID `gorm:"type:uuid" json:"approvedBy"`
	ApprovalTime     *time.Time `json:"approvalTime"`
	ApprovalNotes    *string    `gorm:"type:text" json:"approvalNotes"`

	// 空域信息
	AirspaceClass             *string `gorm:"type:varchar(10)" json:"airspaceClass"` // G/E/D/C/B/A
	FlightAuthorizationNumber *string `gorm:"type:varchar(100)" json:"flightAuthorizationNumber"`
	NotamIssued               bool    `gorm:"default:false" json:"notamIssued"`

	// 天气条件
	WeatherConditions *string `gorm:"type:jsonb" json:"weatherConditions"`
	WindSpeed         *int    `json:"windSpeed"`
	Visibility        *int    `json:"visibility"`

	// 任务详情
	Description         *string `gorm:"type:text" json:"description"`
	Objectives          *string `gorm:"type:text" json:"objectives"`
	PayloadInfo         *string `gorm:"type:jsonb" json:"payloadInfo"`
	SpecialRequirements *string `gorm:"type:text" json:"specialRequirements"`

	// 安全信息
	EmergencyContact *string `gorm:"type:jsonb" json:"emergencyContact"`
	BackupPlan       *string `gorm:"type:text" json:"backupPlan"`
	RiskAssessment   *string `gorm:"type:jsonb" json:"riskAssessment"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Drone    Drone    `gorm:"foreignKey:DroneID" json:"drone,omitempty"`
	Operator Operator `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
	Pilot    *User    `gorm:"foreignKey:PilotID" json:"pilot,omitempty"`
}

// TableName 指定表名
func (DroneMission) TableName() string {
	return "drone_missions"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (m *DroneMission) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
