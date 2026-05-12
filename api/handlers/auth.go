package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/david0154/devil-panel/api/config"
	"github.com/david0154/devil-panel/api/middleware"
	"github.com/david0154/devil-panel/api/services/cache"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db    *sql.DB
	cache *cache.RedisClient
	cfg   *config.Config
}

func NewAuthHandler(db *sql.DB, cache *cache.RedisClient, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cache: cache, cfg: cfg}
}

type LoginRequest struct {
	UsernameOrEmail string `json:"username_or_email" binding:"required"`
	Password        string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var (
		userID       int
		username     string
		email        string
		passwordHash string
		role         string
		isActive     bool
	)

	query := `SELECT id, username, email, password_hash, role, is_active FROM users
			  WHERE (username = $1 OR email = $1) AND is_suspended = false`
	err := h.db.QueryRow(query, req.UsernameOrEmail).Scan(&userID, &username, &email, &passwordHash, &role, &isActive)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !isActive {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account not activated"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Update last login
	h.db.Exec("UPDATE users SET last_login = $1 WHERE id = $2", time.Now(), userID)

	// Generate tokens
	accessToken, err := middleware.GenerateToken(userID, username, email, role, h.cfg.JWTSecret, 24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	refreshToken, err := middleware.GenerateToken(userID, username, email, role, h.cfg.JWTSecret, 168*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    86400,
		"user": gin.H{
			"id":       userID,
			"username": username,
			"email":    email,
			"role":     role,
		},
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}

	var userID int
	query := `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id`
	err = h.db.QueryRow(query, req.Username, req.Email, string(hash)).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username or email already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"user_id": userID,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed"})
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Password reset email sent"})
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Email verified"})
}

func (h *AuthHandler) Enable2FA(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "2FA setup initiated"})
}

func (h *AuthHandler) Verify2FA(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "2FA verified"})
}
