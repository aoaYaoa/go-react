# Redis 缓存扩展指南（本项目）

本文说明：在当前项目里，除了验证码缓存外，如何继续新增业务缓存。

## 1. 当前已接入的缓存

目前验证码缓存已经接入 Redis：

- 初始化入口：`cmd/server/main.go`
- 配置来源：`internal/config/config.go`
- 验证码存储实现：`pkg/utils/captcha/redis_store.go`
- 失败回退：Redis 不可用时自动回退内存存储

## 2. 新增缓存的推荐方式

推荐使用 **Cache-Aside（旁路缓存）**：

1. 读请求：先读缓存，miss 再读数据库，再回填缓存
2. 写请求：先写数据库，成功后删除/刷新缓存

优点：改动小，和现有 Service/Repository 结构契合。

## 3. Key 命名与 TTL 规范

建议统一命名：

- `cache:user:profile:{userID}`
- `cache:user:menus:{userID}`
- `cache:task:list:{userID}`

TTL 建议：

- 高频且变化慢：`10m ~ 30m`
- 登录态/菜单权限：`5m ~ 10m`
- 强一致要求高：可不用缓存或 TTL 设短（`30s ~ 2m`）

## 4. 示例：给用户信息加缓存

目标：为 `UserService.GetByID` 增加缓存。

### 4.1 新建缓存模块（建议）

建议新增目录：

- `internal/cache/`

新增文件：

- `internal/cache/user_cache.go`

接口示例：

```go
package cache

import (
	"context"
	"time"
)

type UserCache interface {
	GetProfile(ctx context.Context, userID string) ([]byte, bool, error)
	SetProfile(ctx context.Context, userID string, payload []byte, ttl time.Duration) error
	DeleteProfile(ctx context.Context, userID string) error
}
```

说明：

- `payload` 可直接存 JSON（`dto.UserResponse` 序列化结果）
- key 使用 `cache:user:profile:{userID}`

### 4.2 在 Service 中接入（Cache-Aside）

读路径（示例逻辑）：

```go
func (s *userService) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	// 1) 先读缓存
	// 2) miss -> 读 DB
	// 3) 回填缓存（设置 TTL）
	// 4) 返回
}
```

写路径（如更新用户信息）：

```go
func (s *userService) UpdateProfile(ctx context.Context, req *dto.UpdateProfileRequest) error {
	// 1) 写 DB
	// 2) 成功后删除对应 key（或刷新 key）
	// 3) 返回
}
```

## 5. 配置建议

沿用现有 Redis 配置：

```env
REDIS_ADDR=host:port
REDIS_USERNAME=default
REDIS_PASSWORD=xxxx
REDIS_DB=0
REDIS_TLS=true
REDIS_KEY_PREFIX=captcha:
```

如果新增通用缓存，建议再加一个可选前缀：

```env
REDIS_CACHE_PREFIX=cache:
```

## 6. 失效策略建议

优先级建议：

1. 写后删除（推荐，简单可靠）
2. 写后刷新（读压力大时再考虑）
3. 定时过期（所有 key 必须带 TTL，除非明确长期驻留）

## 7. 排查清单

新增缓存后，如果没生效，依次检查：

1. 服务启动日志是否显示 Redis 已启用
2. Redis Insight 是否能搜到对应 key（如 `cache:user:*`）
3. 读接口第二次响应是否明显更快
4. 写接口后旧 key 是否被删除

## 8. 实施顺序（建议）

1. 先给 `GetByID` 做缓存（低风险）
2. 再给菜单/权限接口做缓存
3. 最后评估任务列表等分页数据缓存（需要额外失效策略）

