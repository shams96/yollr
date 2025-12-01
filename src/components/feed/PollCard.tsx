'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';
import type { FeedItem, PollOption } from '@/types/feed';

interface PollCardProps {
  item: FeedItem;
  onVote?: (pollId: string, optionId: string) => void;
}

export function PollCard({ item, onVote }: PollCardProps) {
  const supabase = createClient();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(item.user_voted || false);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(item.options || []);
  const [totalVotes, setTotalVotes] = useState(item.poll_total_votes || 0);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'sports':
        return 'bg-blue-500';
      case 'campus_life':
        return 'bg-green-500';
      case 'food':
        return 'bg-orange-500';
      case 'entertainment':
        return 'bg-purple-500';
      case 'academics':
        return 'bg-yellow-500';
      case 'weekend_plans':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'sports':
        return '🏈';
      case 'campus_life':
        return '🏫';
      case 'food':
        return '🍕';
      case 'entertainment':
        return '🎬';
      case 'academics':
        return '📚';
      case 'weekend_plans':
        return '🎉';
      default:
        return '📊';
    }
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    setSelectedOption(optionId);

    try {
      // Optimistic update
      const updatedOptions = pollOptions.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, vote_count: opt.vote_count + 1 };
        }
        return opt;
      });
      setPollOptions(updatedOptions);
      setTotalVotes(totalVotes + 1);
      setHasVoted(true);

      // Call the onVote callback if provided
      if (onVote) {
        onVote(item.id, optionId);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Submit vote to Supabase
      const voteData = {
        poll_id: item.id,
        option_id: optionId,
        user_id: user.id,
      };

      const { error } = await supabase
        .from('poll_votes')
        .insert(voteData as any);

      if (error) throw error;

      // Award XP for voting
      await supabase.rpc('award_xp', {
        user_id: user.id,
        amount: 10,
        reason: 'poll_vote',
      } as any);

    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setPollOptions(item.options || []);
      setTotalVotes(item.poll_total_votes || 0);
      setHasVoted(item.user_voted || false);
    } finally {
      setIsVoting(false);
    }
  };

  const getTimeRemaining = (closesAt?: string) => {
    if (!closesAt) return '';
    const now = new Date();
    const end = new Date(closesAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Closed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getCategoryIcon(item.category)}</span>
            <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
              {item.category?.replace('_', ' ').toUpperCase()}
            </span>
            <div className="flex items-center space-x-1 text-xs text-cloud/60">
              <Clock className="h-3 w-3" />
              <span>{getTimeRemaining(item.poll_closes_at)}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-cloud leading-tight">
            {item.question}
          </h3>
        </div>
        <div className="flex items-center space-x-1 text-xs text-cloud/60 ml-2">
          <BarChart3 className="h-3 w-3" />
          <span>{totalVotes} votes</span>
        </div>
      </div>

      {item.poll_image_url && (
        <img 
          src={item.poll_image_url} 
          alt="Poll" 
          className="w-full h-32 object-cover rounded-lg mb-4 border border-cloud/10" 
        />
      )}

      <div className="space-y-2">
        {pollOptions.map((option) => {
          const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;
          const showResults = hasVoted || (item.poll_closes_at && new Date(item.poll_closes_at) < new Date());

          return (
            <div key={option.id} className="relative">
              {showResults && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                    isSelected ? 'bg-cosmic-pink/20' : 'bg-graphite/50'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
                className={`relative w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${
                  showResults
                    ? 'border-cloud/20 bg-graphite/30'
                    : 'border-cloud/20 bg-graphite/30 hover:border-cosmic-pink hover:bg-graphite/50'
                } ${hasVoted || isVoting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-cosmic-pink' : 'text-cloud'
                  }`}>
                    {option.option_text}
                  </span>
                  {showResults && (
                    <span className={`text-xs font-bold ${
                      isSelected ? 'text-cosmic-pink' : 'text-cloud/70'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {!hasVoted && !isVoting && (
        <p className="text-xs text-cloud/60 mt-3 text-center">
          Tap an option to vote
        </p>
      )}

      {hasVoted && (
        <div className="flex items-center justify-center space-x-1 text-xs text-cosmic-pink mt-3">
          <TrendingUp className="h-3 w-3" />
          <span>Thanks for voting! +10 XP</span>
        </div>
      )}
    </div>
  );
}