-- Add invite_code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_sports TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_team TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index on invite_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON profiles(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Friendships table
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

-- Enable RLS on friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- RLS policies for friendships
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (user_id = auth.uid());

-- Function to generate unique invite code
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

-- Function to auto-connect friends when invite code is used
CREATE OR REPLACE FUNCTION fn_create_friendship_on_referral()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL AND OLD.referred_by IS NULL THEN
    -- Create bidirectional friendship
    INSERT INTO friendships (user_id, friend_id)
    VALUES (NEW.id, NEW.referred_by), (NEW.referred_by, NEW.id)
    ON CONFLICT DO NOTHING;

    -- Award bonus XP to both users
    PERFORM fn_add_user_xp(NEW.id, 50, 'friend_invite_used', NEW.referred_by);
    PERFORM fn_add_user_xp(NEW.referred_by, 50, 'friend_invite_referral', NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create friendship on referral
DROP TRIGGER IF EXISTS trg_create_friendship_on_referral ON profiles;
CREATE TRIGGER trg_create_friendship_on_referral
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by))
  EXECUTE FUNCTION fn_create_friendship_on_referral();

-- Update existing profiles with invite codes
UPDATE profiles SET invite_code = generate_invite_code() WHERE invite_code IS NULL;
