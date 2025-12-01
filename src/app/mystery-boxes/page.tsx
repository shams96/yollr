'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useMysteryBoxes } from '@/hooks/useMysteryBoxes';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';
import { ErrorToast } from '@/components/error/ErrorToast';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Gift, Sparkles, Lock, CheckCircle, X, Package } from 'lucide-react';
import type { Database } from '@/types/database';

type RewardType = Database['public']['Enums']['reward_type'];

export default function MysteryBoxesPage() {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay error={null} title="Mystery Boxes Error" message="Unable to load mystery boxes. Please try again." />}
    >
      <MysteryBoxesPageContent />
    </ErrorBoundary>
  );
}

function MysteryBoxesPageContent() {
  const router = useRouter();
  const supabase = createClient();
  const [campus, setCampus] = useState<any>(null);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [openingBox, setOpeningBox] = useState(false);
  const [rewardAnimation, setRewardAnimation] = useState<{
    show: boolean;
    reward?: {
      reward_type: RewardType;
      reward_value: any;
    };
  }>({ show: false });
  const [error, setError] = useState<string | null>(null);

  const { boxes, availableCount, loading, openBox, refreshBoxes } = useMysteryBoxes(campus?.user?.id || null);

  useEffect(() => {
    loadCampusAndUser();
  }, []);

  const loadCampusAndUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: membership } = await supabase
        .from('campus_memberships')
        .select('campus_id')
        .eq('user_id', user.id)
        .is('left_at', null)
        .single() as { data: { campus_id: string } | null };

      if (!membership) {
        router.push('/onboarding/campus');
        return;
      }

      const { data: campusData } = await supabase
        .from('campuses')
        .select('*')
        .eq('id', membership.campus_id)
        .single();

      setCampus({ ...(campusData as any), user });
    } catch (err) {
      setError('Failed to load campus information');
    }
  };

  const getRewardIcon = (rewardType: RewardType) => {
    switch (rewardType) {
      case 'xp_boost':
        return '⚡';
      case 'mystery_box':
        return '🎁';
      case 'badge':
        return '🏅';
      case 'streak_freeze':
        return '❄️';
      case 'custom_title':
        return '👑';
      default:
        return '🎁';
    }
  };

  const getRewardTitle = (rewardType: RewardType) => {
    switch (rewardType) {
      case 'xp_boost':
        return 'XP Boost';
      case 'mystery_box':
        return 'Bonus Box';
      case 'badge':
        return 'Special Badge';
      case 'streak_freeze':
        return 'Streak Freeze';
      case 'custom_title':
        return 'Custom Title';
      default:
        return 'Special Reward';
    }
  };

  const getRewardDescription = (reward: { reward_type: RewardType; reward_value: any }) => {
    switch (reward.reward_type) {
      case 'xp_boost':
        return `+${reward.reward_value.amount} XP`;
      case 'mystery_box':
        return 'You got another mystery box!';
      case 'badge':
        return `New badge: ${reward.reward_value.badge_name}`;
      case 'streak_freeze':
        return `Protects your streak for ${reward.reward_value.duration}`;
      case 'custom_title':
        return `New title: "${reward.reward_value.title}"`;
      default:
        return 'Special reward unlocked!';
    }
  };

  const handleOpenBox = async (boxId: string) => {
    try {
      setOpeningBox(true);
      setSelectedBox(boxId);
      
      const reward = await openBox(boxId);
      
      if (reward) {
        setRewardAnimation({ show: true, reward });
        
        // Hide reward animation after 3 seconds
        setTimeout(() => {
          setRewardAnimation({ show: false });
          setSelectedBox(null);
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open mystery box');
    } finally {
      setOpeningBox(false);
    }
  };

  const unopenedBoxes = boxes.filter(box => !box.is_opened);
  const openedBoxes = boxes.filter(box => box.is_opened);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {error && (
        <ErrorToast
          message={error}
          type="error"
          duration={5000}
          onClose={() => setError(null)}
        />
      )}

      <FeedHeader campus={campus} />

      <main className="flex-1 overflow-y-auto pb-16">
        <div className="px-4 py-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mystery Boxes</h1>
            <p className="text-sm text-gray-600">Open boxes to reveal exciting rewards!</p>
          </div>

          {/* Available Boxes Counter */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Available Boxes</p>
                <p className="text-2xl font-bold text-purple-600">{availableCount}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          {/* Unopened Boxes */}
          {unopenedBoxes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Boxes</h2>
              <div className="grid grid-cols-2 gap-4">
                {unopenedBoxes.map((box) => (
                  <button
                    key={box.id}
                    onClick={() => handleOpenBox(box.id)}
                    disabled={openingBox}
                    className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-center">
                      <Gift className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Mystery Box</p>
                      <p className="text-xs opacity-90">Tap to open</p>
                    </div>
                    {openingBox && selectedBox === box.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Boxes State */}
          {unopenedBoxes.length === 0 && (
            <div className="text-center py-12 mb-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mystery boxes yet</h3>
              <p className="text-sm text-gray-600 mb-4">Earn boxes by participating in campus activities!</p>
              <button
                onClick={() => router.push('/feed')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Go to Feed
              </button>
            </div>
          )}

          {/* Opened Boxes History */}
          {openedBoxes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Opened Boxes</h2>
              <div className="space-y-3">
                {openedBoxes.map((box) => (
                  <div
                    key={box.id}
                    className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {box.reward_type ? getRewardTitle(box.reward_type) : 'Opened Box'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(box.opened_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    {box.reward_type && (
                      <span className="text-2xl">
                        {getRewardIcon(box.reward_type)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Reward Animation Modal */}
      {rewardAnimation.show && rewardAnimation.reward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full transform scale-100 animate-bounce">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You Won!</h2>
              <div className="text-4xl mb-2">
                {getRewardIcon(rewardAnimation.reward.reward_type)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {getRewardTitle(rewardAnimation.reward.reward_type)}
              </h3>
              <p className="text-sm text-gray-600">
                {getRewardDescription(rewardAnimation.reward)}
              </p>
            </div>
            <button
              onClick={() => setRewardAnimation({ show: false })}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}