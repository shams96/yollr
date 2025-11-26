# Yollr Database Schema Documentation

## Overview

This document provides comprehensive documentation for the Yollr database schema, including table structures, relationships, indexes, and data flow patterns.

## Database Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "postgis";       -- Geospatial data
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Text search optimization
```

## Enum Types

### Profile Sport Types
```sql
CREATE TYPE profile_sport_type AS ENUM (
  'football', 'basketball', 'soccer', 'baseball', 'softball',
  'track', 'volleyball', 'tennis', 'swimming', 'golf',
  'lacrosse', 'hockey', 'wrestling', 'cross_country',
  'gymnastics', 'cheer', 'band', 'other'
);
```

### Campus Types
```sql
CREATE TYPE campus_type AS ENUM (
  'university', 'college', 'high_school', 'community_college'
);
```

### Squad Types
```sql
CREATE TYPE squad_type AS ENUM (
  'sports', 'club', 'greek', 'residence', 'academic', 'social'
);
```

### Squad Roles
```sql
CREATE TYPE squad_role AS ENUM ('member', 'captain', 'co_captain');
```

### Poll Categories
```sql
CREATE TYPE poll_category AS ENUM (
  'sports', 'campus_life', 'food', 'entertainment', 'academics', 'weekend_plans'
);
```

### Heist Phases
```sql
CREATE TYPE heist_phase AS ENUM (
  'submitting', 'voting', 'won', 'executing', 'completed'
);
```

### Reaction Types
```sql
CREATE TYPE reaction_type AS ENUM (
  'fire', 'laugh', 'heart', 'clap', 'mind_blown', 'sad', 'angry', 'star'
);
```

### Moment Sources
```sql
CREATE TYPE moment_source AS ENUM ('camera', 'upload', 'screen_record');
```

### Reward Types
```sql
CREATE TYPE reward_type AS ENUM (
  'xp_boost', 'mystery_box', 'badge', 'streak_freeze', 'custom_title'
);
```

### Offer Types
```sql
CREATE TYPE offer_type AS ENUM (
  'discount', 'free_item', 'experience', 'sponsored_challenge'
);
```

### Moderation Status
```sql
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');
```

### Moderation Decisions
```sql
CREATE TYPE moderation_decision_type AS ENUM (
  'approve', 'reject', 'escalate', 'shadow_ban'
);
```

### Streak Types
```sql
CREATE TYPE streak_type AS ENUM (
  'daily_login', 'yollr_bell', 'heist_participation'
);
```

## Core Tables

### Profiles
```sql
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

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_total_xp ON profiles(total_xp DESC);
CREATE INDEX idx_profiles_current_streak ON profiles(current_streak DESC);
```

**Purpose**: User profiles that extend Supabase Auth users

**Relationships**:
- One-to-one with `auth.users`
- One-to-many with `moments`, `polls`, `heist_submissions`
- One-to-many with `campus_memberships`

### Campuses
```sql
CREATE TABLE campuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  campus_type campus_type NOT NULL,
  domain TEXT,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
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

-- Indexes
CREATE INDEX idx_campuses_location ON campuses USING GIST(location);
CREATE INDEX idx_campuses_active ON campuses(is_active) WHERE is_active = true;
```

**Purpose**: College/university campuses

**Relationships**:
- One-to-many with `campus_memberships`
- One-to-many with `squads`, `athletics_events`
- One-to-many with `polls`, `heists`, `moments`

### Campus Memberships
```sql
CREATE TABLE campus_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' NOT NULL CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT unique_active_membership UNIQUE (user_id, campus_id, is_active) WHERE is_active = true
);

-- Indexes
CREATE INDEX idx_campus_memberships_user ON campus_memberships(user_id);
CREATE INDEX idx_campus_memberships_campus ON campus_memberships(campus_id);
CREATE INDEX idx_campus_memberships_active ON campus_memberships(is_active) WHERE is_active = true;
```

**Purpose**: Links users to campuses with roles

## Social Features

### Squads
```sql
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

-- Indexes
CREATE INDEX idx_squads_campus ON squads(campus_id);
CREATE INDEX idx_squads_type ON squads(squad_type);
CREATE INDEX idx_squads_active ON squads(is_active) WHERE is_active = true;
```

**Purpose**: User groups within campuses

### Squad Members
```sql
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role squad_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT unique_squad_membership UNIQUE (squad_id, user_id, is_active) WHERE is_active = true
);

-- Indexes
CREATE INDEX idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX idx_squad_members_user ON squad_members(user_id);
CREATE INDEX idx_squad_members_active ON squad_members(is_active) WHERE is_active = true;
```

## Content Tables

### Moments
```sql
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

-- Indexes
CREATE INDEX idx_moments_campus ON moments(campus_id);
CREATE INDEX idx_moments_user ON moments(user_id);
CREATE INDEX idx_moments_squad ON moments(squad_id);
CREATE INDEX idx_moments_event ON moments(athletics_event_id);
CREATE INDEX idx_moments_expires ON moments(expires_at);
CREATE INDEX idx_moments_active ON moments(is_active) WHERE is_active = true;
CREATE INDEX idx_moments_created ON moments(created_at DESC);
```

**Purpose**: User-generated video content (24-hour lifespan)

### Reactions
```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID NOT NULL REFERENCES moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_moment_reaction UNIQUE (moment_id, user_id, reaction_type)
);

-- Indexes
CREATE INDEX idx_reactions_moment ON reactions(moment_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
CREATE INDEX idx_reactions_type ON reactions(reaction_type);
```

**Purpose**: Reactions on moments (awards XP)

### Polls
```sql
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

-- Indexes
CREATE INDEX idx_polls_campus ON polls(campus_id);
CREATE INDEX idx_polls_author ON polls(author_id);
CREATE INDEX idx_polls_closes_at ON polls(closes_at);
CREATE INDEX idx_polls_active ON polls(is_active) WHERE is_active = true;
```

**Purpose**: Time-limited polls with urgency scoring

### Poll Options
```sql
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0 NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);
CREATE INDEX idx_poll_options_position ON poll_options(position);
```

### Poll Votes
```sql
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  points_awarded INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_poll_vote UNIQUE (poll_id, user_id)
);

-- Indexes
CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);
```

### Heists
```sql
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
  CONSTRAINT valid_heist_timeline CHECK (
    submission_opens_at < submission_closes_at 
    AND submission_closes_at < voting_opens_at 
    AND voting_opens_at < voting_closes_at
  )
);

-- Indexes
CREATE INDEX idx_heists_campus ON heists(campus_id);
CREATE INDEX idx_heists_phase ON heists(phase);
CREATE INDEX idx_heists_submission_window ON heists(submission_opens_at, submission_closes_at);
CREATE INDEX idx_heists_voting_window ON heists(voting_opens_at, voting_closes_at);
CREATE INDEX idx_heists_active ON heists(is_active) WHERE is_active = true;
```

**Purpose**: Weekly campus challenges with 5-phase lifecycle

### Heist Submissions
```sql
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_heist_submissions_heist ON heist_submissions(heist_id);
CREATE INDEX idx_heist_submissions_user ON heist_submissions(user_id);
CREATE INDEX idx_heist_submissions_vote_count ON heist_submissions(vote_count DESC);
CREATE INDEX idx_heist_submissions_winner ON heist_submissions(is_winner) WHERE is_winner = true;
```

### Heist Votes
```sql
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

-- Indexes
CREATE INDEX idx_heist_votes_heist ON heist_votes(heist_id);
CREATE INDEX idx_heist_votes_submission ON heist_votes(submission_id);
CREATE INDEX idx_heist_votes_user ON heist_votes(user_id);
```

## Gamification Tables

### Streaks
```sql
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

-- Indexes
CREATE INDEX idx_streaks_user ON streaks(user_id);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_current ON streaks(current_streak DESC);
```

**Purpose**: Track user streaks for different activities

### User XP
```sql
CREATE TABLE user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_xp_user ON user_xp(user_id);
CREATE INDEX idx_user_xp_created ON user_xp(created_at DESC);
CREATE INDEX idx_user_xp_source ON user_xp(source);
```

**Purpose**: Audit trail of XP earnings

### Mystery Boxes
```sql
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

-- Indexes
CREATE INDEX idx_mystery_boxes_user ON mystery_boxes(user_id);
CREATE INDEX idx_mystery_boxes_opened ON mystery_boxes(is_opened) WHERE is_opened = false;
```

### User Rewards
```sql
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_type reward_type NOT NULL,
  reward_value JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_rewards_user ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_active ON user_rewards(is_active) WHERE is_active = true;
CREATE INDEX idx_user_rewards_expires ON user_rewards(expires_at);
```

## Sponsorship Tables

### Sponsors
```sql
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

-- Indexes
CREATE INDEX idx_sponsors_active ON sponsors(is_active) WHERE is_active = true;
```

### Sponsor Offers
```sql
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

-- Indexes
CREATE INDEX idx_sponsor_offers_sponsor ON sponsor_offers(sponsor_id);
CREATE INDEX idx_sponsor_offers_campus ON sponsor_offers(campus_id);
CREATE INDEX idx_sponsor_offers_dates ON sponsor_offers(start_date, end_date);
CREATE INDEX idx_sponsor_offers_active ON sponsor_offers(is_active) WHERE is_active = true;
```

## Analytics Tables

### Campus Weekly Stats
```sql
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

-- Indexes
CREATE INDEX idx_campus_weekly_stats_campus ON campus_weekly_stats(campus_id);
CREATE INDEX idx_campus_weekly_stats_week ON campus_weekly_stats(week_start_date);
```

### Campus Legacy Stats
```sql
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

-- Indexes
CREATE INDEX idx_campus_legacy_stats_campus ON campus_legacy_stats(campus_id);
```

## Moderation Tables

### Moderation Queue
```sql
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('moment', 'heist_submission', 'poll')),
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

-- Indexes
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_campus ON moderation_queue(campus_id);
CREATE INDEX idx_moderation_queue_content ON moderation_queue(content_type, content_id);
CREATE INDEX idx_moderation_queue_pending ON moderation_queue(status) WHERE status = 'pending';
```

## Row Level Security

All tables have RLS enabled with appropriate policies:

### Campus Isolation
```sql
-- Users only see content from their campus
CREATE POLICY "Content is viewable by campus members"
  ON table_name FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = table_name.campus_id
      AND cm.is_active = true
    )
  );
```

### User Ownership
```sql
-- Users can only modify their own content
CREATE POLICY "Users can modify own content"
  ON table_name FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Moderator Access
```sql
-- Moderators can manage content in their campus
CREATE POLICY "Moderators can manage campus content"
  ON table_name FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id = table_name.campus_id
      AND cm.role IN ('moderator', 'admin')
      AND cm.is_active = true
    )
  );
```

## Functions

### XP Management
```sql
-- Add XP to user
CREATE OR REPLACE FUNCTION fn_add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS VOID;
```

### Heist State Machine
```sql
-- Reveal heists (Monday 9am)
CREATE OR REPLACE FUNCTION fn_reveal_heists() RETURNS VOID;

-- Close submissions (Wednesday 11:59pm)
CREATE OR REPLACE FUNCTION fn_close_submissions() RETURNS VOID;

-- Open voting (Thursday 12:00am)
CREATE OR REPLACE FUNCTION fn_open_voting() RETURNS VOID;

-- Close voting and select winner (Sunday 11:59pm)
CREATE OR REPLACE FUNCTION fn_close_voting_and_select_winner() RETURNS VOID;

-- Start execution week
CREATE OR REPLACE FUNCTION fn_start_execution_week() RETURNS VOID;

-- End execution week
CREATE OR REPLACE FUNCTION fn_end_execution_week() RETURNS VOID;
```

### Streak Management
```sql
-- Update Yollr Bell streaks
CREATE OR REPLACE FUNCTION fn_update_streaks_yollr_bell() RETURNS VOID;

-- Update heist participation streaks
CREATE OR REPLACE FUNCTION fn_update_streaks_heist_participation() RETURNS VOID;
```

### Analytics
```sql
-- Rollover weekly stats
CREATE OR REPLACE FUNCTION fn_rollover_weekly_stats() RETURNS VOID;
```

## Triggers

### Automatic Timestamps
```sql
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
```

### XP Awards
```sql
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
```

### Content Moderation
```sql
-- Auto-moderate new moments
CREATE TRIGGER trg_moments_moderation
  AFTER INSERT ON moments
  FOR EACH ROW EXECUTE FUNCTION fn_enqueue_for_moderation();

-- Auto-moderate heist submissions
CREATE TRIGGER trg_heist_submissions_moderation
  AFTER INSERT ON heist_submissions
  FOR EACH ROW EXECUTE FUNCTION fn_enqueue_for_moderation();
```

## Data Flow Patterns

### Moment Creation Flow
1. User creates moment → `moments` table
2. Trigger sets 24-hour expiry
3. Content auto-flagged for moderation
4. Real-time subscription notifies feed
5. XP awarded for reactions

### Heist Lifecycle
1. **Monday 9am**: `fn_reveal_heists()` → phase: 'submitting'
2. **Wednesday 11:59pm**: `fn_close_submissions()` → phase: 'voting'
3. **Sunday 11:59pm**: `fn_close_voting_and_select_winner()` → phase: 'won'
4. Next week: `fn_start_execution_week()` → phase: 'executing'
5. Week end: `fn_end_execution_week()` → phase: 'completed'

### Poll Urgency Scoring
- 40 points for voting when >60% time remains
- 30 points for 30-60% time remaining
- 20 points for 10-30% time remaining
- 10 points for <10% time remaining

## Performance Indexes

### Hot Path Optimization
```sql
-- Feed queries
CREATE INDEX idx_moments_campus_active_created ON moments(campus_id, is_active, created_at DESC) 
  WHERE is_active = true AND expires_at > NOW();

-- Leaderboard queries
CREATE INDEX idx_profiles_campus_xp ON profiles(total_xp DESC) 
  WHERE id IN (SELECT user_id FROM campus_memberships WHERE campus_id = 'specific_campus');

-- Heist participation
CREATE INDEX idx_heist_submissions_heist_created ON heist_submissions(heist_id, created_at DESC);
```

### Partial Indexes
```sql
-- Active content only
CREATE INDEX idx_polls_active_closes ON polls(is_active, closes_at) 
  WHERE is_active = true AND closes_at > NOW();

-- Unopened mystery boxes
CREATE INDEX idx_mystery_boxes_unopened ON mystery_boxes(user_id, is_opened) 
  WHERE is_opened = false;
```

## Storage Buckets

Configure these buckets in Supabase Storage:

1. **moments** - User video moments
2. **heist-submissions** - Heist entry images/videos
3. **profile-avatars** - User profile pictures
4. **campus-assets** - Campus logos and banners
5. **sponsor-assets** - Sponsor logos and offer images

## Backup Strategy

### Automated Backups
- Daily full database backups
- Hourly WAL archiving
- Point-in-time recovery enabled

### Manual Backup
```bash
supabase db dump --db-url $PRODUCTION_URL > backup_$(date +%Y%m%d).sql
```

## Monitoring Queries

### Database Health
```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Performance Monitoring
```sql
-- Slow query analysis
SELECT query, calls, total_time, mean_time, rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Schema Versioning

Current schema version: `1.0.0`

Track schema changes in `supabase/migrations/` directory with timestamp prefixes.