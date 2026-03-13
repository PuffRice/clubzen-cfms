-- One-time migration: change all user emails from @clubzen.com to @gmail.com
-- Run this once in Supabase SQL Editor.

-- 1. Update public.users (app profile table)
UPDATE public.users
SET email = REPLACE(email, '@clubzen.com', '@gmail.com'),
    updated_at = NOW()
WHERE email LIKE '%@clubzen.com';

-- 2. Update auth.users (Supabase Auth – required for login)
UPDATE auth.users
SET email = REPLACE(email, '@clubzen.com', '@gmail.com')
WHERE email LIKE '%@clubzen.com';
