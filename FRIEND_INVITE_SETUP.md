# Friend Invite System - Setup Instructions

## Overview
The Friend Invite System has been implemented with the following features:
- ✅ Unique invite codes generated for each user (6-character alphanumeric)
- ✅ Optional invite code input during signup
- ✅ Auto-connect friends when invite code is used (bidirectional friendship)
- ✅ 50 XP bonus for both users when invite code is redeemed
- ✅ Invite code display card on feed page with copy/share functionality

## Database Migration Required

To enable the friend invite system, you need to apply the database migration:

### Option 1: Supabase Dashboard (Recommended for quick testing)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20250127000000_add_friend_invites.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Supabase CLI (If using local development)

```bash
# If you have Supabase CLI installed
supabase db push
```

## Migration Details

The migration adds:

### 1. **Profiles Table Extensions**
- `invite_code` TEXT UNIQUE - User's unique invite code
- `phone_number` TEXT - Phone number for authentication
- `favorite_sports` TEXT[] - User's favorite sports (from progressive profiling)
- `interests` TEXT[] - User's interests (from progressive profiling)
- `favorite_team` TEXT - User's favorite team
- `profile_completed_at` TIMESTAMPTZ - Profile completion timestamp
- `referred_by` UUID - Reference to the user who invited them

### 2. **Friendships Table**
- Bidirectional friendship tracking
- Prevents self-friending
- Unique constraint on user-friend pairs

### 3. **Functions**
- `generate_invite_code()` - Generates unique 6-character codes
- `fn_create_friendship_on_referral()` - Auto-creates friendship and awards XP

### 4. **Triggers**
- Auto-creates bidirectional friendships when `referred_by` is set
- Awards 50 XP to both users on successful referral

## Testing the Friend Invite System

### Test Scenario 1: New User with Invite Code

1. **Create first user:**
   - Open the landing page
   - Enter phone number
   - Click "Get Started"
   - Check the feed page - you should see your invite code

2. **Share invite code:**
   - Click "Copy" or "Share" button on the invite code card
   - Note down the 6-character code (e.g., "ABC123")

3. **Create second user with invite code:**
   - Open landing page in incognito/private window
   - Enter a different phone number
   - Click "Have an invite code? →"
   - Enter the invite code from step 2
   - Click "Get Started"

4. **Verify:**
   - Both users should receive 50 XP
   - Friendship should be auto-created (check via database or future friends list)

### Test Scenario 2: New User without Invite Code

1. Open landing page
2. Enter phone number
3. Click "Get Started" (without entering invite code)
4. User is created with their own invite code but no referrer

## Features Implemented

### 1. **Landing Page** (`src/app/page.tsx`)
- Phone number input
- Optional invite code input (toggle to show)
- Invite code lookup during signup
- Unique invite code generation for new users
- Geo-location campus detection

### 2. **Feed Page** (`src/app/feed/page.tsx`)
- Invite code display card
- Shows user's personal invite code
- Copy and share functionality

### 3. **Invite Code Card Component** (`src/components/InviteCodeCard.tsx`)
- Beautiful gradient card design
- Copy to clipboard functionality
- Native share API support with clipboard fallback
- Displays XP reward information

## Progressive Profiling (Already Implemented)

The system also includes progressive profiling:
- Triggers after first user interaction on feed
- 2-step modal: Sports selection → Interests selection
- Optional favorite team input
- 100 XP bonus for completion
- "I'll do this later" skip option

## Geo-location Campus Detection (Already Implemented)

- Uses browser Geolocation API
- Calculates distance to all campuses using Haversine formula
- Auto-assigns nearest campus
- Graceful fallback to first campus if geo-location fails

## Next Steps (Optional Enhancements)

1. **Friends List Page** - Display all friends
2. **Friend Activity Feed** - See what friends are doing
3. **Friend Leaderboard** - Compete with friends
4. **Invite Code Analytics** - Track invite code usage
5. **Referral Rewards** - Additional rewards for multiple referrals

## Troubleshooting

### Issue: "Invalid invite code" error
- **Cause:** Invite code doesn't exist in database
- **Solution:** Verify the code is correct (case-insensitive, 6 characters)

### Issue: Invite code not showing on feed
- **Cause:** Migration not applied or profile doesn't have invite_code
- **Solution:** Apply migration, or manually update existing profiles with invite codes

### Issue: Friendship not created
- **Cause:** Trigger not executing or database function error
- **Solution:** Check Supabase logs for errors, verify trigger is active

## Technical Notes

- Invite codes are **case-insensitive** (converted to uppercase)
- Invite codes exclude similar-looking characters (I, O, 0, 1, L)
- Friendships are **bidirectional** (both users see each other as friends)
- XP rewards are awarded via database trigger automatically
- Migration is **idempotent** (safe to run multiple times)

## Current Status

✅ All code implementation complete
⏳ Database migration pending (manual step required)

Once the migration is applied, the friend invite system will be fully functional!
