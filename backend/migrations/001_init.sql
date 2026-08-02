-- Run this once against your smtp_manager database
-- psql -U smtp_admin -d smtp_manager -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain_name VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_username VARCHAR(255),
  smtp_password_encrypted TEXT,
  smtp_secure BOOLEAN DEFAULT TRUE,
  from_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, domain_name)
);

CREATE TABLE IF NOT EXISTS dns_records (
  id SERIAL PRIMARY KEY,
  domain_id INTEGER NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('A','AAAA','CNAME','TXT','MX','DMARC','SPF','NS','DKIM')),
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  ttl INTEGER DEFAULT 3600,
  priority INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_records_domain_id ON dns_records(domain_id);
