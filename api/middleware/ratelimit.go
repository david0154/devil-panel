package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/david0154/devil-panel/api/config"
	"github.com/david0154/devil-panel/api/services/cache"
	"github.com/gin-gonic/gin"
)

func RateLimitMiddleware(redis *cache.RedisClient, cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		key := fmt.Sprintf("ratelimit:%s", ip)

		count, err := redis.IncrWithExpiry(key, time.Minute)
		if err != nil {
			c.Next()
			return
		}

		if count > int64(cfg.RateLimit) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":       "Rate limit exceeded",
				"retry_after": "60s",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
