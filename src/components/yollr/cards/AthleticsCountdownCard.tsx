'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Bell } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AthleticsCountdownCardProps {
  id: string;
  sportType: 'football' | 'basketball' | 'soccer' | 'volleyball' | 'hockey';
  opponent: string;
  gameTime: string;
  location: string;
  homeTeam: string;
  awayTeam: string;
  squadCount?: number;
  isRivalry?: boolean;
  onNotify?: () => void;
  onJoinSquad?: () => void;
  className?: string;
}

const sportEmojis = {
  football: '🏈',
  basketball: '🏀',
  soccer: '⚽',
  volleyball: '🏐',
  hockey: '🏒',
};

const sportColors = {
  football: 'from-sport-football to-sport-football',
  basketball: 'from-sport-basketball to-sport-basketball',
  soccer: 'from-sport-soccer to-sport-soccer',
  volleyball: 'from-sport-volleyball to-sport-volleyball',
  hockey: 'from-sport-hockey to-sport-hockey',
};

/**
 * AthleticsCountdownCard - Game countdown card with squad participation
 * Features: Live countdown, rivalry badge, squad joining, notification bell
 */
export function AthleticsCountdownCard({
  id,
  sportType,
  opponent,
  gameTime,
  location,
  homeTeam,
  awayTeam,
  squadCount = 0,
  isRivalry = false,
  onNotify,
  onJoinSquad,
  className,
}: AthleticsCountdownCardProps) {
  const [countdown, setCountdown] = useState(getCountdown(gameTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(gameTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameTime]);

  return (
    <GlassCard
      variant="heavy"
      gradient="athletics"
      glow={isRivalry}
      className={cn('overflow-hidden', className)}
    >
      {/* Header with Sport Badge */}
      <div className={cn(
        'p-5 bg-gradient-to-r text-white relative overflow-hidden',
        sportColors[sportType]
      )}>
        {isRivalry && (
          <div className="absolute top-2 right-2">
            <motion.div
              className="px-2 py-1 rounded-full bg-error/90 backdrop-blur-sm text-xs font-bold uppercase tracking-wider"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔥 Rivalry Week
            </motion.div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{sportEmojis[sportType]}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold leading-tight">
              {homeTeam} vs {opponent}
            </h3>
            <p className="text-sm opacity-90">{sportType.charAt(0).toUpperCase() + sportType.slice(1)}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-2 py-4">
          {countdown.days > 0 && (
            <CountdownUnit value={countdown.days} label="days" />
          )}
          <CountdownUnit value={countdown.hours} label="hrs" />
          <span className="text-2xl font-bold">:</span>
          <CountdownUnit value={countdown.minutes} label="min" />
          <span className="text-2xl font-bold">:</span>
          <CountdownUnit value={countdown.seconds} label="sec" />
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        {/* Time & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar className="w-4 h-4" />
            <span>{new Date(gameTime).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        {/* Squad Participation */}
        {squadCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-glass-medium">
            <Users className="w-4 h-4 text-hyper-pink" />
            <span className="text-sm text-text-primary">
              <span className="font-semibold">{squadCount}</span> squads are going
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            onClick={onJoinSquad}
            className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-hyper-pink to-hyper-pink-light text-white font-semibold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Join Squad
          </motion.button>

          <motion.button
            onClick={onNotify}
            className="p-2.5 rounded-lg bg-glass-medium hover:bg-glass-heavy transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-5 h-5 text-text-primary" />
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        className="text-3xl font-bold tabular-nums"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <div className="text-xs opacity-75 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function getCountdown(gameTime: string) {
  const now = new Date().getTime();
  const target = new Date(gameTime).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}
