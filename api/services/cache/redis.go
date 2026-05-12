package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/david0154/devil-panel/api/config"
	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisClient(cfg *config.Config) (*RedisClient, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis connection failed: %w", err)
	}

	fmt.Println("✓ Connected to Redis")
	return &RedisClient{client: rdb, ctx: ctx}, nil
}

func (r *RedisClient) Set(key string, value interface{}, expiry time.Duration) error {
	return r.client.Set(r.ctx, key, value, expiry).Err()
}

func (r *RedisClient) Get(key string) (string, error) {
	return r.client.Get(r.ctx, key).Result()
}

func (r *RedisClient) Delete(key string) error {
	return r.client.Del(r.ctx, key).Err()
}

func (r *RedisClient) IncrWithExpiry(key string, expiry time.Duration) (int64, error) {
	pipe := r.client.Pipeline()
	incr := pipe.Incr(r.ctx, key)
	pipe.Expire(r.ctx, key, expiry)
	_, err := pipe.Exec(r.ctx)
	return incr.Val(), err
}

func (r *RedisClient) Close() error {
	return r.client.Close()
}
