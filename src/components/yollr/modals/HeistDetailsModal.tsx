'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Users, Clock, CheckCircle, ArrowRight, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HeistDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heist: {
    id: string;
    title: string;
    description: string;
    fullDescription: string;
    prize: string;
    phase: 'reveal' | 'submissions' | 'voting' | 'execution';
    phaseEndsAt: string;
    imageUrl?: string;
    rules: string[];
    guardrails: string[];
    submissionCount: number;
    participantCount: number;
  };
  onSubmit?: () => void;
  onVote?: () => void;
}

/**
 * HeistDetailsModal - Full heist challenge details
 * Features: Rules, guardrails, submission requirements, CTA
 */
export function HeistDetailsModal({
  isOpen,
  onClose,
  heist,
  onSubmit,
  onVote,
}: HeistDetailsModalProps) {
  const timeRemaining = getTimeRemaining(heist.phaseEndsAt);

  const handleCTA = () => {
    if (heist.phase === 'submissions' && onSubmit) {
      onSubmit();
    } else if (heist.phase === 'voting' && onVote) {
      onVote();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-2xl bg-obsidian-light rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-glass-heavy backdrop-blur-md text-white hover:bg-glass-medium transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Hero Image */}
              <div className="relative h-64 overflow-hidden">
                {heist.imageUrl ? (
                  <Image
                    src={heist.imageUrl}
                    alt={heist.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-pop-coral via-accent-lilac to-energy-lime opacity-60" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

                {/* Phase Badge */}
                <div className="absolute top-4 left-4">
                  <div className={cn(
                    'px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-wide',
                    heist.phase === 'submissions'
                      ? 'bg-accent-pop-coral/30 text-accent-pop-coral border border-accent-pop-coral/50'
                      : heist.phase === 'voting'
                      ? 'bg-energy-pink/30 text-energy-pink border border-energy-pink/50'
                      : 'bg-energy-lime/30 text-energy-lime border border-energy-lime/50'
                  )}>
                    {heist.phase}
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-3xl font-bold text-white mb-2">{heist.title}</h2>
                  <div className="flex items-center gap-1 text-sm text-white/80">
                    <Clock className="w-4 h-4" />
                    {timeRemaining}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Prize */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-accent-honey/20 to-xp-bronze/10 border border-accent-honey/30">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-accent-honey" />
                    <div>
                      <p className="text-xs text-text-tertiary font-medium uppercase">Grand Prize</p>
                      <p className="text-lg font-bold text-text-primary">{heist.prize}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">Description</h3>
                  <p className="text-text-secondary leading-relaxed">{heist.fullDescription}</p>
                </div>

                {/* Rules */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Rules</h3>
                  <div className="space-y-2">
                    {heist.rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-text-secondary">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guardrails */}
                {heist.guardrails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">
                      Guardrails (Community Standards)
                    </h3>
                    <div className="space-y-2">
                      {heist.guardrails.map((guardrail, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/30">
                          <span className="text-error">⚠️</span>
                          <p className="text-sm text-text-secondary">{guardrail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-glass-medium">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-5 h-5 text-accent-pop-coral" />
                      <p className="text-xs text-text-tertiary uppercase">Submissions</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{heist.submissionCount}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-glass-medium">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-energy-pink" />
                      <p className="text-xs text-text-tertiary uppercase">Participants</p>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{heist.participantCount}</p>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-6 pt-0">
                <motion.button
                  onClick={handleCTA}
                  className={cn(
                    'w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg',
                    heist.phase === 'submissions'
                      ? 'bg-gradient-to-r from-accent-pop-coral to-accent-pop-coral-light text-white'
                      : heist.phase === 'voting'
                      ? 'bg-gradient-to-r from-energy-pink to-energy-pink-light text-white'
                      : 'bg-gradient-to-r from-accent-honey to-xp-bronze text-obsidian'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {heist.phase === 'submissions' ? 'Submit Your Heist' :
                   heist.phase === 'voting' ? 'Vote for Winner' :
                   'View Execution'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
