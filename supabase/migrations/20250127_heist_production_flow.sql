-- =============================================
-- HEIST SYSTEM PRODUCTION FLOW MIGRATION
-- =============================================
-- This migration upgrades the Heist system for production with:
-- 1. Automated weekly cycle tracking
-- 2. Vote momentum scoring
-- 3. Moments integration during execution week
-- 4. Enhanced submission constraints

-- Add heist_id to moments table for execution week tagging
ALTER TABLE moments
ADD COLUMN heist_id UUID REFERENCES heists(id) ON DELETE SET NULL;

CREATE INDEX idx_moments_heist ON moments(heist_id) WHERE heist_id IS NOT NULL;

-- Add momentum tracking to heist_votes
ALTER TABLE heist_votes
ADD COLUMN momentum_score DECIMAL(5,2) DEFAULT 1.0 NOT NULL;

-- Add ranking score to heist_submissions (votes + momentum)
ALTER TABLE heist_submissions
ADD COLUMN ranking_score DECIMAL(10,2) DEFAULT 0 NOT NULL,
ADD COLUMN momentum_factor DECIMAL(5,2) DEFAULT 0 NOT NULL;

CREATE INDEX idx_heist_submissions_ranking ON heist_submissions(ranking_score DESC);

-- Add one submission per user constraint
ALTER TABLE heist_submissions
ADD CONSTRAINT unique_user_heist_submission UNIQUE (heist_id, user_id);

-- Add week_number for tracking weekly cycles
ALTER TABLE heists
ADD COLUMN week_number INTEGER NOT NULL DEFAULT 1,
ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW());

CREATE INDEX idx_heists_week ON heists(campus_id, year, week_number);

-- Add prize information to heists
ALTER TABLE heists
ADD COLUMN prize_amount DECIMAL(10,2),
ADD COLUMN prize_description TEXT;

-- =============================================
-- RLS POLICIES FOR HEIST SYSTEM
-- =============================================

-- Enable RLS on all heist tables
ALTER TABLE heists ENABLE ROW LEVEL SECURITY;
ALTER TABLE heist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE heist_votes ENABLE ROW LEVEL SECURITY;

-- Heists: Everyone can view active heists
DROP POLICY IF EXISTS "heists_select_policy" ON heists;
CREATE POLICY "heists_select_policy" ON heists
  FOR SELECT
  USING (is_active = true);

-- Heist Submissions: Users can view all submissions, create their own
DROP POLICY IF EXISTS "heist_submissions_select_policy" ON heist_submissions;
CREATE POLICY "heist_submissions_select_policy" ON heist_submissions
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "heist_submissions_insert_policy" ON heist_submissions;
CREATE POLICY "heist_submissions_insert_policy" ON heist_submissions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM heists h
      WHERE h.id = heist_id
      AND h.phase = 'submitting'
      AND NOW() BETWEEN h.submission_opens_at AND h.submission_closes_at
    )
  );

DROP POLICY IF EXISTS "heist_submissions_update_policy" ON heist_submissions;
CREATE POLICY "heist_submissions_update_policy" ON heist_submissions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Heist Votes: Users can view all votes, create one vote per heist
DROP POLICY IF EXISTS "heist_votes_select_policy" ON heist_votes;
CREATE POLICY "heist_votes_select_policy" ON heist_votes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "heist_votes_insert_policy" ON heist_votes;
CREATE POLICY "heist_votes_insert_policy" ON heist_votes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM heists h
      WHERE h.id = heist_id
      AND h.phase = 'voting'
      AND NOW() BETWEEN h.voting_opens_at AND h.voting_closes_at
    )
  );

-- =============================================
-- FUNCTIONS FOR HEIST RANKING
-- =============================================

-- Function to calculate momentum based on vote recency
CREATE OR REPLACE FUNCTION calculate_vote_momentum(vote_created_at TIMESTAMPTZ)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  hours_since_vote DECIMAL;
  momentum DECIMAL(5,2);
BEGIN
  hours_since_vote := EXTRACT(EPOCH FROM (NOW() - vote_created_at)) / 3600;

  -- Momentum decays over 72 hours (3 days)
  -- Recent votes (0-24h): 1.0x multiplier
  -- 24-48h: 0.75x multiplier
  -- 48-72h: 0.5x multiplier
  -- 72h+: 0.25x multiplier
  IF hours_since_vote < 24 THEN
    momentum := 1.0;
  ELSIF hours_since_vote < 48 THEN
    momentum := 0.75;
  ELSIF hours_since_vote < 72 THEN
    momentum := 0.5;
  ELSE
    momentum := 0.25;
  END IF;

  RETURN momentum;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update submission rankings
CREATE OR REPLACE FUNCTION update_heist_submission_rankings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the submission's ranking score
  UPDATE heist_submissions
  SET
    ranking_score = (
      SELECT COALESCE(SUM(
        CASE
          WHEN v.reaction_type = 'fire' THEN 2.0 * calculate_vote_momentum(v.created_at)
          WHEN v.reaction_type = 'heart' THEN 1.5 * calculate_vote_momentum(v.created_at)
          ELSE 1.0 * calculate_vote_momentum(v.created_at)
        END
      ), 0)
      FROM heist_votes v
      WHERE v.submission_id = NEW.submission_id
    ),
    vote_count = (
      SELECT COUNT(*)
      FROM heist_votes v
      WHERE v.submission_id = NEW.submission_id
    ),
    updated_at = NOW()
  WHERE id = NEW.submission_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rankings when votes change
DROP TRIGGER IF EXISTS trigger_update_heist_rankings ON heist_votes;
CREATE TRIGGER trigger_update_heist_rankings
  AFTER INSERT OR UPDATE OR DELETE ON heist_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_heist_submission_rankings();

-- =============================================
-- FUNCTION FOR WEEKLY HEIST CREATION
-- =============================================

CREATE OR REPLACE FUNCTION create_weekly_heist(
  p_campus_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_prize_amount DECIMAL DEFAULT NULL,
  p_prize_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_heist_id UUID;
  v_week_number INTEGER;
  v_year INTEGER;
  v_monday TIMESTAMPTZ;
BEGIN
  -- Get current week number and year
  v_week_number := EXTRACT(WEEK FROM NOW());
  v_year := EXTRACT(YEAR FROM NOW());

  -- Calculate next Monday 9 AM
  v_monday := date_trunc('week', NOW() + INTERVAL '1 week') + INTERVAL '9 hours';

  -- Create heist with weekly cycle
  INSERT INTO heists (
    campus_id,
    title,
    description,
    phase,
    week_number,
    year,
    prize_amount,
    prize_description,
    submission_opens_at,
    submission_closes_at,
    voting_opens_at,
    voting_closes_at,
    execution_week_start,
    execution_week_end
  ) VALUES (
    p_campus_id,
    p_title,
    p_description,
    'submitting',
    v_week_number,
    v_year,
    p_prize_amount,
    p_prize_description,
    v_monday, -- Monday 9 AM
    v_monday + INTERVAL '2 days 14 hours 59 minutes', -- Wednesday 11:59 PM
    v_monday + INTERVAL '3 days', -- Thursday 12 AM
    v_monday + INTERVAL '6 days 23 hours 59 minutes', -- Sunday 11:59 PM
    v_monday + INTERVAL '7 days', -- Next Monday
    v_monday + INTERVAL '11 days 23 hours 59 minutes' -- Next Friday 11:59 PM
  )
  RETURNING id INTO v_heist_id;

  RETURN v_heist_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION FOR PHASE TRANSITIONS
-- =============================================

CREATE OR REPLACE FUNCTION transition_heist_phases()
RETURNS void AS $$
DECLARE
  v_heist RECORD;
  v_winner_id UUID;
BEGIN
  -- Loop through active heists and transition phases
  FOR v_heist IN
    SELECT * FROM heists
    WHERE is_active = true
  LOOP
    -- Transition from submitting to voting
    IF v_heist.phase = 'submitting'
       AND NOW() >= v_heist.voting_opens_at THEN
      UPDATE heists
      SET phase = 'voting', updated_at = NOW()
      WHERE id = v_heist.id;

    -- Transition from voting to won (determine winner)
    ELSIF v_heist.phase = 'voting'
          AND NOW() >= v_heist.voting_closes_at THEN

      -- Find winner (highest ranking_score)
      SELECT id INTO v_winner_id
      FROM heist_submissions
      WHERE heist_id = v_heist.id
      ORDER BY ranking_score DESC, vote_count DESC
      LIMIT 1;

      -- Update heist with winner
      UPDATE heists
      SET
        phase = 'won',
        winner_submission_id = v_winner_id,
        updated_at = NOW()
      WHERE id = v_heist.id;

      -- Mark winning submission
      UPDATE heist_submissions
      SET is_winner = true, updated_at = NOW()
      WHERE id = v_winner_id;

    -- Transition from won to executing
    ELSIF v_heist.phase = 'won'
          AND NOW() >= v_heist.execution_week_start THEN
      UPDATE heists
      SET phase = 'executing', updated_at = NOW()
      WHERE id = v_heist.id;

    -- Transition from executing to completed
    ELSIF v_heist.phase = 'executing'
          AND NOW() >= v_heist.execution_week_end THEN
      UPDATE heists
      SET
        phase = 'completed',
        is_active = false,
        updated_at = NOW()
      WHERE id = v_heist.id;

    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION create_weekly_heist IS 'Creates a new weekly heist with automated phase scheduling';
COMMENT ON FUNCTION transition_heist_phases IS 'Automatically transitions heist phases based on timestamps (run via cron)';
COMMENT ON FUNCTION calculate_vote_momentum IS 'Calculates vote momentum multiplier based on recency (decays over 72 hours)';
COMMENT ON COLUMN moments.heist_id IS 'Links moment to heist during execution week (#ThisWeeksHeist tag)';
COMMENT ON COLUMN heist_submissions.ranking_score IS 'Calculated score: vote_count + momentum_factor';
COMMENT ON COLUMN heist_votes.momentum_score IS 'Time-based multiplier for vote weight';
