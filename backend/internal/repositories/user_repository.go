package repositories

import (
	"backend/internal/models"
	"context"
	"errors"
	"sync"
	"time"
)

// UserRepository 用户仓储接口
type UserRepository interface {
	Create(ctx context.Context, user *models.User) (*models.User, error)
	FindByID(ctx context.Context, id uint) (*models.User, error)
	FindByUsername(ctx context.Context, username string) (*models.User, error)
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) (*models.User, error)
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context) ([]*models.User, error)
}

// InMemoryUserRepository 内存用户仓储实现
type InMemoryUserRepository struct {
	users  map[uint]*models.User
	mu     sync.RWMutex
	autoID uint
}

// NewUserRepository 创建用户仓储实例
func NewUserRepository() UserRepository {
	return &InMemoryUserRepository{
		users: make(map[uint]*models.User),
	}
}

// Create 创建用户
func (r *InMemoryUserRepository) Create(ctx context.Context, user *models.User) (*models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// 检查用户名是否已存在
	for _, u := range r.users {
		if u.Username == user.Username {
			return nil, errors.New("用户名已存在")
		}
		if u.Email == user.Email {
			return nil, errors.New("邮箱已被使用")
		}
	}

	// 生成 ID
	r.autoID++
	user.ID = r.autoID
	user.CreatedAt = time.Now().Unix()
	user.UpdatedAt = time.Now().Unix()
	user.Role = "user" // 默认角色

	// 存储
	r.users[user.ID] = user

	return user, nil
}

// FindByID 根据 ID 查找用户
func (r *InMemoryUserRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, exists := r.users[id]
	if !exists {
		return nil, errors.New("用户不存在")
	}

	return user, nil
}

// FindByUsername 根据用户名查找用户
func (r *InMemoryUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.users {
		if user.Username == username {
			return user, nil
		}
	}

	return nil, errors.New("用户不存在")
}

// FindByEmail 根据邮箱查找用户
func (r *InMemoryUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.users {
		if user.Email == email {
			return user, nil
		}
	}

	return nil, errors.New("用户不存在")
}

// Update 更新用户
func (r *InMemoryUserRepository) Update(ctx context.Context, user *models.User) (*models.User, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[user.ID]; !exists {
		return nil, errors.New("用户不存在")
	}

	user.UpdatedAt = time.Now().Unix()
	r.users[user.ID] = user
	return user, nil
}

// Delete 删除用户
func (r *InMemoryUserRepository) Delete(ctx context.Context, id uint) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.users[id]; !exists {
		return errors.New("用户不存在")
	}

	delete(r.users, id)
	return nil
}

// List 获取用户列表
func (r *InMemoryUserRepository) List(ctx context.Context) ([]*models.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var users []*models.User
	for _, user := range r.users {
		users = append(users, user)
	}
	return users, nil
}
