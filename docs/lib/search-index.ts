export interface SearchItem {
  title: string
  description: string
  url: string
  type: 'page' | 'section'
  section?: string
}

export const searchIndex: SearchItem[] = [
  // Home Page
  {
    title: 'Yollr Platform Documentation',
    description: 'Complete API documentation and developer guides for building gamified campus social experiences',
    url: '/',
    type: 'page'
  },
  {
    title: 'Platform Overview',
    description: 'Yollr is a gamified campus social platform with single vertical feed, weekly heists, real-time polls, and comprehensive gamification features',
    url: '/#overview',
    type: 'section',
    section: 'Overview'
  },
  {
    title: 'Key Features',
    description: 'Single vertical feed, weekly heists, real-time polls, gamification, campus isolation, real-time updates',
    url: '/#features',
    type: 'section',
    section: 'Features'
  },
  {
    title: 'Technology Stack',
    description: 'Next.js 15, React 19, TypeScript, Supabase, Vercel Edge Runtime, Phone-based OTP authentication',
    url: '/#tech-stack',
    type: 'section',
    section: 'Technology Stack'
  },

  // API Documentation
  {
    title: 'API Documentation',
    description: 'Complete reference for Yollr platform APIs with endpoints, authentication, and integration patterns',
    url: '/api',
    type: 'page'
  },
  {
    title: 'API Overview',
    description: 'Base URL, authentication requirements, and API structure',
    url: '/api#overview',
    type: 'section',
    section: 'Overview'
  },
  {
    title: 'API Authentication',
    description: 'JWT token authentication with Supabase Auth',
    url: '/api#authentication',
    type: 'section',
    section: 'Authentication'
  },
  {
    title: 'API Endpoints',
    description: 'Complete list of API endpoints for authentication, campus management, feed, polls, heists, and more',
    url: '/api#endpoints',
    type: 'section',
    section: 'Endpoints'
  },
  {
    title: 'Real-time Subscriptions',
    description: 'WebSocket-based real-time updates for feed and heist changes',
    url: '/api#realtime',
    type: 'section',
    section: 'Real-time'
  },
  {
    title: 'SDK Examples',
    description: 'JavaScript/TypeScript, Python, and cURL examples for API usage',
    url: '/api#sdks',
    type: 'section',
    section: 'SDK Examples'
  },

  // Authentication
  {
    title: 'Authentication Guide',
    description: 'Complete guide to implementing phone-based OTP authentication with Supabase Auth',
    url: '/authentication',
    type: 'page'
  },
  {
    title: 'Authentication Overview',
    description: 'Supabase Auth with phone OTP, JWT tokens, and Row Level Security',
    url: '/authentication#overview',
    type: 'section',
    section: 'Overview'
  },
  {
    title: 'Authentication Flow',
    description: 'Step-by-step phone OTP flow from user input to session creation',
    url: '/authentication#flow',
    type: 'section',
    section: 'Authentication Flow'
  },
  {
    title: 'Phone Number Format',
    description: 'E.164 format support for 20+ countries with automatic detection',
    url: '/authentication#phone-format',
    type: 'section',
    section: 'Phone Format'
  },
  {
    title: 'Security Measures',
    description: 'Rate limiting, phone validation, session management, and RLS policies',
    url: '/authentication#security',
    type: 'section',
    section: 'Security'
  },
  {
    title: 'Implementation Example',
    description: 'Code examples for sending and verifying OTP codes',
    url: '/authentication#implementation',
    type: 'section',
    section: 'Implementation'
  },
  {
    title: 'Authentication Best Practices',
    description: 'Security, user experience, and performance best practices',
    url: '/authentication#best-practices',
    type: 'section',
    section: 'Best Practices'
  },

  // Database Schema
  {
    title: 'Database Schema',
    description: 'Comprehensive PostgreSQL schema documentation with tables, enums, and relationships',
    url: '/database',
    type: 'page'
  },
  {
    title: 'Database Overview',
    description: 'PostgreSQL with Supabase, extensions, and schema design',
    url: '/database#overview',
    type: 'section',
    section: 'Overview'
  },
  {
    title: 'Enum Types',
    description: 'Custom enum types for sport types, campus types, heist phases, and reaction types',
    url: '/database#enums',
    type: 'section',
    section: 'Enum Types'
  },
  {
    title: 'Core Tables',
    description: 'profiles, campuses, campus_memberships tables and relationships',
    url: '/database#core-tables',
    type: 'section',
    section: 'Core Tables'
  },
  {
    title: 'Content Tables',
    description: 'moments, polls, heists tables for user-generated content',
    url: '/database#content-tables',
    type: 'section',
    section: 'Content Tables'
  },
  {
    title: 'Gamification Tables',
    description: 'user_xp, streaks, mystery_boxes tables for gamification features',
    url: '/database#gamification',
    type: 'section',
    section: 'Gamification'
  },
  {
    title: 'Row Level Security',
    description: 'RLS policies for campus isolation and data security',
    url: '/database#rls',
    type: 'section',
    section: 'Row Level Security'
  },

  // Edge Functions
  {
    title: 'Edge Functions',
    description: 'High-performance serverless functions for campus detection and feed ranking',
    url: '/edge-functions',
    type: 'page'
  },
  {
    title: 'Edge Functions Overview',
    description: 'Vercel Edge Runtime with sub-100ms global response times',
    url: '/edge-functions#overview',
    type: 'section',
    section: 'Overview'
  },
  {
    title: 'geo-infer-campus Function',
    description: 'Campus detection from location or ZIP code with caching',
    url: '/edge-functions#geo-infer-campus',
    type: 'section',
    section: 'geo-infer-campus'
  },
  {
    title: 'rank-feed-page Function',
    description: 'Algorithmic feed ranking with scoring system',
    url: '/edge-functions#rank-feed-page',
    type: 'section',
    section: 'rank-feed-page'
  },
  {
    title: 'Caching Strategy',
    description: 'In-memory caching with ETag support and TTL configuration',
    url: '/edge-functions#caching',
    type: 'section',
    section: 'Caching'
  },
  {
    title: 'Edge Function Deployment',
    description: 'Local development and production deployment instructions',
    url: '/edge-functions#deployment',
    type: 'section',
    section: 'Deployment'
  },

  // Webhooks & Real-time
  {
    title: 'Webhooks & Real-time Events',
    description: 'Real-time capabilities and webhook integrations for live updates',
    url: '/webhooks',
    type: 'page'
  },
  {
    title: 'Real-time Architecture',
    description: 'Supabase Realtime with WebSocket subscriptions and webhook delivery',
    url: '/webhooks#overview',
    type: 'section',
    section: 'Architecture'
  },
  {
    title: 'Supabase Realtime',
    description: 'WebSocket-based subscriptions for database changes',
    url: '/webhooks#subscriptions',
    type: 'section',
    section: 'Subscriptions'
  },
  {
    title: 'Webhook Configuration',
    description: 'Server-to-server notifications with signature verification',
    url: '/webhooks#webhooks',
    type: 'section',
    section: 'Webhooks'
  },
  {
    title: 'Event Types',
    description: 'Moment, poll, heist, and user events with payload examples',
    url: '/webhooks#events',
    type: 'section',
    section: 'Event Types'
  },
  {
    title: 'Webhook Security',
    description: 'Signature verification and middleware implementation',
    url: '/webhooks#security',
    type: 'section',
    section: 'Security'
  },
  {
    title: 'Real-time Patterns',
    description: 'Feed updates, live polls, and heist notifications patterns',
    url: '/webhooks#patterns',
    type: 'section',
    section: 'Patterns'
  },

  // Developer Setup
  {
    title: 'Developer Setup Guide',
    description: 'Step-by-step guide to set up Yollr development environment',
    url: '/setup',
    type: 'page'
  },
  {
    title: 'Prerequisites',
    description: 'System requirements and required accounts for development',
    url: '/setup#prerequisites',
    type: 'section',
    section: 'Prerequisites'
  },
  {
    title: 'Quick Start',
    description: '5-step process to get started with Yollr development',
    url: '/setup#quick-start',
    type: 'section',
    section: 'Quick Start'
  },
  {
    title: 'Environment Variables',
    description: 'Supabase, Firebase, and optional analytics configuration',
    url: '/setup#environment',
    type: 'section',
    section: 'Environment Variables'
  },
  {
    title: 'Key Commands',
    description: 'Development, testing, Supabase, and database commands',
    url: '/setup#commands',
    type: 'section',
    section: 'Commands'
  },
  {
    title: 'Project Structure',
    description: 'Complete Yollr project directory structure and organization',
    url: '/setup#structure',
    type: 'section',
    section: 'Project Structure'
  },

  // Error Handling
  {
    title: 'Error Handling & Troubleshooting',
    description: 'Comprehensive guide to debugging and resolving common issues',
    url: '/errors',
    type: 'page'
  },
  {
    title: 'Quick Troubleshooting',
    description: '5-step debugging process for common issues',
    url: '/errors#troubleshooting',
    type: 'section',
    section: 'Troubleshooting'
  },
  {
    title: 'Authentication Errors',
    description: 'Phone OTP, session management, and rate limiting errors',
    url: '/errors#authentication',
    type: 'section',
    section: 'Authentication Errors'
  },
  {
    title: 'Database & RLS Errors',
    description: 'Permission denied, constraint violations, and JWT issues',
    url: '/errors#database',
    type: 'section',
    section: 'Database Errors'
  },
  {
    title: 'API & Edge Function Errors',
    description: 'Timeouts, rate limits, and storage errors',
    url: '/errors#api',
    type: 'section',
    section: 'API Errors'
  },
  {
    title: 'Real-time & Webhook Errors',
    description: 'WebSocket disconnections and webhook delivery failures',
    url: '/errors#realtime',
    type: 'section',
    section: 'Real-time Errors'
  },
  {
    title: 'Client-Side Errors',
    description: 'Network issues, storage, and permission errors',
    url: '/errors#client',
    type: 'section',
    section: 'Client Errors'
  },
  {
    title: 'Debugging Tools',
    description: 'Supabase debug mode and common debug commands',
    url: '/errors#debugging',
    type: 'section',
    section: 'Debugging Tools'
  },

  // Support
  {
    title: 'Support & Resources',
    description: 'Get help with Yollr platform development and integration',
    url: '/support',
    type: 'page'
  },
  {
    title: 'Support Channels',
    description: 'Discord community, email support, GitHub issues, and documentation',
    url: '/support#channels',
    type: 'section',
    section: 'Support Channels'
  },
  {
    title: 'FAQ - Getting Started',
    description: 'Common questions about setup, prerequisites, and first steps',
    url: '/support#faq-getting-started',
    type: 'section',
    section: 'FAQ Getting Started'
  },
  {
    title: 'FAQ - Authentication',
    description: 'Phone OTP, security, session management, and rate limiting questions',
    url: '/support#faq-authentication',
    type: 'section',
    section: 'FAQ Authentication'
  },
  {
    title: 'FAQ - Technical Issues',
    description: 'Database, API, real-time, and deployment troubleshooting',
    url: '/support#faq-technical',
    type: 'section',
    section: 'FAQ Technical'
  },
  {
    title: 'FAQ - Features',
    description: 'Heists, polls, moments, gamification, and campus features',
    url: '/support#faq-features',
    type: 'section',
    section: 'FAQ Features'
  },
  {
    title: 'Additional Resources',
    description: 'Video tutorials, code examples, API reference, and community resources',
    url: '/support#resources',
    type: 'section',
    section: 'Additional Resources'
  }
]

export const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'description', weight: 0.3 }
  ],
  includeScore: true,
  threshold: 0.4,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: true
}