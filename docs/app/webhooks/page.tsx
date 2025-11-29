import { Zap, Code, Shield, Webhook, Activity, Bell } from 'lucide-react'

const sections = [
  {
    id: 'overview',
    title: 'Real-time Architecture',
    icon: Zap,
    content: [
      'Yollr provides comprehensive real-time capabilities through Supabase Realtime and webhooks. The stack includes WebSocket-based subscriptions, HTTP POST webhooks, and at-least-once delivery guarantees.',
      'Event Flow: Database change → Supabase Realtime → Client subscription → Webhook trigger (if configured)'
    ]
  },
  {
    id: 'subscriptions',
    title: 'Supabase Realtime',
    icon: Activity,
    subsections: [
      {
        title: 'Basic Subscription',
        code: `const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'moments',
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();`
      },
      {
        title: 'Campus-Specific Subscriptions',
        code: `const momentsChannel = supabase
  .channel('campus-moments')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'moments',
    filter: \`campus_id=eq.\${campusId}\`,
  }, (payload) => {
    addMomentToFeed(payload.new);
  })
  .subscribe();`
      },
      {
        title: 'Multi-Table Subscriptions',
        code: `const feedChannel = supabase
  .channel('feed-updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'moments',
    filter: \`campus_id=eq.\${campusId}\`,
  }, handleNewMoment)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'polls',
    filter: \`campus_id=eq.\${campusId}\`,
  }, handleNewPoll)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'heists',
    filter: \`campus_id=eq.\${campusId}\`,
  }, handleHeistUpdate)
  .subscribe();`
      }
    ]
  },
  {
    id: 'webhooks',
    title: 'Webhook Configuration',
    icon: Webhook,
    content: [
      'Webhooks provide server-to-server notifications for important events. Configure webhooks to receive real-time updates about user actions, content creation, and system events.'
    ],
    configuration: {
      structure: {
        id: 'string',
        url: 'string',
        events: 'string[]',
        secret: 'string',
        active: 'boolean'
      },
      creation: `const createWebhook = async (config) => {
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
  
  return data;
};`
    }
  },
  {
    id: 'events',
    title: 'Event Types',
    icon: Bell,
    categories: [
      {
        name: 'Moment Events',
        events: [
          {
            name: 'moment.created',
            description: 'New moment posted',
            payload: `{
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
}`
          },
          {
            name: 'moment.reacted',
            description: 'New reaction added to moment',
            payload: `{
  "event": "moment.reacted",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "moment_id": "moment_id",
    "user_id": "user_id",
    "reaction_type": "fire",
    "reaction_count": 10
  }
}`
          }
        ]
      },
      {
        name: 'Poll Events',
        events: [
          {
            name: 'poll.created',
            description: 'New poll created',
            payload: `{
  "event": "poll.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "poll_id",
    "campus_id": "campus_id",
    "question": "Best dining hall?",
    "category": "food",
    "closes_at": "2024-01-02T00:00:00Z"
  }
}`
          },
          {
            name: 'poll.voted',
            description: 'User voted in poll',
            payload: `{
  "event": "poll.voted",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "poll_id": "poll_id",
    "user_id": "user_id",
    "option_id": "option_id",
    "total_votes": 43
  }
}`
          }
        ]
      },
      {
        name: 'Heist Events',
        events: [
          {
            name: 'heist.phase_changed',
            description: 'Heist phase updated',
            payload: `{
  "event": "heist.phase_changed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "heist_id": "heist_id",
    "previous_phase": "submitting",
    "new_phase": "voting",
    "campus_id": "campus_id"
  }
}`
          },
          {
            name: 'heist.winner_selected',
            description: 'Heist winner chosen',
            payload: `{
  "event": "heist.winner_selected",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "heist_id": "heist_id",
    "winner_submission_id": "submission_id",
    "winner_user_id": "user_id",
    "total_votes": 150
  }
}`
          }
        ]
      },
      {
        name: 'User Events',
        events: [
          {
            name: 'user.xp_earned',
            description: 'User earned XP',
            payload: `{
  "event": "user.xp_earned",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "user_id": "user_id",
    "xp_amount": 100,
    "source": "heist_vote",
    "total_xp": 1350,
    "new_level": false
  }
}`
          },
          {
            name: 'user.streak_updated',
            description: 'User streak changed',
            payload: `{
  "event": "user.streak_updated",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "user_id": "user_id",
    "streak_type": "daily_login",
    "current_streak": 6,
    "longest_streak": 12
  }
}`
          }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Webhook Security',
    icon: Shield,
    content: [
      'All webhooks include signature verification to ensure authenticity and prevent replay attacks.'
    ],
    security: {
      verification: `// Verify webhook signature
import { createHmac } from 'crypto';

const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === \`sha256=\${expectedSignature}\`;
};`,
      middleware: `// Express.js middleware
const webhookMiddleware = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};`,
      handler: `// Webhook endpoint handler
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
    default:
      console.log('Unhandled event:', event);
  }
  
  res.json({ received: true });
});`
    }
  },
  {
    id: 'patterns',
    title: 'Real-time Patterns',
    icon: Code,
    patterns: [
      {
        name: 'Feed Updates',
        description: 'Real-time feed updates with subscription management',
        code: `const useRealtimeFeed = (campusId: string) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const supabase = createRealtimeClient();

  useEffect(() => {
    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'moments',
        filter: \`campus_id=eq.\${campusId}\`,
      }, (payload) => {
        setFeedItems(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campusId]);

  return feedItems;
};`
      },
      {
        name: 'Live Poll Results',
        description: 'Real-time poll result updates',
        code: `const useRealtimePoll = (pollId: string) => {
  const [poll, setPoll] = useState<Poll | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(\`poll-\${pollId}\`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'poll_votes',
        filter: \`poll_id=eq.\${pollId}\`,
      }, (payload) => {
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
};`
      }
    ]
  }
]

export default function WebhooksRealtimeDocs() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Webhooks & Real-time Events
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Real-time capabilities and webhook integrations for Yollr platform
          </p>
        </div>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center mb-6">
                <section.icon className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="prose prose-lg max-w-none">
                {section.content?.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 mb-4">{paragraph}</p>
                ))}
              </div>

              {section.subsections && (
                <div className="mt-8 space-y-8">
                  {section.subsections.map((subsection) => (
                    <div key={subsection.title} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{subsection.title}</h3>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                          <code>{subsection.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.configuration && (
                <div className="mt-8 space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Structure</h3>
                    <div className="bg-gray-50 rounded p-4">
                      {Object.entries(section.configuration.structure).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <code className="text-sm font-mono text-blue-600">{key}</code>
                          <span className="text-sm text-gray-600 ml-2">- {value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Creating Webhooks</h3>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{section.configuration.creation}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {section.categories && (
                <div className="mt-8 space-y-8">
                  {section.categories.map((category) => (
                    <div key={category.name} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h3>
                      <div className="space-y-6">
                        {category.events.map((event) => (
                          <div key={event.name} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                            <h4 className="font-medium text-gray-900">{event.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="mt-3 bg-gray-900 rounded-lg p-3 overflow-x-auto">
                              <pre className="text-xs text-gray-100">
                                <code>{event.payload}</code>
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.security && (
                <div className="mt-8 space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature Verification</h3>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{section.security.verification}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Middleware Example</h3>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{section.security.middleware}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Handler Example</h3>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-100">
                        <code>{section.security.handler}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {section.patterns && (
                <div className="mt-8 space-y-6">
                  {section.patterns.map((pattern) => (
                    <div key={pattern.name} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{pattern.name}</h3>
                      <p className="text-gray-600 mb-4">{pattern.description}</p>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-100">
                          <code>{pattern.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}