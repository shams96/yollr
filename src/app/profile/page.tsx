'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit3,
  Trophy,
  Zap,
  Flame,
  Camera,
  Users,
  Settings,
  Award,
  TrendingUp,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  // User data
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    moments: 0,
    polls: 0,
    heists: 0,
    level: 1,
    xp: 0,
    nextLevelXP: 1000,
  });
  const [streaks, setStreaks] = useState({
    yollrBell: 0,
    daily: 0,
  });
  const [campus, setCampus] = useState<any>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Background colors (solid Gen-Z colors)
  const bgColors = [
    'bg-accent-mint',
    'bg-accent-sky',
    'bg-accent-lilac',
    'bg-accent-coral',
  ];
  const [bgColor] = useState(bgColors[Math.floor(Math.random() * bgColors.length)]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);

      // Get profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setNewUsername((profileData as any).username || '');
      }

      // Get campus
      const { data: membership } = await supabase
        .from('campus_memberships')
        .select('campuses(name, city, state)')
        .eq('user_id', authUser.id)
        .is('left_at', null)
        .single();

      if (membership) {
        setCampus((membership as any).campuses);
      }

      // Get stats
      const { data: momentsCount } = await supabase
        .from('moments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

      const { data: pollVotesCount } = await supabase
        .from('poll_votes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

      const { data: heistSubmissionsCount } = await supabase
        .from('heist_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

      // Get streaks
      const { data: streaksData } = await supabase
        .from('user_streaks')
        .select('streak_type, current_streak')
        .eq('user_id', authUser.id);

      // @ts-ignore - user_streaks table schema
      const yollrBellStreak = streaksData?.find(s => s.streak_type === 'yollr_bell')?.current_streak || 0;
      // @ts-ignore - user_streaks table schema
      const dailyStreak = streaksData?.find(s => s.streak_type === 'daily')?.current_streak || 0;

      setStats({
        moments: (momentsCount as any)?.count || 0,
        polls: (pollVotesCount as any)?.count || 0,
        heists: (heistSubmissionsCount as any)?.count || 0,
        level: (profileData as any)?.level || 1,
        xp: (profileData as any)?.xp || 0,
        nextLevelXP: (profileData as any)?.next_level_xp || 1000,
      });

      setStreaks({
        yollrBell: yollrBellStreak,
        daily: dailyStreak,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameEdit = async () => {
    if (!user || !newUsername.trim()) return;

    try {
      // @ts-ignore - users table schema
      const { error } = await (supabase as any)
        .from('users')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) {
        alert('Error updating username: ' + error.message);
        return;
      }

      setProfile({ ...profile, username: newUsername.trim() });
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
    }
  };

  const getXPPercentage = () => {
    return (stats.xp / stats.nextLevelXP) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-accent-mint text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
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
          className="absolute top-20 right-10 w-40 h-40 bg-white rounded-full blur-3xl"
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
          className="absolute bottom-40 left-10 w-32 h-32 bg-white rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/feed')}
          className="text-white hover:text-white/80 transition-colors backdrop-blur-sm bg-black/20 rounded-full p-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={() => router.push('/settings')}
          className="text-white hover:text-white/80 transition-colors backdrop-blur-sm bg-black/20 rounded-full p-2"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 pt-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-md w-full"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="relative inline-block"
          >
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl text-white">
                  {profile?.display_name?.charAt(0) || '?'}
                </span>
              )}
            </div>

            {/* Level badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 font-black px-4 py-1 rounded-full text-sm shadow-lg"
            >
              Level {stats.level}
            </motion.div>
          </motion.div>

          {/* Username */}
          <div className="space-y-2">
            {isEditingUsername ? (
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-white/30 backdrop-blur-sm text-white font-bold text-2xl px-4 py-2 rounded-xl text-center placeholder-white/50 border-2 border-white/50 focus:outline-none focus:border-white"
                  placeholder="Username"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleUsernameEdit}
                  className="bg-white text-gray-900 p-2 rounded-lg font-bold"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <h1 className="text-white font-black text-4xl">
                  @{profile?.username || 'anonymous'}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingUsername(true)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Edit3 className="h-5 w-5" />
                </button>
              </div>
            )}

            <p className="text-white/80 text-lg font-medium">
              {profile?.display_name || 'Yollr User'}
            </p>

            {campus && (
              <p className="text-white/60 text-sm font-medium">
                📍 {campus.name}
              </p>
            )}
          </div>

          {/* XP Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-white/90 text-sm font-bold">
              <span>XP Progress</span>
              <span>{stats.xp} / {stats.nextLevelXP}</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getXPPercentage()}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-accent-mint via-energy-lime to-accent-honey rounded-full"
              />
            </div>
          </motion.div>

          {/* Streaks */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-accent-coral/50"
            >
              <Flame className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-black text-3xl">{streaks.yollrBell}</div>
              <div className="text-white/80 text-xs font-medium">Bell Streak</div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-energy-lime/50"
            >
              <TrendingUp className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-black text-3xl">{streaks.daily}</div>
              <div className="text-white/80 text-xs font-medium">Daily Streak</div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <Camera className="h-5 w-5 text-white mx-auto mb-2" />
              <div className="text-white font-black text-2xl">{stats.moments}</div>
              <div className="text-white/80 text-xs font-medium">Moments</div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <Trophy className="h-5 w-5 text-white mx-auto mb-2" />
              <div className="text-white font-black text-2xl">{stats.heists}</div>
              <div className="text-white/80 text-xs font-medium">Heists</div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
              <Users className="h-5 w-5 text-white mx-auto mb-2" />
              <div className="text-white font-black text-2xl">{stats.polls}</div>
              <div className="text-white/80 text-xs font-medium">Polls</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/profile/gems')}
              className="w-full bg-white text-gray-900 font-black text-lg px-8 py-4 rounded-xl shadow-2xl flex items-center justify-center gap-2"
            >
              <Star className="h-6 w-6" />
              View Achievements
            </motion.button>

            <button
              type="button"
              onClick={() => router.push('/feed')}
              className="text-white/70 hover:text-white font-bold text-sm transition-colors"
            >
              Back to Feed
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
