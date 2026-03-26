//go:build integration

package repositories_test

import (
	"backend/internal/models"
	"backend/internal/repositories"
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	tcpostgres "github.com/testcontainers/testcontainers-go/modules/postgres"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// setupPostgres 启动 PostgreSQL 容器并返回 GORM 实例。
// 容器在测试结束后自动销毁。
func setupPostgres(t *testing.T) *gorm.DB {
	t.Helper()
	ctx := context.Background()

	ctr, err := tcpostgres.Run(ctx,
		"postgres:16-alpine",
		tcpostgres.WithDatabase("testdb"),
		tcpostgres.WithUsername("test"),
		tcpostgres.WithPassword("test"),
		tcpostgres.BasicWaitStrategies(),
	)
	require.NoError(t, err)
	t.Cleanup(func() { _ = ctr.Terminate(ctx) })

	dsn, err := ctr.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	require.NoError(t, err)

	err = db.AutoMigrate(&models.User{}, &models.Role{}, &models.UserRole{})
	require.NoError(t, err)

	return db
}

func newTestUser(username, email string) *models.User {
	return &models.User{
		ID:        uuid.New(),
		Username:  username,
		Email:     email,
		Password:  "hashed",
		Role:      "user",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func TestUserRepository_CreateAndFindByID(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	user := newTestUser("alice", "alice@example.com")
	created, err := repo.Create(ctx, user)
	require.NoError(t, err)
	assert.Equal(t, user.Username, created.Username)

	found, err := repo.FindByID(ctx, created.ID)
	require.NoError(t, err)
	assert.Equal(t, "alice", found.Username)
	assert.Equal(t, "alice@example.com", found.Email)
}

func TestUserRepository_FindByID_NotFound(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	_, err := repo.FindByID(ctx, uuid.New())
	require.Error(t, err)
}

func TestUserRepository_FindByUsername(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	_, err := repo.Create(ctx, newTestUser("bob", "bob@example.com"))
	require.NoError(t, err)

	found, err := repo.FindByUsername(ctx, "bob")
	require.NoError(t, err)
	assert.Equal(t, "bob", found.Username)
}

func TestUserRepository_FindByUsername_NotFound(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	_, err := repo.FindByUsername(ctx, "nonexistent")
	require.Error(t, err)
}

func TestUserRepository_FindByEmail(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	_, err := repo.Create(ctx, newTestUser("carol", "carol@example.com"))
	require.NoError(t, err)

	found, err := repo.FindByEmail(ctx, "carol@example.com")
	require.NoError(t, err)
	assert.Equal(t, "carol", found.Username)
}

func TestUserRepository_Update(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	user := newTestUser("dave", "dave@example.com")
	created, err := repo.Create(ctx, user)
	require.NoError(t, err)

	created.Role = "admin"
	updated, err := repo.Update(ctx, created)
	require.NoError(t, err)
	assert.Equal(t, "admin", updated.Role)

	// 验证持久化
	found, err := repo.FindByID(ctx, created.ID)
	require.NoError(t, err)
	assert.Equal(t, "admin", found.Role)
}

func TestUserRepository_Delete(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	user := newTestUser("eve", "eve@example.com")
	created, err := repo.Create(ctx, user)
	require.NoError(t, err)

	err = repo.Delete(ctx, created.ID)
	require.NoError(t, err)

	_, err = repo.FindByID(ctx, created.ID)
	require.Error(t, err)
}

func TestUserRepository_Delete_NotFound(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	err := repo.Delete(ctx, uuid.New())
	require.Error(t, err)
}

func TestUserRepository_List(t *testing.T) {
	db := setupPostgres(t)
	repo := repositories.NewDBUserRepository(db)
	ctx := context.Background()

	for _, name := range []string{"u1", "u2", "u3"} {
		_, err := repo.Create(ctx, newTestUser(name, name+"@example.com"))
		require.NoError(t, err)
	}

	users, err := repo.List(ctx)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, len(users), 3)
}
