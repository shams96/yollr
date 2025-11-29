'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface PollCardProps {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: string;
  hasVoted?: boolean;
  userVoteId?: string;
  onVote?: (optionId: string) => void;
  className?: string;
}

/**
 * PollCard - Interactive poll card with vote visualization
 * Features: Option selection, real-time results, percentage bars
 */
export function PollCard({
  id,
  question,
  options,
  totalVotes,
  endsAt,
  hasVoted = false,
  userVoteId,
  onVote,
  className,
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVoteId || null);
  const timeRemaining = getTimeRemaining(endsAt);
  const isExpired = new Date(endsAt) < new Date();

  const handleVote = (optionId: string) => {
    if (hasVoted || isExpired) return;
    setSelectedOption(optionId);
    onVote?.(optionId);
  };

  return (
    <GlassCard
      variant="medium"
      gradient="energyPink"
      className={cn('p-5 space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold text-text-primary leading-tight flex-1">
          {question}
        </h3>

        {/* Time remaining */}
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          isExpired
            ? 'bg-glass-light text-text-muted'
            : 'bg-hyper-pink/20 text-hyper-pink'
        )}>
          <Clock className="w-3 h-3" />
          {isExpired ? 'Ended' : timeRemaining}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const showResults = hasVoted || isExpired;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || isExpired}
              className={cn(
                'relative w-full p-4 rounded-lg text-left overflow-hidden transition-all',
                'disabled:cursor-not-allowed',
                showResults
                  ? 'bg-glass-light cursor-default'
                  : 'bg-glass-medium hover:bg-glass-heavy active:scale-[0.98]'
              )}
              whileHover={!hasVoted && !isExpired ? { scale: 1.02 } : {}}
              whileTap={!hasVoted && !isExpired ? { scale: 0.98 } : {}}
            >
              {/* Progress bar background */}
              {showResults && (
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-lg',
                    isSelected
                      ? 'bg-gradient-to-r from-hyper-pink/30 to-hyper-pink/10'
                      : 'bg-glass-light'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${option.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              )}

              {/* Content */}
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  {/* Checkmark for selected option */}
                  {isSelected && showResults && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-hyper-pink" fill="currentColor" />
                    </motion.div>
                  )}

                  <span className={cn(
                    'text-sm font-medium',
                    isSelected && showResults
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  )}>
                    {option.text}
                  </span>
                </div>

                {/* Percentage */}
                {showResults && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {Math.round(option.percentage)}%
                    </span>
                    <span className="text-xs text-text-tertiary">
                      ({option.voteCount})
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-text-tertiary pt-2 border-t border-glass-light">
        <Users className="w-3.5 h-3.5" />
        <span>
          {totalVotes.toLocaleString()} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>
    </GlassCard>
  );
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
