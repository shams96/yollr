'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Flame,
  Heart,
  ThumbsUp,
  Trophy,
  Users,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Submission {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  vote_count: number;
  ranking_score: number;
  created_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    total_xp: number;
  };
}

interface HeistData {
  id: string;
  title: string;
  description: string;
  phase: string;
  voting_closes_at: string;
}

const reactionTypes = [
  { type: 'fire', icon: Flame, label: 'Fire', color: 'text-accent-pop-coral', points: 2 },
  { type: 'heart', icon: Heart, label: 'Love', color: 'text-energy-pink', points: 1.5 },
  { type: 'thumbs_up', icon: ThumbsUp, label: 'Like', color: 'text-accent-mint', points: 1 },
];

export default function HeistVotingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [heist, setHeist] = useState<HeistData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userVotedFor, setUserVotedFor] = useState<string | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string>('fire');
  const [isVoting, setIsVoting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch heist and submissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch heist data
        const heistResponse = await fetch(`/api/heist/${params.id}`);
        if (!heistResponse.ok) throw new Error('Failed to load heist');
        const heistData = await heistResponse.json();
        setHeist(heistData);

        // Fetch submissions
        const submissionsResponse = await fetch(
          `/api/heist/submissions?heistId=${params.id}&limit=50`
        );
        if (!submissionsResponse.ok) throw new Error('Failed to load submissions');
        const submissionsData = await submissionsResponse.json();
        setSubmissions(submissionsData.submissions);
        setUserVotedFor(submissionsData.user_voted_for);
      } catch (err: any) {
        setError(err.message || 'Failed to load voting data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, authLoading, router]);

  const handleVote = async (submissionId: string) => {
    if (!user || isVoting || userVotedFor) return;

    setIsVoting(true);
    setError(null);

    try {
      const response = await fetch('/api/heist/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heist_id: params.id,
          submission_id: submissionId,
          reaction_type: selectedReaction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      // Update local state
      setUserVotedFor(submissionId);
      setSuccess(true);

      // Refresh submissions to show updated vote counts
      const submissionsResponse = await fetch(
        `/api/heist/submissions?heistId=${params.id}&limit=50`
      );
      const submissionsData = await submissionsResponse.json();
      setSubmissions(submissionsData.submissions);

      // Show success briefly, then navigate back
      setTimeout(() => {
        router.push(`/heist?success=vote&xp=10`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to vote. Please try again.');
      setIsVoting(false);
    }
  };

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) return 'Voting ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-accent-mint text-lg">Loading...</div>
      </div>
    );
  }

  if (error && !heist) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-text-primary font-bold text-xl mb-2">
            Failed to Load Voting
          </div>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-accent-mint text-gray-900 rounded-xl font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-text-primary font-bold text-2xl mb-2">
            Vote Recorded!
          </h2>
          <p className="text-text-secondary">+10 XP earned</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-secondary/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-text-primary font-bold text-xl">
                Vote for the Best Heist
              </h1>
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Clock size={14} />
                <span>{heist && getTimeRemaining(heist.voting_closes_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-accent-mint">
              <Users size={18} />
              <span className="font-bold">{submissions.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Already Voted Message */}
        {userVotedFor && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent-mint/10 border border-accent-mint/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-accent-mint">
              <CheckCircle size={20} />
              <p className="text-sm font-medium">
                You've already voted! Check out the rankings below.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 text-red-400">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Reaction Selector */}
        {!userVotedFor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card rounded-2xl p-4 border border-white/10"
          >
            <h3 className="text-text-primary font-semibold text-sm mb-3">
              Choose Your Reaction
            </h3>
            <div className="flex gap-3">
              {reactionTypes.map(({ type, icon: Icon, label, color, points }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedReaction(type)}
                  className={cn(
                    'flex-1 py-3 px-4 rounded-xl border-2 transition-all',
                    selectedReaction === type
                      ? 'border-accent-mint bg-accent-mint/10'
                      : 'border-white/10 bg-bg-secondary/50 hover:border-white/20'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 mx-auto mb-1',
                      selectedReaction === type ? color : 'text-text-muted'
                    )}
                  />
                  <div className="text-xs font-medium text-text-secondary">
                    {label}
                  </div>
                  <div className="text-xs text-text-muted">+{points} pts</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-text-primary font-bold text-lg mb-2">
              No Submissions Yet
            </h3>
            <p className="text-text-secondary">
              Be the first to submit a heist idea!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission, index) => {
              const isVotedFor = userVotedFor === submission.id;
              const isUserOwn = user?.id === submission.user.id;

              return (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'bg-bg-card rounded-2xl p-5 border transition-all',
                    isVotedFor
                      ? 'border-accent-mint/50 bg-accent-mint/5'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  {/* Ranking Badge */}
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                        index === 0
                          ? 'bg-gradient-to-br from-accent-honey to-energy-lime text-gray-900'
                          : index === 1
                          ? 'bg-gradient-to-br from-white/30 to-white/10 text-white'
                          : index === 2
                          ? 'bg-gradient-to-br from-energy-orange to-accent-honey text-gray-900'
                          : 'bg-bg-secondary text-text-muted'
                      )}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-text-primary font-bold text-lg mb-1">
                        {submission.title}
                      </h3>
                      <p className="text-text-secondary text-sm line-clamp-3 mb-3">
                        {submission.description}
                      </p>

                      {/* Author Info */}
                      <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
                        <span>by</span>
                        <span className="text-text-primary font-medium">
                          @{submission.user.username}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Flame size={14} className="text-accent-pop-coral" />
                          <span className="font-bold text-text-primary">
                            {submission.vote_count}
                          </span>
                        </div>
                      </div>

                      {/* Vote Button */}
                      {!userVotedFor && !isUserOwn && (
                        <button
                          type="button"
                          onClick={() => handleVote(submission.id)}
                          disabled={isVoting}
                          className={cn(
                            'w-full py-3 px-4 rounded-xl font-bold transition-all',
                            isVoting
                              ? 'bg-bg-secondary text-text-muted cursor-not-allowed'
                              : 'bg-gradient-to-r from-accent-mint to-accent-lilac text-gray-900 hover:scale-105 active:scale-95 shadow-lg'
                          )}
                        >
                          {isVoting ? 'Voting...' : `Vote with ${selectedReaction.replace('_', ' ')}`}
                        </button>
                      )}

                      {isVotedFor && (
                        <div className="flex items-center gap-2 text-accent-mint text-sm font-medium">
                          <CheckCircle size={16} />
                          <span>You voted for this</span>
                        </div>
                      )}

                      {isUserOwn && !userVotedFor && (
                        <div className="text-text-muted text-sm italic">
                          This is your submission
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
