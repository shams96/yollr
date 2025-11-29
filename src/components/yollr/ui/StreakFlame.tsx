'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakFlameProps {
  streak: number;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * StreakFlame - Daily streak counter with animated flame
 * Features: Flame animation, milestone badges, streak count
 */
export function StreakFlame({
  streak,
  variant = 'compact',
  className,
}: StreakFlameProps) {
  const isOnFire = streak >= 7;
  const isMilestone = streak % 7 === 0 && streak > 0;

  const flameColor = streak >= 30
    ? 'text-energy-pink'
    : streak >= 14
    ? 'text-accent-pop-coral'
    : streak >= 7
    ? 'text-accent-honey'
    : 'text-text-tertiary';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Flame Icon */}
      <motion.div
        className="relative"
        animate={isOnFire ? {
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect for high streaks */}
        {isOnFire && (
          <motion.div
            className="absolute inset-0 blur-lg opacity-60"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Flame className={cn('w-full h-full', flameColor)} />
          </motion.div>
        )}

        <Flame className={cn('w-5 h-5 relative', flameColor)} fill="currentColor" />
      </motion.div>

      {/* Streak Count */}
      <div>
        <div className="flex items-center gap-1">
          <span className={cn(
            'font-bold tabular-nums',
            variant === 'full' ? 'text-lg' : 'text-base',
            streak >= 7 ? 'text-text-primary' : 'text-text-secondary'
          )}>
            {streak}
          </span>
          {variant === 'full' && (
            <span className="text-xs text-text-tertiary">day streak</span>
          )}
        </div>

        {/* Milestone Badge */}
        {isMilestone && variant === 'full' && (
          <motion.div
            className="text-xs font-medium text-accent-pop-coral"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🎉 Milestone!
          </motion.div>
        )}
      </div>
    </div>
  );
}
