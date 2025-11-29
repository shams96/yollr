'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  variant?: 'compact' | 'full';
  showIcon?: boolean;
  className?: string;
}

/**
 * LevelBadge - User level badge with tier colors
 * Features: Bronze/Silver/Gold/Platinum/Diamond tiers, animated icon
 */
export function LevelBadge({
  level,
  variant = 'compact',
  showIcon = true,
  className,
}: LevelBadgeProps) {
  const tier = getTier(level);

  const Icon = tier.icon;

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
        tier.bgClass,
        className
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {showIcon && (
        <motion.div
          animate={tier.name === 'Diamond' ? {
            rotate: [0, 360],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Icon className={cn('w-4 h-4', tier.iconClass)} fill={tier.fill ? 'currentColor' : 'none'} />
        </motion.div>
      )}

      <span className={cn(
        'font-bold tabular-nums',
        variant === 'full' ? 'text-base' : 'text-sm',
        tier.textClass
      )}>
        {level}
      </span>

      {variant === 'full' && (
        <span className={cn('text-xs font-medium', tier.textClass)}>
          {tier.name}
        </span>
      )}
    </motion.div>
  );
}

function getTier(level: number) {
  if (level >= 50) {
    return {
      name: 'Diamond',
      icon: Crown,
      bgClass: 'bg-xp-diamond/20 border border-xp-diamond/50',
      textClass: 'text-xp-diamond',
      iconClass: 'text-xp-diamond',
      fill: true,
    };
  }

  if (level >= 30) {
    return {
      name: 'Platinum',
      icon: Star,
      bgClass: 'bg-xp-platinum/20 border border-xp-platinum/50',
      textClass: 'text-xp-platinum',
      iconClass: 'text-xp-platinum',
      fill: true,
    };
  }

  if (level >= 20) {
    return {
      name: 'Gold',
      icon: Zap,
      bgClass: 'bg-xp-gold/20 border border-xp-gold/50',
      textClass: 'text-xp-gold',
      iconClass: 'text-xp-gold',
      fill: true,
    };
  }

  if (level >= 10) {
    return {
      name: 'Silver',
      icon: Star,
      bgClass: 'bg-xp-silver/20 border border-xp-silver/50',
      textClass: 'text-xp-silver',
      iconClass: 'text-xp-silver',
      fill: false,
    };
  }

  return {
    name: 'Bronze',
    icon: Star,
    bgClass: 'bg-xp-bronze/20 border border-xp-bronze/50',
    textClass: 'text-xp-bronze',
    iconClass: 'text-xp-bronze',
    fill: false,
  };
}
