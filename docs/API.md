# Yollr API Documentation

## Overview

Yollr is a gamified campus social platform with a single vertical feed, weekly heists, real-time polls, and comprehensive gamification features. This API documentation covers all endpoints, authentication, and integration patterns.

## Base URL

```
https://your-project.supabase.co
```

## Authentication

All API requests require authentication using Supabase Auth. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication

#### Phone OTP Authentication
- **POST** `/auth/v1/otp` - Send OTP to phone
- **POST** `/auth/v1/verify` - Verify OTP and sign in

### Campus Management

#### Get Campus List
- **GET** `/rest/v1/campuses` - List all campuses
- **Query Parameters**: `select=*`, `is_active=eq.true`

#### Get Campus Details
- **GET** `/rest/v1/campuses?id=eq.{campus_id}` - Get specific campus

#### Infer Campus from Location
- **POST** `/functions/v1/geo-infer-campus` - Find campuses by location
- **Request Body**:
  ```json
  {
    "lat": 40.7128,
    "lng": -74.0060,
    "zip": "10001"
  }
  ```

### Feed Management

#### Get Ranked Feed
- **POST** `/functions/v1/rank-feed-page` - Get ranked feed items
- **Request Body**:
  ```json
  {
    "campus_id": "uuid",
    "cursor": "score_id", // optional
    "limit": 10 // optional
  }
  ```

#### Get Moments
- **GET** `/rest/v1/moments` - List moments
- **Query Parameters**: `campus_id=eq.{id}`, `order=created_at.desc`, `limit=20`

#### Create Moment
- **POST** `/rest/v1/moments` - Create new moment
- **Request Body**:
  ```json
  {
    "campus_id": "uuid",
    "caption": "text",
    "video_url": "url",
    "thumbnail_url": "url",
    "source": "camera|upload|screen_record"
  }
  ```

### Polls

#### Get Active Polls
- **GET** `/rest/v1/polls` - List active polls
- **Query Parameters**: `campus_id=eq.{id}`, `is_active=eq.true`, `closes_at=gt.now`

#### Create Poll
- **POST** `/rest/v1/polls` - Create new poll
- **Request Body**:
  ```json
  {
    "campus_id": "uuid",
    "question": "text",
    "category": "sports|campus_life|food|entertainment|academics|weekend_plans",
    "image_url": "url", // optional
    "closes_at": "ISO timestamp"
  }
  ```

#### Vote in Poll
- **POST** `/rest/v1/poll_votes` - Cast vote
- **Request Body**:
  ```json
  {
    "poll_id": "uuid",
    "option_id": "uuid"
  }
  ```

### Heists

#### Get Active Heists
- **GET** `/rest/v1/heists` - List active heists
- **Query Parameters**: `campus_id=eq.{id}`, `is_active=eq.true`

#### Get Heist Submissions
- **GET** `/rest/v1/heist_submissions` - List submissions
- **Query Parameters**: `heist_id=eq.{id}`, `order=vote_count.desc`

#### Submit to Heist
- **POST** `/rest/v1/heist_submissions` - Submit entry
- **Request Body**:
  ```json
  {
    "heist_id": "uuid",
    "title": "text",
    "description": "text",
    "image_url": "url", // optional
    "video_url": "url" // optional
  }
  ```

#### Vote on Heist Submission
- **POST** `/rest/v1/heist_votes` - Cast vote
- **Request Body**:
  ```json
  {
    "heist_id": "uuid",
    "submission_id": "uuid",
    "reaction_type": "fire|laugh|heart|clap|mind_blown|sad|angry|star"
  }
  ```

### Squads

#### Get Campus Squads
- **GET** `/rest/v1/squads` - List squads
- **Query Parameters**: `campus_id=eq.{id}`, `is_active=eq.true`

#### Join Squad
- **POST** `/rest/v1/squad_members` - Join squad
- **Request Body**:
  ```json
  {
    "squad_id": "uuid"
  }
  ```

### User Management

#### Get User Profile
- **GET** `/rest/v1/profiles?id=eq.{user_id}` - Get profile

#### Update Profile
- **PATCH** `/rest/v1/profiles?id=eq.{user_id}` - Update profile
- **Request Body**:
  ```json
  {
    "display_name": "text",
    "bio": "text",
    "avatar_url": "url",
    "sport_type": "football|basketball|..."
  }
  ```

#### Get User XP History
- **GET** `/rest/v1/user_xp` - Get XP history
- **Query Parameters**: `user_id=eq.{id}`, `order=created_at.desc`

### Reactions

#### Add Reaction
- **POST** `/rest/v1/reactions` - Add reaction
- **Request Body**:
  ```json
  {
    "moment_id": "uuid",
    "reaction_type": "fire|laugh|heart|clap|mind_blown|sad|angry|star"
  }
  ```

### Leaderboards

#### Get Campus Leaderboard
- **GET** `/rest/v1/profiles` - Get leaderboard
- **Query Parameters**: `select=id,username,display_name,total_xp,current_streak`, `order=total_xp.desc`, `limit=100`

### Analytics

#### Log Analytics Event
- **POST** `/rest/v1/analytics_events` - Log event
- **Request Body**:
  ```json
  {
    "event_type": "string",
    "event_data": {}
  }
  ```

## Real-time Subscriptions

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

## Error Handling

### Error Response Format
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
- `VALIDATION_ERROR` - Invalid request data
- `AUTH_ERROR` - Authentication failed
- `PERMISSION_DENIED` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests

## Rate Limiting

- **Authenticated requests**: 60 requests per minute
- **Write operations**: 10 writes per minute per user
- **File uploads**: 5 uploads per minute

## Webhooks

### Available Webhook Events
- `moment.created` - New moment posted
- `poll.created` - New poll created
- `heist.phase_changed` - Heist phase updated
- `user.xp_earned` - User earned XP
- `reaction.added` - New reaction added

### Webhook Payload Format
```json
{
  "event": "event.type",
  "timestamp": "ISO timestamp",
  "data": { /* event-specific data */ }
}
```

## File Storage

### Upload Files
- **POST** `/storage/v1/object/{bucket}/{path}` - Upload file
- **Buckets**: `moments`, `heist-submissions`, `profile-avatars`

### Get Public URL
- **GET** `/storage/v1/object/public/{bucket}/{path}` - Get public URL

## Push Notifications

### Subscribe to Topic
```javascript
// Client-side
messaging.subscribeToTopic('campus_{campusId}');
messaging.subscribeToTopic('heist_{heistId}');
```

### Send Notification
- **POST** `/functions/v1/broadcast-notification` - Send notification
- **Request Body**:
  ```json
  {
    "topic": "string",
    "title": "string",
    "body": "string",
    "data": {}
  }
  ```

## Best Practices

1. **Caching**: Use ETags and cache headers for feed responses
2. **Pagination**: Always use cursor-based pagination for feeds
3. **Error Handling**: Implement retry logic with exponential backoff
4. **Real-time**: Use Supabase Realtime for live updates
5. **Batching**: Batch analytics events to reduce API calls
6. **Optimistic Updates**: Update UI immediately, sync with server

## SDK Examples

### JavaScript/TypeScript
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get feed
const { data: feed } = await supabase.functions.invoke('rank-feed-page', {
  body: { campus_id: 'uuid', limit: 10 }
});
```

### Python
```python
from supabase import create_client

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

# Get moments
moments = supabase.table('moments')\
    .select('*')\
    .eq('campus_id', campus_id)\
    .order('created_at', desc=True)\
    .limit(20)\
    .execute()
```

### cURL
```bash
# Get feed
curl -X POST https://your-project.supabase.co/functions/v1/rank-feed-page \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campus_id": "uuid", "limit": 10}'

# Create moment
curl -X POST https://your-project.supabase.co/rest/v1/moments \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"campus_id": "uuid", "caption": "Hello", "video_url": "url"}'
```

## Support

For API support, please contact:
- Email: support@yollr.com
- Discord: [Yollr Developer Community](https://discord.gg/yollr)
- Documentation: [docs.yollr.com](https://docs.yollr.com)