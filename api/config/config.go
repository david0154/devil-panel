package config

import (
	"os"
	"strconv"
)

type Config struct {
	AppName    string
	AppEnv     string
	AppPort    string
	AppSecret  string
	AppDebug   bool

	DBHost     string
	DBPort     string
	DBName     string
	DBUser     string
	DBPassword string
	DBSSLMode  string

	RedisHost     string
	RedisPort     string
	RedisPassword string
	RedisDB       int

	JWTSecret        string
	JWTExpiry        string
	JWTRefreshExpiry string

	RabbitMQHost     string
	RabbitMQPort     string
	RabbitMQUser     string
	RabbitMQPassword string
	RabbitMQVHost    string

	MinIOEndpoint  string
	MinIOAccessKey string
	MinIOSecretKey string
	MinIOBucket    string
	MinIOUseSSL    bool

	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string

	LetsEncryptEmail string

	PowerDNSAPIURL string
	PowerDNSAPIKey string
	DefaultNS1     string
	DefaultNS2     string

	AIEnabled   bool
	AIModelPath string
	AIAPIPort   string

	StripeAPIKey      string
	RazorpayKeyID     string
	RazorpayKeySecret string

	GrafanaAdminUser     string
	GrafanaAdminPassword string

	CSRFSecret         string
	CORSAllowedOrigins string
	RateLimit          int
	MaxLoginAttempts   int

	PanelDomain  string
	APIDomain    string
	MonitorDomain string
}

func Load() *Config {
	return &Config{
		AppName:   getEnv("APP_NAME", "DevilPanel"),
		AppEnv:    getEnv("APP_ENV", "development"),
		AppPort:   getEnv("APP_PORT", "8080"),
		AppSecret: getEnv("APP_SECRET_KEY", "change-this-secret"),
		AppDebug:  getEnvBool("APP_DEBUG", false),

		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBName:     getEnv("DB_NAME", "devilpanel"),
		DBUser:     getEnv("DB_USER", "devilpanel"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBSSLMode:  getEnv("DB_SSL_MODE", "disable"),

		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisDB:       getEnvInt("REDIS_DB", 0),

		JWTSecret:        getEnv("JWT_SECRET", "jwt-secret-change-this"),
		JWTExpiry:        getEnv("JWT_EXPIRY", "24h"),
		JWTRefreshExpiry: getEnv("JWT_REFRESH_EXPIRY", "168h"),

		RabbitMQHost:     getEnv("RABBITMQ_HOST", "localhost"),
		RabbitMQPort:     getEnv("RABBITMQ_PORT", "5672"),
		RabbitMQUser:     getEnv("RABBITMQ_USER", "devilpanel"),
		RabbitMQPassword: getEnv("RABBITMQ_PASSWORD", ""),
		RabbitMQVHost:    getEnv("RABBITMQ_VHOST", "/devilpanel"),

		MinIOEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinIOAccessKey: getEnv("MINIO_ACCESS_KEY", ""),
		MinIOSecretKey: getEnv("MINIO_SECRET_KEY", ""),
		MinIOBucket:    getEnv("MINIO_BUCKET", "devilpanel-backups"),
		MinIOUseSSL:    getEnvBool("MINIO_USE_SSL", false),

		SMTPHost:     getEnv("SMTP_HOST", "localhost"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),

		LetsEncryptEmail: getEnv("LETSENCRYPT_EMAIL", ""),

		PowerDNSAPIURL: getEnv("POWERDNS_API_URL", "http://localhost:8053"),
		PowerDNSAPIKey: getEnv("POWERDNS_API_KEY", ""),
		DefaultNS1:     getEnv("DEFAULT_NS1", "devil1.yourdomain.com"),
		DefaultNS2:     getEnv("DEFAULT_NS2", "devil2.yourdomain.com"),

		AIEnabled:   getEnvBool("AI_ENABLED", true),
		AIModelPath: getEnv("AI_MODEL_PATH", "/opt/devilpanel/models"),
		AIAPIPort:   getEnv("AI_API_PORT", "11434"),

		StripeAPIKey:      getEnv("STRIPE_API_KEY", ""),
		RazorpayKeyID:     getEnv("RAZORPAY_KEY_ID", ""),
		RazorpayKeySecret: getEnv("RAZORPAY_KEY_SECRET", ""),

		GrafanaAdminUser:     getEnv("GRAFANA_ADMIN_USER", "admin"),
		GrafanaAdminPassword: getEnv("GRAFANA_ADMIN_PASSWORD", "grafanapassword"),

		CSRFSecret:         getEnv("CSRF_SECRET", "csrf-secret"),
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", "*"),
		RateLimit:          getEnvInt("RATE_LIMIT", 100),
		MaxLoginAttempts:   getEnvInt("MAX_LOGIN_ATTEMPTS", 5),

		PanelDomain:   getEnv("PANEL_DOMAIN", "localhost"),
		APIDomain:     getEnv("API_DOMAIN", "localhost"),
		MonitorDomain: getEnv("MONITOR_DOMAIN", "localhost"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	if val := os.Getenv(key); val != "" {
		b, err := strconv.ParseBool(val)
		if err == nil {
			return b
		}
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		i, err := strconv.Atoi(val)
		if err == nil {
			return i
		}
	}
	return defaultVal
}
