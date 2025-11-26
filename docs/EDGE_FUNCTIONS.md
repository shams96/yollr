# Yollr Edge Functions Guide

## Overview

Yollr uses Vercel Edge Functions for performance-critical operations that require low latency and global distribution. Edge Functions run on Vercel's edge network, providing sub-100ms response times worldwide.

## Architecture

### Edge Function Stack
- **Runtime**: Vercel Edge Runtime (Deno-compatible)
- **Language**: TypeScript
- **Deployment**: Vercel CLI
- **Caching**: Custom in-memory cache with ETag support
- **Database**: Supabase via connection pooling

### Current Edge Functions

1. **geo-infer-campus** - Campus detection from location/ZIP
2. **rank-feed-page** - Feed ranking and pagination

## geo-infer-campus Function

### Purpose
Detects user's campus based on geographic location or ZIP code.

### Endpoint
```
POST https://your-project.vercel.app/api/geo-infer-campus
```

### Request
```typescript
interface GeoInferRequest {
  lat?: number;      // Latitude
  lng?: number;      // Longitude
  zip?: string;      // ZIP/postal code
}
```

### Response
```typescript
interface GeoInferResponse {
  campuses: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number;
    longitude: number;
    student_count: number;
    logo_url?: string;
    distance_miles?: number;
  }>;
  location_used: 'coordinates' | 'zip_code';
  total_found: number;
}
```

### Implementation
```typescript
// supabase/functions/geo-infer-campus/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
import { getDistance } from 'https://esm.sh/geolib@3.3.4';
import { geoCache } from '../_shared/cache.ts';

serve(async (req) => {
  const { lat, lng, zip } = await req.json();
  
  // Cache key generation
  const cacheKey = geoCache.generateKey([
    'geo',
    lat ? lat.toFixed(4) : null,
    lng ? lng.toFixed(4) : null,
    zip ? `zip:${zip}` : null
  ].filter(Boolean));

  // Check cache
  const cached = geoCache.get(cacheKey);
  if (cached) {
    const isStale = geoCache.isStale(cacheKey);
    const cacheHeaders = geoCache.getCacheHeaders(cached.etag, isStale);
    
    return new Response(JSON.stringify(cached.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...cacheHeaders },
      status: 200,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  let campuses = [];
  
  if (zip) {
    // Search by ZIP code
    const { data } = await supabase
      .from('campuses')
      .select('*')
      .eq('zip_code', zip)
      .limit(10);
    campuses = data || [];
  } else if (lat && lng) {
    // Search within 50 miles
    const radiusKm = 80.467;
    const { data } = await supabase.from('campuses').select('*');
    
    campuses = (data || [])
      .map(campus => ({
        ...campus,
        distance: getDistance(
          { latitude: lat, longitude: lng },
          { latitude: campus.lat, longitude: campus.lng }
        ) / 1000,
      }))
      .filter(campus => campus.distance <= radiusKm)
      .sort((a, b) => {
        // Rank by enrollment / distance^1.5
        const scoreA = a.enrollment / Math.pow(a.distance, 1.5);
        const scoreB = b.enrollment / Math.pow(b.distance, 1.5);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }

  const result = { campuses };
  
  // Store in cache
  const etag = geoCache.set(cacheKey, result);
  const cacheHeaders = geoCache.getCacheHeaders(etag, false);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...cacheHeaders },
    status: 200,
  });
});
```

### Caching Strategy
- **Cache Key**: `geo:{lat}:{lng}` or `geo:zip:{zip}`
- **TTL**: 24 hours
- **Stale-while-revalidate**: 1 hour
- **Cache Headers**: ETag + Cache-Control

## rank-feed-page Function

### Purpose
Ranks feed items using algorithmic scoring for optimal engagement.

### Endpoint
```
POST https://your-project.vercel.app/api/rank-feed-page
```

### Request
```typescript
interface RankFeedRequest {
  campus_id: string;     // Campus UUID
  cursor?: string;       // Pagination cursor (score_id)
  limit?: number;        // Items per page (default: 10)
}
```

### Response
```typescript
interface RankFeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  is_stale: boolean;
}

interface FeedItem {
  id: string;
  type: 'heist' | 'poll' | 'moment' | 'squad_activity';
  score: number;
  created_at: string;
  campus_id: string;
  // ... type-specific fields
}
```

### Scoring Algorithm

```typescript
function calculateScore(item: any, now: number): number {
  const baseScores = {
    heist_reveal: 1_000_000,
    heist_voting: 900_000,
    poll: 800_000,
    moment: 700_000,
    squad_activity: 600_000,
  };
  
  let score = baseScores[item.type] || 0;
  
  if (item.type === 'heist') {
    if (item.status === 'revealed') {
      score += (new Date(item.submissions_close_at).getTime() - now) / 1000;
    } else if (item.status === 'voting') {
      score += (item.vote_velocity || 0) * 100;
    }
  } else if (item.type === 'poll') {
    score += (item.total_votes || 0) * 10;
    score += (now - new Date(item.created_at).getTime()) / 100;
    
    // 40/30/20/10 urgency boost
    const timeLeft = new Date(item.closes_at).getTime() - now;
    const duration = new Date(item.closes_at).getTime() - new Date(item.created_at).getTime();
    if (timeLeft < duration * 0.1) score += 50000;
    else if (timeLeft < duration * 0.3) score += 20000;
    else if (timeLeft < duration * 0.6) score += 10000;
  } else if (item.type === 'moment') {
    score += (item.reaction_count || 0) * 50;
    score += (item.view_count || 0) * 5;
    score += Math.max(0, 10000 - (now - new Date(item.created_at).getTime()) / 60000);
  } else if (item.type === 'squad_activity') {
    score += (item.squad_affinity || 0) * 100;
  }
  
  return score;
}
```

### Implementation
```typescript
// supabase/functions/rank-feed-page/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
import { feedCache } from '../_shared/cache.ts';

serve(async (req) => {
  const { campus_id, cursor, limit = 10 } = await req.json();
  
  // Cache key
  const cacheKey = feedCache.generateKey(['feed', campus_id, cursor || 'start', limit]);
  
  // ETag validation
  const ifNoneMatch = req.headers.get('If-None-Match');
  const cached = feedCache.get(cacheKey);
  
  if (cached && ifNoneMatch === cached.etag) {
    return new Response(null, { headers: corsHeaders, status: 304 });
  }

  if (cached) {
    const isStale = feedCache.isStale(cacheKey);
    const cacheHeaders = feedCache.getCacheHeaders(cached.etag, isStale);
    
    return new Response(JSON.stringify({
      items: cached.data.items || [],
      next_cursor: cached.data.next_cursor || null,
      is_stale: isStale,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...cacheHeaders },
      status: 200,
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const now = Date.now();
  const cursorScore = cursor ? parseFloat(cursor.split('_')[0]) : null;
  const cursorId = cursor ? cursor.split('_')[1] : null;

  // Fetch heists
  const { data: heists } = await supabase
    .from('heists')
    .select('*')
    .eq('campus_id', campus_id)
    .in('status', ['revealed', 'voting', 'won'])
    .order('revealed_at', { ascending: false })
    .limit(limit);

  // Fetch polls with options
  const { data: polls } = await supabase
    .from('polls')
    .select(`*, poll_options (*)`)
    .eq('campus_id', campus_id)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Fetch moments
  const { data: moments } = await supabase
    .from('moments')
    .select(`*, profiles:author_id (username, avatar_url)`)
    .eq('campus_id', campus_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit * 2);

  // Combine and score
  const items = [
    ...heists.map(h => ({ ...h, type: 'heist' })),
    ...polls.map(p => ({ ...p, type: 'poll' })),
    ...moments.map(m => ({
      ...m,
      type: 'moment',
      author_username: m.profiles?.username,
      author_avatar: m.profiles?.avatar_url,
    })),
  ]
  .map(item => ({ ...item, score: calculateScore(item, now) }))
  .sort((a, b) => b.score - a.score)
  .filter(item => {
    if (!cursorScore || !cursorId) return true;
    return item.score < cursorScore || (item.score === cursorScore && item.id < cursorId);
  })
  .slice(0, limit);

  const nextCursor = items.length > 0
    ? `${items[items.length - 1].score}_${items[items.length - 1].id}`
    : null;

  const result = { items, next_cursor: nextCursor, is_stale: false };
  
  // Cache result
  const etag = feedCache.set(cacheKey, result);
  const cacheHeaders = feedCache.getCacheHeaders(etag, false);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json', ...cacheHeaders },
    status: 200,
  });
});
```

### Caching Strategy
- **Cache Key**: `feed:{campus_id}:{cursor}:{limit}`
- **TTL**: 5 seconds (real-time feed)
- **Stale-while-revalidate**: 1 second
- **ETag**: For conditional requests

## Shared Cache Module

### Implementation
```typescript
// supabase/functions/_shared/cache.ts
interface CacheEntry {
  data: any;
  etag: string;
  timestamp: number;
}

class Cache {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5000; // 5 seconds
  private readonly STALE_TTL = 1000;   // 1 second stale

  generateKey(parts: string[]): string {
    return parts.filter(Boolean).join(':');
  }

  get(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): string {
    const etag = this.generateETag(data);
    this.cache.set(key, {
      data,
      etag,
      timestamp: Date.now(),
    });
    
    // Auto-expire
    setTimeout(() => this.cache.delete(key), ttl + this.STALE_TTL);
    
    return etag;
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    return age > this.DEFAULT_TTL;
  }

  getCacheHeaders(etag: string, isStale: boolean): Record<string, string> {
    return {
      'ETag': etag,
      'Cache-Control': `public, max-age=${this.DEFAULT_TTL / 1000}, stale-while-revalidate=${this.STALE_TTL / 1000}`,
      'X-Cache-Stale': isStale.toString(),
    };
  }

  private generateETag(data: any): string {
    return `"${btoa(JSON.stringify(data)).slice(0, 16)}"`;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const feedCache = new Cache();
export const geoCache = new Cache();
```

## Deployment

### Local Development

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Run function locally
vercel dev
```

### Production Deployment

```bash
# Deploy specific function
cd supabase/functions/geo-infer-campus
vercel deploy --prod

# Or deploy all functions
vercel deploy supabase/functions
```

### Environment Variables

Set in Vercel dashboard:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## Testing

### Local Testing

```bash
# Start local Supabase
supabase start

# Test geo-infer-campus
curl -X POST http://localhost:3000/api/geo-infer-campus \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0060}'

# Test rank-feed-page
curl -X POST http://localhost:3000/api/rank-feed-page \
  -H "Content-Type: application/json" \
  -d '{"campus_id": "your-campus-id", "limit": 10}'
```

### Production Testing

```bash
# Test with production URL
curl -X POST https://your-project.vercel.app/api/geo-infer-campus \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"zip": "10001"}'
```

## Performance Optimization

### Caching Best Practices
1. **Use appropriate TTLs**: 5s for feed, 24h for geo data
2. **Implement ETags**: Reduce bandwidth with 304 responses
3. **Cache warming**: Pre-populate cache for popular campuses
4. **Monitor cache hit rates**: Aim for >80% hit rate

### Database Optimization
1. **Use indexes**: All queries have proper indexes
2. **Limit results**: Always use `.limit()` to prevent over-fetching
3. **Select specific fields**: Avoid `select('*')` when possible
4. **Connection pooling**: Supabase handles this automatically

### Cold Start Mitigation
1. **Keep functions warm**: Use Vercel's Pro plan for warm functions
2. **Minimize dependencies**: Only import what you need
3. **Use edge runtime**: Faster cold starts than Node.js
4. **Cache external calls**: Reduce external API latency

## Monitoring

### Vercel Analytics
- Function invocations
- Cold start frequency
- Response times
- Error rates

### Custom Metrics
```typescript
// Add to functions
console.log(JSON.stringify({
  metric: 'function.invocation',
  function: 'geo-infer-campus',
  duration: Date.now() - startTime,
  cacheHit: cached !== null,
}));
```

## Error Handling

### Function-Level Errors
```typescript
try {
  // Function logic
} catch (error) {
  console.error('Function error:', error);
  return new Response(JSON.stringify({ error: 'Internal server error' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500,
  });
}
```

### Database Errors
```typescript
const { data, error } = await supabase.from('table').select('*');
if (error) {
  console.error('Database error:', error);
  return new Response(JSON.stringify({ error: 'Database error' }), {
    status: 500,
  });
}
```

## Security

### CORS Configuration
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### Authentication
```typescript
// Verify JWT token
const token = req.headers.get('Authorization')?.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
  });
}
```

### Rate Limiting
```typescript
// Implement rate limiting
const ip = req.headers.get('x-forwarded-for') || 'unknown';
const rateLimitKey = `rate_limit:${ip}:${functionName}`;
// Check against Redis or similar
```

## Best Practices

1. **Keep functions small**: Single responsibility per function
2. **Use TypeScript**: Type safety reduces errors
3. **Implement caching**: Dramatically improves performance
4. **Monitor performance**: Track cold starts and response times
5. **Handle errors gracefully**: Return meaningful error messages
6. **Use environment variables**: Never hardcode secrets
7. **Test locally**: Use `vercel dev` before deploying
8. **Version functions**: Use semantic versioning for breaking changes

## Troubleshooting

### Common Issues

**Cold Starts**
- Upgrade to Vercel Pro for warm functions
- Minimize bundle size
- Use edge runtime

**Database Timeouts**
- Increase statement timeout in Supabase
- Optimize queries with indexes
- Use connection pooling

**Cache Issues**
- Clear cache: `feedCache.clear()` or `geoCache.clear()`
- Check cache key generation
- Verify TTL settings

**CORS Errors**
- Verify CORS headers are set
- Check allowed origins
- Ensure preflight requests are handled

### Debug Mode
```typescript
const DEBUG = Deno.env.get('DEBUG') === 'true';

if (DEBUG) {
  console.log('Debug info:', { cacheKey, cacheSize: feedCache.size() });
}
```

## Future Enhancements

1. **AI-Powered Ranking**: Machine learning for personalized feeds
2. **Geofencing**: Precise campus boundaries
3. **Real-time Analytics**: Live engagement metrics
4. **A/B Testing**: Test different ranking algorithms
5. **Multi-region Support**: Deploy to multiple edge regions