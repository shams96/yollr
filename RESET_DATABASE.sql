-- =============================================
-- RESET DATABASE - Drop all existing objects
-- Run this FIRST before running the main schema
-- =============================================

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS user_rewards CASCADE;
DROP TABLE IF EXISTS mystery_boxes CASCADE;
DROP TABLE IF EXISTS user_xp CASCADE;
DROP TABLE IF EXISTS streaks CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS bell_events CASCADE;
DROP TABLE IF EXISTS moments CASCADE;
DROP TABLE IF EXISTS heist_votes CASCADE;
DROP TABLE IF EXISTS heist_submissions CASCADE;
DROP TABLE IF EXISTS heists CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS athletics_events CASCADE;
DROP TABLE IF EXISTS squad_members CASCADE;
DROP TABLE IF EXISTS squads CASCADE;
DROP TABLE IF EXISTS campus_memberships CASCADE;
DROP TABLE IF EXISTS campuses CASCADE;
DROP TABLE IF EXISTS sponsor_offers CASCADE;
DROP TABLE IF EXISTS sponsors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS reward_type CASCADE;
DROP TYPE IF EXISTS moment_source CASCADE;
DROP TYPE IF EXISTS reaction_type CASCADE;
DROP TYPE IF EXISTS poll_type CASCADE;
DROP TYPE IF EXISTS heist_phase CASCADE;
DROP TYPE IF EXISTS squad_role CASCADE;
DROP TYPE IF EXISTS campus_role CASCADE;
DROP TYPE IF EXISTS squad_type CASCADE;
DROP TYPE IF EXISTS campus_type CASCADE;
DROP TYPE IF EXISTS profile_sport_type CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS fn_update_session_end CASCADE;
DROP FUNCTION IF EXISTS fn_open_mystery_box CASCADE;
DROP FUNCTION IF EXISTS fn_award_mystery_box CASCADE;
DROP FUNCTION IF EXISTS fn_apply_moderation_decision CASCADE;
DROP FUNCTION IF EXISTS fn_enqueue_for_moderation CASCADE;
DROP FUNCTION IF EXISTS fn_rollover_weekly_stats CASCADE;
DROP FUNCTION IF EXISTS fn_end_execution_week CASCADE;
DROP FUNCTION IF EXISTS fn_start_execution_week CASCADE;
DROP FUNCTION IF EXISTS fn_close_voting_and_select_winner CASCADE;
DROP FUNCTION IF EXISTS fn_open_voting CASCADE;
DROP FUNCTION IF EXISTS fn_close_submissions CASCADE;
DROP FUNCTION IF EXISTS fn_reveal_heists CASCADE;
DROP FUNCTION IF EXISTS fn_update_streaks_heist_participation CASCADE;
DROP FUNCTION IF EXISTS fn_update_streaks_yollr_bell CASCADE;
DROP FUNCTION IF EXISTS fn_add_xp_on_poll_vote CASCADE;
DROP FUNCTION IF EXISTS fn_add_xp_on_heist_vote CASCADE;
DROP FUNCTION IF EXISTS fn_add_xp_on_reaction CASCADE;
DROP FUNCTION IF EXISTS fn_add_user_xp CASCADE;
DROP FUNCTION IF EXISTS fn_set_moment_expiry CASCADE;
DROP FUNCTION IF EXISTS fn_update_updated_at CASCADE;

-- Success message
SELECT 'Database reset complete! Now run the main schema.sql file.' as message;
