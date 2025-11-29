-- =============================================
-- YOLLR SUPABASE SCHEMA - COMPLETE IMPLEMENTATION
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE profile_sport_type AS ENUM (
  'football',
  'basketball',
  'soccer',
  'baseball',
  'softball',
  'track',
  'volleyball',
  'tennis',
  'swimming',
  'golf',
  'lacrosse',
  'hockey',
  'wrestling',
  'cross_country',
  'gymnastics',
  'cheer',
  'band',
  'other'
);

CREATE TYPE campus_type AS ENUM (
  'university',
  'college',
  'high_school',
  'community_college'
);

CREATE TYPE squad_type AS ENUM (
  'sports',
  'club',
  'greek',
  'residence',
  'academic',
  'social'
);

CREATE TYPE squad_role AS ENUM (
  'member',
  'captain',
  'co_captain'
);

CREATE TYPE poll_category AS ENUM (
  'sports',
  'campus_life',
  'food',
  'entertainment',
  'academics',
  'weekend_plans'
);

CREATE TYPE heist_phase AS ENUM (
  'submitting',
  'voting',
  'won',
  'executing',
  'completed'
);

CREATE TYPE reaction_type AS ENUM (
  'fire',
  'laugh',
  'heart',
  'clap',
  'mind_blown',
  'sad',
  'angry',
  'star'
);

CREATE TYPE moment_source AS ENUM (
  'camera',
  'upload',
  'screen_record'
);

CREATE TYPE reward_type AS ENUM (
  'xp_boost',
  'mystery_box',
  'badge',
  'streak_freeze',
  'custom_title'
);

CREATE TYPE offer_type AS ENUM (
  'discount',
  'free_item',
  'experience',
  'sponsored_challenge'
);

CREATE TYPE moderation_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'escalated'
);

CREATE TYPE moderation_decision_type AS ENUM (
  'approve',
  'reject',
  'escalate',
  'shadow_ban'
);

CREATE TYPE streak_type AS ENUM (
  'daily_login',
  'yollr_bell',
  'heist_participation'
);

CREATE TYPE campus_role AS ENUM (
  'member',
  'moderator',
  'admin'
);

CREATE TYPE moderation_content_type AS ENUM (
  'moment',
  'heist_submission',
  'poll'
);

-- =============================================
-- TABLES
-- =============================================

-- Users table (phone-based authentication)
-- Note: Using Supabase's built-in auth.users table
-- No need to create a users table - Supabase manages this

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  sport_type profile_sport_type,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  mystery_boxes_available INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_total_xp ON profiles(total_xp DESC);
CREATE INDEX idx_profiles_current_streak ON profiles(current_streak DESC);

-- Campuses table
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  campus_type campus_type NOT NULL,
  domain TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  zip_code TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  enrollment INTEGER DEFAULT 0,
  primary_color TEXT,
  secondary_color TEXT,
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_campus_name UNIQUE (name),
  CONSTRAINT unique_campus_domain UNIQUE (domain)
);

CREATE INDEX idx_campuses_location ON campuses USING GIST(location);
CREATE INDEX idx_campuses_active ON campuses(is_active) WHERE is_active = true;

-- Campus memberships
CREATE TABLE campus_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  role campus_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_campus UNIQUE (user_id, campus_id)
);

CREATE INDEX idx_campus_memberships_user ON campus_memberships(user_id);
CREATE INDEX idx_campus_memberships_campus ON campus_memberships(campus_id);
CREATE INDEX idx_campus_memberships_active ON campus_memberships(is_active) WHERE is_active = true;
CREATE UNIQUE INDEX idx_unique_active_membership ON campus_memberships(user_id, campus_id) WHERE is_active = true;

-- Squads
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  squad_type squad_type NOT NULL,
  sport_type profile_sport_type,
  description TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  member_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_squads_campus ON squads(campus_id);
CREATE INDEX idx_squads_type ON squads(squad_type);
CREATE INDEX idx_squads_active ON squads(is_active) WHERE is_active = true;

-- Squad members
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role squad_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_squad_user UNIQUE (squad_id, user_id)
);

CREATE INDEX idx_squad_members_squad ON squad_members(squad_id);
CREATE UNIQUE INDEX idx_unique_active_squad_membership ON squad_members(squad_id, user_id) WHERE is_active = true;
CREATE INDEX idx_squad_members_user ON squad_members(user_id);
CREATE INDEX idx_squad_members_active ON squad_members(is_active) WHERE is_active = true;

-- Athletics events
CREATE TABLE athletics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  sport_type profile_sport_type NOT NULL,
  opponent_name TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_home_game BOOLEAN DEFAULT true NOT NULL,
  expected_attendance INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_athletics_events_campus ON athletics_events(campus_id);
CREATE INDEX idx_athletics_events_date ON athletics_events(event_date);
CREATE INDEX idx_athletics_events_sport ON athletics_events(sport_type);

-- Polls
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category poll_category NOT NULL,
  image_url TEXT,
  closes_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  total_votes INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_closes_at CHECK (closes_at > created_at)
);

CREATE INDEX idx_polls_campus ON polls(campus_id);
CREATE INDEX idx_polls_author ON polls(author_id);
CREATE INDEX idx_polls_closes_at ON polls(closes_at);
CREATE INDEX idx_polls_active ON polls(is_active) WHERE is_active = true;

-- Poll options
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0 NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_poll_options_position ON poll_options(position);

-- Poll votes
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_poll_vote UNIQUE (poll_id, user_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);

-- Heists
CREATE TABLE heists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  phase heist_phase DEFAULT 'submitting' NOT NULL,
  image_url TEXT,
  submission_opens_at TIMESTAMPTZ NOT NULL,
  submission_closes_at TIMESTAMPTZ NOT NULL,
  voting_opens_at TIMESTAMPTZ NOT NULL,
  voting_closes_at TIMESTAMPTZ NOT NULL,
  execution_week_start TIMESTAMPTZ,
  execution_week_end TIMESTAMPTZ,
  winner_submission_id UUID,
  total_submissions INTEGER DEFAULT 0 NOT NULL,
  total_votes INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_heist_timeline CHECK (submission_opens_at < submission_closes_at 
    AND submission_closes_at < voting_opens_at 
    AND voting_opens_at < voting_closes_at)
);

CREATE INDEX idx_heists_campus ON heists(campus_id);
CREATE INDEX idx_heists_phase ON heists(phase);
CREATE INDEX idx_heists_submission_window ON heists(submission_opens_at, submission_closes_at);
CREATE INDEX idx_heists_voting_window ON heists(voting_opens_at, voting_closes_at);
CREATE INDEX idx_heists_active ON heists(is_active) WHERE is_active = true;

-- Heist submissions
CREATE TABLE heist_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heist_id UUID NOT NULL REFERENCES heists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  vote_count INTEGER DEFAULT 0 NOT NULL,
  is_winner BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_heist_submissions_heist ON heist_submissions(heist_id);
CREATE INDEX idx_heist_submissions_user ON heist_submissions(user_id);
CREATE INDEX idx_heist_submissions_vote_count ON heist_submissions(vote_count DESC);
CREATE INDEX idx_heist_submissions_winner ON heist_submissions(is_winner) WHERE is_winner = true;

-- Heist votes
CREATE TABLE heist_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heist_id UUID NOT NULL REFERENCES heists(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES heist_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_heist_vote UNIQUE (heist_id, user_id)
);

CREATE INDEX idx_heist_votes_heist ON heist_votes(heist_id);
CREATE INDEX idx_heist_votes_submission ON heist_votes(submission_id);
CREATE INDEX idx_heist_votes_user ON heist_votes(user_id);

-- Moments
CREATE TABLE moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  squad_id UUID REFERENCES squads(id) ON DELETE SET NULL,
  athletics_event_id UUID REFERENCES athletics_events(id) ON DELETE SET NULL,
  caption TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  source moment_source NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  reaction_count INTEGER DEFAULT 0 NOT NULL,
  comment_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_expires_at CHECK (expires_at > created_at)
);

CREATE INDEX idx_moments_campus ON moments(campus_id);
CREATE INDEX idx_moments_user ON moments(user_id);
CREATE INDEX idx_moments_squad ON moments(squad_id);
CREATE INDEX idx_moments_event ON moments(athletics_event_id);
CREATE INDEX idx_moments_expires ON moments(expires_at);
CREATE INDEX idx_moments_active ON moments(is_active) WHERE is_active = true;
CREATE INDEX idx_moments_created ON moments(created_at DESC);

-- Yollr Bell Events
CREATE TABLE bell_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  participants_count INTEGER DEFAULT 0 NOT NULL,
  moments_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_bell_duration CHECK (expires_at > triggered_at)
);

CREATE INDEX idx_bell_events_campus ON bell_events(campus_id);
CREATE INDEX idx_bell_events_triggered ON bell_events(triggered_at DESC);
CREATE INDEX idx_bell_events_expires ON bell_events(expires_at);
CREATE INDEX idx_bell_events_active ON bell_events(is_active, expires_at) WHERE is_active = true;

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_moment_reaction UNIQUE (moment_id, user_id, reaction_type)
);

CREATE INDEX idx_reactions_moment ON reactions(moment_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_type ON reactions(reaction_type);

-- Streaks
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_type streak_type NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_at TIMESTAMPTZ,
  grace_period_used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_streak UNIQUE (user_id, streak_type)
);

CREATE INDEX idx_streaks_user ON streaks(user_id);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_current ON streaks(current_streak DESC);

-- User XP history
CREATE TABLE user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_xp_user ON user_xp(user_id);
CREATE INDEX idx_user_xp_created ON user_xp(created_at DESC);
CREATE INDEX idx_user_xp_source ON user_xp(source);

-- Mystery boxes
CREATE TABLE mystery_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  box_type TEXT NOT NULL,
  is_opened BOOLEAN DEFAULT false NOT NULL,
  reward_type reward_type,
  reward_value JSONB,
  opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mystery_boxes_user ON mystery_boxes(user_id);
CREATE INDEX idx_mystery_boxes_opened ON mystery_boxes(is_opened) WHERE is_opened = false;

-- User rewards
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_type reward_type NOT NULL,
  reward_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_active ON user_rewards(is_active) WHERE is_active = true;
CREATE INDEX idx_user_rewards_expires ON user_rewards(expires_at);

-- Sponsors
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_sponsors_active ON sponsors(is_active) WHERE is_active = true;

-- Sponsor offers
CREATE TABLE sponsor_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  offer_type offer_type NOT NULL,
  offer_value JSONB NOT NULL,
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_redemptions INTEGER,
  redemption_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_offer_dates CHECK (start_date < end_date)
);

CREATE INDEX idx_sponsor_offers_sponsor ON sponsor_offers(sponsor_id);
CREATE INDEX idx_sponsor_offers_campus ON sponsor_offers(campus_id);
CREATE INDEX idx_sponsor_offers_dates ON sponsor_offers(start_date, end_date);
CREATE INDEX idx_sponsor_offers_active ON sponsor_offers(is_active) WHERE is_active = true;

-- Campus weekly stats
CREATE TABLE campus_weekly_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  total_users INTEGER DEFAULT 0 NOT NULL,
  active_users INTEGER DEFAULT 0 NOT NULL,
  total_moments INTEGER DEFAULT 0 NOT NULL,
  total_polls INTEGER DEFAULT 0 NOT NULL,
  total_heist_submissions INTEGER DEFAULT 0 NOT NULL,
  total_reactions INTEGER DEFAULT 0 NOT NULL,
  total_xp_awarded INTEGER DEFAULT 0 NOT NULL,
  engagement_rate DECIMAL(5,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_weekly_stats UNIQUE (campus_id, week_start_date)
);

CREATE INDEX idx_campus_weekly_stats_campus ON campus_weekly_stats(campus_id);
CREATE INDEX idx_campus_weekly_stats_week ON campus_weekly_stats(week_start_date);

-- Campus legacy stats
CREATE TABLE campus_legacy_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  total_users_all_time INTEGER DEFAULT 0 NOT NULL,
  total_moments_all_time INTEGER DEFAULT 0 NOT NULL,
  total_polls_all_time INTEGER DEFAULT 0 NOT NULL,
  total_heist_submissions_all_time INTEGER DEFAULT 0 NOT NULL,
  total_reactions_all_time INTEGER DEFAULT 0 NOT NULL,
  total_xp_awarded_all_time BIGINT DEFAULT 0 NOT NULL,
  longest_streak_record INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_legacy_stats UNIQUE (campus_id)
);

CREATE INDEX idx_campus_legacy_stats_campus ON campus_legacy_stats(campus_id);

-- Moderation queue
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type moderation_content_type NOT NULL,
  content_id UUID NOT NULL,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status moderation_status DEFAULT 'pending' NOT NULL,
  reason TEXT,
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  decision moderation_decision_type,
  decision_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_campus ON moderation_queue(campus_id);
CREATE INDEX idx_moderation_queue_content ON moderation_queue(content_type, content_id);
CREATE INDEX idx_moderation_queue_pending ON moderation_queue(status) WHERE status = 'pending';

-- =============================================
-- STORAGE BUCKETS (CONCEPTUAL - MANAGED VIA SUPABASE UI)
-- =============================================

-- Buckets to create in Supabase UI:
-- - moments: For moment videos
-- - heist-submissions: For heist submission images/videos
-- - profile-avatars: For user profile pictures
-- - campus-assets: For campus logos and banners
-- - sponsor-assets: For sponsor logos and offer images

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE heists ENABLE ROW LEVEL SECURITY;
ALTER TABLE heist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE heist_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_legacy_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by campus members"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id IN (
        SELECT campus_id FROM campus_memberships WHERE user_id = profiles.id AND is_active = true
      )
      AND cm.is_active = true
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Campuses policies
CREATE POLICY "Campuses are viewable by members"
  ON campuses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = campuses.id
      AND cm.is_active = true
    )
  );

CREATE POLICY "Admins can update campuses"
  ON campuses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = campuses.id
      AND cm.role = 'admin'
      AND cm.is_active = true
    )
  );

-- Campus memberships policies
CREATE POLICY "Users can view their own memberships"
  ON campus_memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view active memberships in their campus"
  ON campus_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = campus_memberships.campus_id
      AND cm.is_active = true
    )
  );

CREATE POLICY "Admins can manage memberships"
  ON campus_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = campus_memberships.campus_id
      AND cm.role = 'admin'
      AND cm.is_active = true
    )
  );

-- Squads policies
CREATE POLICY "Squads are viewable by campus members"
  ON squads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = squads.campus_id
      AND cm.is_active = true
    )
  );

CREATE POLICY "Campus members can create squads"
  ON squads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = squads.campus_id
      AND cm.is_active = true
    )
  );

-- Squad members policies
CREATE POLICY "Squad members are viewable by squad members"
  ON squad_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM squad_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.squad_id = squad_members.squad_id
      AND sm.is_active = true
    )
  );

CREATE POLICY "Squad captains can manage members"
  ON squad_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM squad_members sm
      WHERE sm.user_id = auth.uid()
      AND sm.squad_id = squad_members.squad_id
      AND sm.role IN ('captain', 'co_captain')
      AND sm.is_active = true
    )
  );

-- Athletics events policies
CREATE POLICY "Events are viewable by campus members"
  ON athletics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = athletics_events.campus_id
      AND cm.is_active = true
    )
  );

CREATE POLICY "Admins can manage events"
  ON athletics_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = athletics_events.campus_id
      AND cm.role IN ('admin', 'moderator')
      AND cm.is_active = true
    )
  );

-- Polls policies
CREATE POLICY "Polls are viewable by campus members"
  ON polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = polls.campus_id
      AND cm.is_active = true
    )
    AND (polls.closes_at > NOW() OR EXISTS (
      SELECT 1 FROM poll_votes pv
      WHERE pv.poll_id = polls.id
      AND pv.user_id = auth.uid()
    ))
  );

CREATE POLICY "Campus members can create polls"
  ON polls FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = polls.campus_id
      AND cm.is_active = true
    )
    AND author_id = auth.uid()
  );

-- Poll options policies
CREATE POLICY "Poll options are viewable with poll access"
  ON poll_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls p
      WHERE p.id = poll_options.poll_id
      AND (
        EXISTS (
          SELECT 1 FROM campus_memberships cm
          WHERE cm.user_id = auth.uid()
          AND cm.campus_id = p.campus_id
          AND cm.is_active = true
        )
      )
    )
  );

-- Poll votes policies
CREATE POLICY "Users can view their own votes"
  ON poll_votes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can vote in accessible polls"
  ON poll_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM polls p
      WHERE p.id = poll_votes.poll_id
      AND p.closes_at > NOW()
      AND p.is_active = true
      AND EXISTS (
        SELECT 1 FROM campus_memberships cm
        WHERE cm.user_id = auth.uid()
        AND cm.campus_id = p.campus_id
        AND cm.is_active = true
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM poll_votes pv
      WHERE pv.poll_id = poll_votes.poll_id
      AND pv.user_id = auth.uid()
    )
  );

-- Heists policies
CREATE POLICY "Heists are viewable by campus members"
  ON heists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = heists.campus_id
      AND cm.is_active = true
    )
  );

-- Heist submissions policies
CREATE POLICY "Submissions are viewable during voting phase"
  ON heist_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM heists h
      WHERE h.id = heist_submissions.heist_id
      AND h.phase IN ('voting', 'won', 'executing', 'completed')
      AND EXISTS (
        SELECT 1 FROM campus_memberships cm
        WHERE cm.user_id = auth.uid()
        AND cm.campus_id = h.campus_id
        AND cm.is_active = true
      )
    )
  );

CREATE POLICY "Users can submit during submission phase"
  ON heist_submissions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM heists h
      WHERE h.id = heist_submissions.heist_id
      AND h.phase = 'submitting'
      AND h.submission_opens_at <= NOW()
      AND h.submission_closes_at > NOW()
      AND EXISTS (
        SELECT 1 FROM campus_memberships cm
        WHERE cm.user_id = auth.uid()
        AND cm.campus_id = h.campus_id
        AND cm.is_active = true
      )
    )
  );

-- Heist votes policies
CREATE POLICY "Users can vote during voting phase"
  ON heist_votes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM heists h
      WHERE h.id = heist_votes.heist_id
      AND h.phase = 'voting'
      AND h.voting_opens_at <= NOW()
      AND h.voting_closes_at > NOW()
      AND EXISTS (
        SELECT 1 FROM campus_memberships cm
        WHERE cm.user_id = auth.uid()
        AND cm.campus_id = h.campus_id
        AND cm.is_active = true
      )
    )
    AND NOT EXISTS (
      SELECT 1 FROM heist_votes hv
      WHERE hv.heist_id = heist_votes.heist_id
      AND hv.user_id = auth.uid()
    )
  );

-- Moments policies
CREATE POLICY "Moments are viewable by campus members"
  ON moments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = moments.campus_id
      AND cm.is_active = true
    )
    AND moments.expires_at > NOW()
    AND moments.is_active = true
  );

CREATE POLICY "Users can create moments"
  ON moments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = moments.campus_id
      AND cm.is_active = true
    )
  );

-- Reactions policies
CREATE POLICY "Users can view reactions on accessible moments"
  ON reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moments m
      WHERE m.id = reactions.moment_id
      AND m.expires_at > NOW()
      AND m.is_active = true
      AND EXISTS (
        SELECT 1 FROM campus_memberships cm
        WHERE cm.user_id = auth.uid()
        AND cm.campus_id = m.campus_id
        AND cm.is_active = true
      )
    )
  );

CREATE POLICY "Users can react to accessible moments"
  ON reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM moments m
      WHERE m.id = reactions.moment_id
      AND m.expires_at > NOW()
      AND m.is_active = true
      AND EXISTS (
        SELECT 1 FROM campus_memberships cm
        WHERE cm.user_id = auth.uid()
        AND cm.campus_id = m.campus_id
        AND cm.is_active = true
      )
    )
  );

-- Streaks policies
CREATE POLICY "Users can view own streaks"
  ON streaks FOR SELECT
  USING (user_id = auth.uid());

-- User XP policies
CREATE POLICY "Users can view own XP history"
  ON user_xp FOR SELECT
  USING (user_id = auth.uid());

-- Mystery boxes policies
CREATE POLICY "Users can view own mystery boxes"
  ON mystery_boxes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own mystery boxes"
  ON mystery_boxes FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User rewards policies
CREATE POLICY "Users can view own rewards"
  ON user_rewards FOR SELECT
  USING (user_id = auth.uid());

-- Sponsors policies
CREATE POLICY "Sponsors are viewable by all active members"
  ON sponsors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.is_active = true
    )
  );

-- Sponsor offers policies
CREATE POLICY "Offers are viewable by campus members"
  ON sponsor_offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = sponsor_offers.campus_id
      AND cm.is_active = true
    )
    AND sponsor_offers.start_date <= NOW()
    AND sponsor_offers.end_date > NOW()
    AND sponsor_offers.is_active = true
  );

-- Campus stats policies
CREATE POLICY "Weekly stats are viewable by campus members"
  ON campus_weekly_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = campus_weekly_stats.campus_id
      AND cm.is_active = true
    )
  );

CREATE POLICY "Legacy stats are viewable by campus members"
  ON campus_legacy_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = campus_legacy_stats.campus_id
      AND cm.is_active = true
    )
  );

-- Moderation queue policies
CREATE POLICY "Moderators can view moderation queue"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = moderation_queue.campus_id
      AND cm.role IN ('moderator', 'admin')
      AND cm.is_active = true
    )
  );

CREATE POLICY "Moderators can update moderation items"
  ON moderation_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = moderation_queue.campus_id
      AND cm.role IN ('moderator', 'admin')
      AND cm.is_active = true
    )
  );

CREATE POLICY "Users can report content"
  ON moderation_queue FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid()
    AND status = 'pending'
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set moment expiry
CREATE OR REPLACE FUNCTION fn_set_moment_expiry()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expires_at = NOW() + INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add XP to user
CREATE OR REPLACE FUNCTION fn_add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT,
  p_reference_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert XP record
  INSERT INTO user_xp (user_id, xp_amount, source, reference_id)
  VALUES (p_user_id, p_xp_amount, p_source, p_reference_id);
  
  -- Update profile total XP
  UPDATE profiles
  SET total_xp = total_xp + p_xp_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Award XP for reaction
CREATE OR REPLACE FUNCTION fn_add_xp_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  v_moment_user_id UUID;
BEGIN
  -- Get the moment owner
  SELECT user_id INTO v_moment_user_id
  FROM moments
  WHERE id = NEW.moment_id;
  
  -- Award XP to reaction giver (5 XP)
  PERFORM fn_add_user_xp(NEW.user_id, 5, 'reaction_given', NEW.moment_id);
  
  -- Award XP to moment owner (10 XP)
  PERFORM fn_add_user_xp(v_moment_user_id, 10, 'reaction_received', NEW.moment_id);
  
  -- Update moment reaction count
  UPDATE moments
  SET reaction_count = reaction_count + 1,
      updated_at = NOW()
  WHERE id = NEW.moment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Award XP for heist vote
CREATE OR REPLACE FUNCTION fn_add_xp_on_heist_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Award XP to voter (100 XP for heist participation)
  PERFORM fn_add_user_xp(NEW.user_id, 100, 'heist_vote', NEW.heist_id);
  
  -- Update heist submission vote count
  UPDATE heist_submissions
  SET vote_count = vote_count + 1,
      updated_at = NOW()
  WHERE id = NEW.submission_id;
  
  -- Update heist total votes
  UPDATE heists
  SET total_votes = total_votes + 1,
      updated_at = NOW()
  WHERE id = NEW.heist_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Award XP for poll vote
CREATE OR REPLACE FUNCTION fn_add_xp_on_poll_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_points INTEGER;
  v_option_position INTEGER;
  v_total_options INTEGER;
BEGIN
  -- Get option position and total options
  SELECT position, (SELECT COUNT(*) FROM poll_options WHERE poll_id = NEW.poll_id)
  INTO v_option_position, v_total_options
  FROM poll_options
  WHERE id = NEW.option_id;
  
  -- Calculate points based on position (40/30/20/10 scoring)
  v_points := CASE
    WHEN v_option_position = 1 THEN 40
    WHEN v_option_position = 2 THEN 30
    WHEN v_option_position = 3 THEN 20
    ELSE 10
  END;
  
  -- Update vote with points
  NEW.points_awarded := v_points;
  
  -- Award XP to voter
  PERFORM fn_add_user_xp(NEW.user_id, 10, 'poll_vote', NEW.poll_id);
  
  -- Update poll option vote count
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = NEW.option_id;
  
  -- Update poll total votes
  UPDATE polls
  SET total_votes = total_votes + 1,
      updated_at = NOW()
  WHERE id = NEW.poll_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update streaks for Yollr Bell
CREATE OR REPLACE FUNCTION fn_update_streaks_yollr_bell()
RETURNS VOID AS $$
BEGIN
  UPDATE streaks
  SET 
    current_streak = CASE 
      WHEN last_activity_at >= NOW() - INTERVAL '23 hours' THEN current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(longest_streak, CASE 
      WHEN last_activity_at >= NOW() - INTERVAL '23 hours' THEN current_streak + 1
      ELSE 1
    END),
    last_activity_at = NOW(),
    grace_period_used = false,
    updated_at = NOW()
  WHERE streak_type = 'yollr_bell'
  AND user_id IN (
    SELECT DISTINCT user_id FROM moments 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
  );
END;
$$ LANGUAGE plpgsql;

-- Update streaks for heist participation
CREATE OR REPLACE FUNCTION fn_update_streaks_heist_participation()
RETURNS VOID AS $$
BEGIN
  UPDATE streaks
  SET 
    current_streak = CASE 
      WHEN last_activity_at >= NOW() - INTERVAL '6 days' THEN current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(longest_streak, CASE 
      WHEN last_activity_at >= NOW() - INTERVAL '6 days' THEN current_streak + 1
      ELSE 1
    END),
    last_activity_at = NOW(),
    grace_period_used = false,
    updated_at = NOW()
  WHERE streak_type = 'heist_participation'
  AND user_id IN (
    SELECT DISTINCT user_id FROM heist_votes 
    WHERE created_at >= NOW() - INTERVAL '1 week'
  );
END;
$$ LANGUAGE plpgsql;

-- Reveal heists (Monday 9am)
CREATE OR REPLACE FUNCTION fn_reveal_heists()
RETURNS VOID AS $$
BEGIN
  UPDATE heists
  SET 
    phase = 'submitting',
    updated_at = NOW()
  WHERE phase = 'completed'
  AND submission_opens_at <= NOW()
  AND submission_closes_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Close submissions (Wednesday 11:59pm)
CREATE OR REPLACE FUNCTION fn_close_submissions()
RETURNS VOID AS $$
BEGIN
  UPDATE heists
  SET 
    phase = 'voting',
    updated_at = NOW()
  WHERE phase = 'submitting'
  AND submission_closes_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Open voting (Thursday 12:00am)
CREATE OR REPLACE FUNCTION fn_open_voting()
RETURNS VOID AS $$
BEGIN
  UPDATE heists
  SET 
    phase = 'voting',
    updated_at = NOW()
  WHERE phase = 'submitting'
  AND voting_opens_at <= NOW()
  AND voting_closes_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Close voting and select winner (Sunday 11:59pm)
CREATE OR REPLACE FUNCTION fn_close_voting_and_select_winner()
RETURNS VOID AS $$
DECLARE
  r_heist RECORD;
  v_winner_id UUID;
BEGIN
  FOR r_heist IN 
    SELECT * FROM heists 
    WHERE phase = 'voting' 
    AND voting_closes_at <= NOW()
  LOOP
    -- Select winner (highest votes, random tie-break)
    SELECT id INTO v_winner_id
    FROM heist_submissions
    WHERE heist_id = r_heist.id
    ORDER BY vote_count DESC, RANDOM()
    LIMIT 1;
    
    -- Update heist
    UPDATE heists
    SET 
      phase = 'won',
      winner_submission_id = v_winner_id,
      updated_at = NOW()
    WHERE id = r_heist.id;
    
    -- Update winning submission
    UPDATE heist_submissions
    SET is_winner = true,
        updated_at = NOW()
    WHERE id = v_winner_id;
    
    -- Award XP to winner (500 XP)
    PERFORM fn_add_user_xp(
      (SELECT user_id FROM heist_submissions WHERE id = v_winner_id),
      500,
      'heist_won',
      r_heist.id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Start execution week
CREATE OR REPLACE FUNCTION fn_start_execution_week()
RETURNS VOID AS $$
BEGIN
  UPDATE heists
  SET 
    phase = 'executing',
    updated_at = NOW()
  WHERE phase = 'won'
  AND execution_week_start <= NOW()
  AND execution_week_end > NOW();
END;
$$ LANGUAGE plpgsql;

-- End execution week
CREATE OR REPLACE FUNCTION fn_end_execution_week()
RETURNS VOID AS $$
BEGIN
  UPDATE heists
  SET 
    phase = 'completed',
    updated_at = NOW()
  WHERE phase = 'executing'
  AND execution_week_end <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Rollover weekly stats
CREATE OR REPLACE FUNCTION fn_rollover_weekly_stats()
RETURNS VOID AS $$
BEGIN
  INSERT INTO campus_weekly_stats (
    campus_id,
    week_start_date,
    total_users,
    active_users,
    total_moments,
    total_polls,
    total_heist_submissions,
    total_reactions,
    total_xp_awarded,
    engagement_rate
  )
  SELECT
    c.id,
    DATE_TRUNC('week', NOW()),
    COUNT(DISTINCT cm.user_id),
    COUNT(DISTINCT CASE WHEN ux.created_at >= NOW() - INTERVAL '7 days' THEN cm.user_id END),
    COUNT(DISTINCT m.id),
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT hs.id),
    COUNT(DISTINCT r.id),
    COALESCE(SUM(ux.xp_amount), 0),
    CASE 
      WHEN COUNT(DISTINCT cm.user_id) > 0 THEN 
        ROUND((COUNT(DISTINCT CASE WHEN ux.created_at >= NOW() - INTERVAL '7 days' THEN cm.user_id END)::DECIMAL / 
         COUNT(DISTINCT cm.user_id) * 100), 2)
      ELSE 0
    END
  FROM campuses c
  JOIN campus_memberships cm ON cm.campus_id = c.id AND cm.is_active = true
  JOIN profiles u ON u.id = cm.user_id
  LEFT JOIN moments m ON m.campus_id = c.id AND m.created_at >= DATE_TRUNC('week', NOW())
  LEFT JOIN polls p ON p.campus_id = c.id AND p.created_at >= DATE_TRUNC('week', NOW())
  LEFT JOIN heist_submissions hs ON hs.created_at >= DATE_TRUNC('week', NOW()) 
    AND hs.heist_id IN (SELECT id FROM heists WHERE campus_id = c.id)
  LEFT JOIN reactions r ON r.created_at >= DATE_TRUNC('week', NOW())
    AND r.moment_id IN (SELECT id FROM moments WHERE campus_id = c.id)
  LEFT JOIN user_xp ux ON ux.created_at >= DATE_TRUNC('week', NOW()) AND ux.user_id = cm.user_id
  GROUP BY c.id;
  
  -- Update legacy stats
  INSERT INTO campus_legacy_stats (
    campus_id,
    total_users_all_time,
    total_moments_all_time,
    total_polls_all_time,
    total_heist_submissions_all_time,
    total_reactions_all_time,
    total_xp_awarded_all_time,
    longest_streak_record
  )
  SELECT
    c.id,
    COUNT(DISTINCT cm.user_id),
    COUNT(DISTINCT m.id),
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT hs.id),
    COUNT(DISTINCT r.id),
    COALESCE(SUM(ux.xp_amount), 0),
    MAX(s.longest_streak)
  FROM campuses c
  JOIN campus_memberships cm ON cm.campus_id = c.id AND cm.is_active = true
  LEFT JOIN moments m ON m.campus_id = c.id
  LEFT JOIN polls p ON p.campus_id = c.id
  LEFT JOIN heist_submissions hs ON hs.heist_id IN (SELECT id FROM heists WHERE campus_id = c.id)
  LEFT JOIN reactions r ON r.moment_id IN (SELECT id FROM moments WHERE campus_id = c.id)
  LEFT JOIN user_xp ux ON ux.user_id = cm.user_id
  LEFT JOIN streaks s ON s.user_id = cm.user_id AND s.streak_type = 'daily_login'
  GROUP BY c.id
  ON CONFLICT (campus_id) DO UPDATE SET
    total_users_all_time = EXCLUDED.total_users_all_time,
    total_moments_all_time = EXCLUDED.total_moments_all_time,
    total_polls_all_time = EXCLUDED.total_polls_all_time,
    total_heist_submissions_all_time = EXCLUDED.total_heist_submissions_all_time,
    total_reactions_all_time = EXCLUDED.total_reactions_all_time,
    total_xp_awarded_all_time = EXCLUDED.total_xp_awarded_all_time,
    longest_streak_record = EXCLUDED.longest_streak_record,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enqueue for moderation
CREATE OR REPLACE FUNCTION fn_enqueue_for_moderation()
RETURNS TRIGGER AS $$
DECLARE
  v_content_type moderation_content_type;
  v_campus_id UUID;
BEGIN
  -- Map table name to moderation_content_type enum and campus_id
  IF TG_TABLE_NAME = 'moments' THEN
    v_content_type := 'moment';
    v_campus_id := NEW.campus_id;

  ELSIF TG_TABLE_NAME = 'heist_submissions' THEN
    v_content_type := 'heist_submission';
    SELECT h.campus_id
    INTO v_campus_id
    FROM heists h
    WHERE h.id = NEW.heist_id;

  ELSE
    -- Unknown table: do nothing
    RETURN NEW;
  END IF;

  INSERT INTO moderation_queue (
    content_type,
    content_id,
    campus_id,
    status,
    reason
  )
  VALUES (
    v_content_type,
    NEW.id,
    v_campus_id,
    'pending',
    'Auto-flagged for review'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply moderation decision
CREATE OR REPLACE FUNCTION fn_apply_moderation_decision(
  p_moderation_id UUID,
  p_moderator_id UUID,
  p_decision moderation_decision_type,
  p_notes TEXT
)
RETURNS VOID AS $$
DECLARE
  v_content_type TEXT;
  v_content_id UUID;
  v_campus_id UUID;
BEGIN
  -- Get moderation details
  SELECT content_type, content_id, campus_id
  INTO v_content_type, v_content_id, v_campus_id
  FROM moderation_queue
  WHERE id = p_moderation_id;
  
  -- Update moderation record
  UPDATE moderation_queue
  SET 
    moderator_id = p_moderator_id,
    decision = p_decision,
    decision_notes = p_notes,
    status = CASE 
      WHEN p_decision = 'approve' THEN 'approved'
      WHEN p_decision = 'reject' THEN 'rejected'
      ELSE 'escalated'
    END,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_moderation_id;
  
  -- Apply decision to content
  IF p_decision = 'reject' THEN
    IF v_content_type = 'moment' THEN
      UPDATE moments SET is_active = false WHERE id = v_content_id;
    ELSIF v_content_type = 'heist_submission' THEN
      UPDATE heist_submissions SET is_active = false WHERE id = v_content_id;
    ELSIF v_content_type = 'poll' THEN
      UPDATE polls SET is_active = false WHERE id = v_content_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Award mystery box
CREATE OR REPLACE FUNCTION fn_award_mystery_box(
  p_user_id UUID,
  p_box_type TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO mystery_boxes (user_id, box_type)
  VALUES (p_user_id, p_box_type);
  
  UPDATE profiles
  SET mystery_boxes_available = mystery_boxes_available + 1,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Open mystery box
CREATE OR REPLACE FUNCTION fn_open_mystery_box(
  p_box_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_reward_type reward_type;
  v_reward_value JSONB;
BEGIN
  -- Random reward selection
  SELECT type, value
  INTO v_reward_type, v_reward_value
  FROM (VALUES
    ('xp_boost', '{"amount": 100}'::JSONB),
    ('xp_boost', '{"amount": 250}'::JSONB),
    ('xp_boost', '{"amount": 500}'::JSONB),
    ('streak_freeze', '{"duration": "24h"}'::JSONB),
    ('custom_title', '{"title": "Campus Legend"}'::JSONB)
  ) AS rewards(type, value)
  ORDER BY RANDOM()
  LIMIT 1;
  
  -- Update mystery box
  UPDATE mystery_boxes
  SET 
    is_opened = true,
    reward_type = v_reward_type,
    reward_value = v_reward_value,
    opened_at = NOW()
  WHERE id = p_box_id AND user_id = p_user_id;
  
  -- Apply reward
  IF v_reward_type = 'xp_boost' THEN
    PERFORM fn_add_user_xp(
      p_user_id,
      (v_reward_value->>'amount')::INTEGER,
      'mystery_box',
      p_box_id
    );
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET mystery_boxes_available = mystery_boxes_available - 1,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'reward_type', v_reward_type,
    'reward_value', v_reward_value
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_campuses_updated_at
  BEFORE UPDATE ON campuses
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_campus_memberships_updated_at
  BEFORE UPDATE ON campus_memberships
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_squads_updated_at
  BEFORE UPDATE ON squads
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_squad_members_updated_at
  BEFORE UPDATE ON squad_members
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_athletics_events_updated_at
  BEFORE UPDATE ON athletics_events
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_poll_options_updated_at
  BEFORE UPDATE ON poll_options
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_heists_updated_at
  BEFORE UPDATE ON heists
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_heist_submissions_updated_at
  BEFORE UPDATE ON heist_submissions
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_moments_updated_at
  BEFORE UPDATE ON moments
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TRIGGER trg_sponsor_offers_updated_at
  BEFORE UPDATE ON sponsor_offers
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

-- Set moment expiry
CREATE TRIGGER trg_moments_set_expiry
  BEFORE INSERT ON moments
  FOR EACH ROW EXECUTE FUNCTION fn_set_moment_expiry();

-- Award XP on reactions
CREATE TRIGGER trg_reactions_add_xp
  AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION fn_add_xp_on_reaction();

-- Award XP on heist votes
CREATE TRIGGER trg_heist_votes_add_xp
  AFTER INSERT ON heist_votes
  FOR EACH ROW EXECUTE FUNCTION fn_add_xp_on_heist_vote();

-- Award XP on poll votes
CREATE TRIGGER trg_poll_votes_add_xp
  BEFORE INSERT ON poll_votes
  FOR EACH ROW EXECUTE FUNCTION fn_add_xp_on_poll_vote();

-- Auto-moderate new content
CREATE TRIGGER trg_moments_moderation
  AFTER INSERT ON moments
  FOR EACH ROW EXECUTE FUNCTION fn_enqueue_for_moderation();

CREATE TRIGGER trg_heist_submissions_moderation
  AFTER INSERT ON heist_submissions
  FOR EACH ROW EXECUTE FUNCTION fn_enqueue_for_moderation();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default campus (will be updated with real data)
INSERT INTO campuses (name, short_name, campus_type, timezone, is_active)
VALUES 
  ('Default Campus', 'DEFAULT', 'university', 'America/New_York', true)
ON CONFLICT DO NOTHING;

-- Insert default sponsor
INSERT INTO sponsors (name, description, is_active)
VALUES
  ('Yollr Official', 'Official Yollr sponsor', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- ANALYTICS TABLES
-- =============================================

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  category TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_campus ON analytics_events(campus_id);
CREATE INDEX idx_analytics_events_category ON analytics_events(category);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

-- Analytics sessions table
CREATE TABLE analytics_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  device_info JSONB DEFAULT '{}'::JSONB,
  location_info JSONB DEFAULT '{}'::JSONB,
  event_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_sessions_user ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_campus ON analytics_sessions(campus_id);
CREATE INDEX idx_analytics_sessions_start_time ON analytics_sessions(start_time DESC);

-- Analytics user properties table
CREATE TABLE analytics_user_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_property UNIQUE (user_id, property_name)
);

CREATE INDEX idx_analytics_user_properties_user ON analytics_user_properties(user_id);
CREATE INDEX idx_analytics_user_properties_name ON analytics_user_properties(property_name);

-- Analytics feature usage table
CREATE TABLE analytics_feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 1 NOT NULL,
  last_used TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_feature_user UNIQUE (feature_name, user_id)
);

CREATE INDEX idx_analytics_feature_usage_feature ON analytics_feature_usage(feature_name);
CREATE INDEX idx_analytics_feature_usage_user ON analytics_feature_usage(user_id);
CREATE INDEX idx_analytics_feature_usage_campus ON analytics_feature_usage(campus_id);

-- Analytics funnels table
CREATE TABLE analytics_funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
  step_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  properties JSONB DEFAULT '{}'::JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_funnels_funnel ON analytics_funnels(funnel_name);
CREATE INDEX idx_analytics_funnels_user ON analytics_funnels(user_id);
CREATE INDEX idx_analytics_funnels_timestamp ON analytics_funnels(timestamp DESC);

-- Analytics reports table
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::JSONB,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_analytics_reports_name ON analytics_reports(report_name);
CREATE INDEX idx_analytics_reports_type ON analytics_reports(report_type);
CREATE INDEX idx_analytics_reports_generated_at ON analytics_reports(generated_at DESC);

-- =============================================
-- ANALYTICS RLS POLICIES
-- =============================================

-- Enable RLS on analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all analytics events"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.role = 'admin'
      AND cm.is_active = true
    )
  );

-- Analytics sessions policies
CREATE POLICY "Users can view own sessions"
  ON analytics_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON analytics_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.role = 'admin'
      AND cm.is_active = true
    )
  );

-- Analytics feature usage policies
CREATE POLICY "Users can view own feature usage"
  ON analytics_feature_usage FOR SELECT
  USING (user_id = auth.uid());

-- Analytics reports policies
CREATE POLICY "Users can view reports they generated"
  ON analytics_reports FOR SELECT
  USING (generated_by = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON analytics_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.role = 'admin'
      AND cm.is_active = true
    )
  );

-- =============================================
-- ANALYTICS FUNCTIONS
-- =============================================

-- Update session end time and duration
CREATE OR REPLACE FUNCTION fn_update_session_end()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analytics_sessions
  SET
    end_time = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER,
    updated_at = NOW()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment session event count
CREATE OR REPLACE FUNCTION fn_increment_session_event_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analytics_sessions
  SET
    event_count = event_count + 1,
    updated_at = NOW()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update feature usage
CREATE OR REPLACE FUNCTION fn_update_feature_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_feature_usage (feature_name, user_id, campus_id)
  VALUES (
    NEW.properties->>'feature_name',
    NEW.user_id,
    NEW.campus_id
  )
  ON CONFLICT (feature_name, user_id) DO UPDATE SET
    usage_count = analytics_feature_usage.usage_count + 1,
    last_used = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create session on first event
CREATE OR REPLACE FUNCTION fn_create_session_on_first_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_sessions (id, user_id, campus_id, device_info, location_info)
  VALUES (
    NEW.session_id,
    NEW.user_id,
    NEW.campus_id,
    jsonb_build_object(
      'user_agent', NEW.properties->>'user_agent',
      'viewport', NEW.properties->>'viewport'
    ),
    jsonb_build_object(
      'ip_address', NEW.properties->>'ip_address',
      'country', NEW.properties->>'country'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ANALYTICS TRIGGERS
-- =============================================

-- Update session on event
CREATE TRIGGER trg_analytics_create_session
  AFTER INSERT ON analytics_events
  FOR EACH ROW EXECUTE FUNCTION fn_create_session_on_first_event();

-- Increment session event count
CREATE TRIGGER trg_analytics_increment_session_count
  AFTER INSERT ON analytics_events
  FOR EACH ROW EXECUTE FUNCTION fn_increment_session_event_count();

-- Update feature usage
CREATE TRIGGER trg_analytics_update_feature_usage
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.properties ? 'feature_name')
  EXECUTE FUNCTION fn_update_feature_usage();

-- =============================================
-- SCHEMA COMPLETE
-- =============================================