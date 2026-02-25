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

 ALTER TABLE INCOME   ADD COLUMN IF NOT EXISTS income_type VARCHAR(50);
ALTER TABLE EXPENSE  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);