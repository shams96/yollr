'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    type: 'xp' | 'item' | 'badge' | 'coins';
    amount?: number;
    name: string;
    description: string;
    emoji?: string;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-600',
};

export function RewardModal({ isOpen, onClose, reward }: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              className="relative bg-bg-card rounded-3xl p-8 max-w-md w-full pointer-events-auto border-2 border-accent-mint/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>

              {/* Confetti background */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{
                      top: '-10%',
                      left: `${Math.random() * 100}%`,
                      rotate: Math.random() * 360,
                    }}
                    animate={{
                      top: '110%',
                      rotate: Math.random() * 360 + 720,
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      delay: Math.random() * 0.5,
                      repeat: Infinity,
                    }}
                  >
                    <Sparkles
                      className={cn(
                        'w-4 h-4',
                        i % 3 === 0
                          ? 'text-accent-mint'
                          : i % 3 === 1
                          ? 'text-accent-lilac'
                          : 'text-accent-coral'
                      )}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10 text-center space-y-6">
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold bg-gradient-to-r from-accent-mint via-accent-lilac to-accent-coral bg-clip-text text-transparent"
                >
                  Reward Unlocked!
                </motion.h2>

                {/* Reward icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{
                    scale: { delay: 0.3, type: 'spring', stiffness: 200 },
                    rotate: { delay: 0.6, duration: 0.5 },
                  }}
                  className="flex justify-center"
                >
                  <div
                    className={cn(
                      'w-32 h-32 rounded-full flex items-center justify-center text-6xl bg-gradient-to-br shadow-2xl',
                      reward.rarity
                        ? rarityColors[reward.rarity]
                        : 'from-accent-mint to-accent-lilac'
                    )}
                  >
                    {reward.emoji || <Gift className="w-16 h-16 text-white" />}
                  </div>
                </motion.div>

                {/* Reward details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  {reward.amount && (
                    <div className="text-4xl font-bold text-text-primary">
                      +{reward.amount} {reward.type.toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-text-primary">
                    {reward.name}
                  </h3>
                  <p className="text-text-secondary text-sm max-w-xs mx-auto">
                    {reward.description}
                  </p>
                  {reward.rarity && (
                    <div
                      className={cn(
                        'inline-block px-4 py-1 rounded-full text-xs font-bold uppercase',
                        reward.rarity === 'common' && 'bg-gray-500/20 text-gray-300',
                        reward.rarity === 'rare' && 'bg-blue-500/20 text-blue-300',
                        reward.rarity === 'epic' && 'bg-purple-500/20 text-purple-300',
                        reward.rarity === 'legendary' &&
                          'bg-yellow-500/20 text-yellow-300'
                      )}
                    >
                      {reward.rarity}
                    </div>
                  )}
                </motion.div>

                {/* Claim button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={onClose}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-mint to-accent-lilac text-gray-900 font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-lg"
                >
                  Claim Reward
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
