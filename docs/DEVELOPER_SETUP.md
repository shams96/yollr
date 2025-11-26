# Yollr Developer Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (comes with Node.js)
- **Git**: 2.30.0 or higher
- **Supabase CLI**: Latest version
- **Vercel CLI**: Latest version (for Edge Functions)

### Accounts Needed
- **Supabase Account**: [supabase.com](https://supabase.com) - Free tier works
- **Vercel Account**: [vercel.com](https://vercel.com) - For Edge Functions deployment
- **Firebase Account**: [firebase.google.com](https://firebase.google.com) - For push notifications
- **GitHub Account**: For version control and CI/CD

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd yollr
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Supabase client libraries
- Tailwind CSS for styling
- Testing frameworks (Jest, React Testing Library)

### 3. Environment Setup

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

# Firebase Cloud Messaging (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_firebase_vapid_key

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

### 4. Supabase Setup

#### Initialize Supabase Locally

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Initialize Supabase
supabase init

# Start local Supabase instance
supabase start
```

This will start:
- PostgreSQL database
- Auth service
- Storage service
- Realtime service
- Edge Functions runtime

#### Apply Database Schema

```bash
# Reset database and apply schema
supabase db reset

# Or manually apply schema
supabase migration up
```

The schema includes:
- All tables and enums
- Row Level Security policies
- Functions and triggers
- Indexes for performance

#### Verify Schema

```bash
# Connect to local database
supabase db connect

# Or use Supabase Studio (usually at http://localhost:54323)
```

### 5. Seed Initial Data

#### Seed Campus Data

```bash
npm run seed:campuses
```

This will populate the `campuses` table with major US colleges. You can add more campuses by creating a `data/colleges.csv` file:

```csv
name,short_name,city,state,zip_code,latitude,longitude,enrollment
University of Texas,UT,Austin,TX,78712,30.2849,-97.7341,51000
```

#### Create Admin User

```bash
# In Supabase SQL editor
INSERT INTO profiles (id, username, display_name, total_xp)
VALUES (
  'your-user-id-from-auth',
  'admin',
  'Admin User',
  0
);

INSERT INTO campus_memberships (user_id, campus_id, role)
VALUES (
  'your-user-id-from-auth',
  (SELECT id FROM campuses WHERE short_name = 'YOUR_CAMPUS'),
  'admin'
);
```

### 6. Edge Functions Setup

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy Edge Functions

```bash
# Deploy geo-infer-campus function
cd supabase/functions/geo-infer-campus
vercel deploy

# Deploy rank-feed-page function
cd supabase/functions/rank-feed-page
vercel deploy
```

#### Configure Environment Variables

In Vercel dashboard, add these environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Update Supabase Function URLs

In Supabase dashboard, go to Project Settings → Edge Functions and update the URLs for:
- `geo-infer-campus`
- `rank-feed-page`

### 7. Firebase Setup (Push Notifications)

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Cloud Messaging
4. Add web app to project

#### Configure Web Push

1. Generate VAPID key pair in Firebase Console
2. Add to `.env.local` as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
3. Configure `public/firebase-messaging-sw.js` with your Firebase config

#### Upload Service Worker

The service worker is already in `public/firebase-messaging-sw.js`. Firebase will automatically serve it.

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app should:
- Load the login page
- Show phone authentication
- Allow campus selection
- Display the feed (if authenticated)

## Development Workflow

### Project Structure

```
yollr/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── feed/              # Feed page
│   │   ├── login/             # Login page
│   │   └── onboarding/        # Onboarding flow
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── feed/              # Feed components
│   │   └── navigation/        # Navigation components
│   ├── lib/                   # Utilities and clients
│   │   ├── supabase/          # Supabase clients
│   │   ├── validation/        # Validation schemas
│   │   └── crdt/              # CRDT implementation
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── supabase/
│   ├── functions/             # Edge Functions
│   ├── schema.sql            # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
├── scripts/                  # Utility scripts
└── docs/                     # Documentation
```

### Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Testing
npm test                # Run all tests
npm test:watch         # Run tests in watch mode
npm test:coverage      # Run tests with coverage

# Supabase
npm run supabase:start  # Start local Supabase
npm run supabase:stop   # Stop local Supabase
npm run supabase:status # Check Supabase status

# Database
npm run db:reset        # Reset database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed data

# Edge Functions
npm run functions:dev   # Run functions locally
npm run functions:deploy # Deploy functions
```

### Code Style

We use:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Conventional Commits** for git commits

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit: `git commit -m "feat: add new feature"`
3. Push branch: `git push origin feature/your-feature-name`
4. Create pull request

## Testing

### Run Tests

```bash
# All tests
npm test

# Specific test file
npm test -- PhoneInput.test.tsx

# Watch mode
npm test:watch

# Coverage report
npm test:coverage
```

### Test Structure

```
src/__tests__/
├── app/                      # Page tests
├── components/              # Component tests
├── hooks/                   # Hook tests
└── lib/                     # Utility tests
```

### Writing Tests

Use React Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Debugging

### Enable Debug Logging

```bash
# In .env.local
NEXT_PUBLIC_DEBUG=true
```

### Common Issues

#### Supabase Connection Issues
```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start
```

#### Authentication Issues
```bash
# Check auth logs
supabase logs --target auth
```

#### Database Issues
```bash
# Connect to database
supabase db connect

# Check database logs
supabase logs --target db
```

### Browser DevTools

- **React DevTools**: Install browser extension
- **Redux DevTools**: If using state management
- **Network Tab**: Monitor API requests
- **Console**: Check for errors and warnings

## Environment-Specific Configuration

### Development

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
```

### Staging

```env
# .env.staging
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
```

### Production

```env
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

Vercel will automatically:
- Build the Next.js app
- Deploy Edge Functions
- Set up preview deployments

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm run start
```

## Monitoring

### Application Monitoring

Set up monitoring tools:

```bash
# Sentry for error tracking
npm install @sentry/nextjs

# LogRocket for session replay
npm install logrocket
```

### Database Monitoring

In Supabase dashboard:
- Query performance
- Connection pooling
- Storage usage
- Auth metrics

## Security Best Practices

### Environment Variables

Never commit sensitive keys:

```bash
# .gitignore
.env
.env.local
.env.production
.env.staging
```

### Row Level Security

All tables have RLS enabled. Test policies:

```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM moments; -- Should return 0 rows

-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM moments; -- Should return campus-specific rows
```

### API Keys

- Use ANON key for client-side operations
- Use SERVICE ROLE key for server-side operations only
- Rotate keys regularly
- Monitor key usage in Supabase dashboard

## Getting Help

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Yollr API Docs](./API.md)
- [Yollr Database Schema](./DATABASE_SCHEMA.md)

### Community
- [Yollr Discord](https://discord.gg/yollr)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/your-org/yollr/issues)

### Support
- Email: support@yollr.com
- Technical Issues: tech@yollr.com
- Security Issues: security@yollr.com

## Next Steps

After setup, explore:

1. **Authentication Flow**: Try phone OTP login
2. **Campus Selection**: Test geolocation-based campus detection
3. **Feed Features**: Post moments, create polls, participate in heists
4. **Gamification**: Earn XP, maintain streaks, open mystery boxes
5. **Real-time Features**: Test live feed updates and notifications

Happy coding! 🚀