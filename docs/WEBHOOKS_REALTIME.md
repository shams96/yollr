# Yollr Webhooks and Real-time Events Guide

## Overview

Yollr provides comprehensive real-time capabilities through Supabase Realtime and webhooks. This guide covers event subscriptions, webhook configurations, and real-time data synchronization patterns.

## Real-time Architecture

### Stack
- **Real-time Engine**: Supabase Realtime (WebSocket-based)
- **Webhook Delivery**: HTTP POST to configured endpoints
- **Event Types**: Database changes, custom events, system events
- **Delivery Guarantees**: At-least-once delivery with retries

### Event Flow
1. Database change occurs (INSERT, UPDATE, DELETE)
2. Supabase Realtime captures the change
3. Event is broadcast to subscribed clients
4. Webhook is triggered (if configured)
5. Client receives and processes the event

## Supabase Realtime

### Connection Setup

```typescript
// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createRealtimeClient = () => {
  const supabase = createClientComponentClient({
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limiting
      },
    },
  });
  
  return supabase;
};
```

### Basic Subscription

```typescript
// Subscribe to all changes on a table
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*', // 'INSERT', 'UPDATE', 'DELETE', '*'
    schema: 'public',
    table: 'moments',
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

### Campus-Specific Subscriptions

```typescript
// Subscribe to moments in user's campus
const campusId = 'your-campus-id';

const momentsChannel = supabase
  .channel('campus-moments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'moments',
    filter: `campus_id=eq.${campusId}`,
  }, (payload) => {
    const newMoment = payload.new;
    // Add to feed, show notification, etc.
    addMomentToFeed(newMoment);
  })
  .subscribe();
```

### Multi-Table Subscriptions

```typescript
// Subscribe to multiple tables
const feedChannel = supabase
  .channel('feed-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'moments',
    filter: `campus_id=eq.${campusId}`,
  }, handleNewMoment)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'polls',
    filter: `campus_id=eq.${campusId}`,
  }, handleNewPoll)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'heists',
    filter: `campus_id=eq.${campusId}`,
  }, handleHeistUpdate)
  .subscribe();
```

## Event Types

### Database Events

#### INSERT Events
```typescript
interface InsertPayload {
  eventType: 'INSERT';
  new: {
    // New record data
    id: string;
    created_at: string;
    // ... other fields
  };
  old: null;
  schema: 'public';
  table: string;
  commit_timestamp: string;
  errors: null;
}
```

#### UPDATE Events
```typescript
interface UpdatePayload {
  eventType: 'UPDATE';
  new: {
    // Updated record data
    id: string;
    updated_at: string;
    // ... other fields
  };
  old: {
    // Previous record data
    id: string;
    // ... previous field values
  };
  schema: 'public';
  table: string;
  commit_timestamp: string;
  errors: null;
}
```

#### DELETE Events
```typescript
interface DeletePayload {
  eventType: 'DELETE';
  new: null;
  old: {
    // Deleted record data
    id: string;
    // ... other fields
  };
  schema: 'public';
  table: string;
  commit_timestamp: string;
  errors: null;
}
```

### Custom Events

#### User Presence
```typescript
// Track user presence in real-time
const presenceChannel = supabase
  .channel('presence')
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    console.log('Online users:', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: 'user_id',
        status: 'online',
        last_seen: new Date().toISOString(),
      });
    }
  });
```

#### Broadcast Events
```typescript
// Send custom events
const broadcastChannel = supabase
  .channel('broadcast')
  .on('broadcast', { event: 'yollr-bell' }, (payload) => {
    console.log('Yollr Bell rang!', payload);
    showBellAnimation();
  })
  .subscribe();

// Broadcast an event
broadcastChannel.send({
  type: 'broadcast',
  event: 'yollr-bell',
  payload: { campus_id: 'campus_id', user_id: 'user_id' },
});
```

## Webhook Configuration

### Webhook Structure

```typescript
interface WebhookConfig {
  id: string;
  url: string;
  events: string[]; // Event types to subscribe to
  secret: string;   // For signature verification
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
  signature?: string;
}
```

### Creating Webhooks

```typescript
// Create a webhook programmatically
const createWebhook = async (config: {
  url: string;
  events: string[];
  secret: string;
}) => {
  const { data, error } = await supabase
    .from('webhooks')
    .insert([{
      url: config.url,
      events: config.events,
      secret: config.secret,
      active: true,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
```

### Webhook Events

#### Moment Events
```typescript
// moment.created
{
  "event": "moment.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "moment_id",
    "campus_id": "campus_id",
    "user_id": "user_id",
    "caption": "Amazing game!",
    "video_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
}

// moment.reacted
{
  "event": "moment.reacted",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "moment_id": "moment_id",
    "user_id": "user_id",
    "reaction_type": "fire",
    "reaction_count": 10
  }
}
```

#### Poll Events
```typescript
// poll.created
{
  "event": "poll.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "poll_id",
    "campus_id": "campus_id",
    "author_id": "user_id",
    "question": "Best dining hall?",
    "category": "food",
    "closes_at": "2024-01-02T00:00:00Z"
  }
}

// poll.voted
{
  "event": "poll.voted",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "poll_id": "poll_id",
    "user_id": "user_id",
    "option_id": "option_id",
    "total_votes": 43
  }
}

// poll.closed
{
  "event": "poll.closed",
  "timestamp": "2024-01-02T00:00:00Z",
  "data": {
    "poll_id": "poll_id",
    "winning_option_id": "option_id",
    "total_votes": 100
  }
}
```

#### Heist Events
```typescript
// heist.phase_changed
{
  "event": "heist.phase_changed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "heist_id": "heist_id",
    "previous_phase": "submitting",
    "new_phase": "voting",
    "campus_id": "campus_id"
  }
}

// heist.submission_created
{
  "event": "heist.submission_created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "submission_id",
    "heist_id": "heist_id",
    "user_id": "user_id",
    "title": "My submission",
    "total_submissions": 16
  }
}

// heist.winner_selected
{
  "event": "heist.winner_selected",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "heist_id": "heist_id",
    "winner_submission_id": "submission_id",
    "winner_user_id": "user_id",
    "total_votes": 150
  }
}
```

#### User Events
```typescript
// user.xp_earned
{
  "event": "user.xp_earned",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "user_id": "user_id",
    "xp_amount": 100,
    "source": "heist_vote",
    "total_xp": 1350,
    "new_level": false
  }
}

// user.streak_updated
{
  "event": "user.streak_updated",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "user_id": "user_id",
    "streak_type": "daily_login",
    "current_streak": 6,
    "longest_streak": 12
  }
}

// user.mystery_box_earned
{
  "event": "user.mystery_box_earned",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "user_id": "user_id",
    "box_type": "daily_bonus",
    "mystery_boxes_available": 3
  }
}
```

#### Campus Events
```typescript
// campus.engagement_milestone
{
  "event": "campus.engagement_milestone",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "campus_id": "campus_id",
    "milestone": "1000_users",
    "total_users": 1000,
    "active_users": 750
  }
}

// campus.yollr_bell
{
  "event": "campus.yollr_bell",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "campus_id": "campus_id",
    "triggered_by": "user_id",
    "reason": "game_night",
    "participating_users": 150
  }
}
```

## Webhook Security

### Signature Verification

```typescript
// Verify webhook signature
import { createHmac } from 'crypto';

const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
};

// Express.js middleware
const webhookMiddleware = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};
```

### Webhook Handler Example

```typescript
// Webhook endpoint handler
app.post('/webhooks/yollr', webhookMiddleware, (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'moment.created':
      handleMomentCreated(data);
      break;
    case 'poll.voted':
      handlePollVoted(data);
      break;
    case 'heist.winner_selected':
      handleHeistWinner(data);
      break;
    case 'user.xp_earned':
      handleXPEarned(data);
      break;
    default:
      console.log('Unhandled event:', event);
  }
  
  res.json({ received: true });
});
```

## Real-time Patterns

### Feed Updates

```typescript
// Real-time feed updates
const useRealtimeFeed = (campusId: string) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const supabase = createRealtimeClient();

  useEffect(() => {
    // Subscribe to new content
    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'moments',
        filter: `campus_id=eq.${campusId}`,
      }, (payload) => {
        setFeedItems(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'polls',
        filter: `campus_id=eq.${campusId}`,
      }, (payload) => {
        setFeedItems(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'heists',
        filter: `campus_id=eq.${campusId}`,
      }, (payload) => {
        // Update heist in feed
        setFeedItems(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);

  return feedItems;
};
```

### Live Poll Results

```typescript
// Real-time poll results
const useRealtimePoll = (pollId: string) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const supabase = createRealtimeClient();

  useEffect(() => {
    // Fetch initial poll data
    fetchPoll(pollId).then(setPoll);

    // Subscribe to vote updates
    const channel = supabase
      .channel(`poll-${pollId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'poll_votes',
        filter: `poll_id=eq.${pollId}`,
      }, (payload) => {
        // Update vote counts
        setPoll(prev => {
          if (!prev) return prev;
          const updatedOptions = prev.poll_options.map(option => 
            option.id === payload.new.option_id
              ? { ...option, vote_count: option.vote_count + 1 }
              : option
          );
          return {
            ...prev,
            poll_options: updatedOptions,
            total_votes: prev.total_votes + 1,
          };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  return poll;
};
```

### Heist Phase Notifications

```typescript
// Heist phase change notifications
const useHeistNotifications = (campusId: string) => {
  const supabase = createRealtimeClient();

  useEffect(() => {
    const channel = supabase
      .channel('heist-notifications')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'heists',
        filter: `campus_id=eq.${campusId}`,
      }, (payload) => {
        const { phase: oldPhase } = payload.old;
        const { phase: newPhase, title } = payload.new;
        
        // Show notification for phase changes
        if (oldPhase !== newPhase) {
          showNotification({
            title: 'Heist Update',
            message: `${title} is now in ${newPhase} phase!`,
            type: 'info',
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);
};
```

### User Presence

```typescript
// Show online users
const useCampusPresence = (campusId: string) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const supabase = createRealtimeClient();

  useEffect(() => {
    const channel = supabase
      .channel(`campus-${campusId}-presence`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat().map(p => p.user_id);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers(prev => [...prev, ...newPresences.map(p => p.user_id)]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setOnlineUsers(prev => prev.filter(id => 
          !leftPresences.some(p => p.user_id === id)
        ));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: 'current_user_id',
            campus_id: campusId,
            status: 'online',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);

  return onlineUsers;
};
```

## Performance Optimization

### Connection Management

```typescript
// Reuse connections
const supabase = createRealtimeClient();

// Batch subscriptions
const batchSubscribe = (channels: string[]) => {
  const channel = supabase.channel('batch');
  
  channels.forEach(ch => {
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: ch,
    }, handleChange);
  });
  
  channel.subscribe();
};

// Unsubscribe when not needed
useEffect(() => {
  const channel = supabase.channel('temp');
  // ... setup
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Event Filtering

```typescript
// Filter events on server side
const efficientSubscription = supabase
  .channel('filtered')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'moments',
    filter: `campus_id=eq.${campusId}`, // Server-side filtering
  }, handleNewMoment)
  .subscribe();
```

### Debounced Updates

```typescript
// Debounce rapid updates
const debouncedUpdate = useCallback(
  debounce((data) => {
    setState(data);
  }, 100),
  []
);

const channel = supabase
  .channel('debounced')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'moments',
  }, (payload) => {
    debouncedUpdate(payload.new);
  })
  .subscribe();
```

## Error Handling

### Connection Errors

```typescript
const channel = supabase
  .channel('with-error-handling')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'moments',
  }, handleChange)
  .subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log('Subscribed successfully');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Channel error:', err);
      // Retry logic
      setTimeout(() => channel.subscribe(), 5000);
    } else if (status === 'TIMED_OUT') {
      console.error('Connection timed out');
      // Reconnect
      channel.subscribe();
    } else if (status === 'CLOSED') {
      console.log('Channel closed');
    }
  });
```

### Reconnection Logic

```typescript
const useReliableSubscription = (config) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  const connect = () => {
    const channel = supabase.channel('reliable');
    
    channel.on('postgres_changes', config, handleChange);
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        // Exponential backoff
        setTimeout(connect, Math.min(30000, Math.pow(2, attempts) * 1000));
      }
    });
    
    channelRef.current = channel;
  };

  useEffect(() => {
    connect();
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, []);

  return isConnected;
};
```

## Testing Real-time Features

### Local Testing

```typescript
// Test subscription
const testSubscription = async () => {
  const channel = supabase.channel('test');
  let received = false;

  channel.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'moments',
  }, (payload) => {
    console.log('Received:', payload);
    received = true;
  });

  await channel.subscribe();

  // Insert test data
  await supabase.from('moments').insert([{
    campus_id: 'test-campus',
    user_id: 'test-user',
    video_url: 'test.mp4',
    source: 'camera',
  }]);

  // Wait for event
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Event received:', received);
  
  await channel.unsubscribe();
};
```

### Integration Tests

```typescript
// Jest test for real-time features
describe('Real-time feed', () => {
  it('should receive new moment events', async () => {
    const mockCallback = jest.fn();
    const channel = supabase.channel('test-feed');
    
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'moments',
    }, mockCallback);
    
    await channel.subscribe();
    
    // Insert test moment
    await supabase.from('moments').insert([{
      campus_id: 'test-campus',
      user_id: 'test-user',
      video_url: 'test.mp4',
      source: 'camera',
    }]);
    
    // Wait for event
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
    
    await channel.unsubscribe();
  });
});
```

## Best Practices

### 1. Connection Management
- Reuse Supabase client instances
- Unsubscribe when components unmount
- Implement reconnection logic
- Monitor connection status

### 2. Event Handling
- Filter events server-side when possible
- Debounce rapid updates
- Batch related updates
- Handle out-of-order events

### 3. Security
- Validate webhook signatures
- Use HTTPS for webhook endpoints
- Implement rate limiting
- Sanitize event data

### 4. Performance
- Subscribe only to necessary events
- Use server-side filtering
- Implement caching strategies
- Monitor event frequency

### 5. Error Handling
- Implement retry logic with backoff
- Handle connection timeouts
- Gracefully handle disconnections
- Log errors for monitoring

## Monitoring and Debugging

### Debug Mode

```typescript
// Enable debug logging
const supabase = createClientComponentClient({
  realtime: {
    logger: (kind, msg, data) => {
      console.log(`[${kind}] ${msg}`, data);
    },
  },
});
```

### Event Monitoring

```typescript
// Monitor all events
supabase.realtime.onOpen(() => console.log('Realtime connected'));
supabase.realtime.onClose(() => console.log('Realtime disconnected'));
supabase.realtime.onError((error) => console.error('Realtime error:', error));
```

### Performance Metrics

```typescript
// Track event latency
const trackEventLatency = (payload) => {
  const latency = Date.now() - new Date(payload.commit_timestamp).getTime();
  console.log(`Event latency: ${latency}ms`);
  
  // Send to analytics
  analytics.track('realtime.latency', { latency });
};
```

## Troubleshooting

### Common Issues

**Connection Fails**
- Check network connectivity
- Verify Supabase URL and keys
- Check for firewall blocking WebSockets
- Verify RLS policies allow access

**Events Not Received**
- Check subscription status
- Verify filter conditions
- Check for channel errors
- Verify database changes are committed

**High Latency**
- Check geographic distance to Supabase
- Optimize database queries
- Reduce payload size
- Implement client-side caching

**Memory Leaks**
- Unsubscribe on unmount
- Remove unused channels
- Limit number of subscriptions
- Clean up event listeners

### Debug Commands

```bash
# Check WebSocket connection
wscat -c "wss://your-project.supabase.co/realtime/v1/websocket?apikey=YOUR_KEY"

# Monitor network traffic
# Use browser DevTools Network tab to inspect WebSocket frames

# Test webhook endpoint
curl -X POST https://your-webhook-url.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: sha256=..." \
  -d '{"event":"test","data":{}}'
```

## Advanced Patterns

### Event Sourcing

```typescript
// Store events for audit trail
const storeEvent = async (event) => {
  await supabase.from('event_log').insert([{
    event_type: event.type,
    event_data: event.data,
    user_id: event.user_id,
    timestamp: new Date().toISOString(),
  }]);
};

// Replay events
const replayEvents = async (fromTimestamp) => {
  const { data: events } = await supabase
    .from('event_log')
    .select('*')
    .gte('timestamp', fromTimestamp)
    .order('timestamp');
  
  events.forEach(event => {
    applyEvent(event);
  });
};
```

### CQRS Pattern

```typescript
// Command side
const handleCommand = async (command) => {
  // Validate command
  // Update database
  // Emit events
  await supabase.from('commands').insert([command]);
};

// Query side
const handleQuery = async (query) => {
  // Read from materialized views
  // Return cached results
  return await supabase.from('query_views').select('*');
};

// Event handler
const handleEvent = async (event) => {
  // Update materialized views
  // Update caches
  // Send notifications
};
```

This comprehensive guide covers all aspects of real-time functionality in Yollr, from basic subscriptions to advanced patterns like event sourcing and CQRS.