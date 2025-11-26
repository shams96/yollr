-- =============================================
-- PERFORMANCE OPTIMIZATION INDEXES FOR YOLLR
-- =============================================

-- These indexes are designed to optimize the most common query patterns
-- identified in the Yollr campus engagement platform

-- =============================================
-- FEED RANKING PERFORMANCE INDEXES
-- =============================================

-- Composite indexes for feed ranking queries
-- These optimize the rank-feed-page edge function queries

-- Heists feed queries (by campus_id, phase, and date windows)
DROP INDEX IF EXISTS idx_heists_feed_ranking;
CREATE INDEX idx_heists_feed_ranking ON heists 
USING btree (campus_id, phase, submission_opens_at DESC, voting_closes_at DESC) 
WHERE is_active = true;

-- Polls feed queries (by campus_id, active status, and closing time)
DROP INDEX IF EXISTS idx_polls_feed_ranking;
CREATE INDEX idx_polls_feed_ranking ON polls 
USING btree (campus_id, is_active, closes_at DESC, created_at DESC);

-- Moments feed queries (by campus_id, active status, and recency)
DROP INDEX IF EXISTS idx_moments_feed_ranking;
CREATE INDEX idx_moments_feed_ranking ON moments 
USING btree (campus_id, is_active, created_at DESC, expires_at DESC) 
WHERE is_active = true AND expires_at > NOW();

-- Composite index for heist submissions with vote counts
DROP INDEX IF EXISTS idx_heist_submissions_ranking;
CREATE INDEX idx_heist_submissions_ranking ON heist_submissions 
USING btree (heist_id, vote_count DESC, created_at DESC) 
WHERE is_active = true;

-- =============================================
-- REAL-TIME SUBSCRIPTIONS INDEXES
-- =============================================

-- Optimize Supabase real-time subscriptions for feed updates

-- Moments real-time queries (campus-specific)
DROP INDEX IF EXISTS idx_moments_campus_realtime;
CREATE INDEX idx_moments_campus_realtime ON moments 
USING btree (campus_id, created_at DESC) 
WHERE is_active = true;

-- Polls real-time queries (campus-specific)
DROP INDEX IF EXISTS idx_polls_campus_realtime;
CREATE INDEX idx_polls_campus_realtime ON polls 
USING btree (campus_id, created_at DESC) 
WHERE is_active = true;

-- Heists real-time queries (campus-specific)
DROP INDEX IF EXISTS idx_heists_campus_realtime;
CREATE INDEX idx_heists_campus_realtime ON heists 
USING btree (campus_id, created_at DESC) 
WHERE is_active = true;

-- Reactions real-time queries (moment-specific)
DROP INDEX IF EXISTS idx_reactions_moment_realtime;
CREATE INDEX idx_reactions_moment_realtime ON reactions 
USING btree (moment_id, created_at DESC);

-- =============================================
-- USER-SPECIFIC QUERY INDEXES
-- =============================================

-- User profile and membership queries
DROP INDEX IF EXISTS idx_profiles_username_trgm;
CREATE INDEX idx_profiles_username_trgm ON profiles 
USING gin (username gin_trgm_ops);

-- Campus membership queries (active memberships by user)
DROP INDEX IF EXISTS idx_campus_memberships_user_active;
CREATE INDEX idx_campus_memberships_user_active ON campus_memberships 
USING btree (user_id, campus_id) 
WHERE is_active = true;

-- Squad membership queries (active memberships by user)
DROP INDEX IF EXISTS idx_squad_members_user_active;
CREATE INDEX idx_squad_members_user_active ON squad_members 
USING btree (user_id, squad_id) 
WHERE is_active = true;

-- User XP history queries
DROP INDEX IF EXISTS idx_user_xp_user_source;
CREATE INDEX idx_user_xp_user_source ON user_xp 
USING btree (user_id, source, created_at DESC);

-- User streak queries
DROP INDEX IF EXISTS idx_streaks_user_type;
CREATE INDEX idx_streaks_user_type ON streaks 
USING btree (user_id, streak_type, current_streak DESC);

-- Mystery boxes queries (unopened boxes)
DROP INDEX IF EXISTS idx_mystery_boxes_user_unopened;
CREATE INDEX idx_mystery_boxes_user_unopened ON mystery_boxes 
USING btree (user_id, created_at DESC) 
WHERE is_opened = false;

-- =============================================
-- GEOGRAPHIC QUERY INDEXES
-- =============================================

-- Spatial index for campus location queries (already exists but optimized)
DROP INDEX IF EXISTS idx_campuses_location_optimized;
CREATE INDEX idx_campuses_location_optimized ON campuses 
USING gist (location) 
WHERE is_active = true;

-- Campus lookup by domain (for email verification)
DROP INDEX IF EXISTS idx_campuses_domain_active;
CREATE INDEX idx_campuses_domain_active ON campuses 
USING btree (domain) 
WHERE is_active = true AND domain IS NOT NULL;

-- Campus search by name (trigram for fuzzy search)
DROP INDEX IF EXISTS idx_campuses_name_trgm;
CREATE INDEX idx_campuses_name_trgm ON campuses 
USING gin (name gin_trgm_ops) 
WHERE is_active = true;

-- =============================================
-- TIME-BASED QUERY INDEXES
-- =============================================

-- Active content time window queries
DROP INDEX IF EXISTS idx_heists_active_timeline;
CREATE INDEX idx_heists_active_timeline ON heists 
USING btree (campus_id, phase, submission_opens_at, voting_closes_at) 
WHERE is_active = true;

-- Polls closing soon queries
DROP INDEX IF EXISTS idx_polls_closing_soon;
CREATE INDEX idx_polls_closing_soon ON polls 
USING btree (campus_id, closes_at) 
WHERE is_active = true AND closes_at > NOW();

-- Recent moments queries
DROP INDEX IF EXISTS idx_moments_recent;
CREATE INDEX idx_moments_recent ON moments 
USING btree (campus_id, created_at DESC) 
WHERE is_active = true AND expires_at > NOW();

-- Sponsor offers active date range queries
DROP INDEX IF EXISTS idx_sponsor_offers_active_range;
CREATE INDEX idx_sponsor_offers_active_range ON sponsor_offers 
USING btree (campus_id, start_date, end_date) 
WHERE is_active = true AND start_date <= NOW() AND end_date > NOW();

-- =============================================
-- AGGREGATION AND ANALYTICS INDEXES
-- =============================================

-- Campus weekly stats queries
DROP INDEX IF EXISTS idx_campus_weekly_stats_composite;
CREATE INDEX idx_campus_weekly_stats_composite ON campus_weekly_stats 
USING btree (campus_id, week_start_date DESC);

-- Campus legacy stats queries
DROP INDEX IF EXISTS idx_campus_legacy_stats_campus;
CREATE INDEX idx_campus_legacy_stats_campus ON campus_legacy_stats 
USING btree (campus_id);

-- Moderation queue queries (pending items)
DROP INDEX IF EXISTS idx_moderation_queue_pending_campus;
CREATE INDEX idx_moderation_queue_pending_campus ON moderation_queue 
USING btree (campus_id, created_at DESC) 
WHERE status = 'pending';

-- =============================================
-- COMPOSITE INDEXES FOR COMMON JOINS
-- =============================================

-- Heist submissions with user data (for leaderboard queries)
DROP INDEX IF EXISTS idx_heist_submissions_user_heist;
CREATE INDEX idx_heist_submissions_user_heist ON heist_submissions 
USING btree (user_id, heist_id, vote_count DESC);

-- Poll votes with user and poll data
DROP INDEX IF EXISTS idx_poll_votes_user_poll;
CREATE INDEX idx_poll_votes_user_poll ON poll_votes 
USING btree (user_id, poll_id, created_at DESC);

-- Reactions with user and moment data
DROP INDEX IF EXISTS idx_reactions_user_moment;
CREATE INDEX idx_reactions_user_moment ON reactions 
USING btree (user_id, moment_id, created_at DESC);

-- Athletics events by campus and date
DROP INDEX IF EXISTS idx_athletics_events_campus_date;
CREATE INDEX idx_athletics_events_campus_date ON athletics_events 
USING btree (campus_id, event_date, sport_type);

-- =============================================
-- PARTIAL INDEXES FOR PERFORMANCE
-- =============================================

-- Active campus memberships (most common query)
DROP INDEX IF EXISTS idx_campus_memberships_active_only;
CREATE INDEX idx_campus_memberships_active_only ON campus_memberships 
USING btree (campus_id, user_id) 
WHERE is_active = true;

-- Active squad memberships
DROP INDEX IF EXISTS idx_squad_members_active_only;
CREATE INDEX idx_squad_members_active_only ON squad_members 
USING btree (squad_id, user_id) 
WHERE is_active = true;

-- Active squads only
DROP INDEX IF EXISTS idx_squads_active_only;
CREATE INDEX idx_squads_active_only ON squads 
USING btree (campus_id, squad_type, member_count DESC) 
WHERE is_active = true;

-- Active sponsors only
DROP INDEX IF EXISTS idx_sponsors_active_only;
CREATE INDEX idx_sponsors_active_only ON sponsors 
USING btree (name) 
WHERE is_active = true;

-- =============================================
-- INDEXES FOR SORTING AND LEADERBOARDS
-- =============================================

-- Profiles sorted by XP (leaderboard)
DROP INDEX IF EXISTS idx_profiles_xp_leaderboard;
CREATE INDEX idx_profiles_xp_leaderboard ON profiles 
USING btree (total_xp DESC) 
WHERE total_xp > 0;

-- Profiles sorted by streak (leaderboard)
DROP INDEX IF EXISTS idx_profiles_streak_leaderboard;
CREATE INDEX idx_profiles_streak_leaderboard ON profiles 
USING btree (current_streak DESC) 
WHERE current_streak > 0;

-- Heist submissions sorted by votes (leaderboard)
DROP INDEX IF EXISTS idx_heist_submissions_vote_leaderboard;
CREATE INDEX idx_heist_submissions_vote_leaderboard ON heist_submissions 
USING btree (heist_id, vote_count DESC, created_at DESC);

-- =============================================
-- INDEX MAINTENANCE AND MONITORING
-- =============================================

-- Function to analyze index usage
CREATE OR REPLACE FUNCTION fn_analyze_index_usage()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to find unused indexes
CREATE OR REPLACE FUNCTION fn_find_unused_indexes()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    ORDER BY tablename, indexname;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PERFORMANCE INDEXES CREATION COMPLETE
-- =============================================
-- Run this file using: psql -d your_database -f performance_indexes.sql
-- Or apply through Supabase SQL editor