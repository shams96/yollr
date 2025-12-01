-- =============================================
-- YOLLR COMPLETE RESET SCRIPT
-- Drop all existing tables, then create MVP schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Drop all foreign key constraints and tables in reverse dependency order
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- Step 2: Drop all enums
DROP TYPE IF EXISTS profile_sport_type CASCADE;
DROP TYPE IF EXISTS campus_type CASCADE;
DROP TYPE IF EXISTS squad_type CASCADE;
DROP TYPE IF EXISTS squad_role CASCADE;
DROP TYPE IF EXISTS poll_category CASCADE;
DROP TYPE IF EXISTS heist_phase CASCADE;
DROP TYPE IF EXISTS reaction_type CASCADE;
DROP TYPE IF EXISTS moment_source CASCADE;
DROP TYPE IF EXISTS reward_type CASCADE;
DROP TYPE IF EXISTS offer_type CASCADE;
DROP TYPE IF EXISTS moderation_status CASCADE;
DROP TYPE IF EXISTS moderation_decision_type CASCADE;
DROP TYPE IF EXISTS moderation_content_type CASCADE;
DROP TYPE IF EXISTS streak_type CASCADE;
DROP TYPE IF EXISTS campus_role CASCADE;

-- Step 3: Drop all extensions
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS "postgis" CASCADE;
DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;

-- Step 4: Create fresh extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- NOW CREATE MVP SCHEMA
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- 1. CAMPUSES
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  emoji TEXT DEFAULT '🎓',
  tier TEXT NOT NULL CHECK (tier IN ('high_school', 'university')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🎓',
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_campus_id ON users(campus_id);
CREATE INDEX idx_users_device_id ON users(device_id);

-- 3. POLLS
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_polls_campus_id ON polls(campus_id);
CREATE INDEX idx_polls_expires_at ON polls(expires_at);

-- 4. POLL_VOTES
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index INT NOT NULL CHECK (option_index >= 0 AND option_index <= 3),
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_id ON poll_votes(user_id);

-- 5. MOMENTS (must be created before DROPS due to forward reference)
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  caption TEXT,
  drop_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_moments_campus_id ON moments(campus_id);
CREATE INDEX idx_moments_expires_at ON moments(expires_at);

-- 6. DROPS
CREATE TABLE drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  guardrails JSONB NOT NULL,
  submission_phase_start TIMESTAMP NOT NULL,
  submission_phase_end TIMESTAMP NOT NULL,
  voting_phase_start TIMESTAMP NOT NULL,
  voting_phase_end TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'submission', 'voting', 'execution', 'closed')),
  winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  winner_submission_id UUID REFERENCES drop_submissions(id) ON DELETE SET NULL,
  week_of DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_drops_campus_id ON drops(campus_id);
CREATE INDEX idx_drops_week_of ON drops(week_of);
CREATE INDEX idx_drops_status ON drops(status);

-- 7. DROP_SUBMISSIONS
CREATE TABLE drop_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  text_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drop_id, user_id)
);

CREATE INDEX idx_drop_submissions_drop_id ON drop_submissions(drop_id);
CREATE INDEX idx_drop_submissions_user_id ON drop_submissions(user_id);

-- 8. DROP_VOTES
CREATE TABLE drop_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES drop_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drop_id, submission_id, user_id)
);

CREATE INDEX idx_drop_votes_drop_id ON drop_votes(drop_id);
CREATE INDEX idx_drop_votes_submission_id ON drop_votes(submission_id);

-- 9. POINTS
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('poll_vote', 'moment_post', 'drop_submit', 'drop_vote_received')),
  points_earned INT NOT NULL,
  week_of DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_points_campus_id ON points(campus_id);
CREATE INDEX idx_points_week_of ON points(week_of);

-- Add foreign key constraint to moments.drop_id (now that drops table exists)
ALTER TABLE moments ADD CONSTRAINT fk_moments_drop_id
  FOREIGN KEY (drop_id) REFERENCES drops(id) ON DELETE SET NULL;

CREATE INDEX idx_moments_drop_id ON moments(drop_id);

-- =============================================
-- RLS (ROW-LEVEL SECURITY) POLICIES
-- =============================================

ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- CAMPUSES: Public read
CREATE POLICY "campuses_read_all" ON campuses FOR SELECT USING (true);

-- USERS: Campus-scoped access
CREATE POLICY "users_read_campus" ON users FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "users_insert_own" ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- POLLS: Campus-scoped
CREATE POLICY "polls_read_campus" ON polls FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "polls_insert_own_campus" ON polls FOR INSERT
  WITH CHECK (
    campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1)
    AND creator_user_id = auth.uid()
  );

-- POLL_VOTES: Campus-scoped
CREATE POLICY "poll_votes_read_campus" ON poll_votes FOR SELECT
  USING (
    poll_id IN (SELECT id FROM polls WHERE campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

CREATE POLICY "poll_votes_insert_own" ON poll_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- MOMENTS: Campus-scoped
CREATE POLICY "moments_read_campus" ON moments FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "moments_insert_own_campus" ON moments FOR INSERT
  WITH CHECK (
    campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1)
    AND creator_user_id = auth.uid()
  );

-- DROPS: Campus-scoped
CREATE POLICY "drops_read_campus" ON drops FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

-- DROP_SUBMISSIONS: Campus-scoped
CREATE POLICY "drop_submissions_read_campus" ON drop_submissions FOR SELECT
  USING (
    drop_id IN (SELECT id FROM drops WHERE campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

CREATE POLICY "drop_submissions_insert_own" ON drop_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- DROP_VOTES: Campus-scoped
CREATE POLICY "drop_votes_read_campus" ON drop_votes FOR SELECT
  USING (
    drop_id IN (SELECT id FROM drops WHERE campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

CREATE POLICY "drop_votes_insert_own" ON drop_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- POINTS: Campus-scoped
CREATE POLICY "points_read_campus" ON points FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

-- =============================================
-- HELPER FUNCTIONS & VIEWS
-- =============================================

CREATE OR REPLACE FUNCTION get_current_week()
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CURRENT_DATE - ((CURRENT_DATE - '2025-01-01'::DATE) % 7);
$$;

-- View: Poll results with vote counts per option
CREATE OR REPLACE VIEW poll_results AS
SELECT
  p.id,
  p.question,
  p.options,
  p.campus_id,
  COALESCE(v.option_index, -1) as option_index,
  COUNT(v.id) as vote_count
FROM polls p
LEFT JOIN poll_votes v ON p.id = v.poll_id
WHERE p.expires_at > NOW()
GROUP BY p.id, p.question, p.options, p.campus_id, v.option_index;

-- View: Weekly leaderboard
CREATE OR REPLACE VIEW weekly_leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_emoji,
  u.campus_id,
  SUM(p.points_earned) as total_points,
  MAX(p.week_of) as week_of
FROM users u
LEFT JOIN points p ON u.id = p.user_id AND p.week_of = get_current_week()
GROUP BY u.id, u.username, u.avatar_emoji, u.campus_id;

-- =============================================
-- RESET COMPLETE
-- =============================================

SELECT 'Schema reset and MVP schema created successfully!' as status;
