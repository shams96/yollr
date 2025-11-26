'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FeedList } from '@/components/feed/FeedList';
import { FeedHeader } from '@/components/feed/FeedHeader';
import { BottomNav } from '@/components/navigation/BottomNav';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ErrorDisplay } from '@/components/error/ErrorDisplay';
import { ErrorToast } from '@/components/error/ErrorToast';
import type { FeedItem } from '@/types/feed';
import { logError, createError } from '@/lib/error-handler';

export default function FeedPage() {
  return (
    <ErrorBoundary
      fallback={<ErrorDisplay error={null} title="Feed Error" message="Unable to load your feed. Please try again." />}
    >
      <FeedPageContent />
    </ErrorBoundary>
  );
}

function FeedPageContent() {
  const router = useRouter();
  const supabase = createClient();
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [campus, setCampus] = useState<any>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
    loadCampus();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('feed_updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'moments' },
        (payload) => handleRealtimeUpdate('moment', payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'polls' },
        (payload) => handleRealtimeUpdate('poll', payload)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'heists' },
        (payload) => handleRealtimeUpdate('heist', payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showError = (message: string, error?: unknown) => {
    setError(message);
    logError(error instanceof Error ? error : new Error(message), {
      component: 'FeedPage',
    });
  };

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's campus
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

      // Call Edge Function to get ranked feed
      const response = await fetch('/api/rank-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campus_id: membership.campus_id,
          cursor: null,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw createError('Failed to load feed', response.status, 'FEED_LOAD_ERROR');
      }
      
      const { items, next_cursor } = await response.json();
      setFeedItems(items);
      setNextCursor(next_cursor);
    } catch (error) {
      showError('Failed to load feed. Please try again.', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCampus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('campus_memberships')
        .select('campus_id')
        .eq('user_id', user.id)
        .is('left_at', null)
        .single() as { data: { campus_id: string } | null };

      if (membership) {
        const { data: campusData } = await supabase
          .from('campuses')
          .select('*')
          .eq('id', membership.campus_id)
          .single();
        
        setCampus(campusData);
      }
    } catch (error) {
      console.error('Error loading campus:', error);
      // Non-critical error, don't show to user
    }
  };

  const handleRealtimeUpdate = (type: string, payload: any) => {
    // CRDT merge logic here
    console.log('Realtime update:', type, payload);
    loadFeed(); // Refresh feed for now, can be optimized
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !nextCursor) return;
    
    setIsLoadingMore(true);
    try {
      // Get user's campus
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

      // Call Edge Function to get next page of ranked feed
      const response = await fetch('/api/rank-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campus_id: membership.campus_id,
          cursor: nextCursor,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw createError('Failed to load more feed items', response.status, 'FEED_LOAD_MORE_ERROR');
      }
      
      const { items, next_cursor } = await response.json();
      
      // Append new items to existing feed
      setFeedItems(prev => [...prev, ...items]);
      setNextCursor(next_cursor);
    } catch (error) {
      showError('Failed to load more items. Please try again.', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

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
        <FeedList
          items={feedItems}
          onLoadMore={handleLoadMore}
        />
      </main>

      <BottomNav />
    </div>
  );
}