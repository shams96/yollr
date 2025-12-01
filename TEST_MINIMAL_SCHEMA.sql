-- MINIMAL TEST SCHEMA
-- Run this to identify where the error occurs

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (references auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Campuses table
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Campus memberships with user_id
CREATE TABLE campus_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_memberships ENABLE ROW LEVEL SECURITY;

-- Simple policy
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Policy with user_id reference
CREATE POLICY "Users can view their memberships"
  ON campus_memberships FOR SELECT
  USING (user_id = auth.uid());

SELECT 'Minimal schema completed successfully!' as result;
