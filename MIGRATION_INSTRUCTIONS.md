# Apply Database Migration - Quick Guide

## Steps (Takes ~2 minutes)

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your Yollr project

### 2. Open SQL Editor
- Click **SQL Editor** in the left sidebar
- Click **New Query** button

### 3. Copy and Paste Migration
- Open the file: `APPLY_MIGRATION.sql`
- Copy ALL the content (Ctrl+A, Ctrl+C)
- Paste it into the SQL Editor

### 4. Run the Migration
- Click **Run** button (or press Ctrl+Enter)
- Wait for completion (~5-10 seconds)

### 5. Verify Success
You should see:
```
Success. No rows returned
```

If you see any errors about "already exists", that's okay - it means parts are already there.

## Troubleshooting

### Error: "relation already exists"
✅ **This is fine!** It means the table/column already exists. The migration is idempotent.

### Error: "permission denied"
❌ Make sure you're using the correct project and have admin access.

### Error: "syntax error"
❌ Make sure you copied the ENTIRE file, including the beginning comments.

## Quick Verification

After running the migration, verify it worked by running this query:

```sql
SELECT id, username, invite_code, referred_by
FROM profiles
LIMIT 5;
```

You should see the new `invite_code` and `referred_by` columns!

## What This Migration Does

✅ Adds `invite_code` column to profiles (unique 6-char codes)
✅ Adds `referred_by` column to track who invited whom
✅ Adds `favorite_sports`, `interests`, `favorite_team` for progressive profiling
✅ Adds `profile_completed_at` timestamp
✅ Creates `friendships` table for bidirectional friend connections
✅ Creates function to generate unique invite codes
✅ Creates trigger to auto-create friendships when invite codes are used
✅ Awards 50 XP to both users when friendship is created

## After Migration

Once complete, your app will have:
- 🎫 Invite codes for all users
- 🤝 Friend invite system fully functional
- 📊 Progressive profiling ready
- 📍 Geo-location campus detection working

Test it out at http://localhost:3002!
