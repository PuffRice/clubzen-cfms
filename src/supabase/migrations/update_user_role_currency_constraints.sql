-- Update role/currency constraints and seed data

-- Allow 'User' role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('Admin', 'Staff', 'User'));

-- Set user@gmail.com to User role
UPDATE users SET role = 'User', updated_at = NOW() WHERE email = 'user@gmail.com';

-- Restrict currency to USD and BDT only
UPDATE users SET currency = 'USD' WHERE currency IS NULL OR currency NOT IN ('USD', 'BDT');
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_currency_check;
ALTER TABLE users ADD CONSTRAINT users_currency_check CHECK (currency IN ('USD', 'BDT'));
