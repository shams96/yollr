'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Trophy, TrendingUp, Crown, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Squad {
  id: string;
  name: string;
  sportType?: string;
  memberCount: number;
  xpModifier: number;
  totalXP: number;
  rank?: number;
  isOfficial: boolean;
  isMember: boolean;
  emoji?: string;
}

interface SquadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  squads: Squad[];
  userSquads: string[];
  onJoinSquad?: (squadId: string) => Promise<void>;
  onLeaveSquad?: (squadId: string) => Promise<void>;
  onCreateSquad?: () => void;
}

/**
 * SquadsModal - Squad management and discovery
 * Features: Squad list, join/leave, official badges, XP modifiers
 */
export function SquadsModal({
  isOpen,
  onClose,
  squads,
  userSquads,
  onJoinSquad,
  onLeaveSquad,
  onCreateSquad,
}: SquadsModalProps) {
  const [loadingSquadId, setLoadingSquadId] = useState<string | null>(null);

  const handleSquadAction = async (squadId: string, action: 'join' | 'leave') => {
    setLoadingSquadId(squadId);

    try {
      if (action === 'join' && onJoinSquad) {
        await onJoinSquad(squadId);
      } else if (action === 'leave' && onLeaveSquad) {
        await onLeaveSquad(squadId);
      }
    } catch (error) {
      console.error('Squad action failed:', error);
    } finally {
      setLoadingSquadId(null);
    }
  };

  const officialSquads = squads.filter((s) => s.isOfficial);
  const communitySquads = squads.filter((s) => !s.isOfficial);
  const mySquads = squads.filter((s) => userSquads.includes(s.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-obsidian/90 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <div className="relative min-h-screen flex items-start justify-center p-4 py-12">
            <motion.div
              className="relative w-full max-w-3xl bg-obsidian-light rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-obsidian-light/95 backdrop-blur-md border-b border-glass-light p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-glass-heavy backdrop-blur-md text-white hover:bg-glass-medium transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center justify-between gap-4 pr-12">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Squads</h2>
                    <p className="text-sm text-text-secondary">
                      Join squads to earn XP bonuses and compete together
                    </p>
                  </div>

                  <motion.button
                    onClick={onCreateSquad}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-mint to-accent-lilac text-white font-semibold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Squad
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* My Squads */}
                {mySquads.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-energy-lime" />
                      My Squads ({mySquads.length})
                    </h3>

                    <div className="space-y-2">
                      {mySquads.map((squad) => (
                        <SquadCard
                          key={squad.id}
                          squad={squad}
                          isMember
                          isLoading={loadingSquadId === squad.id}
                          onAction={() => handleSquadAction(squad.id, 'leave')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Athletics Squads */}
                {officialSquads.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-accent-honey" />
                      Official Athletics Squads
                    </h3>

                    <div className="space-y-2">
                      {officialSquads.map((squad) => (
                        <SquadCard
                          key={squad.id}
                          squad={squad}
                          isMember={userSquads.includes(squad.id)}
                          isLoading={loadingSquadId === squad.id}
                          onAction={() =>
                            handleSquadAction(
                              squad.id,
                              userSquads.includes(squad.id) ? 'leave' : 'join'
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Squads */}
                {communitySquads.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-energy-pink" />
                      Community Squads
                    </h3>

                    <div className="space-y-2">
                      {communitySquads.map((squad) => (
                        <SquadCard
                          key={squad.id}
                          squad={squad}
                          isMember={userSquads.includes(squad.id)}
                          isLoading={loadingSquadId === squad.id}
                          onAction={() =>
                            handleSquadAction(
                              squad.id,
                              userSquads.includes(squad.id) ? 'leave' : 'join'
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SquadCard({
  squad,
  isMember,
  isLoading,
  onAction,
}: {
  squad: Squad;
  isMember: boolean;
  isLoading: boolean;
  onAction: () => void;
}) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all',
        isMember
          ? 'bg-energy-lime/10 border-energy-lime/30'
          : 'bg-glass-medium border-glass-light hover:bg-glass-heavy'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Emoji/Icon */}
          <div className="text-3xl">{squad.emoji || '⚡'}</div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-text-primary truncate">
                {squad.name}
              </h4>

              {squad.isOfficial && (
                <div className="flex-shrink-0 px-2 py-0.5 rounded-full bg-accent-honey/20 border border-accent-honey/30 text-xs font-bold text-accent-honey flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Official
                </div>
              )}

              {squad.rank && squad.rank <= 10 && (
                <div className="flex-shrink-0 px-2 py-0.5 rounded-full bg-energy-pink/20 border border-energy-pink/30 text-xs font-bold text-energy-pink">
                  #{squad.rank}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {squad.memberCount} members
              </div>

              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{squad.xpModifier}% XP
              </div>

              {squad.totalXP > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {squad.totalXP.toLocaleString()} XP
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          onClick={onAction}
          disabled={isLoading}
          className={cn(
            'px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap',
            isMember
              ? 'bg-glass-medium hover:bg-glass-heavy text-text-primary'
              : 'bg-gradient-to-r from-energy-pink to-energy-pink-light text-white hover:shadow-energy-pink-glow'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? 'Loading...' : isMember ? 'Leave' : 'Join'}
        </motion.button>
      </div>
    </div>
  );
}
