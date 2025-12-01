'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Shuffle, SkipForward, X } from 'lucide-react';

// Mock data - replace with real data from your database
const questions = [
  {
    id: 1,
    emoji: '😊',
    text: 'Has the most integrity',
    gradient: 'from-purple-600 to-purple-800',
  },
  {
    id: 2,
    emoji: '😘',
    text: 'Think about them way more than they know',
    subtext: 'From a girl in 10th grade',
    gradient: 'from-pink-600 to-fuchsia-700',
  },
  {
    id: 3,
    emoji: '🔥',
    text: 'Most likely to be famous',
    gradient: 'from-orange-600 to-red-700',
  },
  {
    id: 4,
    emoji: '🎨',
    text: 'Most creative',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 5,
    emoji: '💪',
    text: 'Best gym buddy',
    gradient: 'from-green-600 to-emerald-700',
  },
  {
    id: 6,
    emoji: '🧠',
    text: 'Smartest person you know',
    gradient: 'from-cyan-600 to-blue-700',
  },
];

const mockFriends = [
  { id: '1', name: 'Stacey Smith', avatar: null },
  { id: '2', name: 'Michael Keller', avatar: null },
  { id: '3', name: 'Anthony Arnold', avatar: null },
  { id: '4', name: 'Taylor Anderson', avatar: null },
  { id: '5', name: 'Emma Wilson', avatar: null },
  { id: '6', name: 'James Brown', avatar: null },
  { id: '7', name: 'Olivia Davis', avatar: null },
  { id: '8', name: 'Noah Martinez', avatar: null },
];

export default function TBHPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentFriends, setCurrentFriends] = useState<typeof mockFriends>([]);
  const [direction, setDirection] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  // Shuffle and pick 4 random friends
  const shuffleFriends = () => {
    const shuffled = [...mockFriends].sort(() => Math.random() - 0.5);
    setCurrentFriends(shuffled.slice(0, 4));
  };

  useEffect(() => {
    shuffleFriends();
  }, [currentQuestionIndex]);

  const handleVote = (friendId: string) => {
    setSelectedFriend(friendId);
    // TODO: Submit vote to backend
    console.log('Voted for:', friendId, 'on question:', currentQuestion.id);

    // Move to next question after delay
    setTimeout(() => {
      nextQuestion();
    }, 800);
  };

  const nextQuestion = () => {
    setDirection(1);
    setSelectedFriend(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  const skipQuestion = () => {
    setDirection(1);
    setSelectedFriend(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Close button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-6 left-6 z-50 text-white/80 hover:text-white transition-colors"
      >
        <X size={28} />
      </button>

      {/* Progress indicator */}
      <div className="absolute top-6 right-6 z-50 text-white/80 text-sm font-medium">
        {currentQuestionIndex + 1}/{questions.length}
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentQuestionIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            currentQuestion.gradient,
            'flex flex-col items-center justify-center px-6 py-12'
          )}
        >
          {/* Emoji */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-8xl mb-8"
          >
            {currentQuestion.emoji}
          </motion.div>

          {/* Question text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12 space-y-2"
          >
            {currentQuestion.subtext && (
              <p className="text-white/70 text-sm font-medium">
                {currentQuestion.subtext}
              </p>
            )}
            <h1 className="text-white text-2xl font-bold leading-tight max-w-md">
              {currentQuestion.text}
            </h1>
          </motion.div>

          {/* Friend options */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-8">
            {currentFriends.map((friend, index) => (
              <motion.button
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => handleVote(friend.id)}
                className={cn(
                  'bg-white rounded-xl px-6 py-4 font-semibold text-gray-900',
                  'hover:scale-105 active:scale-95 transition-all duration-200',
                  'shadow-lg hover:shadow-xl',
                  selectedFriend === friend.id && 'ring-4 ring-white/50 scale-105'
                )}
              >
                {friend.name}
              </motion.button>
            ))}
          </div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-8 text-white/90"
          >
            <button
              onClick={shuffleFriends}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Shuffle size={20} />
              <span className="font-medium">Shuffle</span>
            </button>

            <button
              onClick={skipQuestion}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <SkipForward size={20} />
              <span className="font-medium">Skip</span>
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
