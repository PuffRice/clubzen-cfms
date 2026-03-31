-- Add optional columns to existing tables
-- Run on deployments that were created before these columns existed.

ALTER TABLE INCOME  ADD COLUMN IF NOT EXISTS income_type VARCHAR(50);
ALTER TABLE EXPENSE ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
