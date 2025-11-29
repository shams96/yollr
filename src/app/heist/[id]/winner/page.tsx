'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Flame,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinnerData {
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
    total_xp: number;
  };
}

interface HeistData {
  id: string;
  title: string;
  description: string;
  phase: string;
  prize_description: string | null;
  execution_week_start: string;
  execution_week_end: string;
  vote_count: number;
  submission_count: number;
  winner_submission: WinnerData | null;
}

export default function HeistWinnerPage() {
  const router = useRouter();
  const params = useParams();
  const [heist, setHeist] = useState<HeistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeist = async () => {
      try {
        const response = await fetch(`/api/heist/${params.id}`);
        if (!response.ok) throw new Error('Failed to load heist');
        const data = await response.json();
        setHeist(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load winner data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchHeist();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-accent-mint text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !heist || !heist.winner_submission) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-text-primary font-bold text-xl mb-2">
            Winner Not Available
          </div>
          <p className="text-text-secondary mb-4">
            {error || 'The winner hasn\'t been announced yet'}
          </p>
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

  const winner = heist.winner_submission;

  return (
    <div className="min-h-screen bg-bg-primary">
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
            <div>
              <h1 className="text-text-primary font-bold text-xl">Winner Announced</h1>
              <p className="text-text-muted text-sm">{heist.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Celebration Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center py-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="text-8xl"
            >
              🏆
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute -inset-4 bg-accent-honey/20 rounded-full blur-xl -z-10"
            />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-text-primary font-bold text-3xl mt-4 mb-2"
          >
            We Have a Winner!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary"
          >
            Chosen by the campus community
          </motion.p>
        </motion.div>

        {/* Winner Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-accent-honey/20 to-energy-lime/20 border-2 border-accent-honey/50 rounded-3xl p-6 space-y-4"
        >
          {/* Winner Badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="text-accent-honey" size={24} />
            <span className="text-accent-honey font-bold text-sm uppercase tracking-wider">
              Winning Submission
            </span>
          </div>

          {/* Cover Image */}
          {winner.image_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-bg-secondary">
              <img
                src={winner.image_url}
                alt={winner.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h3 className="text-text-primary font-bold text-2xl mb-2">
              {winner.title}
            </h3>
            <p className="text-text-secondary text-base leading-relaxed">
              {winner.description}
            </p>
          </div>

          {/* Winner Info */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <p className="text-text-muted text-xs mb-1">Created by</p>
              <div className="flex items-center gap-2">
                {winner.user.avatar_url ? (
                  <img
                    src={winner.user.avatar_url}
                    alt={winner.user.display_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-mint to-accent-lilac flex items-center justify-center text-white font-bold">
                    {winner.user.display_name[0]}
                  </div>
                )}
                <div>
                  <p className="text-text-primary font-bold text-sm">
                    {winner.user.display_name}
                  </p>
                  <p className="text-text-muted text-xs">@{winner.user.username}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-text-muted text-xs mb-1">Votes Received</p>
              <div className="flex items-center gap-2">
                <Flame className="text-accent-pop-coral" size={20} />
                <span className="text-text-primary font-bold text-2xl">
                  {winner.vote_count}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-bg-card rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <Users size={16} />
              <span>Total Submissions</span>
            </div>
            <p className="text-text-primary font-bold text-2xl">
              {heist.submission_count}
            </p>
          </div>

          <div className="bg-bg-card rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <Flame size={16} />
              <span>Total Votes</span>
            </div>
            <p className="text-text-primary font-bold text-2xl">{heist.vote_count}</p>
          </div>
        </motion.div>

        {/* Prize Info */}
        {heist.prize_description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-accent-lilac/10 to-sport-purple/10 border border-accent-lilac/30 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <Trophy className="text-accent-lilac flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-text-primary font-bold text-sm mb-1">Prize</h4>
                <p className="text-text-secondary text-sm">
                  {heist.prize_description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Execution Week Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-br from-accent-mint/10 to-accent-sky/10 border border-accent-mint/30 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="text-accent-mint flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h4 className="text-text-primary font-bold text-sm mb-1">
                What's Next?
              </h4>
              <p className="text-text-secondary text-sm mb-3">
                The winning heist will be executed during the execution week. Join us to
                make it happen!
              </p>
              <div className="flex items-center gap-2 text-text-muted text-xs">
                <Calendar size={14} />
                <span>
                  {formatDate(heist.execution_week_start)} -{' '}
                  {formatDate(heist.execution_week_end)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/heist/${params.id}/execute`)}
            className="w-full bg-gradient-to-r from-accent-mint to-accent-lilac text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-between"
          >
            <span>Join Execution Week</span>
            <ChevronRight size={20} />
          </button>
        </motion.div>

        {/* Congratulations Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-3">🎊 🎉 🎊</div>
          <p className="text-text-primary font-bold text-lg mb-1">
            Congratulations to {winner.user.display_name}!
          </p>
          <p className="text-text-secondary text-sm">
            Your creative idea will come to life on campus
          </p>
        </motion.div>
      </div>
    </div>
  );
}
