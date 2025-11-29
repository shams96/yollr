'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';

const MIGRATION_SQL = `-- ============================================
-- YOLLR FRIEND INVITE SYSTEM MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Step 1: Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_sports TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_team TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_invite_code ON profiles(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by) WHERE referred_by IS NOT NULL;

-- Step 3: Create friendships table
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

-- Step 4: Enable RLS on friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS policies for friendships
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (user_id = auth.uid() OR friend_id = auth.uid());

DROP POLICY IF EXISTS "Users can create friendships" ON friendships;
CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;
CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (user_id = auth.uid());

-- Step 6: Function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN := TRUE;
BEGIN
  WHILE exists LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    SELECT COUNT(*) > 0 INTO exists FROM profiles WHERE invite_code = code;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Function to create friendship on referral
CREATE OR REPLACE FUNCTION fn_create_friendship_on_referral()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by) THEN
    INSERT INTO friendships (user_id, friend_id)
    VALUES (NEW.id, NEW.referred_by), (NEW.referred_by, NEW.id)
    ON CONFLICT DO NOTHING;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_add_user_xp') THEN
      PERFORM fn_add_user_xp(NEW.id, 50, 'friend_invite_used', NEW.referred_by);
      PERFORM fn_add_user_xp(NEW.referred_by, 50, 'friend_invite_referral', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for friendship creation
DROP TRIGGER IF EXISTS trg_create_friendship_on_referral ON profiles;
CREATE TRIGGER trg_create_friendship_on_referral
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by))
  EXECUTE FUNCTION fn_create_friendship_on_referral();

-- Step 9: Generate invite codes for existing profiles
UPDATE profiles SET invite_code = generate_invite_code() WHERE invite_code IS NULL;`;

const PROJECT_REF = 'dklpoxigmpcjjynmbtga';

export default function MigratePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MIGRATION_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenSupabase = () => {
    window.open(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2E] to-[#0A0F1C] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-[#FF2D95] to-[#FF6B35] bg-clip-text text-transparent">
            Database Migration
          </h1>
          <p className="text-white/70">Friend Invite System Setup</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF2D95] to-[#FF6B35] rounded-full flex items-center justify-center font-black">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Copy SQL Migration</h3>
              <p className="text-sm text-white/70 mb-3">
                Click the button below to copy the migration SQL to your clipboard
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#00FFC6]" />
                    <span className="text-[#00FFC6] font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="font-bold">Copy SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF2D95] to-[#FF6B35] rounded-full flex items-center justify-center font-black">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Open Supabase SQL Editor</h3>
              <p className="text-sm text-white/70 mb-3">
                Click to open the SQL Editor in a new tab
              </p>
              <button
                onClick={handleOpenSupabase}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF2D95] to-[#FF6B35] hover:opacity-90 rounded-xl transition-all font-bold"
              >
                <ExternalLink className="h-4 w-4" />
                Open SQL Editor
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#FF2D95] to-[#FF6B35] rounded-full flex items-center justify-center font-black">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Paste and Run</h3>
              <p className="text-sm text-white/70">
                Paste the SQL (Ctrl+V) and click the green "Run" button. Takes ~5 seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-3">What This Migration Does</h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-[#00FFC6]">✓</span>
              <span>Adds invite_code column to profiles (unique 6-char codes)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00FFC6]">✓</span>
              <span>Adds referred_by column to track who invited whom</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00FFC6]">✓</span>
              <span>Creates friendships table for bidirectional connections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00FFC6]">✓</span>
              <span>Auto-creates friendships when invite codes are used</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00FFC6]">✓</span>
              <span>Awards 50 XP to both users when friendship created</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00FFC6]">✓</span>
              <span>Adds progressive profiling fields (sports, interests, team)</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-2xl p-4">
          <p className="text-sm">
            <strong className="text-[#FF6B35]">Note:</strong> This migration is safe to run on a brand new database.
            All operations use "IF NOT EXISTS" to prevent errors if run multiple times.
          </p>
        </div>

        <div className="bg-black/30 rounded-2xl p-4 overflow-x-auto">
          <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono">
            {MIGRATION_SQL}
          </pre>
        </div>
      </div>
    </div>
  );
}
