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
