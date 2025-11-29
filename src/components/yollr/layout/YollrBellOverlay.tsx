'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Camera, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface YollrBellOverlayProps {
  isActive: boolean;
  onDismiss?: () => void;
  onCapture?: () => void;
  timeRemaining?: number; // seconds
}

/**
 * YollrBellOverlay - BeReal-style random bell trigger
 * Features: 2-minute countdown, bell animation, full-screen takeover
 */
export function YollrBellOverlay({
  isActive,
  onDismiss,
  onCapture,
  timeRemaining: initialTime = 120,
}: YollrBellOverlayProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [showPenalty, setShowPenalty] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowPenalty(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const handleCapture = () => {
    if (onCapture) {
      onCapture();
    }
  };

  const handleSkip = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/95 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dismiss Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-glass-heavy backdrop-blur-md text-white hover:bg-glass-medium transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-md w-full px-6 text-center space-y-8">
            {/* Bell Animation */}
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, -15, 15, -15, 15, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              >
                {/* Glow */}
                <div className="absolute inset-0 blur-2xl opacity-60">
                  <div className="w-full h-full bg-gradient-to-r from-accent-mint via-accent-lilac to-energy-lime rounded-full" />
                </div>

                {/* Bell Icon */}
                <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-br from-accent-mint via-accent-lilac to-energy-lime p-1">
                  <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center">
                    <Bell className="w-16 h-16 text-energy-lime" fill="currentColor" />
                  </div>
                </div>

                {/* Ring Pulses */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-energy-lime"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.8, 0.4, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-mint via-accent-lilac to-energy-lime bg-clip-text text-transparent">
                🔔 Yollr Bell!
              </h1>
              <p className="text-lg text-text-secondary">
                Time to capture a moment
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {!showPenalty ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-text-tertiary">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">Time remaining</span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-20 h-24 rounded-xl flex items-center justify-center text-5xl font-bold tabular-nums transition-colors',
                        timeRemaining <= 30
                          ? 'bg-error/20 text-error'
                          : 'bg-glass-medium text-text-primary'
                      )}>
                        {String(minutes).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-text-tertiary mt-1 uppercase">min</span>
                    </div>

                    <span className="text-3xl font-bold text-text-primary">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-20 h-24 rounded-xl flex items-center justify-center text-5xl font-bold tabular-nums transition-colors',
                        timeRemaining <= 30
                          ? 'bg-error/20 text-error'
                          : 'bg-glass-medium text-text-primary'
                      )}>
                        {String(seconds).padStart(2, '0')}
                      </div>
                      <span className="text-xs text-text-tertiary mt-1 uppercase">sec</span>
                    </div>
                  </div>

                  {/* Warning */}
                  {timeRemaining <= 30 && (
                    <motion.p
                      className="text-sm text-error font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      ⚠️ Hurry! You'll lose XP if you miss it
                    </motion.p>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="space-y-3"
                >
                  <div className="text-6xl">😢</div>
                  <p className="text-lg font-semibold text-error">Time's Up!</p>
                  <p className="text-sm text-text-secondary">
                    You missed the bell. -50 XP
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Actions */}
            {!showPenalty ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-3"
              >
                <motion.button
                  onClick={handleCapture}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-accent-mint via-accent-lilac to-energy-lime text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-6 h-6" />
                  Capture Moment Now
                </motion.button>

                <button
                  onClick={handleSkip}
                  className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  Skip (-50 XP)
                </button>
              </motion.div>
            ) : (
              <motion.button
                onClick={handleSkip}
                className="w-full py-3 px-6 rounded-xl bg-glass-medium hover:bg-glass-heavy text-white font-semibold transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            )}
          </div>

          {/* Confetti Effect (when captured on time) */}
          {timeRemaining > 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    background: ['#6FF2C6', '#C8A3FF', '#C8FF4E'][Math.floor(Math.random() * 3)],
                  }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{
                    y: '100vh',
                    opacity: [0, 1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
