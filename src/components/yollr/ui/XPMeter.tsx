'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface XPMeterProps {
  currentXP: number;
  maxXP: number;
  level: number;
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * XPMeter - Gamification XP progress bar
 * Shows current XP, level, and progress to next level
 */
export function XPMeter({
  currentXP,
  maxXP,
  level,
  variant = 'compact',
  className,
}: XPMeterProps) {
  const progress = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Level Badge */}
      <motion.div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-accent-honey to-xp-bronze text-white font-bold text-sm shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {level}
      </motion.div>

      {/* XP Bar */}
      <div className="flex-1">
        {variant === 'full' && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-secondary">
              Level {level}
            </span>
            <span className="text-xs font-medium text-text-secondary">
              {currentXP} / {maxXP} XP
            </span>
          </div>
        )}

        <div className="relative h-2 bg-glass-medium rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-mint via-accent-lilac to-energy-lime rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}
