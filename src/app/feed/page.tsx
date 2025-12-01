'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, User, Camera, Flame, Trophy,
  Users, Clock, Sparkles, ChevronRight, Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFeedData } from '@/hooks/useFeedData';
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import InviteCodeCard from '@/components/InviteCodeCard';
import { createClient } from '@/lib/supabase/client';

export default function FeedPage() {
  const router = useRouter();
  const feedData = useFeedData();

  // Local state for Mystery Box opening
  const [boxOpened, setBoxOpened] = useState(false);

  // Profile completion modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Extract data from hook
  const {
    profile,
    userLevel,
    userXP,
    streak,
    liveUsers,
    canOpenBox,
    activeBell,
    bellTimeRemaining,
    activeHeist,
    nextEvent,
    squadsGoing,
    activePoll,
    topPlayers,
    userRank,
    loading,
    error,
  } = feedData;

  // Format time remaining for bell
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check for profile completion and trigger modal
  useEffect(() => {
    const checkProfileCompletion = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // @ts-ignore - profile_completed_at field from migration
      if (user && profile && !profile.profile_completed_at) {
        setUserId(user.id);

        // Show modal after first interaction (click anywhere)
        const handleFirstInteraction = () => {
          setTimeout(() => {
            setShowProfileModal(true);
          }, 1000); // Delay slightly for better UX
        };

        document.addEventListener('click', handleFirstInteraction, { once: true });

        return () => {
          document.removeEventListener('click', handleFirstInteraction);
        };
      }
    };

    if (!loading && !error) {
      checkProfileCompletion();
    }
  }, [profile, loading, error]);

  const handleProfileComplete = () => {
    // Refresh feed data to show updated profile
    window.location.reload();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight via-graphite to-midnight text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cosmic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cloud/70">Loading your feed...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-midnight via-graphite to-midnight text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-electric-peach mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cosmic-pink text-white px-6 py-2 rounded-full font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight via-graphite to-midnight text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
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
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-cosmic-pink to-electric-peach rounded-full blur-3xl"
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
          className="absolute bottom-40 left-20 w-48 h-48 bg-gradient-to-r from-accent-mint to-energy-lime rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-midnight/80 border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-3">
            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl font-black bg-gradient-to-r from-accent-mint via-cosmic-pink to-energy-lime bg-clip-text text-transparent animate-gradient"
            >
              Yollr
            </motion.h1>

            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1 bg-gradient-to-r from-energy-lime to-accent-mint px-3 py-1 rounded-full"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs font-bold text-white">{liveUsers} online</span>
              </motion.div>

              <button
                type="button"
                onClick={() => router.push('/notifications')}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-electric-peach rounded-full" />
              </button>

              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold flex items-center gap-1">
                <Trophy className="w-4 h-4 text-accent-honey" />
                Level {userLevel}
              </span>
              <span className="text-cloud/70">{userXP} / 1000 XP</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userXP / 1000) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-accent-mint via-energy-lime to-accent-honey rounded-full relative"
              >
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/moment/capture')}
              className="flex items-center gap-2 bg-gradient-to-r from-cosmic-pink to-electric-peach px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap shadow-lg"
            >
              <Camera className="w-4 h-4" />
              Capture Moment
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/heist')}
              className="flex items-center gap-2 bg-gradient-to-r from-accent-honey to-energy-lime px-4 py-2 rounded-full font-bold text-sm text-midnight whitespace-nowrap shadow-lg"
            >
              <Trophy className="w-4 h-4" />
              Join Heist
            </motion.button>

            <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-full text-sm">
              <Flame className="w-4 h-4 text-electric-peach" />
              <span className="font-bold">{streak}</span>
              <span className="text-cloud/70">day streak</span>
            </div>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 relative z-10">
        {/* 🔥 YOLLR BELL - Urgent CTA - Only show if active */}
        {activeBell && bellTimeRemaining > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-honey via-energy-lime to-accent-mint p-1 cursor-pointer"
            onClick={() => router.push('/bell')}
          >
            <div className="bg-midnight/40 backdrop-blur-sm rounded-[22px] p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-white/20 p-3 rounded-full"
                  >
                    <Bell className="w-8 h-8 text-white" fill="white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">Yollr Bell! 🔔</h3>
                    <p className="text-white/80 text-sm font-medium">Everyone's posting right NOW</p>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1 text-white font-black text-lg">
                    <Clock className="w-4 h-4" />
                    {formatTime(bellTimeRemaining)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-pink to-electric-peach border-2 border-white" />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center text-xs font-bold">
                    +{activeBell.participants_count}
                  </div>
                </div>
                <span className="text-white/80 text-sm font-bold">posting now!</span>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white text-midnight font-black text-lg py-4 rounded-xl shadow-2xl flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Before Time Runs Out!
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 🏆 HEIST OF THE WEEK - Hero Module - Only show if active */}
        {activeHeist && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sport-purple via-accent-lilac to-cosmic-pink p-1 cursor-pointer"
            onClick={() => router.push('/heist')}
          >
            <div className="bg-midnight/60 backdrop-blur-sm rounded-[22px] p-6">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-accent-honey/20 border border-accent-honey/50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent-honey" />
                  <span className="text-accent-honey font-black text-xs">
                    {activeHeist.phase === 'submitting' ? 'SUBMISSIONS OPEN' : 'VOTING OPEN'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-xs">
                  <Clock className="w-3 h-3" />
                  {Math.ceil((new Date(activeHeist.phase === 'submitting' ? activeHeist.submission_closes_at : activeHeist.voting_closes_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                {activeHeist.title}
              </h2>
              <p className="text-white/80 text-sm mb-4 line-clamp-2">
                {activeHeist.description}
              </p>

              {/* Prize */}
              <div className="bg-gradient-to-r from-accent-honey/20 to-energy-lime/20 border border-accent-honey/30 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 text-accent-honey">
                  <Trophy className="w-5 h-5" />
                  <span className="font-black text-lg">$5,000 Event Budget + Campus Fame</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-cosmic-pink" />
                    <span className="text-white/60 text-xs font-bold">Submissions</span>
                  </div>
                  <div className="text-white font-black text-2xl">{activeHeist.total_submissions}</div>
                  <div className="text-white/60 text-xs">and counting! 🔥</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-energy-lime" />
                    <span className="text-white/60 text-xs font-bold">Votes</span>
                  </div>
                  <div className="text-white font-black text-2xl">{activeHeist.total_votes}</div>
                  <div className="text-white/60 text-xs">participate now!</div>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-accent-honey to-energy-lime text-midnight font-black text-lg py-4 rounded-xl shadow-2xl flex items-center justify-center gap-2"
              >
                {activeHeist.phase === 'submitting' ? 'Submit Your Idea' : 'Vote Now'}
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 🎁 MYSTERY BOX - Gamification - Only show if user has boxes */}
        {canOpenBox && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, rotate: !boxOpened ? 1 : 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-coral via-cosmic-pink to-accent-lilac p-1 cursor-pointer"
          >
            <div className="bg-midnight/60 backdrop-blur-sm rounded-[22px] p-8 text-center">
              <motion.div
                animate={{
                  rotate: !boxOpened ? [0, 5, -5, 0] : 0,
                  scale: !boxOpened ? [1, 1.05, 1] : 1
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-4"
              >
                {!boxOpened ? '🎁' : '✅'}
              </motion.div>

              {!boxOpened ? (
                <>
                  <h3 className="text-2xl font-black text-white mb-2">Mystery Box Ready!</h3>
                  <p className="text-white/80 text-sm mb-1">Tap to reveal your reward</p>
                  <p className="text-white/60 text-xs mb-6">✨ Shake to preview ✨</p>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBoxOpened(true)}
                    className="bg-white text-midnight font-black text-xl px-12 py-4 rounded-full shadow-2xl"
                  >
                    Open Box
                  </motion.button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-white mb-2">Box Opened!</h3>
                  <p className="text-white/80 text-sm mb-4">Next box available in 23h</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 inline-block">
                    <div className="text-accent-honey font-black text-lg">+250 XP Earned! ⚡</div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* 🏀 ATHLETICS - Game Night Hype - Only show if there's an upcoming event */}
        {nextEvent && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sport-red via-sport-orange to-sport-green p-1 cursor-pointer"
            onClick={() => router.push('/athletics')}
          >
            <div className="bg-midnight/60 backdrop-blur-sm rounded-[22px] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-sport-red/20 border border-sport-red/50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 text-sport-red" />
                  <span className="text-sport-red font-black text-xs">
                    {nextEvent.is_home_game ? 'HOME GAME' : 'AWAY GAME'}
                  </span>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-4xl font-black text-white mb-2">
                  {nextEvent.sport_type === 'basketball' ? '🏀' :
                   nextEvent.sport_type === 'football' ? '🏈' :
                   nextEvent.sport_type === 'soccer' ? '⚽' : '🏆'}
                </h3>
                <h4 className="text-2xl font-black text-white mb-1">vs {nextEvent.opponent_name}</h4>
                <p className="text-white/80 text-sm">
                  {nextEvent.location || 'Campus Arena'} • {new Date(nextEvent.event_date).toLocaleDateString('en-US', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <div className="text-white font-black text-2xl mb-1">{squadsGoing || 12}</div>
                  <div className="text-white/60 text-xs">Squads Going</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                  <div className="text-white font-black text-2xl mb-1">
                    {Math.ceil((new Date(nextEvent.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                  </div>
                  <div className="text-white/60 text-xs">Until Game</div>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-sport-red to-sport-orange text-white font-black text-lg py-4 rounded-xl shadow-2xl"
              >
                Join the Hype! 🔥
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 📊 QUICK POLL - Only show if active poll exists */}
        {activePoll && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-graphite/80 to-midnight/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Quick Poll</h3>
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Clock className="w-3 h-3" />
                {Math.ceil((new Date(activePoll.closes_at).getTime() - Date.now()) / (1000 * 60 * 60))}h left
              </div>
            </div>

            <p className="text-white/90 font-bold text-base mb-4">
              {activePoll.question}
            </p>

            <div className="space-y-2">
              {activePoll.poll_options?.sort((a, b) => a.position - b.position).map((option, i) => (
                <motion.button
                  key={option.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden rounded-xl bg-white/10 border border-white/20 p-4 text-left"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${option.percent}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${
                      i === 0 ? 'from-accent-mint to-energy-lime' :
                      i === 1 ? 'from-cosmic-pink to-accent-coral' :
                      'from-accent-lilac to-sport-purple'
                    } opacity-30 rounded-xl`}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="font-bold text-white">{option.option_text}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 text-sm">{option.vote_count} votes</span>
                      <span className="font-black text-white">{option.percent}%</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-3 text-center text-white/60 text-xs">
              {activePoll.total_votes} people voted • <span className="text-accent-mint">Tap to vote!</span>
            </div>
          </motion.div>
        )}

        {/* 🏆 LEADERBOARD SNIPPET */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-graphite/80 to-midnight/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-honey" />
              <h3 className="text-lg font-black text-white">Top Players</h3>
            </div>
            <button
              type="button"
              className="text-accent-mint text-sm font-bold flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {topPlayers.map((player, i) => (
              <div
                key={player.username}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                  i === 0 ? 'bg-gradient-to-br from-accent-honey to-energy-lime text-midnight' :
                  i === 1 ? 'bg-gradient-to-br from-cloud to-white text-midnight' :
                  'bg-gradient-to-br from-sport-orange to-accent-coral text-white'
                }`}>
                  {player.rank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">@{player.username}</div>
                  <div className="text-white/60 text-xs">Level {player.level} • {player.total_xp.toLocaleString()} XP</div>
                </div>
                <div className="text-xl">↗️</div>
              </div>
            ))}

            {/* User's position */}
            {userRank > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-cosmic-pink/20 to-electric-peach/20 border border-cosmic-pink/30 rounded-xl p-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-pink to-electric-peach flex items-center justify-center font-black text-white text-sm">
                  {userRank}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">You</div>
                  <div className="text-white/80 text-xs">Level {userLevel} • {userXP.toLocaleString()} XP</div>
                </div>
                <div className="text-xl">↗️</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 🎁 INVITE CODE CARD */}
        {/* @ts-ignore - invite_code field from migration */}
        {profile?.invite_code && profile?.username && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <InviteCodeCard
              inviteCode={(profile as any).invite_code}
              username={profile.username}
            />
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/moment/capture')}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cosmic-pink to-electric-peach p-5 rounded-full shadow-2xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
      >
        <Camera className="w-7 h-7 text-white" />
      </motion.button>

      {/* Profile Completion Modal */}
      {userId && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={userId}
          onComplete={handleProfileComplete}
        />
      )}
    </div>
  );
}
