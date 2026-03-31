-- Add mirror columns to loans table
-- For deployments that already have the loans table without these columns.

ALTER TABLE loans ADD COLUMN IF NOT EXISTS mirror_income_id INTEGER;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS mirror_expense_id INTEGER;
