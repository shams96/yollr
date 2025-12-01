'use client';

import { useState, useEffect } from 'react';
import { 
  Flame, 
  Laugh, 
  Heart, 
  Hand,
  Brain, 
  Frown, 
  Angry, 
  Star,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Clock,
  Zap,
  Trophy,
  Calendar
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { FeedItem } from '@/types/feed';

interface MomentCardProps {
  item: FeedItem;
  onReaction?: (momentId: string, reactionType: string) => void;
}

export function MomentCard({ item, onReaction }: MomentCardProps) {
  const supabase = createClient();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    fire: 0,
    laugh: 0,
    heart: 0,
    clap: 0,
    mind_blown: 0,
    sad: 0,
    angry: 0,
    star: 0,
  });
  const [isReacting, setIsReacting] = useState(false);
  const [viewCount, setViewCount] = useState(item.moment_view_count || 0);
  const [timeAgo, setTimeAgo] = useState('');

  const reactionEmojis = {
    fire: { icon: Flame, color: 'text-orange-500', label: 'Fire' },
    laugh: { icon: Laugh, color: 'text-yellow-500', label: 'Laugh' },
    heart: { icon: Heart, color: 'text-red-500', label: 'Heart' },
    clap: { icon: Hand, color: 'text-blue-500', label: 'Clap' },
    mind_blown: { icon: Brain, color: 'text-purple-500', label: 'Mind Blown' },
    sad: { icon: Frown, color: 'text-gray-500', label: 'Sad' },
    angry: { icon: Angry, color: 'text-red-600', label: 'Angry' },
    star: { icon: Star, color: 'text-yellow-400', label: 'Star' },
  };

  useEffect(() => {
    // Calculate time ago
    const createdAt = new Date(item.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      setTimeAgo('Just now');
    } else if (diffMins < 60) {
      setTimeAgo(`${diffMins}m ago`);
    } else if (diffHours < 24) {
      setTimeAgo(`${diffHours}h ago`);
    } else {
      setTimeAgo(`${diffDays}d ago`);
    }

    // Simulate view count increment
    setViewCount(prev => prev + Math.floor(Math.random() * 5) + 1);
  }, [item.created_at]);

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'yollr_bell':
        return { icon: Zap, label: 'Yollr Bell', color: 'text-cosmic-pink' };
      case 'heist_execution':
        return { icon: Trophy, label: 'Heist Execution', color: 'text-electric-peach' };
      case 'game_night':
        return { icon: Calendar, label: 'Game Night', color: 'text-lime-pop' };
      default:
        return null;
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (isReacting) return;

    setIsReacting(true);

    try {
      // Remove old reaction if exists
      if (userReaction) {
        setReactionCounts(prev => ({
          ...prev,
          [userReaction]: Math.max(0, prev[userReaction] - 1),
        }));
      }

      // Add new reaction
      setUserReaction(reactionType);
      setReactionCounts(prev => ({
        ...prev,
        [reactionType]: (prev[reactionType] || 0) + 1,
      }));

      // Call the onReaction callback if provided
      if (onReaction) {
        onReaction(item.id, reactionType);
      }

      // Submit reaction to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Remove previous reaction
      if (userReaction) {
        await supabase
          .from('reactions')
          .delete()
          .eq('moment_id', item.id)
          .eq('user_id', user.id);
      }

      // Add new reaction
      await supabase
        .from('reactions')
        .insert({
          moment_id: item.id,
          user_id: user.id,
          reaction_type: reactionType,
        } as any);

      // Award XP for reaction
      await supabase.rpc('award_xp', {
        user_id: user.id,
        amount: 5,
        reason: 'moment_reaction',
      } as any);

    } catch (error) {
      console.error('Error reacting:', error);
      // Revert on error
      setUserReaction(null);
      setReactionCounts({
        fire: 0, laugh: 0, heart: 0, clap: 0, mind_blown: 0, sad: 0, angry: 0, star: 0,
      });
    } finally {
      setIsReacting(false);
    }
  };

  const sourceInfo = getSourceIcon(item.source);

  return (
    <div className="glass-card mb-4 overflow-hidden">
      {/* Source indicator */}
      {sourceInfo && (
        <div className={`flex items-center space-x-2 px-4 py-2 bg-graphite/50 border-b border-cloud/10`}>
          <sourceInfo.icon className={`h-4 w-4 ${sourceInfo.color}`} />
          <span className={`text-xs font-semibold ${sourceInfo.color}`}>
            {sourceInfo.label}
          </span>
          {item.expires_at && (
            <span className="text-xs text-cloud/60 ml-auto">
              Expires {new Date(item.expires_at).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Video */}
      {item.video_url && (
        <div className="relative aspect-video bg-graphite">
          <video
            src={item.video_url}
            className="w-full h-full object-cover"
            controls
            loop
            muted
            playsInline
            onLoadedData={() => {
              // Increment view count when video starts playing
              setViewCount(prev => prev + 1);
            }}
          />
          {/* View count overlay */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs text-white">{viewCount} views</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Author info */}
        <div className="flex items-center mb-3">
          {item.author?.avatar_url ? (
            <img
              src={item.author.avatar_url}
              alt={item.author.display_name}
              className="w-10 h-10 rounded-full mr-3 border-2 border-cosmic-pink/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-peach to-cosmic-pink flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">
                {item.author?.display_name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-cloud">
              {item.author?.display_name || 'Anonymous'}
            </p>
            <p className="text-xs text-cloud/60">
              {timeAgo}
            </p>
          </div>
          <button className="ml-auto text-cloud/40 hover:text-cloud/60" aria-label="More options">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {/* Caption */}
        {item.moment_caption && (
          <p className="text-sm text-cloud mb-4 leading-relaxed">
            {item.moment_caption}
          </p>
        )}

        {/* Reaction bar */}
        <div className="flex items-center justify-between pt-3 border-t border-cloud/10">
          <div className="flex items-center space-x-1">
            {Object.entries(reactionEmojis).map(([type, config]) => {
              const IconComponent = config.icon;
              const count = reactionCounts[type] || 0;
              const isActive = userReaction === type;
              
              if (count === 0 && !isActive) return null;

              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  disabled={isReacting}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-cosmic-pink/20 border border-cosmic-pink/30'
                      : 'bg-graphite/50 hover:bg-graphite/70'
                  } ${isReacting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <IconComponent className={`h-4 w-4 ${config.color}`} />
                  {count > 0 && (
                    <span className={`text-xs font-medium ${config.color}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-1 text-cloud/60 hover:text-cloud transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{item.comment_count || 0}</span>
            </button>
            <button className="flex items-center space-x-1 text-cloud/60 hover:text-cloud transition-colors" aria-label="Share">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}