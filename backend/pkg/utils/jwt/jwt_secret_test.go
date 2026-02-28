package jwt

import (
	"backend/pkg/utils/logger"
	"testing"
	"time"
)

func TestGenerateTokenUsesConfiguredDefaultSecret(t *testing.T) {
	logger.Init()

	SetDefaultSecret("secret-A")
	t.Cleanup(func() {
		SetDefaultSecret("")
	})

	token, err := GenerateToken("u-1", "alice", "admin", "", time.Minute)
	if err != nil {
		t.Fatalf("GenerateToken returned error: %v", err)
	}

	if _, err := ValidateToken(token, ""); err != nil {
		t.Fatalf("ValidateToken with configured secret should succeed, got: %v", err)
	}

	if _, err := ValidateToken(token, "wrong-secret"); err == nil {
		t.Fatalf("ValidateToken with wrong secret should fail")
	}
}
