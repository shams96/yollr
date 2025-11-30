-- =============================================
-- YOLLR MVP SEED DATA
-- Run this after RESET_COMPLETE.sql
-- =============================================

-- =============================================
-- 1. INSERT CAMPUSES
-- =============================================
INSERT INTO campuses (name, slug, location, emoji, tier) VALUES
  ('UCLA', 'ucla', 'Los Angeles, CA', '🐻', 'university'),
  ('UC Berkeley', 'berkeley', 'Berkeley, CA', '🐻‍❄️', 'university'),
  ('Stanford University', 'stanford', 'Palo Alto, CA', '🌲', 'university'),
  ('Manhattan High School', 'manhattan-hs', 'New York, NY', '🗽', 'high_school'),
  ('Lincoln Prep', 'lincoln-prep', 'Chicago, IL', '🏫', 'high_school');

-- =============================================
-- 2. INSERT SAMPLE USERS (device-based)
-- =============================================
INSERT INTO users (device_id, campus_id, username, avatar_emoji) VALUES
  ('f1a2b3c4-d5e6-7f8g-9h0i-j1k2l3m4n5o6', (SELECT id FROM campuses WHERE slug = 'ucla'), 'bruins_fan', '😎'),
  ('a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6', (SELECT id FROM campuses WHERE slug = 'berkeley'), 'bear_power', '🐻'),
  ('x1y2z3a4-b5c6-7d8e-9f0g-h1i2j3k4l5m6', (SELECT id FROM campuses WHERE slug = 'stanford'), 'cardinal_pride', '🌲'),
  ('p1q2r3s4-t5u6-7v8w-9x0y-z1a2b3c4d5e6', (SELECT id FROM campuses WHERE slug = 'manhattan-hs'), 'nyc_vibe', '🗽'),
  ('m1n2o3p4-q5r6-7s8t-9u0v-w1x2y3z4a5b6', (SELECT id FROM campuses WHERE slug = 'lincoln-prep'), 'chicago_pride', '🏫');

-- =============================================
-- 3. INSERT SAMPLE POLLS (active, 24 hours)
-- =============================================
INSERT INTO polls (campus_id, creator_user_id, question, options, expires_at) VALUES
  (
    (SELECT id FROM campuses WHERE slug = 'ucla'),
    (SELECT id FROM users WHERE username = 'bruins_fan'),
    'What''s your favorite spot on campus?',
    '["Royce Hall", "The Hill", "Covel Commons", "Bruin Walk"]'::jsonb,
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'berkeley'),
    (SELECT id FROM users WHERE username = 'bear_power'),
    'Best study spot at Berkeley?',
    '["Doe Library", "Bancroft", "Café Strada", "Upper Sproul"]'::jsonb,
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'stanford'),
    (SELECT id FROM users WHERE username = 'cardinal_pride'),
    'Favorite dining option?',
    '["Lag (Lagunita)", "FloMo", "Avery", "The Axe & Palm"]'::jsonb,
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'manhattan-hs'),
    (SELECT id FROM users WHERE username = 'nyc_vibe'),
    'Best after-school hangout?',
    '["Times Square", "Central Park", "Brooklyn Bridge", "Hudson River Park"]'::jsonb,
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'lincoln-prep'),
    (SELECT id FROM users WHERE username = 'chicago_pride'),
    'Most iconic Chicago spot?',
    '["Navy Pier", "Millennium Park", "Wrigley Field", "The Bean"]'::jsonb,
    NOW() + INTERVAL '24 hours'
  );

-- =============================================
-- 4. INSERT SAMPLE POLL VOTES
-- =============================================
-- UCLA poll: 3 users vote
INSERT INTO poll_votes (poll_id, user_id, option_index) VALUES
  (
    (SELECT id FROM polls WHERE question LIKE 'What%s your favorite spot%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'bruins_fan'),
    0
  ),
  (
    (SELECT id FROM polls WHERE question LIKE 'What%s your favorite spot%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'bear_power'),
    1
  ),
  (
    (SELECT id FROM polls WHERE question LIKE 'What%s your favorite spot%' LIMIT 1),
    (SELECT id FROM users WHERE username = 'cardinal_pride'),
    2
  );

-- =============================================
-- 5. INSERT SAMPLE MOMENTS (24-hour expiry)
-- =============================================
INSERT INTO moments (campus_id, creator_user_id, video_url, caption, expires_at) VALUES
  (
    (SELECT id FROM campuses WHERE slug = 'ucla'),
    (SELECT id FROM users WHERE username = 'bruins_fan'),
    'moments/ucla/bruins_fan/sample_1.mp4',
    '🐻 Go Bruins! Game day energy! 🏈',
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'berkeley'),
    (SELECT id FROM users WHERE username = 'bear_power'),
    'moments/berkeley/bear_power/sample_1.mp4',
    'Golden hour on the campus ✨',
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'stanford'),
    (SELECT id FROM users WHERE username = 'cardinal_pride'),
    'moments/stanford/cardinal_pride/sample_1.mp4',
    'Sunday sunrise at Stanford ☀️',
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'manhattan-hs'),
    (SELECT id FROM users WHERE username = 'nyc_vibe'),
    'moments/manhattan-hs/nyc_vibe/sample_1.mp4',
    'NYC Lights 🗽💡',
    NOW() + INTERVAL '24 hours'
  ),
  (
    (SELECT id FROM campuses WHERE slug = 'lincoln-prep'),
    (SELECT id FROM users WHERE username = 'chicago_pride'),
    'moments/lincoln-prep/chicago_pride/sample_1.mp4',
    'Windy City vibes 🌬️',
    NOW() + INTERVAL '24 hours'
  );

-- =============================================
-- 6. INSERT SAMPLE DROP (weekly challenge)
-- =============================================
INSERT INTO drops (
  campus_id,
  title,
  guardrails,
  submission_phase_start,
  submission_phase_end,
  voting_phase_start,
  voting_phase_end,
  status,
  week_of
) VALUES
  (
    (SELECT id FROM campuses WHERE slug = 'ucla'),
    '🎬 Best Campus Moment This Week',
    '["Be respectful to others", "Keep it school-appropriate", "No harmful content", "Original content only", "Tag your location"]'::jsonb,
    (NOW() - INTERVAL '2 days')::DATE,
    (NOW() + INTERVAL '1 day')::DATE,
    (NOW() + INTERVAL '2 days')::DATE,
    (NOW() + INTERVAL '6 days')::DATE,
    'submission',
    (NOW() - INTERVAL '2 days')::DATE
  );

-- =============================================
-- 7. INSERT SAMPLE POINTS (gamification)
-- =============================================
INSERT INTO points (user_id, campus_id, action, points_earned, week_of) VALUES
  -- bruins_fan: voted on poll
  (
    (SELECT id FROM users WHERE username = 'bruins_fan'),
    (SELECT id FROM campuses WHERE slug = 'ucla'),
    'poll_vote',
    5,
    (NOW() - INTERVAL '2 days')::DATE
  ),
  -- bruins_fan: posted a moment
  (
    (SELECT id FROM users WHERE username = 'bruins_fan'),
    (SELECT id FROM campuses WHERE slug = 'ucla'),
    'moment_post',
    10,
    (NOW() - INTERVAL '1 day')::DATE
  ),
  -- bear_power: voted on poll
  (
    (SELECT id FROM users WHERE username = 'bear_power'),
    (SELECT id FROM campuses WHERE slug = 'berkeley'),
    'poll_vote',
    5,
    (NOW() - INTERVAL '2 days')::DATE
  ),
  -- cardinal_pride: voted on poll
  (
    (SELECT id FROM users WHERE username = 'cardinal_pride'),
    (SELECT id FROM campuses WHERE slug = 'stanford'),
    'poll_vote',
    5,
    (NOW() - INTERVAL '2 days')::DATE
  );

-- =============================================
-- VERIFY SEED DATA
-- =============================================

SELECT '=== YOLLR MVP DATABASE SEEDED ===' as status;
SELECT 'Campuses' as table_name, COUNT(*) as count FROM campuses
UNION ALL SELECT 'Users', COUNT(*) FROM users
UNION ALL SELECT 'Polls', COUNT(*) FROM polls
UNION ALL SELECT 'Poll Votes', COUNT(*) FROM poll_votes
UNION ALL SELECT 'Moments', COUNT(*) FROM moments
UNION ALL SELECT 'Drops', COUNT(*) FROM drops
UNION ALL SELECT 'Points', COUNT(*) FROM points;

-- Show sample data
SELECT '=== TOP 3 POLLS ===' as section;
SELECT id, question, (options->0) as first_option FROM polls LIMIT 3;

SELECT '=== TOP 3 MOMENTS ===' as section;
SELECT id, caption, creator_user_id FROM moments LIMIT 3;

SELECT '=== USER POINTS ===' as section;
SELECT u.username, SUM(p.points_earned) as total_points
FROM users u
LEFT JOIN points p ON u.id = p.user_id
GROUP BY u.id, u.username
ORDER BY total_points DESC;
