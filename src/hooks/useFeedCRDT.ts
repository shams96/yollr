/**
 * React hook for managing feed with CRDT support
 * Handles real-time updates, optimistic updates, and conflict resolution
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useFeedState } from '@/lib/crdt/feed-state';
import { createFeedItemCRDT } from '@/lib/crdt/feed-crdt';
import type { FeedItem } from '@/types/feed';
import { logError, createError } from '@/lib/error-handler';

interface UseFeedCRDTOptions {
  campusId: string;
  initialItems?: FeedItem[];
  onError?: (error: Error) => void;
}

export function useFeedCRDT(options: UseFeedCRDTOptions) {
  const supabase = createClient();
  const replicaId = useRef<string>(`client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`).current;
  
  const {
    state: feedState,
    manager: feedManager,
    feedItems,
  } = useFeedState({
    replicaId,
    onError: options.onError,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load initial feed data
   */
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call Edge Function to get ranked feed
      const response = await fetch('/api/rank-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campus_id: options.campusId,
          cursor: null,
          limit: 20,
        }),
      });

      if (!response.ok) {
        throw createError('Failed to load feed', response.status, 'FEED_LOAD_ERROR');
      }

      const { items, next_cursor } = await response.json();
      
      // Initialize feed state with CRDTs
      feedManager.initialize(items);
      
      return { items, nextCursor: next_cursor };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load feed';
      setError(message);
      logError(error instanceof Error ? error : new Error(message), {
        component: 'useFeedCRDT',
        action: 'loadFeed',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [options.campusId, feedManager]);

  /**
   * Load more feed items
   */
  const loadMore = useCallback(async (cursor: string) => {
    try {
      const response = await fetch('/api/rank-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campus_id: options.campusId,
          cursor,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw createError('Failed to load more feed items', response.status, 'FEED_LOAD_MORE_ERROR');
      }

      const { items, next_cursor } = await response.json();
      
      // Merge new items into existing state
      const updates = items.map((item: FeedItem) => ({
        type: 'insert' as const,
        item,
        metadata: {
          replicaId: 'server',
          timestamp: Date.now(),
          wallClock: new Date().toISOString(),
        },
      }));
      
      feedManager.mergeRemoteUpdates(updates);
      
      return { items, nextCursor: next_cursor };
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to load more'), {
        component: 'useFeedCRDT',
        action: 'loadMore',
      });
      throw error;
    }
  }, [options.campusId, feedManager]);

  /**
   * Handle real-time updates from Supabase
   */
  const handleRealtimeUpdate = useCallback((payload: any) => {
    try {
      const { eventType, new: newData, old: oldData } = payload;
      
      // Generate metadata for the update
      const metadata = {
        replicaId: `server-${Date.now()}`,
        timestamp: Date.now(),
        wallClock: new Date().toISOString(),
      };

      let update: any;

      switch (eventType) {
        case 'INSERT':
          update = {
            type: 'insert',
            item: newData,
            metadata,
          };
          break;
        
        case 'UPDATE':
          update = {
            type: 'update',
            item: newData,
            metadata,
          };
          break;
        
        case 'DELETE':
          update = {
            type: 'delete',
            item: { id: oldData.id },
            metadata,
          };
          break;
        
        default:
          return;
      }

      // Merge the remote update
      feedManager.mergeRemoteUpdate(update);
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to handle realtime update'), {
        component: 'useFeedCRDT',
        action: 'handleRealtimeUpdate',
      });
    }
  }, [feedManager]);

  /**
   * Subscribe to real-time updates
   */
  useEffect(() => {
    const channel = supabase
      .channel(`feed:${options.campusId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'moments' },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'polls' },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'heists' },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'heist_submissions' },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'poll_votes' },
        handleRealtimeUpdate
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.campusId, handleRealtimeUpdate, supabase]);

  /**
   * Optimistically update a feed item
   */
  const updateItem = useCallback(async (
    itemId: string,
    updates: Partial<FeedItem>,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    try {
      // Get current item
      const currentItem = feedItems.find((item: FeedItem) => item.id === itemId);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Create updated item
      const updatedItem = { ...currentItem, ...updates };

      // Generate metadata
      const metadata = {
        replicaId,
        timestamp: Date.now(),
        wallClock: new Date().toISOString(),
      };

      // Generate update ID
      const updateId = `${replicaId}-${Date.now()}`;

      // Apply optimistic update
      feedManager.applyOptimisticUpdate({
        type: 'update',
        item: updatedItem,
        metadata,
        updateId,
      });

      // Simulate API call (in real app, this would be an actual API call)
      const simulateApiCall = async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate success/failure (90% success rate for demo)
        if (Math.random() > 0.1) {
          return { success: true };
        } else {
          throw new Error('Network error');
        }
      };

      // Try to confirm the update
      try {
        await simulateApiCall();
        feedManager.confirmUpdate(updateId);
        onSuccess?.();
      } catch (error) {
        // Rollback on failure
        feedManager.rollbackUpdate(updateId);
        onError?.();
        throw error;
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to update item'), {
        component: 'useFeedCRDT',
        action: 'updateItem',
      });
      throw error;
    }
  }, [feedItems, feedManager, replicaId]);

  /**
   * Optimistically add a reaction
   */
  const addReaction = useCallback(async (
    itemId: string,
    reactionType: string,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    try {
      // Get current item
      const currentItem = feedItems.find((item: FeedItem) => item.id === itemId);
      if (!currentItem) {
        throw new Error('Item not found');
      }

      // Create updated item with incremented reaction count
      const updatedItem = {
        ...currentItem,
        moment_reaction_count: (currentItem.moment_reaction_count || 0) + 1,
      };

      // Generate metadata
      const metadata = {
        replicaId,
        timestamp: Date.now(),
        wallClock: new Date().toISOString(),
      };

      // Generate update ID
      const updateId = `${replicaId}-${Date.now()}`;

      // Apply optimistic update
      feedManager.applyOptimisticUpdate({
        type: 'update',
        item: updatedItem,
        metadata,
        updateId,
      });

      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        feedManager.confirmUpdate(updateId);
        onSuccess?.();
      } catch (error) {
        feedManager.rollbackUpdate(updateId);
        onError?.();
        throw error;
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to add reaction'), {
        component: 'useFeedCRDT',
        action: 'addReaction',
      });
      throw error;
    }
  }, [feedItems, feedManager, replicaId]);

  /**
   * Vote in a poll
   */
  const voteInPoll = useCallback(async (
    pollId: string,
    optionId: string,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    try {
      // Get current poll
      const currentPoll = feedItems.find((item: FeedItem) => item.id === pollId);
      if (!currentPoll || currentPoll.type !== 'poll') {
        throw new Error('Poll not found');
      }

      // Create updated poll with incremented votes
      const updatedOptions = currentPoll.options?.map((opt: any) =>
        opt.id === optionId 
          ? { ...opt, vote_count: opt.vote_count + 1 }
          : opt
      );

      const updatedPoll = {
        ...currentPoll,
        options: updatedOptions,
        poll_total_votes: (currentPoll.poll_total_votes || 0) + 1,
        user_voted: true,
      };

      // Generate metadata
      const metadata = {
        replicaId,
        timestamp: Date.now(),
        wallClock: new Date().toISOString(),
      };

      // Generate update ID
      const updateId = `${replicaId}-${Date.now()}`;

      // Apply optimistic update
      feedManager.applyOptimisticUpdate({
        type: 'update',
        item: updatedPoll,
        metadata,
        updateId,
      });

      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        feedManager.confirmUpdate(updateId);
        onSuccess?.();
      } catch (error) {
        feedManager.rollbackUpdate(updateId);
        onError?.();
        throw error;
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to vote in poll'), {
        component: 'useFeedCRDT',
        action: 'voteInPoll',
      });
      throw error;
    }
  }, [feedItems, feedManager, replicaId]);

  return {
    // State
    feedItems,
    loading,
    error,
    
    // Actions
    loadFeed,
    loadMore,
    updateItem,
    addReaction,
    voteInPoll,
    
    // State manager for advanced usage
    feedManager,
  };
}