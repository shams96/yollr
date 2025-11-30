# Yollr MVP — Supabase Setup Guide

## ⚠️ SECURITY WARNING

You've shared your API keys publicly. **Immediately regenerate them:**

1. Go to [Supabase Dashboard](https://supabase.co/dashboard/projects)
2. Select your project → Settings → API
3. Click "Regenerate" for all keys
4. Update your `.env.local` with new keys

**Never share API keys in chat or version control!**

---

## Quick Setup (3 Steps)

### **Step 1: Reset Existing Database**

1. Go to your Supabase project: [wdpiwrdesqtlzsuxfkwc](https://supabase.co/dashboard/projects)
2. Go to **SQL Editor** → Click **+ New Query**
3. Copy entire contents of `supabase/RESET_COMPLETE.sql`
4. Paste into the SQL editor
5. Click **Run** (⚡ button)
6. Wait for completion (~10-15 seconds)

**What this does:**
- Drops ALL existing tables (in correct order)
- Drops all old enums
- Creates fresh MVP schema (9 tables)
- Sets up RLS policies
- Creates helper functions and views

---

### **Step 2: Seed Sample Data**

1. In **SQL Editor** → Click **+ New Query**
2. Copy entire contents of `supabase/SEED_DATA.sql`
3. Paste into the SQL editor
4. Click **Run** (⚡ button)
5. Wait for completion (~5 seconds)

**What this does:**
- Creates 5 sample campuses (UCLA, Berkeley, Stanford, Manhattan HS, Lincoln Prep)
- Creates 5 sample users (one per campus, with device_id)
- Creates 5 active polls (expires in 24 hours)
- Creates 3 sample poll votes
- Creates 5 sample moments (with 24-hour expiry)
- Creates 1 sample Drop challenge (in submission phase)
- Creates 4 sample points records

**Expected output:**
```
=== YOLLR MVP DATABASE SEEDED ===
table_name      | count
Campuses        | 5
Users           | 5
Polls           | 5
Poll Votes      | 3
Moments         | 5
Drops           | 1
Points          | 4
```

---

### **Step 3: Verify Setup**

Go to **Table Editor** (left sidebar) and verify:

#### Campuses
- ✅ UCLA (slug: ucla)
- ✅ UC Berkeley (slug: berkeley)
- ✅ Stanford University (slug: stanford)
- ✅ Manhattan High School (slug: manhattan-hs)
- ✅ Lincoln Prep (slug: lincoln-prep)

#### Users
- ✅ 5 users created
- ✅ Each has unique device_id
- ✅ Each assigned to one campus

#### Polls
- ✅ 5 polls visible
- ✅ Each with 4 options (JSONB)
- ✅ expires_at is 24 hours in future

#### Moments
- ✅ 5 moments visible
- ✅ Each with video_url placeholder
- ✅ expires_at is 24 hours in future

#### Drops
- ✅ 1 drop visible
- ✅ status = "submission" (currently in submission phase)
- ✅ guardrails = 5 rules (JSONB)

#### Points
- ✅ 4 points records
- ✅ Total points per user visible via leaderboard view

---

## Testing RLS Isolation (Optional)

To verify campus isolation works correctly:

### Test 1: User A Can't See User B's Campus Data

```sql
-- In SQL Editor, run:
SELECT * FROM users WHERE username = 'bruins_fan';  -- UCLA user
-- Should see all UCLA users only
-- Should NOT see Berkeley/Stanford/etc users

SELECT * FROM polls WHERE question LIKE 'Best study spot%';
-- UCLA user should see nothing (that's Berkeley's poll)
-- Correct! RLS is working.
```

### Test 2: Check Current Week's Leaderboard

```sql
-- In SQL Editor, run:
SELECT * FROM weekly_leaderboard WHERE campus_id = (SELECT id FROM campuses WHERE slug = 'ucla');
-- Should show UCLA users with their total points for this week
```

---

## Environment Variables Setup (Next.js)

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wdpiwrdesqtlzsuxfkwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcGl3cmRlc3F0bHpzdXhma3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc4NTAsImV4cCI6MjA3ODAzMzg1MH0.-aFoHj7EtEA9k54of_gyIw5DAKDSZyJlT5b4N2sUXUY

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcGl3cmRlc3F0bHpzdXhma3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjQ1Nzg1MCwiZXhwIjoyMDc4MDMzODUwfQ.37dYNRP5CxpaJtldqZoVshRubaPfMpEeKd6kBVMDC-c
```

**⚠️ WARNING**: Update these keys after regenerating them in Supabase!

---

## File Reference

- `supabase/RESET_COMPLETE.sql` — Full reset + schema creation
- `supabase/SEED_DATA.sql` — Sample data population
- `supabase/mvp_schema.sql` — MVP schema only (for reference)
- `supabase/seed.sql` — Original seed file (for reference)
- `src/types/mvp.ts` — TypeScript types for database models

---

## Troubleshooting

### Error: "Cannot find column..."
**Solution:** Re-run RESET_COMPLETE.sql first, then SEED_DATA.sql

### Error: "Duplicate key value..."
**Solution:** Tables already exist. Run RESET_COMPLETE.sql to drop them first.

### Error: "Foreign key constraint violated"
**Solution:** Check that RESET_COMPLETE.sql completed successfully before running SEED_DATA.sql

### Polls/Moments show "is_active = false"
**Solution:** They have expires_at in the past. This is expected if seed data is old. They auto-hide after 24 hours.

### No data showing in Table Editor
1. Verify both scripts ran without errors
2. Refresh the browser (Cmd+R)
3. Check that you selected the correct project

---

## Next Steps (PHASE B)

Once database is verified:

1. Run: `npm install` (if not done)
2. Create `.env.local` with Supabase credentials
3. Start dev server: `npm run dev`
4. Begin PHASE B: PWA Shell + Feed Layout

---

## Database Schema Overview

```
campuses (5 records)
├── users (5 records, 1:many)
│   ├── polls (5 records)
│   │   └── poll_votes (3 records)
│   ├── moments (5 records)
│   ├── drops (1 record)
│   │   ├── drop_submissions
│   │   ├── drop_votes
│   │   └── winner_submission_id (FK)
│   └── points (4 records, weekly)
```

**RLS Enabled:** All tables scoped by campus_id
**Indexes:** Optimized for feed queries (campus_id, expires_at)
**Auto-expiry:** Moments & Polls hide after 24 hours via `is_active` view

---

**Questions?** Check SQL Editor for full schema, or reference `src/types/mvp.ts` for complete type definitions.
