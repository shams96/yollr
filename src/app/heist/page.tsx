'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Users,
  Clock,
  Flame,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Heist phases
type HeistPhase = 'submitting' | 'voting' | 'won' | 'executing' | 'completed';

interface HeistData {
  id: string;
  title: string;
  description: string;
  phase: HeistPhase;
  prize_amount: number | null;
  prize_description: string | null;
  submission_opens_at: string;
  submission_closes_at: string;
  voting_opens_at: string;
  voting_closes_at: string;
  execution_week_start: string;
  execution_week_end: string;
  submission_count: number;
  vote_count: number;
  winner_submission?: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    vote_count: number;
    ranking_score: number;
    user: {
      id: string;
      username: string;
      display_name: string;
      avatar_url: string | null;
    };
  } | null;
}

const phaseConfig = {
  submitting: {
    emoji: '💡',
    title: 'Submission Phase',
    color: 'from-accent-mint to-accent-sky',
    description: 'Submit your epic heist idea!',
  },
  voting: {
    emoji: '🔥',
    title: 'Voting Phase',
    color: 'from-accent-pop-coral to-energy-pink',
    description: 'Vote for the best heist!',
  },
  won: {
    emoji: '🏆',
    title: 'Winner Announced',
    color: 'from-accent-honey to-energy-lime',
    description: 'We have a winner!',
  },
  executing: {
    emoji: '🎬',
    title: 'Execution Week',
    color: 'from-accent-lilac to-sport-purple',
    description: 'The heist is live!',
  },
  completed: {
    emoji: '✅',
    title: 'Heist Complete',
    color: 'from-sport-green to-accent-mint',
    description: 'This heist is finished',
  },
};

export default function HeistLabPage() {
  const router = useRouter();
  const [heist, setHeist] = useState<HeistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [userVote, setUserVote] = useState<any>(null);

  useEffect(() => {
    fetchCurrentHeist();
  }, []);

  const fetchCurrentHeist = async () => {
    try {
      // TODO: Get campus ID from user profile
      const campusId = '00000000-0000-0000-0000-000000000000'; // Placeholder

      const response = await fetch(`/api/heist/current?campusId=${campusId}`);
      const data = await response.json();

      setHeist(data.heist);
      setUserSubmission(data.user_submission);
      setUserVote(data.user_vote);
    } catch (error) {
      console.error('Error fetching heist:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (targetDate: string) => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const handleCTA = () => {
    if (!heist) return;

    switch (heist.phase) {
      case 'submitting':
        router.push(`/heist/${heist.id}/submit`);
        break;
      case 'voting':
        router.push(`/heist/${heist.id}/vote`);
        break;
      case 'won':
        router.push(`/heist/${heist.id}/winner`);
        break;
      case 'executing':
        router.push(`/heist/${heist.id}/execute`);
        break;
      default:
        break;
    }
  };

  const getCTAText = () => {
    if (!heist) return '';

    switch (heist.phase) {
      case 'submitting':
        return userSubmission ? 'View Your Submission' : 'Submit Your Heist';
      case 'voting':
        return userVote ? 'View Results' : 'Vote Now';
      case 'won':
        return 'See Winner';
      case 'executing':
        return 'Join Execution Week';
      case 'completed':
        return 'View Results';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-accent-mint text-lg">Loading Heist Lab...</div>
      </div>
    );
  }

  if (!heist) {
    return (
      <div className="min-h-screen bg-bg-primary">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-bg-secondary/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-text-primary font-bold text-xl">Heist Lab</h1>
            </div>
          </div>
        </div>

        {/* No active heist */}
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🏴‍☠️</div>
          <h2 className="text-text-primary font-bold text-2xl mb-2">
            No Active Heist
          </h2>
          <p className="text-text-secondary">
            A new heist will begin soon. Check back Monday!
          </p>
        </div>
      </div>
    );
  }

  const config = phaseConfig[heist.phase];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg-secondary/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-text-primary font-bold text-xl">Heist Lab</h1>
              <p className="text-text-muted text-sm">This Week's Challenge</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'rounded-3xl p-8 mb-6 bg-gradient-to-br',
              config.color
            )}
          >
            <div className="text-center space-y-4">
              {/* Emoji */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="text-7xl"
              >
                {config.emoji}
              </motion.div>

              {/* Phase Title */}
              <h2 className="text-white font-bold text-2xl">
                {config.title}
              </h2>

              {/* Heist Title */}
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white font-bold text-xl mb-1">
                  {heist.title}
                </h3>
                <p className="text-white/80 text-sm">{heist.description}</p>
              </div>

              {/* Prize */}
              {heist.prize_description && (
                <div className="flex items-center justify-center gap-2 text-white">
                  <Trophy size={20} />
                  <span className="font-semibold">{heist.prize_description}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span className="text-sm">
                    {heist.submission_count} {heist.submission_count === 1 ? 'Submission' : 'Submissions'}
                  </span>
                </div>
                {heist.phase === 'voting' && (
                  <div className="flex items-center gap-2">
                    <Flame size={18} />
                    <span className="text-sm">{heist.vote_count} Votes</span>
                  </div>
                )}
              </div>

              {/* Time Remaining */}
              <div className="flex items-center justify-center gap-2 text-white/90 text-sm">
                <Clock size={16} />
                <span>
                  {heist.phase === 'submitting' &&
                    getTimeRemaining(heist.submission_closes_at)}
                  {heist.phase === 'voting' &&
                    getTimeRemaining(heist.voting_closes_at)}
                  {heist.phase === 'won' &&
                    `Execution starts ${new Date(heist.execution_week_start).toLocaleDateString()}`}
                  {heist.phase === 'executing' &&
                    getTimeRemaining(heist.execution_week_end)}
                </span>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCTA}
                className="w-full bg-white text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-between"
              >
                <span>{getCTAText()}</span>
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </motion.div>

          {/* Winner Preview (if won phase) */}
          {heist.phase === 'won' && heist.winner_submission && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg-card rounded-2xl p-6 border border-accent-honey/30"
            >
              <div className="flex items-center gap-2 text-accent-honey mb-4">
                <Sparkles size={20} />
                <h3 className="font-bold">Winning Submission</h3>
              </div>
              <h4 className="text-text-primary font-bold text-lg mb-2">
                {heist.winner_submission.title}
              </h4>
              <p className="text-text-secondary text-sm mb-3">
                {heist.winner_submission.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <span>by</span>
                  <span className="text-text-primary font-medium">
                    @{heist.winner_submission.user.username}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-accent-coral">
                  <Flame size={16} />
                  <span className="font-bold">{heist.winner_submission.vote_count}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mt-6"
          >
            {userSubmission && (
              <div className="bg-accent-mint/10 border border-accent-mint/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-accent-mint text-sm font-medium">
                  ✓ You submitted: "{userSubmission.title}"
                </div>
              </div>
            )}
            {userVote && (
              <div className="bg-accent-coral/10 border border-accent-coral/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-accent-coral text-sm font-medium">
                  ✓ You voted for a submission
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
