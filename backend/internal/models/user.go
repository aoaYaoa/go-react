package models

// User 用户模型
type User struct {
	ID        uint   `json:"id"`
	Username  string `json:"username" binding:"required,min=3,max=20"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"-" binding:"required,min=6"` // json:"-" 防止在响应中返回密码
	Role      string `json:"role" default:"user"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

// TableName 指定表名（如果使用 GORM）
func (User) TableName() string {
	return "users"
}
