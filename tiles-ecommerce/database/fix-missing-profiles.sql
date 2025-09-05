-- ===================================
-- FIX MISSING PROFILES - Emergency Repair Script
-- ===================================
-- This script fixes the missing profiles table and creates entries
-- for existing auth.users

-- First, run the profiles-schema.sql to create the table and triggers

-- Then, create profiles for any existing auth.users that don't have profiles
-- This handles users created before the trigger was in place
INSERT INTO profiles (id, email, full_name, role, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  'customer' as role,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Optional: Set a specific user as admin (replace with your email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify the fix
SELECT 
  'auth.users count' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'profiles count' as table_name,
  COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
  'missing profiles' as table_name,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;