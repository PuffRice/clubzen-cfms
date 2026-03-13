-- id matches auth.users(id). Create via trigger or app after sign-up.
-- Clean up existing tables before recreating schema
DROP TABLE IF EXISTS support_ticket_replies;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS category_groups;
DROP TABLE IF EXISTS EXPENSE;
DROP TABLE IF EXISTS INCOME;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'Staff' CHECK (role IN ('Admin', 'Staff', 'User')),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'BDT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Support tickets ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id ON support_ticket_replies(ticket_id);

-- ─── Legacy tables ───────────────────────────────────────────────────────
CREATE TABLE EXPENSE(
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    category VARCHAR(50),
    payment_method VARCHAR(50),   -- new optional field for Sprint 4
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE INCOME(
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    source VARCHAR(50),
    income_type VARCHAR(50),      -- new optional classification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category groups (hardcoded: 1 = Expense, 2 = Income)
CREATE TABLE IF NOT EXISTS category_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed the two groups with fixed IDs
INSERT INTO category_groups (id, name) VALUES
  (1, 'Expense'),
  (2, 'Income')
ON CONFLICT (id) DO NOTHING;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category_group
        FOREIGN KEY (group_id)
        REFERENCES category_groups(id)
        ON DELETE CASCADE
);

 ALTER TABLE INCOME   ADD COLUMN IF NOT EXISTS income_type VARCHAR(50);
ALTER TABLE EXPENSE  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Extend users if table already existed (auth-aligned)
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Allow 'User' role (for existing deployments: drop old check and add new one)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('Admin', 'Staff', 'User'));

-- Set user@gmail.com to User role
UPDATE users SET role = 'User', updated_at = NOW() WHERE email = 'user@gmail.com';

-- Restrict currency to USD and BDT only
UPDATE users SET currency = 'USD' WHERE currency IS NULL OR currency NOT IN ('USD', 'BDT');
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_currency_check;
ALTER TABLE users ADD CONSTRAINT users_currency_check CHECK (currency IN ('USD', 'BDT'));
