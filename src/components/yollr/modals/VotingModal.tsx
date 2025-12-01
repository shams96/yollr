'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Trophy, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HeistSubmission {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  voteCount: number;
  hasUserVoted: boolean;
}

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  heistTitle: string;
  submissions: HeistSubmission[];
  votesRemaining: number;
  onVote?: (submissionId: string) => Promise<void>;
  onViewSubmission?: (submissionId: string) => void;
}

/**
 * VotingModal - Heist submission voting interface
 * Features: Submission grid, star voting, vote confirmation, results
 */
export function VotingModal({
  isOpen,
  onClose,
  heistTitle,
  submissions,
  votesRemaining,
  onVote,
  onViewSubmission,
}: VotingModalProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (submissionId: string) => {
    if (votesRemaining <= 0 || !onVote) return;

    setSelectedSubmission(submissionId);
    setIsVoting(true);

    try {
      await onVote(submissionId);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
      setSelectedSubmission(null);
    }
  };

  const topSubmissions = [...submissions]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 10);

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
          <div className="relative min-h-screen flex items-start justify-center p-4 py-12">
            <motion.div
              className="relative w-full max-w-4xl bg-obsidian-light rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-obsidian-light/95 backdrop-blur-md border-b border-glass-light p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-glass-heavy backdrop-blur-md text-white hover:bg-glass-medium transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start justify-between gap-4 pr-12">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Vote for Winner</h2>
                    <p className="text-text-secondary">{heistTitle}</p>
                  </div>

                  {/* Votes Remaining */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-energy-pink/20 border border-energy-pink/30">
                      <Star className="w-5 h-5 text-energy-pink" fill="currentColor" />
                      <div>
                        <p className="text-xs text-text-tertiary">Votes Left</p>
                        <p className="text-xl font-bold text-energy-pink">{votesRemaining}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submissions Grid */}
              <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
                {topSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'relative p-4 rounded-xl border transition-all cursor-pointer',
                      submission.hasUserVoted
                        ? 'bg-energy-pink/10 border-energy-pink/30'
                        : 'bg-glass-medium border-glass-light hover:bg-glass-heavy',
                      selectedSubmission === submission.id && 'ring-2 ring-energy-pink'
                    )}
                    onClick={() => onViewSubmission?.(submission.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {index < 3 ? (
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                            index === 0 && 'bg-accent-honey/20 text-accent-honey',
                            index === 1 && 'bg-xp-silver/20 text-xp-silver',
                            index === 2 && 'bg-xp-bronze/20 text-xp-bronze'
                          )}>
                            {index + 1}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-glass-light flex items-center justify-center text-text-tertiary font-semibold">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail */}
                      {submission.thumbnailUrl && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-obsidian">
                          <Image
                            src={submission.thumbnailUrl}
                            alt={submission.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-1">
                              {submission.title}
                            </h3>
                            <p className="text-sm text-text-secondary line-clamp-2">
                              {submission.description}
                            </p>
                          </div>

                          {/* Vote Count */}
                          <div className="flex-shrink-0 flex items-center gap-1 text-text-tertiary">
                            <Star className="w-4 h-4" fill="currentColor" />
                            <span className="text-sm font-medium">{submission.voteCount}</span>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-pop-coral to-energy-pink p-[1px]">
                            <div className="w-full h-full rounded-full bg-obsidian overflow-hidden flex items-center justify-center text-xs font-semibold text-text-primary">
                              {submission.displayName[0]}
                            </div>
                          </div>
                          <span className="text-xs text-text-secondary">by {submission.displayName}</span>
                        </div>

                        {/* Vote Button */}
                        {submission.hasUserVoted ? (
                          <div className="flex items-center gap-2 text-energy-pink text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" fill="currentColor" />
                            You voted for this
                          </div>
                        ) : (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(submission.id);
                            }}
                            disabled={votesRemaining <= 0 || isVoting}
                            className={cn(
                              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
                              votesRemaining > 0
                                ? 'bg-gradient-to-r from-energy-pink to-energy-pink-light text-white hover:shadow-energy-pink-glow'
                                : 'bg-glass-light text-text-muted cursor-not-allowed'
                            )}
                            whileHover={votesRemaining > 0 ? { scale: 1.02 } : {}}
                            whileTap={votesRemaining > 0 ? { scale: 0.98 } : {}}
                          >
                            {isVoting && selectedSubmission === submission.id
                              ? 'Voting...'
                              : 'Vote ⭐'}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer Stats */}
              <div className="border-t border-glass-light p-6 bg-obsidian/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <Users className="w-4 h-4" />
                      <span>{submissions.length} submissions</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-tertiary">
                      <Trophy className="w-4 h-4" />
                      <span>Top 10 shown</span>
                    </div>
                  </div>

                  {votesRemaining === 0 && (
                    <div className="flex items-center gap-2 text-success font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      All votes cast
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
