'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowLeft, Diamond, Users, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data - replace with real data from backend
const mockGems = [
  {
    id: '1',
    emoji: '📚',
    text: 'Most likely to be on SNL',
    voteCount: 263,
    category: 'humor',
  },
  {
    id: '2',
    emoji: '🎨',
    text: 'Most creative',
    voteCount: 189,
    category: 'talent',
  },
  {
    id: '3',
    emoji: '🤝',
    text: 'Your ideal study buddy',
    voteCount: 156,
    category: 'friendship',
  },
  {
    id: '4',
    emoji: '😊',
    text: 'Has the most integrity',
    voteCount: 142,
    category: 'character',
  },
  {
    id: '5',
    emoji: '💪',
    text: 'Best gym partner',
    voteCount: 128,
    category: 'fitness',
  },
];

const mockProfile = {
  username: '@jweaugh',
  displayName: 'Jonathan Smith',
  avatarUrl: null,
  school: 'OPIOTA',
  grade: 'Grade 12',
  totalGems: 263,
};

export default function ProfileGemsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'gems' | 'stats'>('gems');

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'humor':
        return 'text-accent-coral';
      case 'talent':
        return 'text-accent-lilac';
      case 'friendship':
        return 'text-accent-mint';
      case 'character':
        return 'text-accent-honey';
      case 'fitness':
        return 'text-accent-blue';
      default:
        return 'text-accent-mint';
    }
  };

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
              <h1 className="text-text-primary font-bold text-xl">
                {mockProfile.displayName}
              </h1>
              <p className="text-text-muted text-sm">{mockProfile.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card rounded-2xl p-6 mb-6 border border-white/10"
        >
          {/* Avatar and Name */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-mint to-accent-lilac flex items-center justify-center text-4xl">
              {mockProfile.displayName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-text-primary font-bold text-xl">
                {mockProfile.displayName}
              </h2>
              <p className="text-text-secondary text-sm mb-1">
                {mockProfile.username}
              </p>
              <div className="flex items-center gap-3 text-text-muted text-sm">
                <span className="flex items-center gap-1">
                  <Award size={14} />
                  {mockProfile.school}
                </span>
                <span>•</span>
                <span>{mockProfile.grade}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-bg-primary/50 rounded-xl">
            <div className="text-center">
              <div className="text-accent-mint text-2xl font-bold">
                {mockProfile.totalGems}
              </div>
              <div className="text-text-muted text-xs">Total Gems</div>
            </div>
            <div className="text-center">
              <div className="text-accent-lilac text-2xl font-bold">
                {mockGems.length}
              </div>
              <div className="text-text-muted text-xs">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-accent-coral text-2xl font-bold">
                #12
              </div>
              <div className="text-text-muted text-xs">Rank</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('gems')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
              activeTab === 'gems'
                ? 'bg-accent-mint/20 text-accent-mint border border-accent-mint/30'
                : 'bg-bg-card text-text-secondary border border-white/10'
            )}
          >
            Top Gems
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-semibold transition-all',
              activeTab === 'stats'
                ? 'bg-accent-mint/20 text-accent-mint border border-accent-mint/30'
                : 'bg-bg-card text-text-secondary border border-white/10'
            )}
          >
            Statistics
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'gems' && (
            <motion.div
              key="gems"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {mockGems.map((gem, index) => (
                <motion.div
                  key={gem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-bg-card rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{gem.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-text-primary font-semibold">
                        {gem.text}
                      </h3>
                      <p
                        className={cn(
                          'text-sm font-medium capitalize',
                          getCategoryColor(gem.category)
                        )}
                      >
                        {gem.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Diamond
                        size={16}
                        className="text-accent-mint"
                        fill="currentColor"
                      />
                      <span className="text-accent-mint font-bold text-lg">
                        {gem.voteCount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-bg-card rounded-xl p-6 border border-white/10"
            >
              <div className="text-center text-text-muted">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>Detailed statistics coming soon!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA to vote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-br from-accent-mint/20 to-accent-lilac/20 rounded-2xl p-6 border border-accent-mint/30"
        >
          <h3 className="text-text-primary font-bold text-lg mb-2">
            Help your friends shine! ✨
          </h3>
          <p className="text-text-secondary text-sm mb-4">
            Vote on polls to give your friends gems and boost their profile.
          </p>
          <button
            onClick={() => router.push('/tbh')}
            className="w-full bg-gradient-to-r from-accent-mint to-accent-lilac text-gray-900 font-bold py-3 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Start Voting
          </button>
        </motion.div>
      </div>
    </div>
  );
}
