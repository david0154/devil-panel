package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"github.com/david0154/devil-panel/api/config"
)

func Connect(cfg *config.Config) (*sql.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	log.Println("✓ Connected to PostgreSQL")
	return db, nil
}

func AutoMigrate(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(100) UNIQUE NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			role VARCHAR(50) DEFAULT 'user',
			is_active BOOLEAN DEFAULT true,
			is_suspended BOOLEAN DEFAULT false,
			language VARCHAR(10) DEFAULT 'en',
			two_factor_enabled BOOLEAN DEFAULT false,
			two_factor_secret VARCHAR(100),
			last_login TIMESTAMP,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS servers (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			name VARCHAR(100) NOT NULL,
			ipv4 VARCHAR(45),
			ipv6 VARCHAR(45),
			server_type VARCHAR(50), -- shared, vps, dedicated, cloud
			os VARCHAR(100),
			status VARCHAR(20) DEFAULT 'active',
			cpu_cores INTEGER,
			ram_gb INTEGER,
			disk_gb INTEGER,
			bandwidth_gb INTEGER,
			location VARCHAR(100),
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS domains (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			server_id INTEGER REFERENCES servers(id) ON DELETE SET NULL,
			domain VARCHAR(255) UNIQUE NOT NULL,
			domain_type VARCHAR(50) DEFAULT 'main', -- main, addon, subdomain, alias
			php_version VARCHAR(10) DEFAULT '8.2',
			docroot VARCHAR(500),
			ssl_enabled BOOLEAN DEFAULT false,
			ssl_expiry TIMESTAMP,
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS dns_records (
			id SERIAL PRIMARY KEY,
			domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
			record_type VARCHAR(10) NOT NULL, -- A, AAAA, CNAME, MX, TXT, NS, SRV
			name VARCHAR(255) NOT NULL,
			content VARCHAR(500) NOT NULL,
			ttl INTEGER DEFAULT 300,
			priority INTEGER DEFAULT 0,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS ssl_certificates (
			id SERIAL PRIMARY KEY,
			domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
			cert_type VARCHAR(50) DEFAULT 'letsencrypt',
			cert_path VARCHAR(500),
			key_path VARCHAR(500),
			issued_at TIMESTAMP,
			expires_at TIMESTAMP,
			auto_renew BOOLEAN DEFAULT true,
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS emails (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
			email_address VARCHAR(255) UNIQUE NOT NULL,
			quota_mb INTEGER DEFAULT 1024,
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS backups (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			server_id INTEGER REFERENCES servers(id) ON DELETE SET NULL,
			backup_type VARCHAR(50), -- full, incremental, snapshot
			storage_provider VARCHAR(50), -- s3, backblaze, wasabi, minio
			storage_path VARCHAR(500),
			size_mb BIGINT,
			status VARCHAR(20) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT NOW(),
			completed_at TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS invoices (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			amount DECIMAL(10,2) NOT NULL,
			currency VARCHAR(10) DEFAULT 'INR',
			status VARCHAR(20) DEFAULT 'pending',
			payment_gateway VARCHAR(50),
			gateway_transaction_id VARCHAR(255),
			due_date TIMESTAMP,
			paid_at TIMESTAMP,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS reseller_accounts (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			brand_name VARCHAR(100),
			max_accounts INTEGER DEFAULT 50,
			current_accounts INTEGER DEFAULT 0,
			disk_quota_gb INTEGER DEFAULT 100,
			bandwidth_quota_gb INTEGER DEFAULT 1000,
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS monitoring_logs (
			id SERIAL PRIMARY KEY,
			server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
			cpu_percent DECIMAL(5,2),
			ram_percent DECIMAL(5,2),
			disk_percent DECIMAL(5,2),
			network_in_mb DECIMAL(10,2),
			network_out_mb DECIMAL(10,2),
			load_avg DECIMAL(5,2),
			recorded_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS firewall_rules (
			id SERIAL PRIMARY KEY,
			server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
			rule_type VARCHAR(20), -- allow, deny, block
			protocol VARCHAR(10),
			source_ip VARCHAR(100),
			destination_port INTEGER,
			direction VARCHAR(10) DEFAULT 'inbound',
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
		`CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_dns_records_domain_id ON dns_records(domain_id)`,
		`CREATE INDEX IF NOT EXISTS idx_monitoring_logs_server_id ON monitoring_logs(server_id)`,
		`CREATE INDEX IF NOT EXISTS idx_monitoring_logs_recorded_at ON monitoring_logs(recorded_at)`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	log.Println("✓ Database migrations completed")
	return nil
}
