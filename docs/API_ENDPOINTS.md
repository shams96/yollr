# Yollr API Endpoints Reference

## Authentication Endpoints

### Send OTP
**POST** `/auth/v1/otp`

Send a one-time password to a phone number.

**Request:**
```json
{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Error Responses:**
- `400` - Invalid phone number format
- `429` - Rate limit exceeded (max 3 requests per minute)

### Verify OTP
**POST** `/auth/v1/verify`

Verify the OTP and create a session.

**Request:**
```json
{
  "phone": "+1234567890",
  "token": "123456",
  "type": "sms"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "user": {
    "id": "user_id",
    "phone": "+1234567890",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `400` - Invalid or expired OTP
- `401` - Unauthorized
- `429` - Too many attempts

### Refresh Token
**POST** `/auth/v1/token?grant_type=refresh_token`

Refresh an expired access token.

**Request:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_jwt_token",
  "refresh_token": "new_refresh_token",
  "expires_in": 3600,
  "expires_at": 1234567890,
  "token_type": "bearer"
}
```

### Sign Out
**POST** `/auth/v1/logout`

Sign out and invalidate the session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true
}
```

## User Management Endpoints

### Get Current User
**GET** `/auth/v1/user`

Get the currently authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "user_id",
  "phone": "+1234567890",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update User
**PUT** `/auth/v1/user`

Update user metadata.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "phone": "+1987654321",
  "data": {
    "custom_field": "value"
  }
}
```

**Response:**
```json
{
  "id": "user_id",
  "phone": "+1987654321",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "data": {
    "custom_field": "value"
  }
}
```

## Profile Endpoints

### Get Profile
**GET** `/rest/v1/profiles?id=eq.{user_id}`

Get a user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `select=*` - Select all fields
- `select=id,username,display_name,total_xp` - Select specific fields

**Response:**
```json
[
  {
    "id": "user_id",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Campus enthusiast",
    "sport_type": "football",
    "total_xp": 1250,
    "current_streak": 5,
    "longest_streak": 12,
    "mystery_boxes_available": 2,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Update Profile
**PATCH** `/rest/v1/profiles?id=eq.{user_id}`

Update profile information.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

**Request:**
```json
{
  "display_name": "John Updated",
  "bio": "Updated bio",
  "avatar_url": "https://new-avatar.url",
  "sport_type": "basketball"
}
```

**Response:**
```json
[
  {
    "id": "user_id",
    "username": "johndoe",
    "display_name": "John Updated",
    "avatar_url": "https://new-avatar.url",
    "bio": "Updated bio",
    "sport_type": "basketball",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Profile
**POST** `/rest/v1/profiles`

Create a new profile (usually done after first login).

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

**Request:**
```json
{
  "id": "user_id",
  "username": "johndoe",
  "display_name": "John Doe",
  "avatar_url": "https://...",
  "bio": "Campus enthusiast",
  "sport_type": "football"
}
```

**Response:**
```json
[
  {
    "id": "user_id",
    "username": "johndoe",
    "display_name": "John Doe",
    "avatar_url": "https://...",
    "bio": "Campus enthusiast",
    "sport_type": "football",
    "total_xp": 0,
    "current_streak": 0,
    "longest_streak": 0,
    "mystery_boxes_available": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

## Campus Endpoints

### List Campuses
**GET** `/rest/v1/campuses`

Get list of all campuses.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `select=*` - Select all fields
- `is_active=eq.true` - Only active campuses
- `order=student_count.desc` - Sort by student count

**Response:**
```json
[
  {
    "id": "campus_id",
    "name": "University of Texas",
    "short_name": "UT",
    "campus_type": "university",
    "domain": "utexas.edu",
    "city": "Austin",
    "state": "TX",
    "country": "US",
    "timezone": "America/Chicago",
    "primary_color": "#BF5700",
    "secondary_color": "#FFFFFF",
    "logo_url": "https://...",
    "banner_url": "https://...",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Campus by ID
**GET** `/rest/v1/campuses?id=eq.{campus_id}`

Get a specific campus.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Response:**
```json
[
  {
    "id": "campus_id",
    "name": "University of Texas",
    "short_name": "UT",
    "campus_type": "university",
    "domain": "utexas.edu",
    "city": "Austin",
    "state": "TX",
    "country": "US",
    "timezone": "America/Chicago",
    "primary_color": "#BF5700",
    "secondary_color": "#FFFFFF",
    "logo_url": "https://...",
    "banner_url": "https://...",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Campus Members
**GET** `/rest/v1/campus_memberships`

Get members of a campus.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `campus_id=eq.{campus_id}` - Filter by campus
- `is_active=eq.true` - Only active members
- `select=*,profiles(*)` - Include profile data

**Response:**
```json
[
  {
    "id": "membership_id",
    "user_id": "user_id",
    "campus_id": "campus_id",
    "role": "member",
    "joined_at": "2024-01-01T00:00:00Z",
    "left_at": null,
    "is_active": true,
    "profiles": {
      "id": "user_id",
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://...",
      "total_xp": 1250
    }
  }
]
```

## Feed Endpoints

### Get Ranked Feed
**POST** `/functions/v1/rank-feed-page`

Get ranked feed items for a campus.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "campus_id": "campus_id",
  "cursor": "score_id", // optional
  "limit": 10 // optional, default: 10
}
```

**Response:**
```json
{
  "items": [
    {
      "id": "heist_id",
      "type": "heist",
      "score": 1000000,
      "created_at": "2024-01-01T00:00:00Z",
      "campus_id": "campus_id",
      "title": "Weekly Challenge",
      "description": "Show your campus spirit",
      "phase": "submitting",
      "status": "revealed"
    },
    {
      "id": "poll_id",
      "type": "poll",
      "score": 850000,
      "created_at": "2024-01-01T00:00:00Z",
      "campus_id": "campus_id",
      "question": "What's the best dining hall?",
      "category": "food",
      "closes_at": "2024-01-02T00:00:00Z",
      "total_votes": 42,
      "poll_options": [
        {
          "id": "option_id",
          "option_text": "Jester",
          "vote_count": 25,
          "position": 1
        }
      ]
    },
    {
      "id": "moment_id",
      "type": "moment",
      "score": 750000,
      "created_at": "2024-01-01T00:00:00Z",
      "campus_id": "campus_id",
      "caption": "Game day vibes!",
      "video_url": "https://...",
      "thumbnail_url": "https://...",
      "view_count": 150,
      "reaction_count": 12,
      "author_username": "johndoe",
      "author_avatar": "https://..."
    }
  ],
  "next_cursor": "750000_moment_id",
  "is_stale": false
}
```

### Get Moments
**GET** `/rest/v1/moments`

Get moments for a campus.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `campus_id=eq.{campus_id}` - Filter by campus
- `is_active=eq.true` - Only active moments
- `expires_at=gt.now` - Only non-expired moments
- `order=created_at.desc` - Sort by creation time
- `limit=20` - Limit results
- `select=*,profiles(*)` - Include author data

**Response:**
```json
[
  {
    "id": "moment_id",
    "campus_id": "campus_id",
    "user_id": "user_id",
    "squad_id": null,
    "athletics_event_id": null,
    "caption": "Game day vibes!",
    "video_url": "https://...",
    "thumbnail_url": "https://...",
    "source": "camera",
    "view_count": 150,
    "reaction_count": 12,
    "comment_count": 3,
    "is_active": true,
    "expires_at": "2024-01-02T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "profiles": {
      "username": "johndoe",
      "avatar_url": "https://..."
    }
  }
]
```

### Create Moment
**POST** `/rest/v1/moments`

Create a new moment.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "campus_id": "campus_id",
  "caption": "Amazing game!",
  "video_url": "https://storage.supabase.co/moments/video.mp4",
  "thumbnail_url": "https://storage.supabase.co/moments/thumbnail.jpg",
  "source": "camera"
}
```

**Response:**
```json
[
  {
    "id": "moment_id",
    "campus_id": "campus_id",
    "user_id": "user_id",
    "caption": "Amazing game!",
    "video_url": "https://storage.supabase.co/moments/video.mp4",
    "thumbnail_url": "https://storage.supabase.co/moments/thumbnail.jpg",
    "source": "camera",
    "view_count": 0,
    "reaction_count": 0,
    "comment_count": 0,
    "is_active": true,
    "expires_at": "2024-01-02T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

## Poll Endpoints

### Get Active Polls
**GET** `/rest/v1/polls`

Get active polls for a campus.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `campus_id=eq.{campus_id}` - Filter by campus
- `is_active=eq.true` - Only active polls
- `closes_at=gt.now` - Only open polls
- `order=created_at.desc` - Sort by creation time
- `select=*,poll_options(*),author:author_id(username,display_name,avatar_url)`

**Response:**
```json
[
  {
    "id": "poll_id",
    "campus_id": "campus_id",
    "author_id": "user_id",
    "question": "What's the best dining hall?",
    "category": "food",
    "image_url": "https://...",
    "closes_at": "2024-01-02T00:00:00Z",
    "is_active": true,
    "total_votes": 42,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "poll_options": [
      {
        "id": "option_id",
        "poll_id": "poll_id",
        "option_text": "Jester",
        "vote_count": 25,
        "position": 1,
        "created_at": "2024-01-01T00:00:00Z"
      },
      {
        "id": "option_id_2",
        "poll_id": "poll_id",
        "option_text": "Kinsolving",
        "vote_count": 17,
        "position": 2,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "author": {
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://..."
    }
  }
]
```

### Create Poll
**POST** `/rest/v1/polls`

Create a new poll.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "campus_id": "campus_id",
  "author_id": "user_id",
  "question": "What's the best dining hall?",
  "category": "food",
  "image_url": "https://...",
  "closes_at": "2024-01-02T00:00:00Z"
}
```

**Response:**
```json
[
  {
    "id": "poll_id",
    "campus_id": "campus_id",
    "author_id": "user_id",
    "question": "What's the best dining hall?",
    "category": "food",
    "image_url": "https://...",
    "closes_at": "2024-01-02T00:00:00Z",
    "is_active": true,
    "total_votes": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Vote in Poll
**POST** `/rest/v1/poll_votes`

Cast a vote in a poll.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "poll_id": "poll_id",
  "user_id": "user_id",
  "option_id": "option_id"
}
```

**Response:**
```json
[
  {
    "id": "vote_id",
    "poll_id": "poll_id",
    "user_id": "user_id",
    "option_id": "option_id",
    "points_awarded": 10,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Heist Endpoints

### Get Active Heists
**GET** `/rest/v1/heists`

Get active heists for a campus.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `campus_id=eq.{campus_id}` - Filter by campus
- `is_active=eq.true` - Only active heists
- `order=submission_opens_at.desc` - Sort by start time
- `select=*,winner:winner_submission_id(*)`

**Response:**
```json
[
  {
    "id": "heist_id",
    "campus_id": "campus_id",
    "title": "Campus Spirit Week",
    "description": "Show your campus pride",
    "phase": "submitting",
    "image_url": "https://...",
    "submission_opens_at": "2024-01-01T09:00:00Z",
    "submission_closes_at": "2024-01-03T23:59:59Z",
    "voting_opens_at": "2024-01-04T00:00:00Z",
    "voting_closes_at": "2024-01-07T23:59:59Z",
    "execution_week_start": "2024-01-08T00:00:00Z",
    "execution_week_end": "2024-01-14T23:59:59Z",
    "winner_submission_id": null,
    "total_submissions": 15,
    "total_votes": 0,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Heist Submissions
**GET** `/rest/v1/heist_submissions`

Get submissions for a heist.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `heist_id=eq.{heist_id}` - Filter by heist
- `order=vote_count.desc` - Sort by votes
- `select=*,author:author_id(username,display_name,avatar_url)`

**Response:**
```json
[
  {
    "id": "submission_id",
    "heist_id": "heist_id",
    "user_id": "user_id",
    "title": "My campus spirit moment",
    "description": "This is why I love our campus",
    "image_url": "https://...",
    "video_url": "https://...",
    "vote_count": 42,
    "is_winner": false,
    "created_at": "2024-01-02T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z",
    "author": {
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://..."
    }
  }
]
```

### Submit to Heist
**POST** `/rest/v1/heist_submissions`

Submit an entry to a heist.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "heist_id": "heist_id",
  "user_id": "user_id",
  "title": "My campus spirit moment",
  "description": "This is why I love our campus",
  "image_url": "https://...",
  "video_url": "https://..."
}
```

**Response:**
```json
[
  {
    "id": "submission_id",
    "heist_id": "heist_id",
    "user_id": "user_id",
    "title": "My campus spirit moment",
    "description": "This is why I love our campus",
    "image_url": "https://...",
    "video_url": "https://...",
    "vote_count": 0,
    "is_winner": false,
    "created_at": "2024-01-02T00:00:00Z",
    "updated_at": "2024-01-02T00:00:00Z"
  }
]
```

### Vote on Heist Submission
**POST** `/rest/v1/heist_votes`

Vote on a heist submission.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "heist_id": "heist_id",
  "submission_id": "submission_id",
  "user_id": "user_id",
  "reaction_type": "fire"
}
```

**Response:**
```json
[
  {
    "id": "vote_id",
    "heist_id": "heist_id",
    "submission_id": "submission_id",
    "user_id": "user_id",
    "reaction_type": "fire",
    "points_awarded": 100,
    "created_at": "2024-01-05T00:00:00Z"
  }
]
```

## Reaction Endpoints

### Add Reaction
**POST** `/rest/v1/reactions`

Add a reaction to a moment.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
Prefer: return=representation
```

**Request:**
```json
{
  "moment_id": "moment_id",
  "user_id": "user_id",
  "reaction_type": "fire"
}
```

**Response:**
```json
[
  {
    "id": "reaction_id",
    "moment_id": "moment_id",
    "user_id": "user_id",
    "reaction_type": "fire",
    "points_awarded": 5,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Reactions
**GET** `/rest/v1/reactions`

Get reactions for a moment.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `moment_id=eq.{moment_id}` - Filter by moment
- `select=*,user:profiles(username,display_name,avatar_url)`

**Response:**
```json
[
  {
    "id": "reaction_id",
    "moment_id": "moment_id",
    "user_id": "user_id",
    "reaction_type": "fire",
    "points_awarded": 5,
    "created_at": "2024-01-01T00:00:00Z",
    "user": {
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://..."
    }
  }
]
```

## Leaderboard Endpoints

### Get Campus Leaderboard
**GET** `/rest/v1/profiles`

Get leaderboard for a campus.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `select=id,username,display_name,total_xp,current_streak,longest_streak,avatar_url`
- `order=total_xp.desc` - Sort by XP
- `limit=100` - Top 100 users
- `id=in.(user_ids)` - Filter by campus members

**Response:**
```json
[
  {
    "id": "user_id_1",
    "username": "topplayer",
    "display_name": "Top Player",
    "total_xp": 5000,
    "current_streak": 15,
    "longest_streak": 30,
    "avatar_url": "https://..."
  },
  {
    "id": "user_id_2",
    "username": "secondplace",
    "display_name": "Second Place",
    "total_xp": 4500,
    "current_streak": 12,
    "longest_streak": 25,
    "avatar_url": "https://..."
  }
]
```

### Get User XP History
**GET** `/rest/v1/user_xp`

Get XP history for a user.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Query Parameters:**
- `user_id=eq.{user_id}` - Filter by user
- `order=created_at.desc` - Sort by date
- `limit=50` - Limit results

**Response:**
```json
[
  {
    "id": "xp_id",
    "user_id": "user_id",
    "xp_amount": 100,
    "source": "heist_vote",
    "reference_id": "heist_id",
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": "xp_id_2",
    "user_id": "user_id",
    "xp_amount": 10,
    "source": "poll_vote",
    "reference_id": "poll_id",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

## Storage Endpoints

### Upload File
**POST** `/storage/v1/object/{bucket}/{path}`

Upload a file to storage.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: multipart/form-data
```

**Buckets:**
- `moments` - User video moments
- `heist-submissions` - Heist entry images/videos
- `profile-avatars` - User profile pictures
- `campus-assets` - Campus logos and banners
- `sponsor-assets` - Sponsor logos and offer images

**Response:**
```json
{
  "Key": "bucket/path/filename.jpg",
  "ETag": "\"etag\"",
  "LastModified": "2024-01-01T00:00:00Z",
  "Size": 1024,
  "ContentType": "image/jpeg"
}
```

### Get Public URL
**GET** `/storage/v1/object/public/{bucket}/{path}`

Get a public URL for a file.

**Response:**
```
https://your-project.supabase.co/storage/v1/object/public/bucket/path/filename.jpg
```

### Delete File
**DELETE** `/storage/v1/object/{bucket}/{path}`

Delete a file from storage.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Response:**
```json
{
  "success": true
}
```

## Real-time Endpoints

### Subscribe to Changes
**WebSocket** `/realtime/v1/websocket`

Connect to real-time updates.

**Connection URL:**
```
wss://your-project.supabase.co/realtime/v1/websocket?apikey=<anon_key>&access_token=<jwt_token>
```

### Subscribe to Feed Updates
```javascript
const channel = supabase
  .channel('feed-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'moments',
    filter: `campus_id=eq.${campusId}`
  }, payload => {
    console.log('New moment:', payload.new);
  })
  .subscribe();
```

### Subscribe to Heist Phase Changes
```javascript
const channel = supabase
  .channel('heist-phases')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'heists',
    filter: `campus_id=eq.${campusId}`
  }, payload => {
    console.log('Heist phase changed:', payload.new.phase);
  })
  .subscribe();
```

## Edge Function Endpoints

### Geo-Infer Campus
**POST** `/functions/v1/geo-infer-campus`

Detect campus from location or ZIP code.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "zip": "10001"
}
```

**Response:**
```json
{
  "campuses": [
    {
      "id": "campus_id",
      "name": "New York University",
      "city": "New York",
      "state": "NY",
      "zip_code": "10003",
      "latitude": 40.7295,
      "longitude": -73.9965,
      "student_count": 50000,
      "logo_url": "https://...",
      "distance_miles": 1.2
    }
  ],
  "location_used": "coordinates",
  "total_found": 1
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

### Common Error Codes
- `INVALID_PHONE` - Invalid phone number format
- `INVALID_OTP` - Invalid or expired OTP
- `RATE_LIMITED` - Too many requests
- `UNAUTHORIZED` - Invalid or missing token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `CONFLICT` - Resource already exists

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content
- `304` - Not Modified (cached)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable

## Rate Limiting

### Limits by Endpoint
- **Authentication**: 3 OTP requests/minute, 5 OTP attempts/15 minutes
- **API Requests**: 60 requests/minute per user
- **Write Operations**: 10 writes/minute per user
- **File Uploads**: 5 uploads/minute per user
- **IP Requests**: 10 requests/minute per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1234567890
Retry-After: 60
```

## Pagination

### Cursor-Based Pagination
```json
{
  "items": [...],
  "next_cursor": "score_id",
  "is_stale": false
}
```

### Using Pagination
```javascript
// First page
const response = await fetch('/functions/v1/rank-feed-page', {
  body: JSON.stringify({ campus_id: 'id', limit: 10 })
});

// Next page
const nextResponse = await fetch('/functions/v1/rank-feed-page', {
  body: JSON.stringify({ 
    campus_id: 'id', 
    cursor: response.next_cursor,
    limit: 10 
  })
});
```

## Webhook Endpoints

### Create Webhook
**POST** `/hooks/v1/create`

Create a webhook subscription.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://your-webhook-url.com/webhook",
  "events": ["moment.created", "poll.voted", "heist.won"],
  "secret": "your-webhook-secret"
}
```

**Response:**
```json
{
  "id": "webhook_id",
  "url": "https://your-webhook-url.com/webhook",
  "events": ["moment.created", "poll.voted", "heist.won"],
  "secret": "your-webhook-secret",
  "active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### List Webhooks
**GET** `/hooks/v1/list`

List webhook subscriptions.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Response:**
```json
[
  {
    "id": "webhook_id",
    "url": "https://your-webhook-url.com/webhook",
    "events": ["moment.created", "poll.voted", "heist.won"],
    "active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Delete Webhook
**DELETE** `/hooks/v1/delete?id=eq.{webhook_id}`

Delete a webhook subscription.

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <supabase_anon_key>
```

**Response:**
```json
{
  "success": true
}