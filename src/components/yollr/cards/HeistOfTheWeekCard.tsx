'use client';

import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Flame, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type HeistPhase = 'reveal' | 'submissions' | 'voting' | 'execution';

export interface HeistOfTheWeekCardProps {
  id: string;
  title: string;
  description: string;
  phase: HeistPhase;
  prize: string;
  imageUrl?: string;
  phaseEndsAt: string;
  submissionCount?: number;
  participantCount?: number;
  onViewDetails?: () => void;
  onSubmit?: () => void;
  onVote?: () => void;
  className?: string;
}

/**
 * HeistOfTheWeekCard - Hero card for weekly Heist challenge
 * Features: Phase indicator, countdown, prize display, CTA
 */
export function HeistOfTheWeekCard({
  id,
  title,
  description,
  phase,
  prize,
  imageUrl,
  phaseEndsAt,
  submissionCount = 0,
  participantCount = 0,
  onViewDetails,
  onSubmit,
  onVote,
  className,
}: HeistOfTheWeekCardProps) {
  const phaseConfig = getPhaseConfig(phase);
  const timeRemaining = getTimeRemaining(phaseEndsAt);

  const handleCTA = () => {
    if (phase === 'submissions' && onSubmit) onSubmit();
    else if (phase === 'voting' && onVote) onVote();
    else if (onViewDetails) onViewDetails();
  };

  return (
    <GlassCard
      variant="heavy"
      gradient="primaryCTA"
      glow
      className={cn('overflow-hidden', className)}
    >
      {/* Hero Image/Gradient */}
      <div className="relative h-48 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pop-coral via-accent-lilac to-energy-lime opacity-60" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

        {/* Phase Badge */}
        <div className="absolute top-4 left-4">
          <motion.div
            className={cn(
              'px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wide flex items-center gap-2',
              phaseConfig.badgeClass
            )}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            {phaseConfig.icon}
            {phaseConfig.label}
          </motion.div>
        </div>

        {/* Countdown */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 rounded-full bg-glass-heavy backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {timeRemaining}
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 left-4 right-4">
          <motion.h2
            className="text-2xl font-bold text-white leading-tight mb-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Description */}
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>

        {/* Prize */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-accent-honey/20 to-xp-bronze/10 border border-accent-honey/30">
          <Trophy className="w-5 h-5 text-accent-honey" />
          <div>
            <p className="text-xs text-text-tertiary font-medium">Prize</p>
            <p className="text-sm text-text-primary font-semibold">{prize}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {submissionCount > 0 && (
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent-pop-coral" />
              <div>
                <p className="text-xs text-text-tertiary">Submissions</p>
                <p className="text-sm font-semibold text-text-primary">{submissionCount}</p>
              </div>
            </div>
          )}

          {participantCount > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-energy-pink" />
              <div>
                <p className="text-xs text-text-tertiary">Participants</p>
                <p className="text-sm font-semibold text-text-primary">{participantCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={handleCTA}
          className={cn(
            'w-full py-3.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all',
            phaseConfig.buttonClass
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {phaseConfig.ctaText}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </GlassCard>
  );
}

function getPhaseConfig(phase: HeistPhase) {
  const configs = {
    reveal: {
      label: 'Just Revealed',
      icon: <Trophy className="w-3.5 h-3.5" />,
      badgeClass: 'bg-energy-lime/30 text-energy-lime border border-energy-lime/50',
      buttonClass: 'bg-gradient-to-r from-accent-mint to-accent-lilac text-white hover:shadow-lg',
      ctaText: 'View Challenge',
    },
    submissions: {
      label: 'Submissions Open',
      icon: <Flame className="w-3.5 h-3.5" />,
      badgeClass: 'bg-accent-pop-coral/30 text-accent-pop-coral border border-accent-pop-coral/50',
      buttonClass: 'bg-gradient-to-r from-accent-pop-coral to-accent-pop-coral-light text-white hover:shadow-accent-pop-coral-glow',
      ctaText: 'Submit Your Heist',
    },
    voting: {
      label: 'Voting Open',
      icon: <Trophy className="w-3.5 h-3.5" />,
      badgeClass: 'bg-energy-pink/30 text-energy-pink border border-energy-pink/50',
      buttonClass: 'bg-gradient-to-r from-energy-pink to-energy-pink-light text-white hover:shadow-energy-pink-glow',
      ctaText: 'Vote for Winner',
    },
    execution: {
      label: 'Execution Week',
      icon: <Trophy className="w-3.5 h-3.5" />,
      badgeClass: 'bg-accent-honey/30 text-accent-honey border border-accent-honey/50',
      buttonClass: 'bg-gradient-to-r from-accent-honey to-xp-bronze text-obsidian hover:shadow-lg',
      ctaText: 'Watch Execution',
    },
  };

  return configs[phase];
}

function getTimeRemaining(endsAt: string): string {
  const now = new Date();
  const end = new Date(endsAt);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Ended';

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m left`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h left`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d left`;
}
