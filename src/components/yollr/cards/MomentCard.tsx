'use client';

import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Clock, Bell } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface MomentCardProps {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  reactions: {
    fire: number;
    cry: number;
    lightbulb: number;
    star: number;
  };
  commentCount: number;
  createdAt: string;
  isBellMoment?: boolean;
  tags?: string[];
  onPlay?: () => void;
  onReact?: (type: string) => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * MomentCard - BeReal-style video moment card
 * Features: 15-sec video, reactions, bell badge, tags
 */
export function MomentCard({
  id,
  username,
  displayName,
  avatarUrl,
  videoUrl,
  thumbnailUrl,
  caption,
  reactions,
  commentCount,
  createdAt,
  isBellMoment = false,
  tags = [],
  onPlay,
  onReact,
  onComment,
  onShare,
  className,
}: MomentCardProps) {
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <GlassCard
      variant="medium"
      gradient={isBellMoment ? 'primaryCTA' : 'none'}
      glow={isBellMoment}
      className={cn('p-4 space-y-3', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-hyper-pink p-[2px]">
              <div className="w-full h-full rounded-full bg-obsidian overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName} width={40} height={40} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-text-primary">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Bell badge */}
            {isBellMoment && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-lime-zing flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Bell className="w-3 h-3 text-obsidian" fill="currentColor" />
              </motion.div>
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{displayName}</h3>
            <p className="text-xs text-text-secondary">@{username}</p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-text-tertiary">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>
      </div>

      {/* Video */}
      <div
        className="relative aspect-[9/16] max-h-[500px] rounded-lg overflow-hidden bg-obsidian-light cursor-pointer group"
        onClick={onPlay}
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="Moment thumbnail"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-obsidian-light to-obsidian-lighter" />
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1" />
          </motion.div>
        </div>

        {/* Tags overlay */}
        {tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-full bg-glass-heavy backdrop-blur-md text-xs font-medium text-white"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Caption */}
      {caption && (
        <p className="text-sm text-text-primary leading-relaxed">{caption}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-glass-light">
        {/* Reactions */}
        <div className="flex items-center gap-4">
          <ReactionButton emoji="🔥" count={reactions.fire} onClick={() => onReact?.('fire')} />
          <ReactionButton emoji="😭" count={reactions.cry} onClick={() => onReact?.('cry')} />
          <ReactionButton emoji="💡" count={reactions.lightbulb} onClick={() => onReact?.('lightbulb')} />
          <ReactionButton emoji="⭐" count={reactions.star} onClick={() => onReact?.('star')} />
        </div>

        {/* Comment & Share */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onComment}
            className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-5 h-5" />
            {commentCount > 0 && <span className="text-xs font-medium">{commentCount}</span>}
          </motion.button>

          <motion.button
            onClick={onShare}
            className="text-text-secondary hover:text-text-primary transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </GlassCard>
  );
}

function ReactionButton({
  emoji,
  count,
  onClick,
}: {
  emoji: string;
  count: number;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="text-lg group-hover:scale-125 transition-transform">{emoji}</span>
      {count > 0 && (
        <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">
          {count}
        </span>
      )}
    </motion.button>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}
