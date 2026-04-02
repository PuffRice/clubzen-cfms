-- #1
-- ClubZen CFMS — Base schema (CREATE TABLE only)
-- Run this once on a fresh Supabase project.
-- For existing deployments, use the migration files in src/supabase/migrations/

-- ─── Users ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'Staff' CHECK (role IN ('Admin', 'Staff', 'User')),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'BDT')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Support tickets ────────────────────────────────────────────────────
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

-- ─── Expense ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS EXPENSE (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    category VARCHAR(50),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Income ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS INCOME (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    source VARCHAR(50),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Category groups ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO category_groups (id, name) VALUES
  (1, 'Expense'),
  (2, 'Income')
ON CONFLICT (id) DO NOTHING;

-- ─── Categories ─────────────────────────────────────────────────────────
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

-- ─── Loans and repayments ─────────────────────────────────────────────────────
DROP TABLE IF EXISTS loan_repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;

-- ─────────────────────────────────────────────────────────────
-- LOANS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- given = you lent money → repayment = income
    -- taken = you borrowed money → repayment = expense
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('given','taken')),

    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    note TEXT,

    -- optional links (future use)
    mirror_income_id INTEGER,
    mirror_expense_id INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- LOAN REPAYMENTS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loan_repayments (
    id SERIAL PRIMARY KEY,

    loan_id INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
