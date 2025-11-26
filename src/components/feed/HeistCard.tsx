'use client';

import { useState } from 'react';
import { Trophy, Clock, Users, Flame } from 'lucide-react';
import type { FeedItem } from '@/types/feed';

interface HeistCardProps {
  item: FeedItem;
  onClick?: () => void;
}

export function HeistCard({ item, onClick }: HeistCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'submitting':
        return 'from-electric-peach to-cosmic-pink';
      case 'voting':
        return 'from-cosmic-pink to-cyan-pop';
      case 'executing':
        return 'from-cyan-pop to-lime-pop';
      case 'completed':
        return 'from-lime-pop to-electric-peach';
      default:
        return 'from-electric-peach to-cosmic-pink';
    }
  };

  const getPhaseText = (phase?: string) => {
    switch (phase) {
      case 'submitting':
        return 'Submissions Open';
      case 'voting':
        return 'Voting Active';
      case 'executing':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Active';
    }
  };

  const getTimeRemaining = (closesAt?: string) => {
    if (!closesAt) return '';
    const now = new Date();
    const end = new Date(closesAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div
      className={`glass-card p-4 mb-4 cursor-pointer transition-all duration-200 ${
        isPressed ? 'scale-95' : 'glass-card-hover'
      }`}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <div className={`bg-gradient-to-r ${getPhaseColor(item.phase)} rounded-lg p-4 text-white relative overflow-hidden`}>
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Weekly Heist
              </span>
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full font-semibold">
              {getPhaseText(item.phase)}
            </span>
          </div>

          <h3 className="text-xl font-black mb-2 leading-tight">
            {item.title}
          </h3>
          
          <p className="text-sm mb-4 opacity-90 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs opacity-80">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{getTimeRemaining(item.submission_closes_at || item.voting_closes_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{item.total_submissions || 0} entries</span>
              </div>
              <div className="flex items-center space-x-1">
                <Flame className="h-3 w-3" />
                <span>{item.heist_total_votes || 0} votes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-4">
        <button className="w-full py-3 gradient-btn text-white font-bold rounded-lg haptic-tap relative overflow-hidden group">
          <span className="relative z-10">
            {item.phase === 'submitting' && 'Submit Your Entry'}
            {item.phase === 'voting' && 'Vote Now'}
            {item.phase === 'executing' && 'View Progress'}
            {item.phase === 'completed' && 'View Results'}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
        </button>
      </div>
    </div>
  );
}