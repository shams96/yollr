-- =============================================
-- YOLLR MVP SCHEMA (Phase A)
-- Database: Supabase PostgreSQL
-- Purpose: Minimal, clean schema for GAS/BeReal/MrBeast hybrid
-- Age range: 14-30 years old (high school + college)
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- 1. CAMPUSES
-- Preset list of schools (manually populated)
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- e.g., "UCLA"
  slug TEXT UNIQUE NOT NULL,             -- e.g., "ucla"
  location TEXT NOT NULL,                -- e.g., "Los Angeles, CA"
  emoji TEXT DEFAULT '🎓',               -- e.g., "🐻"
  tier TEXT NOT NULL,                    -- 'high_school' or 'university'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. USERS
-- Device-based identity (no OTP in MVP)
-- deviceId = unique identifier per browser/device
-- Stored in IndexedDB on client
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,        -- Client-generated UUID, stored in IndexedDB
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  username TEXT NOT NULL,                -- Display name
  avatar_emoji TEXT DEFAULT '🎓',        -- Single emoji for profile
  points INT DEFAULT 0,                  -- Cumulative points (reset weekly per campus)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_campus_id ON users(campus_id);
CREATE INDEX idx_users_device_id ON users(device_id);

-- 3. POLLS
-- Anonymous 4-option polls, 24-hour expiry
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,                -- ['Option A', 'Option B', 'Option C', 'Option D']
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL          -- NOW() + 24 hours
);

CREATE INDEX idx_polls_campus_id ON polls(campus_id);
CREATE INDEX idx_polls_expires_at ON polls(expires_at);

-- 4. POLL_VOTES
-- One vote per user per poll (enforced by unique constraint)
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

-- 5. MOMENTS
-- 15-second video clips, 24-hour expiry
-- Can be tagged with #ThisWeeksDrop (drop_id reference)
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,               -- Supabase Storage path: moments/{campus_id}/{user_id}/{id}.mp4
  caption TEXT,                          -- Optional caption
  drop_id UUID REFERENCES drops(id) ON DELETE SET NULL,  -- NULL if not part of a drop
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL          -- NOW() + 24 hours
);

CREATE INDEX idx_moments_campus_id ON moments(campus_id);
CREATE INDEX idx_moments_drop_id ON moments(drop_id);
CREATE INDEX idx_moments_expires_at ON moments(expires_at);

-- 6. DROPS (Weekly Challenge, replaces Heist)
-- Mon–Wed: Submission phase
-- Thu–Sun: Voting phase
-- Monday: Winner announced, execution week starts
CREATE TABLE drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  guardrails JSONB NOT NULL,             -- ['rule1', 'rule2', 'rule3', 'rule4', 'rule5']
  submission_phase_start TIMESTAMP NOT NULL,  -- Monday 00:00
  submission_phase_end TIMESTAMP NOT NULL,    -- Wednesday 23:59
  voting_phase_start TIMESTAMP NOT NULL,      -- Thursday 00:00
  voting_phase_end TIMESTAMP NOT NULL,        -- Sunday 23:59
  status TEXT NOT NULL CHECK (status IN ('planning', 'submission', 'voting', 'execution', 'closed')),
  winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  winner_submission_id UUID REFERENCES drop_submissions(id) ON DELETE SET NULL,
  week_of DATE NOT NULL,                 -- Monday of week
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_drops_campus_id ON drops(campus_id);
CREATE INDEX idx_drops_week_of ON drops(week_of);
CREATE INDEX idx_drops_status ON drops(status);

-- 7. DROP_SUBMISSIONS
-- Students submit 15-sec video + text during submission phase
CREATE TABLE drop_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,               -- Supabase Storage path: drops/{drop_id}/{user_id}/{id}.mp4
  text_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drop_id, user_id)               -- One submission per user per drop
);

CREATE INDEX idx_drop_submissions_drop_id ON drop_submissions(drop_id);
CREATE INDEX idx_drop_submissions_user_id ON drop_submissions(user_id);

-- 8. DROP_VOTES
-- Students vote on submissions during voting phase
-- One vote per user per submission (enforced by unique constraint)
CREATE TABLE drop_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES drop_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drop_id, submission_id, user_id)  -- One vote per user per submission
);

CREATE INDEX idx_drop_votes_drop_id ON drop_votes(drop_id);
CREATE INDEX idx_drop_votes_submission_id ON drop_votes(submission_id);

-- 9. POINTS
-- Gamification: track points earned per action per week
-- Resets every Monday (week_of)
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('poll_vote', 'moment_post', 'drop_submit', 'drop_vote_received')),
  points_earned INT NOT NULL,
  week_of DATE NOT NULL,                 -- Monday of week (for leaderboard reset)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_points_user_id ON points(user_id);
CREATE INDEX idx_points_campus_id ON points(campus_id);
CREATE INDEX idx_points_week_of ON points(week_of);

-- =============================================
-- RLS (ROW-LEVEL SECURITY) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drop_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;

-- CAMPUSES: Public read (all can see list)
CREATE POLICY "campuses_read_all" ON campuses FOR SELECT USING (true);

-- USERS: Campus-scoped access
-- Users can read all users in their campus; can only update/delete own profile
CREATE POLICY "users_read_campus" ON users FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "users_insert_own" ON users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- POLLS: Campus-scoped access
-- Users can read/create polls only in their campus
CREATE POLICY "polls_read_campus" ON polls FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "polls_insert_own_campus" ON polls FOR INSERT
  WITH CHECK (
    campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1)
    AND creator_user_id = auth.uid()
  );

-- POLL_VOTES: Campus-scoped
-- Users can see votes for polls in their campus; can only create own votes
CREATE POLICY "poll_votes_read_campus" ON poll_votes FOR SELECT
  USING (
    poll_id IN (SELECT id FROM polls WHERE campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

CREATE POLICY "poll_votes_insert_own" ON poll_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- MOMENTS: Campus-scoped access
-- Users can read/create moments only in their campus
CREATE POLICY "moments_read_campus" ON moments FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "moments_insert_own_campus" ON moments FOR INSERT
  WITH CHECK (
    campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1)
    AND creator_user_id = auth.uid()
  );

-- DROPS: Campus-scoped access
CREATE POLICY "drops_read_campus" ON drops FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "drops_insert_admin_only" ON drops FOR INSERT
  WITH CHECK (false);  -- Only admins can create drops (via backend/function)

-- DROP_SUBMISSIONS: Campus-scoped
-- Users can see submissions for drops in their campus; can only create own submissions
CREATE POLICY "drop_submissions_read_campus" ON drop_submissions FOR SELECT
  USING (
    drop_id IN (SELECT id FROM drops WHERE campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

CREATE POLICY "drop_submissions_insert_own" ON drop_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- DROP_VOTES: Campus-scoped
-- Users can see votes for drops in their campus; can only create own votes
CREATE POLICY "drop_votes_read_campus" ON drop_votes FOR SELECT
  USING (
    drop_id IN (SELECT id FROM drops WHERE campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1))
  );

CREATE POLICY "drop_votes_insert_own" ON drop_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- POINTS: Campus-scoped
-- Users can see leaderboard (all points in their campus); can only create own points (via backend)
CREATE POLICY "points_read_campus" ON points FOR SELECT
  USING (campus_id = (SELECT campus_id FROM users WHERE id = auth.uid() LIMIT 1));

CREATE POLICY "points_insert_backend_only" ON points FOR INSERT
  WITH CHECK (false);  -- Only backend can insert points

-- =============================================
-- HELPER FUNCTIONS & VIEWS
-- =============================================

-- Function to get current week (Monday of current week)
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

-- View: Weekly leaderboard (points per user this week)
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
-- END SCHEMA
-- =============================================
