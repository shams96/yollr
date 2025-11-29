'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, User } from 'lucide-react';
import { MomentCard } from '@/components/yollr/cards/MomentCard';
import { PollCard } from '@/components/yollr/cards/PollCard';
import { HeistOfTheWeekCard } from '@/components/yollr/cards/HeistOfTheWeekCard';
import { FAB } from '@/components/yollr/ui/FAB';
import { XPMeter } from '@/components/yollr/ui/XPMeter';

/**
 * NEW Yollr Feed Page - Single vertical feed (NO TABS)
 * Mobile-first PWA design with Midnight background
 */
export default function FeedPageNew() {
  const [userXP] = useState(750);
  const [userLevel] = useState(12);

  return (
    <div className="min-h-screen bg-midnight text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-midnight/80 border-b border-glass-light">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            {/* Logo */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-electric-peach via-cosmic-pink to-neon-lime bg-clip-text text-transparent">
              Yollr
            </h1>

            {/* Icons */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-glass-light transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-glass-light transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-glass-light transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* XP Meter */}
          <XPMeter currentXP={userXP} maxXP={1000} level={userLevel} />
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Heist of the Week (Hero Card) */}
          <HeistOfTheWeekCard
            id="heist-1"
            title="Campus Halloween Takeover"
            description="Design the most epic Halloween event that brings the entire campus together. Winner gets their event fully funded and executed!"
            phase="submissions"
            prize="$5,000 Event Budget + Campus Fame"
            phaseEndsAt={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()}
            submissionCount={47}
            participantCount={312}
            className="mb-4"
          />

          {/* Poll */}
          <PollCard
            id="poll-1"
            question="Which dining hall has the best late-night options?"
            options={[
              { id: '1', text: 'North Campus Grill', voteCount: 124, percentage: 45 },
              { id: '2', text: 'South Hall Kitchen', voteCount: 89, percentage: 32 },
              { id: '3', text: 'West Side Cafe', voteCount: 63, percentage: 23 },
            ]}
            totalVotes={276}
            endsAt={new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()}
            className="mb-4"
          />

          {/* Moments */}
          <MomentCard
            id="moment-1"
            username="sarah_j"
            displayName="Sarah Johnson"
            videoUrl="/moments/1.mp4"
            thumbnailUrl="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=700&fit=crop"
            caption="Last minute study session before finals 📚☕"
            reactions={{ fire: 45, cry: 12, lightbulb: 8, star: 23 }}
            commentCount={17}
            createdAt={new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()}
            tags={['studylife', 'finals']}
            className="mb-4"
          />

          <MomentCard
            id="moment-2"
            username="mike_athletics"
            displayName="Mike Torres"
            videoUrl="/moments/2.mp4"
            thumbnailUrl="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=700&fit=crop"
            caption="GAME DAY! Let's go team! 🏀🔥"
            reactions={{ fire: 89, cry: 3, lightbulb: 5, star: 34 }}
            commentCount={42}
            createdAt={new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()}
            tags={['basketball', 'gameday']}
            isBellMoment
            className="mb-4"
          />

          <MomentCard
            id="moment-3"
            username="emma_creates"
            displayName="Emma Davis"
            videoUrl="/moments/3.mp4"
            thumbnailUrl="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=700&fit=crop"
            caption="Art project coming together! What do you think? 🎨"
            reactions={{ fire: 67, cry: 2, lightbulb: 28, star: 19 }}
            commentCount={31}
            createdAt={new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()}
            tags={['art', 'creative']}
            className="mb-4"
          />

          {/* Another Poll */}
          <PollCard
            id="poll-2"
            question="Best spot to watch the sunset on campus?"
            options={[
              { id: '1', text: 'Library Rooftop', voteCount: 156, percentage: 52 },
              { id: '2', text: 'Quad Gardens', voteCount: 98, percentage: 33 },
              { id: '3', text: 'Stadium Bleachers', voteCount: 45, percentage: 15 },
            ]}
            totalVotes={299}
            endsAt={new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()}
            hasVoted
            userVoteId="1"
            className="mb-4"
          />
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <FAB
        onClick={() => console.log('Open camera')}
        icon="camera"
        label="Capture"
        variant="coral"
      />
    </div>
  );
}
