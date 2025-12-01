'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Zap, Camera, Flame } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function YollrBellPage() {
  const router = useRouter();
  const supabase = createClient();

  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [streak, setStreak] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [hasPostedToday, setHasPostedToday] = useState(false);

  useEffect(() => {
    checkBellStatus();
    loadStreak();
  }, []);

  useEffect(() => {
    if (!isActive || hasPostedToday) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-redirect to camera when time's up
          router.push('/moment/capture?bell=true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, hasPostedToday, router]);

  const checkBellStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user has already posted during this Bell window (last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      const { data: recentMoment } = await supabase
        .from('moments')
        .select('id')
        .eq('user_id', user.id)
        .eq('source', 'yollr_bell')
        .gte('created_at', twoHoursAgo)
        .single();

      if (recentMoment) {
        setHasPostedToday(true);
        setIsActive(false);
      }
    } catch (error) {
      console.error('Error checking Bell status:', error);
    }
  };

  const loadStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // @ts-ignore - user_streaks table needs to be created in database
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .eq('streak_type', 'yollr_bell')
        .single();

      if (streakData) {
        // @ts-ignore - user_streaks table schema
        setStreak(streakData.current_streak);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleCapture = () => {
    router.push('/moment/capture?bell=true');
  };

  const handleSkip = () => {
    router.push('/feed');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Already posted view
  if (hasPostedToday) {
    return (
      <div className="min-h-screen bg-accent-honey flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-9xl"
          >
            ✅
          </motion.div>

          <h1 className="text-white font-black text-5xl">
            You're all set!
          </h1>

          <p className="text-white/90 text-xl font-medium">
            You already captured this Bell moment
          </p>

          {streak > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-center gap-3">
                <Flame className="h-8 w-8 text-white" />
                <span className="text-white text-3xl font-black">
                  {streak} day streak!
                </span>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/feed')}
            className="bg-white text-gray-900 font-black text-xl px-12 py-5 rounded-full shadow-2xl"
          >
            Back to Feed
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Active Bell countdown view
  return (
    <div className="min-h-screen bg-accent-honey flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-8 z-10"
      >
        {/* Bell icon with animation */}
        <motion.div
          animate={{
            rotate: [0, 15, -15, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { repeat: Infinity, duration: 1.5 },
            scale: { repeat: Infinity, duration: 2 }
          }}
          className="flex justify-center"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-8">
            <Bell className="h-24 w-24 text-white" fill="white" />
          </div>
        </motion.div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-white font-black text-7xl tracking-tight">
            Yollr Bell!
          </h1>
          <p className="text-white/90 text-2xl font-bold">
            Time to capture campus right now 📸
          </p>
        </div>

        {/* Countdown */}
        <motion.div
          key={countdown}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/30 backdrop-blur-md rounded-3xl p-10 border-4 border-white/50"
        >
          <div className="flex flex-col items-center gap-2">
            <Zap className="h-10 w-10 text-white animate-pulse" />
            <div className="text-white text-8xl font-black tracking-tighter">
              {formatTime(countdown)}
            </div>
            <p className="text-white/90 text-lg font-bold">
              to capture your moment
            </p>
          </div>
        </motion.div>

        {/* Streak indicator */}
        {streak > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-5"
          >
            <div className="flex items-center justify-center gap-3">
              <Flame className="h-7 w-7 text-white" />
              <span className="text-white text-2xl font-black">
                {streak} day streak
              </span>
            </div>
            <p className="text-white/80 text-sm font-medium mt-2">
              Don't break it! Post within {formatTime(countdown)}
            </p>
          </motion.div>
        )}

        {/* CTA buttons */}
        <div className="space-y-4 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCapture}
            className="w-full bg-white text-gray-900 font-black text-2xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-3"
          >
            <Camera className="h-7 w-7" />
            Capture Now
          </motion.button>

          <button
            type="button"
            onClick={handleSkip}
            className="text-white/70 hover:text-white font-bold text-lg transition-colors"
          >
            Skip this Bell
          </button>
        </div>

        {/* Info text */}
        <p className="text-white/60 text-sm font-medium">
          Everyone on campus is posting right now!
        </p>
      </motion.div>
    </div>
  );
}
