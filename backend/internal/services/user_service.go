package services

import (
	"backend/internal/dto"
	"backend/internal/models"
	"backend/internal/repositories"
	"backend/pkg/utils/crypto"
	"backend/pkg/utils/jwt"
	"backend/pkg/utils/logger"
	"context"
	"errors"
	"time"
)

// UserService 用户服务接口
type UserService interface {
	Register(ctx context.Context, req *dto.RegisterRequest) (*dto.RegisterResponse, error)
	Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error)
	GetByID(ctx context.Context, id uint) (*models.User, error)
	List(ctx context.Context) ([]*models.User, error)
}

// userService 用户服务实现
type userService struct {
	repo repositories.UserRepository
}

// NewUserService 创建用户服务实例
func NewUserService(repo repositories.UserRepository) UserService {
	return &userService{repo: repo}
}

// Register 用户注册
func (s *userService) Register(ctx context.Context, req *dto.RegisterRequest) (*dto.RegisterResponse, error) {
	// 检查用户名是否已存在
	if _, err := s.repo.FindByUsername(ctx, req.Username); err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 检查邮箱是否已被使用
	if _, err := s.repo.FindByEmail(ctx, req.Email); err == nil {
		return nil, errors.New("邮箱已被使用")
	}

	// 哈希密码
	hashedPassword, err := crypto.BcryptHash(req.Password, 10)
	if err != nil {
		logger.Errorf("[UserService] 密码哈希失败: %v", err)
		return nil, errors.New("注册失败")
	}

	// 创建用户
	user := &models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     "user",
	}

	createdUser, err := s.repo.Create(ctx, user)
	if err != nil {
		logger.Errorf("[UserService] 创建用户失败: %v", err)
		return nil, errors.New("注册失败")
	}

	logger.Infof("[UserService] 用户注册成功: id=%d, username=%s", createdUser.ID, createdUser.Username)

	return &dto.RegisterResponse{
		ID:       createdUser.ID,
		Username: createdUser.Username,
		Email:    createdUser.Email,
		Role:     createdUser.Role,
	}, nil
}

// Login 用户登录
func (s *userService) Login(ctx context.Context, req *dto.LoginRequest) (*dto.LoginResponse, error) {
	// 查找用户
	user, err := s.repo.FindByUsername(ctx, req.Username)
	if err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	// 验证密码
	if !crypto.BcryptVerify(user.Password, req.Password) {
		return nil, errors.New("用户名或密码错误")
	}

	// 生成 Token
	token, err := jwt.GenerateToken(user.ID, user.Username, user.Role, "", 24*time.Hour)
	if err != nil {
		logger.Errorf("[UserService] 生成 Token 失败: %v", err)
		return nil, errors.New("登录失败")
	}

	logger.Infof("[UserService] 用户登录成功: id=%d, username=%s", user.ID, user.Username)

	return &dto.LoginResponse{
		User: dto.RegisterResponse{
			ID:       user.ID,
			Username: user.Username,
			Email:    user.Email,
			Role:     user.Role,
		},
		Token:     token,
		TokenType: "Bearer",
		ExpiresIn: 86400, // 24 小时（秒）
	}, nil
}

// GetByID 根据 ID 获取用户
func (s *userService) GetByID(ctx context.Context, id uint) (*models.User, error) {
	return s.repo.FindByID(ctx, id)
}

// List 列出所有用户
func (s *userService) List(ctx context.Context) ([]*models.User, error) {
	return s.repo.List(ctx)
}
