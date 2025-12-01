# Yollr MVP - Vercel Deployment Guide

## Prerequisites
- GitHub account with your yollr repository pushed
- Vercel account (free)
- Supabase project credentials
- Environment variables ready

## Deployment Steps

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in
3. Click "Add New" → "Project"
4. Select "Continue with GitHub"
5. Authorize Vercel to access your GitHub account
6. Find and select `shams96/yollr` repository
7. Click "Import"

### 2. Configure Environment Variables

After importing, Vercel will ask for environment variables. Add these:

**Required for MVP (Supabase):**
```
NEXT_PUBLIC_SUPABASE_URL=https://wdpiwrdesqtlzsuxfkwc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_APP_URL=https://<your-vercel-project>.vercel.app
```

**Get these from:**
- Go to your Supabase project → Settings → API
- Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
- Copy "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
- Copy "service_role secret" → SUPABASE_SERVICE_ROLE_KEY

**Optional (for non-MVP features):**
- Firebase configuration (if using push notifications)
- Sentry configuration (if using error tracking)
- Mapbox token (if using enhanced geolocation)

### 3. Configure Vercel Settings

Before deploying, check these settings:

1. **Environment**: Node.js 20.x (default is fine)
2. **Build Command**: `npm run build` (default)
3. **Output Directory**: `.next` (default)
4. **Install Command**: `npm install --legacy-peer-deps` (update to this)

To update install command:
- Click "Settings" tab in your Vercel project
- Go to "Build & Development Settings"
- Update "Install Command" to: `npm install --legacy-peer-deps`
- Save

### 4. Deploy

1. After adding environment variables, click "Deploy"
2. Vercel will build and deploy automatically
3. Wait for deployment to complete (usually 2-3 minutes)
4. Get your project URL from the deployment page

### 5. Test Your Deployment

Once deployed, visit:
```
https://<your-vercel-project>.vercel.app/mvp/campus
```

Test these features:
- [ ] Campus selection page loads
- [ ] Feed page displays (infinite scroll)
- [ ] Create poll form works
- [ ] Vote on polls
- [ ] Record and upload moments
- [ ] Time-remaining displays correctly

### 6. Configure Cron Jobs (Optional)

Vercel cron jobs are configured in `vercel.json`. Current setup:
- **2am UTC**: Heist phase transitions
- **12pm UTC**: Yollr Bell (noon)
- **6pm UTC**: Yollr Bell (evening)

No additional setup needed - these will run automatically once deployed.

⚠️ **Note**: Hobby plan allows 1 daily cron. Upgrade to Pro for more frequent jobs.

### 7. Custom Domain (Optional)

To use a custom domain:
1. Click "Settings" in Vercel project
2. Go to "Domains"
3. Add your custom domain
4. Update DNS records according to Vercel's instructions

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Install command updated to use `--legacy-peer-deps`
- [ ] Deployment completes without errors
- [ ] MVP features work on live URL
- [ ] Campus isolation via RLS working
- [ ] 24-hour content expiry functioning
- [ ] Device ID persists across sessions

## Troubleshooting

### Build Fails
- Check logs in Vercel dashboard
- Ensure all environment variables are set
- Verify `--legacy-peer-deps` flag in install command

### Campus/Content Not Loading
- Verify `NEXT_PUBLIC_SUPABASE_URL` and anon key are correct
- Check Supabase RLS policies allow public read access
- Confirm your Supabase instance has seed data

### Cron Jobs Not Running
- Check Vercel Cron Monitoring in project settings
- Verify cron endpoint paths are correct (`/api/heist/cycle`, `/api/bell/trigger`)
- Ensure `CRON_SECRET` environment variable is set (if required by endpoints)

## Next Steps

After deployment:
1. Share MVP URL with users
2. Gather feedback
3. Implement Phase E (Drops) features
4. Monitor Vercel logs for errors
5. Set up error tracking with Sentry (optional)

## Support

- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
- Supabase docs: https://supabase.com/docs
