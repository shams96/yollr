'use client';

import type { FeedItem } from '@/types/feed';
import { HeistCard } from './HeistCard';
import { PollCard } from './PollCard';
import { MomentCard } from './MomentCard';

interface FeedItemCardProps {
  item: FeedItem;
  onReaction?: (itemId: string, reactionType: string) => void;
  onVote?: (pollId: string, optionId: string) => void;
}

export function FeedItemCard({ item, onReaction, onVote }: FeedItemCardProps) {
  const renderHeistCard = () => (
    <HeistCard item={item} onClick={() => console.log('Heist clicked')} />
  );

  const renderPollCard = () => (
    <PollCard item={item} onVote={onVote} />
  );

  const renderMomentCard = () => (
    <MomentCard item={item} onReaction={onReaction} />
  );

  const renderCard = () => {
    switch (item.type) {
      case 'heist':
        return renderHeistCard();
      case 'poll':
        return renderPollCard();
      case 'moment':
        return renderMomentCard();
      default:
        return null;
    }
  };

  return <div className="px-4">{renderCard()}</div>;
}