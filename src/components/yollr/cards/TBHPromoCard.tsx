'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassCard } from '../ui/GlassCard';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TBHPromoCardProps {
  className?: string;
}

/**
 * TBHPromoCard - Promotional card for tbh-style anonymous polling
 * Drives engagement to the voting feature
 */
export function TBHPromoCard({ className }: TBHPromoCardProps) {
  const router = useRouter();

  const emojis = ['😊', '🔥', '💪', '🎨', '🧠', '😘'];

  return (
    <GlassCard
      variant="medium"
      gradient="primaryCTA"
      glow
      className={cn('cursor-pointer group', className)}
      onClick={() => router.push('/tbh')}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-6">
        {/* Header with animated emojis */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-mint" />
            <h3 className="text-text-primary font-bold text-lg">
              Give Gems to Friends
            </h3>
          </div>
          <ArrowRight className="w-5 h-5 text-accent-mint group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Floating emojis */}
        <div className="flex items-center justify-center gap-2 mb-4 py-3">
          {emojis.map((emoji, index) => (
            <motion.div
              key={index}
              initial={{ y: 0 }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
                ease: 'easeInOut',
              }}
              className="text-3xl"
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        {/* Description */}
        <p className="text-text-secondary text-sm mb-4 text-center">
          Vote on fun questions about your friends and help them collect gems!
        </p>

        {/* CTA */}
        <div className="bg-gradient-to-r from-accent-mint to-accent-lilac rounded-xl p-4 text-center">
          <p className="text-gray-900 font-bold">
            Start Voting Now
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-accent-mint font-bold text-lg">156</div>
            <div className="text-text-muted text-xs">Active Polls</div>
          </div>
          <div className="text-center">
            <div className="text-accent-lilac font-bold text-lg">2.3K</div>
            <div className="text-text-muted text-xs">Votes Today</div>
          </div>
          <div className="text-center">
            <div className="text-accent-coral font-bold text-lg">89%</div>
            <div className="text-text-muted text-xs">Participation</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
