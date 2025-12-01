-- =============================================
-- MINIMAL YOLLR SCHEMA (Simplified)
-- =============================================

-- Drop everything
DROP TABLE IF EXISTS drop_votes CASCADE;
DROP TABLE IF EXISTS drop_submissions CASCADE;
DROP TABLE IF EXISTS moments CASCADE;
DROP TABLE IF EXISTS drops CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS campuses CASCADE;

-- Create campuses
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  emoji TEXT DEFAULT '🎓',
  tier TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🎓',
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_campus_id ON users(campus_id);

-- Create polls
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_polls_campus_id ON polls(campus_id);

-- Create poll_votes
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index INT NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create moments
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  caption TEXT,
  drop_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_moments_campus_id ON moments(campus_id);

-- Create drops
CREATE TABLE drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  guardrails JSONB NOT NULL,
  submission_phase_start TIMESTAMP NOT NULL,
  submission_phase_end TIMESTAMP NOT NULL,
  voting_phase_start TIMESTAMP NOT NULL,
  voting_phase_end TIMESTAMP NOT NULL,
  status TEXT NOT NULL,
  winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  winner_submission_id UUID,
  week_of DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_drops_campus_id ON drops(campus_id);

-- Create drop_submissions
CREATE TABLE drop_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  text_description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drop_id, user_id)
);

-- Create drop_votes
CREATE TABLE drop_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES drop_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drop_id, submission_id, user_id)
);

-- Create points
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points_earned INT NOT NULL,
  week_of DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_points_user_id ON points(user_id);

SELECT 'Schema created successfully!' as status;
