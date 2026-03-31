-- Drop and recreate loans/loan_repayments (destructive)
-- Only run this if you want to start fresh with loans data.
-- WARNING: This deletes all existing loan and repayment records.

DROP TABLE IF EXISTS loan_repayments;
DROP TABLE IF EXISTS loans;

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('given','taken')),
    amount DECIMAL(12,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    mirror_income_id INTEGER,
    mirror_expense_id INTEGER
);

CREATE TABLE IF NOT EXISTS loan_repayments (
    id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    date TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
