'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Share2,
  Camera,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinnerData {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface HeistData {
  id: string;
  title: string;
  description: string;
  phase: string;
  execution_week_start: string;
  execution_week_end: string;
  winner_submission: WinnerData | null;
}

interface ExecutionMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
  icon: any;
}

export default function HeistExecutionPage() {
  const router = useRouter();
  const params = useParams();
  const [heist, setHeist] = useState<HeistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock execution milestones - in production, these would come from the backend
  const [milestones, setMilestones] = useState<ExecutionMilestone[]>([
    {
      id: '1',
      title: 'Planning Meeting',
      description: 'Finalize event logistics and team assignments',
      date: '2024-10-21',
      completed: true,
      icon: Users,
    },
    {
      id: '2',
      title: 'Setup & Preparation',
      description: 'Prepare venue, decorations, and materials',
      date: '2024-10-27',
      completed: true,
      icon: Calendar,
    },
    {
      id: '3',
      title: 'Event Day!',
      description: 'Execute the winning heist on campus',
      date: '2024-10-31',
      completed: false,
      icon: Sparkles,
    },
    {
      id: '4',
      title: 'Wrap Up & Share',
      description: 'Document and share the amazing moments',
      date: '2024-11-02',
      completed: false,
      icon: Camera,
    },
  ]);

  useEffect(() => {
    const fetchHeist = async () => {
      try {
        const response = await fetch(`/api/heist/${params.id}`);
        if (!response.ok) throw new Error('Failed to load heist');
        const data = await response.json();
        setHeist(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load execution data');
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilEvent = () => {
    if (!heist) return 0;
    const now = new Date().getTime();
    const eventStart = new Date(heist.execution_week_start).getTime();
    const diff = eventStart - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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
            Execution Not Available
          </div>
          <p className="text-text-secondary mb-4">
            {error || 'The heist execution hasn\'t started yet'}
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
  const daysUntil = getDaysUntilEvent();
  const isLive = heist.phase === 'executing';
  const isCompleted = heist.phase === 'completed';

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
              <h1 className="text-text-primary font-bold text-xl">Execution Week</h1>
              <p className="text-text-muted text-sm">{heist.title}</p>
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-bold uppercase">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-accent-lilac/20 to-sport-purple/20 border border-accent-lilac/30 rounded-3xl p-6 text-center"
        >
          <div className="text-5xl mb-3">🎬</div>
          <h2 className="text-text-primary font-bold text-2xl mb-2">
            {winner.title}
          </h2>
          <p className="text-text-secondary text-sm mb-4">is coming to life!</p>

          {!isCompleted && (
            <div className="inline-flex items-center gap-2 bg-bg-card/50 backdrop-blur-sm px-4 py-2 rounded-xl">
              <Clock size={16} className="text-accent-mint" />
              <span className="text-text-primary font-medium text-sm">
                {isLive ? 'Happening Now!' : `Starts in ${daysUntil} days`}
              </span>
            </div>
          )}
        </motion.div>

        {/* Winner Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card rounded-2xl p-5 border border-white/10"
        >
          <h3 className="text-text-primary font-semibold text-sm mb-3">
            The Winning Heist
          </h3>

          {winner.image_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-bg-secondary mb-4">
              <img
                src={winner.image_url}
                alt={winner.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <p className="text-text-secondary text-sm mb-4">{winner.description}</p>

          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs">Created by</span>
            {winner.user.avatar_url ? (
              <img
                src={winner.user.avatar_url}
                alt={winner.user.display_name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-mint to-accent-lilac flex items-center justify-center text-white text-xs font-bold">
                {winner.user.display_name[0]}
              </div>
            )}
            <span className="text-text-primary font-medium text-sm">
              {winner.user.display_name}
            </span>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-2xl p-5 border border-white/10"
        >
          <h3 className="text-text-primary font-semibold text-sm mb-4">
            Execution Timeline
          </h3>

          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;
              return (
                <div key={milestone.id} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                        milestone.completed
                          ? 'bg-accent-mint/20 border-accent-mint'
                          : 'bg-bg-secondary border-white/10'
                      )}
                    >
                      {milestone.completed ? (
                        <CheckCircle size={20} className="text-accent-mint" />
                      ) : (
                        <Icon
                          size={20}
                          className={cn(
                            milestone.completed ? 'text-accent-mint' : 'text-text-muted'
                          )}
                        />
                      )}
                    </div>
                    {index < milestones.length - 1 && (
                      <div
                        className={cn(
                          'w-0.5 flex-1 min-h-[40px] transition-colors',
                          milestone.completed ? 'bg-accent-mint/30' : 'bg-white/10'
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h4
                        className={cn(
                          'font-semibold text-sm',
                          milestone.completed ? 'text-text-primary' : 'text-text-secondary'
                        )}
                      >
                        {milestone.title}
                      </h4>
                      <span className="text-text-muted text-xs">
                        {formatDate(milestone.date)}
                      </span>
                    </div>
                    <p className="text-text-muted text-xs">{milestone.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 gap-4"
        >
          {/* Capture Moment CTA */}
          {isLive && (
            <button
              type="button"
              onClick={() => router.push('/moment/capture')}
              className="bg-gradient-to-r from-accent-mint to-accent-lilac text-gray-900 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Camera size={24} />
                <div className="text-left">
                  <div className="text-sm">Capture a Moment</div>
                  <div className="text-xs opacity-80">Share your experience</div>
                </div>
              </div>
              <Share2 size={20} />
            </button>
          )}

          {/* Event Details */}
          <div className="bg-bg-card rounded-xl p-4 border border-white/10">
            <h4 className="text-text-primary font-semibold text-sm mb-3">
              Event Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Calendar size={16} className="text-text-muted" />
                <span>
                  {formatDate(heist.execution_week_start)} -{' '}
                  {formatDate(heist.execution_week_end)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <MapPin size={16} className="text-text-muted" />
                <span>Campus-wide event</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Users size={16} className="text-text-muted" />
                <span>Open to all students</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Participation Reminder */}
        {!isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-accent-mint/10 to-accent-sky/10 border border-accent-mint/30 rounded-2xl p-5"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="text-accent-mint flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="text-text-primary font-bold text-sm mb-1">
                  Join the Fun!
                </h4>
                <p className="text-text-secondary text-xs">
                  This is a community event - everyone is welcome to participate and make
                  it epic. Share your moments and earn XP!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completed State */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-text-primary font-bold text-xl mb-2">
              Heist Complete!
            </h3>
            <p className="text-text-secondary text-sm">
              Thanks to everyone who participated and made it amazing
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
