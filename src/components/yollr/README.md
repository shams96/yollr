# Yollr UI Component Library

Complete viral social app UI system following 2025/26 web trends.

## 🎨 Design System

### Colors
- **Midnight**: `#0B0B0E` - Primary background
- **Electric Peach**: `#FF8E71` - Primary accent
- **Cosmic Pink**: `#FF4BAA` - Secondary accent
- **Neon Lime**: `#C8FF38` - Tertiary accent

### Typography
- **Font**: Inter (400, 500, 600, 700)
- **Headings**: Semibold, tight leading
- **Body**: Regular, relaxed leading
- **Metadata**: Medium, uppercase tracking

### Effects
- **Glass-Matte**: Translucent cards with backdrop-blur
- **Gradient Borders**: 1px borders with color gradients
- **Soft Shadows**: Layered shadow system
- **Glow Effects**: Colored shadows for important elements

---

## 📦 Components

### Feed Cards

#### MomentCard
BeReal-style video moment card with reactions.

```tsx
import { MomentCard } from '@/components/yollr';

<MomentCard
  id="moment-1"
  username="sarah_j"
  displayName="Sarah Johnson"
  videoUrl="/moments/1.mp4"
  thumbnailUrl="https://..."
  caption="Study session 📚"
  reactions={{ fire: 45, cry: 12, lightbulb: 8, star: 23 }}
  commentCount={17}
  createdAt="2024-01-01T12:00:00Z"
  tags={['studylife', 'finals']}
  isBellMoment
/>
```

**Features:**
- 15-sec video preview
- 4 reaction types (🔥 😭 💡 ⭐)
- Comment count
- Bell badge for Yollr Bell moments
- Tag display
- Time ago display

---

#### PollCard
Interactive poll with real-time vote visualization.

```tsx
import { PollCard } from '@/components/yollr';

<PollCard
  id="poll-1"
  question="Best dining hall?"
  options={[
    { id: '1', text: 'North Campus', voteCount: 124, percentage: 45 },
    { id: '2', text: 'South Hall', voteCount: 89, percentage: 32 },
  ]}
  totalVotes={276}
  endsAt="2024-01-01T18:00:00Z"
  hasVoted={false}
  onVote={(optionId) => console.log('Voted:', optionId)}
/>
```

**Features:**
- Real-time percentage bars
- Vote locking after selection
- Countdown timer
- Result visualization
- Disabled state when expired

---

#### HeistOfTheWeekCard
Hero challenge card with phase indicators.

```tsx
import { HeistOfTheWeekCard } from '@/components/yollr';

<HeistOfTheWeekCard
  id="heist-1"
  title="Campus Halloween Takeover"
  description="Design the most epic Halloween event..."
  phase="submissions" // 'reveal' | 'submissions' | 'voting' | 'execution'
  prize="$5,000 Event Budget"
  phaseEndsAt="2024-01-03T00:00:00Z"
  submissionCount={47}
  participantCount={312}
  onSubmit={() => console.log('Submit')}
/>
```

**Features:**
- 4 phase states with different CTAs
- Prize display with gold styling
- Countdown timer
- Participant stats
- Phase-specific colors and actions

---

#### AthleticsCountdownCard
Live game countdown with squad participation.

```tsx
import { AthleticsCountdownCard } from '@/components/yollr';

<AthleticsCountdownCard
  id="athletics-1"
  sportType="basketball" // 'football' | 'basketball' | 'soccer' | etc.
  opponent="State University"
  gameTime="2024-01-05T19:00:00Z"
  location="Campus Arena"
  homeTeam="Your University"
  awayTeam="State University"
  squadCount={12}
  isRivalry
/>
```

**Features:**
- Live countdown (days:hours:min:sec)
- Sport-specific emojis and colors
- Rivalry week badge
- Squad join button
- Notification bell

---

#### LeaderboardSnippetCard
XP leaderboard preview with rankings.

```tsx
import { LeaderboardSnippetCard } from '@/components/yollr';

<LeaderboardSnippetCard
  topUsers={[
    {
      rank: 1,
      userId: '1',
      username: 'alex_star',
      displayName: 'Alex Rodriguez',
      xp: 2450,
      level: 24,
      trend: 'up',
    },
    // ... more users
  ]}
  userEntry={{
    rank: 42,
    userId: 'current',
    username: 'you',
    displayName: 'You',
    xp: 750,
    level: 12,
    trend: 'up',
  }}
  type="weekly" // 'weekly' | 'legacy'
/>
```

**Features:**
- Top 3 medal display
- User's current rank
- Trend indicators
- Weekly vs Legacy toggle

---

#### MysteryBoxCard
Animated gamification reward box.

```tsx
import { MysteryBoxCard } from '@/components/yollr';

<MysteryBoxCard
  id="box-1"
  canOpen={true}
  requiresLevel={10}
  userLevel={12}
  onOpen={() => console.log('Opening box...')}
/>
```

**Features:**
- Shake animation on hover
- Sparkle effects
- Level gate system
- Glow when available
- Lock overlay when unavailable

---

### Modals

#### MomentCaptureModal
Full-screen camera capture interface.

```tsx
import { MomentCaptureModal } from '@/components/yollr';

<MomentCaptureModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onCapture={async (videoBlob, caption, tags) => {
    // Upload video
    await uploadMoment(videoBlob, caption, tags);
  }}
  isBellMoment
  autoTags={['yollrbell']}
/>
```

**Features:**
- 15-second recording limit
- Flip camera (front/back)
- Timer display
- Preview with retake
- Caption input
- Upload progress

---

#### HeistDetailsModal
Full heist challenge details with rules.

```tsx
import { HeistDetailsModal } from '@/components/yollr';

<HeistDetailsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  heist={{
    id: 'heist-1',
    title: 'Halloween Takeover',
    description: 'Short description',
    fullDescription: 'Long description with all details...',
    prize: '$5,000 Budget',
    phase: 'submissions',
    phaseEndsAt: '2024-01-03T00:00:00Z',
    rules: ['Must be campus-wide', 'No alcohol', ...],
    guardrails: ['Safe for all students', 'No vandalism', ...],
    submissionCount: 47,
    participantCount: 312,
  }}
  onSubmit={() => console.log('Submit')}
/>
```

**Features:**
- Hero image
- Prize display
- Rules checklist
- Guardrails warnings
- Stats display
- Phase-specific CTA

---

#### VotingModal
Heist submission voting interface.

```tsx
import { VotingModal } from '@/components/yollr';

<VotingModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  heistTitle="Campus Halloween Takeover"
  submissions={submissions}
  votesRemaining={3}
  onVote={async (submissionId) => {
    await castVote(submissionId);
  }}
/>
```

**Features:**
- Submission grid
- Vote count display
- Vote confirmation
- Top 10 ranking
- Vote tracking
- Disable when no votes left

---

#### SquadsModal
Squad management and discovery.

```tsx
import { SquadsModal } from '@/components/yollr';

<SquadsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  squads={squads}
  userSquads={['squad-1', 'squad-2']}
  onJoinSquad={async (squadId) => {
    await joinSquad(squadId);
  }}
  onLeaveSquad={async (squadId) => {
    await leaveSquad(squadId);
  }}
/>
```

**Features:**
- Official vs Community squads
- XP modifier display
- Member count
- Join/Leave actions
- Squad ranking

---

### Layout Components

#### YollrBellOverlay
BeReal-style random bell trigger.

```tsx
import { YollrBellOverlay } from '@/components/yollr';

<YollrBellOverlay
  isActive={bellActive}
  onDismiss={() => setBellActive(false)}
  onCapture={() => {
    setBellActive(false);
    openCamera();
  }}
  timeRemaining={120}
/>
```

**Features:**
- 2-minute countdown
- Animated bell icon
- Ring pulse effects
- XP penalty warning
- Confetti effects

---

### UI Primitives

#### GlassCard
Base glass-matte card component.

```tsx
import { GlassCard } from '@/components/yollr/ui';

<GlassCard
  variant="medium" // 'light' | 'medium' | 'heavy'
  gradient="peachPink" // 'peach' | 'pink' | 'lime' | 'peachPink' | 'none'
  glow
>
  {children}
</GlassCard>
```

---

#### FAB
Floating Action Button.

```tsx
import { FAB } from '@/components/yollr/ui';

<FAB
  onClick={() => console.log('Capture')}
  icon="camera" // 'camera' | 'plus'
  label="Capture"
  position="bottom-right" // 'bottom-right' | 'bottom-center'
  variant="peach" // 'peach' | 'pink' | 'lime'
/>
```

---

#### XPMeter
Gamification XP progress bar.

```tsx
import { XPMeter } from '@/components/yollr/ui';

<XPMeter
  currentXP={750}
  maxXP={1000}
  level={12}
  variant="full" // 'compact' | 'full'
/>
```

---

#### StreakFlame
Daily streak counter with animation.

```tsx
import { StreakFlame } from '@/components/yollr/ui';

<StreakFlame
  streak={14}
  variant="full" // 'compact' | 'full'
/>
```

---

#### LevelBadge
User level badge with tier colors.

```tsx
import { LevelBadge } from '@/components/yollr/ui';

<LevelBadge
  level={24}
  variant="full" // 'compact' | 'full'
  showIcon
/>
```

---

## 🎯 Usage Patterns

### Feed Layout
```tsx
import {
  HeistOfTheWeekCard,
  MomentCard,
  PollCard,
  FAB
} from '@/components/yollr';

export default function Feed() {
  return (
    <div className="min-h-screen bg-midnight">
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <HeistOfTheWeekCard {...heist} />
        <PollCard {...poll} />
        <MomentCard {...moment} />
      </main>
      <FAB onClick={openCamera} />
    </div>
  );
}
```

### Modal Management
```tsx
const [activeModal, setActiveModal] = useState<'capture' | 'heist' | 'voting' | null>(null);

<MomentCaptureModal
  isOpen={activeModal === 'capture'}
  onClose={() => setActiveModal(null)}
/>
<HeistDetailsModal
  isOpen={activeModal === 'heist'}
  onClose={() => setActiveModal(null)}
/>
```

---

## 🎨 Design Tokens

All components use consistent design tokens from `@/lib/theme/*`:

- `colors.ts` - Color palette
- `tokens.ts` - Spacing, shadows, radii
- `fonts.ts` - Typography system

---

## 🚀 2025/26 Features

✅ **Mobile-First PWA**
✅ **Vertical Feed (TikTok/BeReal)**
✅ **Glass Morphism**
✅ **Micro-Interactions (Framer Motion)**
✅ **Dark Mode Native**
✅ **Gamification**
✅ **Short-Form Video (15-sec)**
✅ **No Tab Navigation**

---

## 📱 PWA Integration

Add to your `layout.tsx`:
```tsx
import { inter } from '@/lib/theme/fonts';

export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#0B0B0E',
};
```

---

## 🎉 Complete Component List

**Feed Cards (6):**
- MomentCard
- PollCard
- HeistOfTheWeekCard
- AthleticsCountdownCard
- LeaderboardSnippetCard
- MysteryBoxCard

**Modals (4):**
- MomentCaptureModal
- HeistDetailsModal
- VotingModal
- SquadsModal

**Layout (1):**
- YollrBellOverlay

**UI Primitives (5):**
- GlassCard
- FAB
- XPMeter
- StreakFlame
- LevelBadge

**Total: 16 Production-Ready Components**
