# Yollr - Campus Social Feed

A gamified, vertical-only social feed PWA designed exclusively for college campuses. Built with Next.js 15, React 19, Supabase, and Vercel Edge Functions.

## 🎯 Overview

Yollr is a campus-first social platform that combines:
- **Single vertical feed** with algorithmic ranking (Heists > Polls > Moments)
- **Weekly Heists** - campus-wide challenges with submissions and voting
- **Real-time polls** with 40/30/20/10 urgency scoring
- **Gamification** - XP, streaks, mystery boxes, and leaderboards
- **Athletics mode** - game night features and squad competitions
- **PWA architecture** - offline support, push notifications, instant auth recovery

## 🏗️ Architecture

- **Frontend**: Next.js 15 App Router + React 19 + TypeScript
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime)
- **Edge Functions**: Vercel Edge Runtime for ranking, geolocation, and heist state machine
- **Real-time**: Supabase Realtime for feed updates and heist phases
- **Push Notifications**: Firebase Cloud Messaging
- **Database**: PostgreSQL with Row Level Security (RLS)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Vercel account (for Edge Functions)
- Firebase account (for push notifications)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd yollr
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Cloud Messaging
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key
```

### 3. Supabase Setup

Initialize Supabase locally:

```bash
npm run supabase:init
npm run supabase:start
```

Apply the database schema:

```bash
supabase db reset  # This will apply schema.sql
```

Or manually run the SQL in `supabase/schema.sql` via the Supabase dashboard.

### 4. Seed Campus Data

Run the campus seeding script to populate colleges:

```bash
npm run seed:campuses
```

This will insert major US colleges into the `campuses` table. You can add a `data/colleges.csv` file for more comprehensive data.

### 5. Deploy Edge Functions

Deploy the Edge Functions to Vercel:

```bash
# geo-infer-campus
vercel deploy supabase/functions/geo-infer-campus

# rank-feed-page
vercel deploy supabase/functions/rank-feed-page
```

Update your Supabase project settings to point to these functions.

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 PWA Setup

### Install as App

1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Or go to browser menu → "Install Yollr"

### Push Notifications

1. Enable notifications when prompted
2. The app will automatically subscribe to your campus topics
3. Test with: `supabase functions invoke broadcast-notification`

## 🔧 Development

### Project Structure

```
yollr/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/             # Supabase clients & utilities
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript types
├── supabase/
│   ├── functions/       # Edge Functions
│   └── schema.sql       # Database schema
├── public/              # Static assets & PWA files
├── scripts/             # Seed scripts
└── middleware.ts        # Auth & rate limiting
```

### Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Supabase
npm run supabase:start  # Start local Supabase
npm run supabase:stop   # Stop local Supabase

# Seeding
npm run seed:campuses   # Seed campus data

# Linting
npm run lint            # Run ESLint
```

### Database Migrations

Create a new migration:

```bash
supabase migration new <migration_name>
```

Apply migrations:

```bash
supabase db push
```

## 🎮 Features Implementation Status

### Core Features ✅
- [x] Phone OTP authentication
- [x] Campus geolocation & selection
- [x] Feed with ranking algorithm
- [x] Moment capture & upload
- [x] Poll creation & voting
- [x] Weekly Heist system
- [x] XP & streak tracking
- [x] Leaderboards
- [x] Squad system
- [x] Push notifications
- [x] PWA installation
- [x] Offline support

### Advanced Features 🚧
- [ ] Athletics mode (game night features)
- [ ] Mystery boxes
- [ ] Sponsor offers
- [ ] Advanced moderation dashboard
- [ ] Analytics pipeline
- [ ] Video transcoding
- [ ] Rivalry week features

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel will automatically:
- Build the Next.js app
- Deploy Edge Functions
- Set up preview deployments

### Supabase Production

1. Go to Supabase dashboard
2. Connect your GitHub repo
3. Enable Branching for preview environments
4. Set up production branch

### Firebase Setup

1. Create Firebase project
2. Enable Cloud Messaging
3. Add web app to Firebase
4. Copy config to `.env.local`
5. Upload `firebase-messaging-sw.js` to public folder

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS policies enabled:

- **Campus isolation**: Users only see content from their campus
- **User ownership**: Users can only modify their own content
- **Moderator roles**: Campus moderators can delete inappropriate content
- **Rate limiting**: 60 req/min per IP, 10 writes/min per user

### Environment Variables

Never commit sensitive keys:

```bash
# Add to .gitignore
.env
.env.local
.env.production
```

## 📊 Analytics

Track user engagement with the analytics pipeline:

```typescript
// Example analytics event
import { logEvent } from '@/lib/analytics';

logEvent('moment_post', {
  campus_id: '...',
  has_caption: true,
  media_size_mb: 2.4,
});
```

Events are batched and stored in `analytics_events` table.

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot find module" errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Supabase connection issues**
- Check `.env.local` credentials
- Ensure Supabase is running: `npm run supabase:start`
- Verify network access to Supabase

**3. Edge Functions not working**
- Check Vercel deployment logs
- Verify environment variables in Vercel
- Test locally: `vercel dev`

**4. PWA not installing**
- Check `manifest.json` is valid
- Ensure HTTPS (required for PWA)
- Verify service worker is registered

**5. Push notifications not working**
- Check Firebase configuration
- Verify VAPID keys match
- Test with `supabase functions invoke`

### Getting Help

- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)
- Open an issue in this repository

## 📈 Performance

### Optimizations Applied

- **Edge caching**: Feed responses cached 5s at edge
- **Partial indexes**: Hot path queries optimized
- **Connection pooling**: PgBouncer for Supabase
- **Lazy loading**: Images and videos load on demand
- **Virtual scrolling**: Feed uses windowing for large lists
- **CRDT merges**: Real-time updates without full refetch

### Benchmarks

- **TTFB**: < 100ms (edge cached)
- **LCP**: < 1.5s (optimized images)
- **FID**: < 100ms (no main thread blocking)
- **CLS**: < 0.1 (stable layout)

## 🎓 Campus Onboarding

### For New Campuses

1. Add campus to `campuses` table
2. Set up rivalries in `rival_campus_id`
3. Configure athletics events
4. Invite initial users
5. Run first heist to kickstart engagement

### Growth Tips

- Target orientation week for maximum adoption
- Partner with student organizations
- Use Yollr Bell for hype moments (games, events)
- Gamify onboarding with XP bonuses

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Phase 1 Complete** ✅ - Ready for Phase 2 implementation

Built with ❤️ for campus communities