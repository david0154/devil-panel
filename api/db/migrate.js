require('dotenv').config({ path: '../.env' });
const { pool } = require('./index');

const migrations = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  uuid            UUID DEFAULT uuid_generate_v4() UNIQUE,
  username        VARCHAR(50) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin','user','reseller')),
  is_active       BOOLEAN DEFAULT false,
  is_suspended    BOOLEAN DEFAULT false,
  two_fa_secret   TEXT,
  two_fa_enabled  BOOLEAN DEFAULT false,
  email_verified  BOOLEAN DEFAULT false,
  verify_token    TEXT,
  reset_token     TEXT,
  reset_expires   TIMESTAMPTZ,
  last_login      TIMESTAMPTZ,
  last_login_ip   VARCHAR(45),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS servers (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  hostname    VARCHAR(255),
  ip_address  VARCHAR(45),
  status      VARCHAR(20) DEFAULT 'active',
  plan        VARCHAR(50),
  disk_limit  BIGINT,
  ram_limit   BIGINT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS domains (
  id           SERIAL PRIMARY KEY,
  user_id      INT REFERENCES users(id) ON DELETE CASCADE,
  server_id    INT REFERENCES servers(id) ON DELETE CASCADE,
  domain       VARCHAR(255) UNIQUE NOT NULL,
  php_version  VARCHAR(10) DEFAULT '8.2',
  document_root TEXT,
  ssl_enabled  BOOLEAN DEFAULT false,
  status       VARCHAR(20) DEFAULT 'active',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ssl_certificates (
  id          SERIAL PRIMARY KEY,
  domain_id   INT REFERENCES domains(id) ON DELETE CASCADE,
  domain      VARCHAR(255) NOT NULL,
  issuer      VARCHAR(100),
  expires_at  TIMESTAMPTZ,
  auto_renew  BOOLEAN DEFAULT true,
  force_https BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dns_zones (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE CASCADE,
  zone       VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dns_records (
  id         SERIAL PRIMARY KEY,
  zone_id    INT REFERENCES dns_zones(id) ON DELETE CASCADE,
  type       VARCHAR(10) NOT NULL,
  name       VARCHAR(255) NOT NULL,
  value      TEXT NOT NULL,
  ttl        INT DEFAULT 3600,
  priority   INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_accounts (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  domain_id   INT REFERENCES domains(id) ON DELETE CASCADE,
  address     VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  quota_mb    INT DEFAULT 1000,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backups (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  server_id   INT REFERENCES servers(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  size_bytes  BIGINT,
  status      VARCHAR(20) DEFAULT 'pending',
  backup_type VARCHAR(20) DEFAULT 'full',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS firewall_rules (
  id          SERIAL PRIMARY KEY,
  server_id   INT REFERENCES servers(id) ON DELETE CASCADE,
  rule_type   VARCHAR(10) CHECK (rule_type IN ('allow','deny')),
  protocol    VARCHAR(10) DEFAULT 'tcp',
  port        VARCHAR(20),
  source_ip   VARCHAR(45),
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_ips (
  id          SERIAL PRIMARY KEY,
  ip_address  VARCHAR(45) UNIQUE NOT NULL,
  reason      TEXT,
  blocked_by  INT REFERENCES users(id),
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_plans (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  features    JSONB,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  plan_id     INT REFERENCES billing_plans(id),
  amount      DECIMAL(10,2) NOT NULL,
  status      VARCHAR(20) DEFAULT 'pending',
  due_date    TIMESTAMPTZ,
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100),
  resource_id TEXT,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wordpress_installs (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id) ON DELETE CASCADE,
  domain_id   INT REFERENCES domains(id) ON DELETE CASCADE,
  site_url    TEXT NOT NULL,
  admin_user  VARCHAR(100),
  db_name     VARCHAR(100),
  wp_version  VARCHAR(20),
  status      VARCHAR(20) DEFAULT 'installing',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Default admin user (password: Devil@Admin123 — CHANGE IMMEDIATELY)
INSERT INTO users (username, email, password_hash, role, is_active, email_verified)
VALUES (
  'admin',
  'admin@devilpanel.local',
  '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.isgm',
  'admin', true, true
) ON CONFLICT (username) DO NOTHING;
`;

async function migrate() {
  console.log('Running migrations...');
  try {
    await pool.query(migrations);
    console.log('✓ Migrations complete');
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    await pool.end();
  }
}

migrate();
