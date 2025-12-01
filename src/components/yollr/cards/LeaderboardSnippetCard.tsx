'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, ArrowRight, Medal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  trend?: 'up' | 'down' | 'same';
}

interface LeaderboardSnippetCardProps {
  topUsers: LeaderboardEntry[];
  userEntry?: LeaderboardEntry;
  type?: 'weekly' | 'legacy';
  onViewFull?: () => void;
  className?: string;
}

/**
 * LeaderboardSnippetCard - Compact leaderboard preview
 * Features: Top 3 users, user's rank, medal display
 */
export function LeaderboardSnippetCard({
  topUsers,
  userEntry,
  type = 'weekly',
  onViewFull,
  className,
}: LeaderboardSnippetCardProps) {
  const top3 = topUsers.slice(0, 3);

  return (
    <GlassCard
      variant="medium"
      gradient="energyLime"
      className={cn('p-5 space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-xp-gold" />
          <h3 className="text-lg font-semibold text-text-primary">
            {type === 'weekly' ? 'Weekly' : 'All-Time'} Leaderboard
          </h3>
        </div>

        <motion.button
          onClick={onViewFull}
          className="flex items-center gap-1 text-sm font-medium text-lime-zing hover:text-lime-zing-light transition-colors"
          whileHover={{ x: 2 }}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Top 3 */}
      <div className="space-y-2">
        {top3.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-all',
              index === 0
                ? 'bg-gradient-to-r from-xp-gold/20 to-xp-bronze/10 border border-xp-gold/30'
                : 'bg-glass-light hover:bg-glass-medium'
            )}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {index === 0 ? (
                <Medal className="w-6 h-6 text-xp-gold" fill="currentColor" />
              ) : index === 1 ? (
                <Medal className="w-6 h-6 text-xp-silver" fill="currentColor" />
              ) : index === 2 ? (
                <Medal className="w-6 h-6 text-xp-bronze" fill="currentColor" />
              ) : (
                <span className="text-lg font-bold text-text-tertiary">
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-hyper-pink p-[2px]">
              <div className="w-full h-full rounded-full bg-obsidian overflow-hidden">
                {entry.avatarUrl ? (
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.displayName}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-text-primary">
                    {entry.displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary truncate">
                {entry.displayName}
              </h4>
              <p className="text-xs text-text-tertiary">
                Level {entry.level} • {entry.xp.toLocaleString()} XP
              </p>
            </div>

            {/* Trend */}
            {entry.trend === 'up' && (
              <div className="flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* User's Entry (if not in top 3) */}
      {userEntry && userEntry.rank > 3 && (
        <>
          <div className="border-t border-glass-light" />

          <div className="flex items-center gap-3 p-3 rounded-lg bg-glass-medium border-2 border-lime-zing/30">
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <span className="text-lg font-bold text-lime-zing">
                {userEntry.rank}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-zing to-lime-zing-light p-[2px]">
              <div className="w-full h-full rounded-full bg-obsidian overflow-hidden">
                {userEntry.avatarUrl ? (
                  <Image
                    src={userEntry.avatarUrl}
                    alt={userEntry.displayName}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-text-primary">
                    {userEntry.displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-text-primary truncate">
                You ({userEntry.displayName})
              </h4>
              <p className="text-xs text-text-tertiary">
                Level {userEntry.level} • {userEntry.xp.toLocaleString()} XP
              </p>
            </div>

            {/* Trend */}
            {userEntry.trend === 'up' && (
              <div className="flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            )}
          </div>
        </>
      )}
    </GlassCard>
  );
}
