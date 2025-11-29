'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Heart, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onComplete: () => void;
}

const SPORTS = [
  { id: 'football', name: 'Football', icon: '🏈' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'baseball', name: 'Baseball', icon: '⚾' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' },
];

const INTERESTS = [
  'Campus Events', 'Parties', 'Sports Games', 'Study Groups',
  'Food & Dining', 'Greek Life', 'Music & Arts', 'Gaming'
];

export default function ProfileCompletionModal({
  isOpen,
  onClose,
  userId,
  onComplete
}: ProfileCompletionModalProps) {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleSport = (sportId: string) => {
    setSelectedSports(prev =>
      prev.includes(sportId)
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selectedSports.length === 0 || selectedInterests.length === 0) return;

    setSubmitting(true);
    try {
      const supabase = createClient();

      // Update profile with preferences
      // Get current XP first
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp')
        .eq('id', userId)
        .single();

      // @ts-ignore - profile fields from migration
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          favorite_sports: selectedSports,
          interests: selectedInterests,
          favorite_team: favoriteTeam || null,
          profile_completed_at: new Date().toISOString(),
          total_xp: ((profile as any)?.total_xp || 0) + 100,
        })
        .eq('id', userId);

      if (error) throw error;

      onComplete();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-graphite via-midnight to-graphite rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-cosmic-pink to-electric-peach rounded-2xl flex items-center justify-center mx-auto">
                {step === 1 ? <Trophy className="h-8 w-8 text-white" /> : <Heart className="h-8 w-8 text-white" />}
              </div>
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-2">
              {step === 1 ? 'What sports do you love?' : 'What interests you?'}
            </h2>
            <p className="text-cloud/70 text-sm">
              {step === 1
                ? 'Help us personalize your feed with content you care about'
                : 'We\'ll show you events and moments that match your vibe'}
            </p>
          </div>

          {/* Step 1: Sports */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                {SPORTS.map((sport) => (
                  <motion.button
                    key={sport.id}
                    type="button"
                    onClick={() => toggleSport(sport.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      selectedSports.includes(sport.id)
                        ? 'bg-gradient-to-br from-cosmic-pink/20 to-electric-peach/20 border-cosmic-pink'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{sport.icon}</div>
                    <div className="text-white font-bold text-sm">{sport.name}</div>
                    {selectedSports.includes(sport.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-cosmic-pink rounded-full flex items-center justify-center"
                      >
                        <Sparkles className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Favorite Team (Optional) */}
              {selectedSports.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4"
                >
                  <label className="block text-white/70 text-sm font-bold mb-2">
                    Favorite Team (Optional)
                  </label>
                  <input
                    type="text"
                    value={favoriteTeam}
                    onChange={(e) => setFavoriteTeam(e.target.value)}
                    placeholder="e.g., Lakers, Patriots..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cosmic-pink transition-colors"
                  />
                </motion.div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedSports.length === 0}
                className="w-full py-4 bg-gradient-to-r from-cosmic-pink to-electric-peach text-white font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cosmic-pink/50 transition-all"
              >
                Next →
              </button>
            </motion.div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <motion.button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-gradient-to-r from-cosmic-pink to-electric-peach text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {interest}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={selectedInterests.length === 0 || submitting}
                  className="flex-2 flex-grow py-4 bg-gradient-to-r from-cosmic-pink to-electric-peach text-white font-black text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cosmic-pink/50 transition-all"
                >
                  {submitting ? 'Saving...' : '🎉 Complete & Earn 100 XP'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Skip Option */}
          <button
            type="button"
            onClick={handleSkip}
            className="w-full mt-4 text-white/50 hover:text-white/70 text-sm font-semibold transition-colors"
          >
            I'll do this later
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
