-- ============================================
-- YOLLR FRIEND INVITE SYSTEM MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_sports TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_team TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON profiles(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Step 3: Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);

-- Step 4: Enable RLS on friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS policies for friendships
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;
CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (user_id = auth.uid());

-- Step 6: Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN := TRUE;
BEGIN
  WHILE exists LOOP
    -- Generate 6-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));

    -- Check if code already exists
    SELECT COUNT(*) > 0 INTO exists
    FROM profiles
    WHERE invite_code = code;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Function to create friendship on referral
CREATE OR REPLACE FUNCTION fn_create_friendship_on_referral()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by) THEN
    -- Create bidirectional friendship
    INSERT INTO friendships (user_id, friend_id)
    VALUES (NEW.id, NEW.referred_by), (NEW.referred_by, NEW.id)
    ON CONFLICT DO NOTHING;

    -- Award bonus XP to both users (if fn_add_user_xp function exists)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_add_user_xp') THEN
      PERFORM fn_add_user_xp(NEW.id, 50, 'friend_invite_used', NEW.referred_by);
      PERFORM fn_add_user_xp(NEW.referred_by, 50, 'friend_invite_referral', NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for friendship creation
DROP TRIGGER IF EXISTS trg_create_friendship_on_referral ON profiles;
CREATE TRIGGER trg_create_friendship_on_referral
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by))
  EXECUTE FUNCTION fn_create_friendship_on_referral();

-- Step 9: Generate invite codes for existing profiles (if any)
UPDATE profiles SET invite_code = generate_invite_code() WHERE invite_code IS NULL;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- You can verify by running:
-- SELECT id, username, invite_code, referred_by FROM profiles LIMIT 5;
