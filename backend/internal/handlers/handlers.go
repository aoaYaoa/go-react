package handlers

// Handlers 聚合所有 HTTP 处理器
type Handlers struct {
	Task   TaskHandler
	User   UserHandler
	Health HealthHandler
}
