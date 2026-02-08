package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DroneIncident 无人机事件/事故模型
type DroneIncident struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	DroneID    *uuid.UUID `gorm:"type:uuid;index" json:"droneId"`
	MissionID  *uuid.UUID `gorm:"type:uuid;index" json:"missionId"`
	OperatorID *uuid.UUID `gorm:"type:uuid;index" json:"operatorId"`

	// 事件信息
	IncidentType string    `gorm:"type:varchar(50);not null;index" json:"incidentType"` // crash/flyaway/near_miss/violation/malfunction
	Severity     string    `gorm:"type:varchar(20);not null" json:"severity"`           // minor/moderate/serious/critical
	IncidentDate time.Time `gorm:"not null;index" json:"incidentDate"`

	// 位置信息
	Location string `gorm:"type:jsonb;not null" json:"location"`
	Altitude *int   `json:"altitude"`

	// 事件描述
	Description         string  `gorm:"type:text;not null" json:"description"`
	Cause               *string `gorm:"type:text" json:"cause"`
	ContributingFactors *string `gorm:"type:jsonb" json:"contributingFactors"`

	// 损失评估
	DroneDamage               *string `gorm:"type:varchar(20)" json:"droneDamage"` // none/minor/major/total_loss
	PropertyDamage            bool    `gorm:"default:false" json:"propertyDamage"`
	PropertyDamageDescription *string `gorm:"type:text" json:"propertyDamageDescription"`
	Injuries                  bool    `gorm:"default:false" json:"injuries"`
	InjuryDescription         *string `gorm:"type:text" json:"injuryDescription"`

	// 调查信息
	InvestigationStatus string     `gorm:"type:varchar(20);default:'pending'" json:"investigationStatus"`
	InvestigatorID      *uuid.UUID `gorm:"type:uuid" json:"investigatorId"`
	InvestigationNotes  *string    `gorm:"type:text" json:"investigationNotes"`
	RootCause           *string    `gorm:"type:text" json:"rootCause"`

	// 纠正措施
	CorrectiveActions  *string `gorm:"type:text" json:"correctiveActions"`
	PreventiveMeasures *string `gorm:"type:text" json:"preventiveMeasures"`

	// 报告信息
	ReportedToAuthority bool    `gorm:"default:false" json:"reportedToAuthority"`
	AuthorityCaseNumber *string `gorm:"type:varchar(100)" json:"authorityCaseNumber"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Drone        *Drone        `gorm:"foreignKey:DroneID" json:"drone,omitempty"`
	Mission      *DroneMission `gorm:"foreignKey:MissionID" json:"mission,omitempty"`
	Operator     *Operator     `gorm:"foreignKey:OperatorID" json:"operator,omitempty"`
	Investigator *User         `gorm:"foreignKey:InvestigatorID" json:"investigator,omitempty"`
}

// TableName 指定表名
func (DroneIncident) TableName() string {
	return "drone_incidents"
}

// BeforeCreate GORM钩子：创建前生成UUID
func (i *DroneIncident) BeforeCreate(tx *gorm.DB) error {
	if i.ID == uuid.Nil {
		i.ID = uuid.New()
	}
	return nil
}
