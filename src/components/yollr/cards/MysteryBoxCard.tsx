'use client';

import { motion, useAnimation } from 'framer-motion';
import { Gift, Sparkles, Star } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface MysteryBoxCardProps {
  id: string;
  canOpen: boolean;
  requiresLevel?: number;
  userLevel?: number;
  onOpen?: () => void;
  className?: string;
}

/**
 * MysteryBoxCard - Gamified mystery box with shake animation
 * Features: Shake on hover, level gate, sparkle effects
 */
export function MysteryBoxCard({
  id,
  canOpen,
  requiresLevel,
  userLevel = 0,
  onOpen,
  className,
}: MysteryBoxCardProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [sparklePositions, setSparklePositions] = useState<Array<{ x: number; y: number }>>([]);
  const controls = useAnimation();

  // Generate random sparkle positions only on client to avoid hydration errors
  useEffect(() => {
    setSparklePositions(
      [...Array(6)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
    );
  }, []);

  const handleHover = async () => {
    if (!canOpen) return;

    setIsShaking(true);
    await controls.start({
      rotate: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 },
    });
    setIsShaking(false);
  };

  const handleClick = () => {
    if (canOpen && onOpen) {
      onOpen();
    }
  };

  const meetsLevelRequirement = !requiresLevel || userLevel >= requiresLevel;
  const isLocked = !canOpen || !meetsLevelRequirement;

  return (
    <GlassCard
      variant="heavy"
      gradient="reward"
      glow={canOpen && meetsLevelRequirement}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Background sparkles */}
      {canOpen && meetsLevelRequirement && sparklePositions.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {sparklePositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{
                x: `${pos.x}%`,
                y: `${pos.y}%`,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-4 h-4 text-lime-zing" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative p-8">
        {/* Mystery Box */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={controls}
            onHoverStart={handleHover}
            className={cn(
              'relative cursor-pointer',
              isLocked && 'cursor-not-allowed opacity-50'
            )}
            onClick={handleClick}
          >
            {/* Glow effect */}
            {canOpen && meetsLevelRequirement && (
              <motion.div
                className="absolute inset-0 blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-full h-full bg-gradient-to-r from-coral via-hyper-pink to-lime-zing rounded-full" />
              </motion.div>
            )}

            {/* Box Icon */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Gift className="w-full h-full text-text-primary" strokeWidth={1.5} />

              {/* Lock overlay */}
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-obsidian/60 backdrop-blur-sm rounded-lg">
                  <div className="text-4xl">🔒</div>
                </div>
              )}

              {/* Stars */}
              {!isLocked && (
                <>
                  <motion.div
                    className="absolute top-0 right-0"
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                    }}
                  >
                    <Star className="w-6 h-6 text-xp-gold" fill="currentColor" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-0 left-0"
                    animate={{
                      rotate: -360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                      scale: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
                    }}
                  >
                    <Star className="w-5 h-5 text-hyper-pink" fill="currentColor" />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-text-primary">
              {isLocked ? 'Mystery Box Locked' : 'Mystery Box Ready!'}
            </h3>

            <p className="text-sm text-text-secondary max-w-xs">
              {isLocked && requiresLevel && userLevel < requiresLevel
                ? `Reach level ${requiresLevel} to unlock`
                : isLocked
                ? 'Complete more challenges to unlock'
                : 'Tap to reveal your reward'}
            </p>

            {canOpen && meetsLevelRequirement && (
              <motion.div
                className="text-xs text-lime-zing font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ Shake to preview ✨
              </motion.div>
            )}
          </div>

          {/* Open Button */}
          {canOpen && meetsLevelRequirement && (
            <motion.button
              onClick={handleClick}
              className="mt-2 px-6 py-3 rounded-lg bg-gradient-to-r from-coral via-hyper-pink to-lime-zing text-white font-bold text-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Open Box
            </motion.button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
