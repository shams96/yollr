'use client';

import { useState, useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedItemCard } from './FeedItemCard';
import type { FeedItem, FeedResponse } from '@/types/feed';

interface FeedListProps {
  items: FeedItem[];
  onLoadMore: () => void;
  onReaction?: (itemId: string) => void;
  onVote?: (pollId: string, optionId: string) => void;
}

export function FeedList({ items, onLoadMore, onReaction, onVote }: FeedListProps) {
  const [ref, inView] = useInView();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  }, [onLoadMore, isLoadingMore]);

  // Auto-load more when reaching bottom
  useEffect(() => {
    if (inView && !isLoadingMore) {
      handleLoadMore();
    }
  }, [inView, isLoadingMore, handleLoadMore]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share a moment!</p>
          <button
            onClick={() => window.location.href = '/capture'}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Capture Moment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {items.map((item) => (
        <FeedItemCard
          key={`${item.type}-${item.id}`}
          item={item}
          onReaction={onReaction}
          onVote={onVote}
        />
      ))}
      
      <div ref={ref} className="py-4">
        {isLoadingMore && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}