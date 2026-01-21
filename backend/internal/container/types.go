package container

import (
	"backend/internal/routes"
)

// Container 依赖注入容器
type Container struct {
	Router *routes.Router
}
