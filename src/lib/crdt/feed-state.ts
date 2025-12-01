/**
 * Feed state management with CRDT support
 * Handles optimistic updates, rollback, and conflict resolution
 */

import { useState, useCallback, useRef } from 'react';
import { FeedItemCRDTImpl, createFeedItemCRDT, mergeFeedItemCRDTs } from './feed-crdt';
import type { FeedItem } from '@/types/feed';
import type { CRDTMetadata } from './types';

export interface FeedState {
  items: FeedItem[];
  crdts: Map<string, FeedItemCRDTImpl>;
  pendingUpdates: Map<string, {
    type: 'insert' | 'update' | 'delete';
    item: FeedItem;
    metadata: CRDTMetadata;
    updateId: string;
    timestamp: number;
  }>;
  confirmedUpdates: Set<string>;
}

export interface FeedUpdate {
  type: 'insert' | 'update' | 'delete';
  item: FeedItem;
  metadata: CRDTMetadata;
  updateId?: string;
}

export interface FeedStateManager {
  state: FeedState;
  initialize: (items: FeedItem[]) => void;
  mergeRemoteUpdate: (update: FeedUpdate) => void;
  mergeRemoteUpdates: (updates: FeedUpdate[]) => void;
  applyOptimisticUpdate: (update: FeedUpdate & { updateId: string }) => void;
  confirmUpdate: (updateId: string) => void;
  rollbackUpdate: (updateId: string) => void;
  getFeedItems: () => FeedItem[];
}

interface UseFeedStateOptions {
  replicaId: string;
  onError?: (error: Error) => void;
}

export function useFeedState(options: UseFeedStateOptions): {
  state: FeedState;
  manager: FeedStateManager;
  feedItems: FeedItem[];
} {
  const [state, setState] = useState<FeedState>({
    items: [],
    crdts: new Map(),
    pendingUpdates: new Map(),
    confirmedUpdates: new Set(),
  });

  // Create a stable manager instance
  const managerRef = useRef<FeedStateManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = {
      state,
      initialize: (items: FeedItem[]) => {
        const crdts = new Map<string, FeedItemCRDTImpl>();
        
        items.forEach((item) => {
          const crdt = createFeedItemCRDT(item, options.replicaId);
          crdts.set(item.id, crdt);
        });

        setState({
          items,
          crdts,
          pendingUpdates: new Map(),
          confirmedUpdates: new Set(),
        });
      },

      mergeRemoteUpdate: (update: FeedUpdate) => {
        setState((prevState) => {
          const newState = { ...prevState };
          const existingCrdt = newState.crdts.get(update.item.id);
          
          if (update.type === 'delete') {
            // Remove the item
            newState.items = newState.items.filter(item => item.id !== update.item.id);
            newState.crdts.delete(update.item.id);
            return newState;
          }

          if (existingCrdt) {
            // Merge with existing CRDT
            existingCrdt.applyUpdate(update.item, update.metadata);
            newState.items = newState.items.map(item =>
              item.id === update.item.id ? existingCrdt.toFeedItem() : item
            );
          } else {
            // New item
            const newCrdt = createFeedItemCRDT(update.item, update.metadata.replicaId);
            newState.crdts.set(update.item.id, newCrdt);
            newState.items = [...newState.items, newCrdt.toFeedItem()];
          }

          return newState;
        });
      },

      mergeRemoteUpdates: (updates: FeedUpdate[]) => {
        setState((prevState) => {
          const newState = { ...prevState };
          const updatedIds = new Set<string>();

          updates.forEach((update) => {
            const existingCrdt = newState.crdts.get(update.item.id);
            
            if (update.type === 'delete') {
              newState.items = newState.items.filter(item => item.id !== update.item.id);
              newState.crdts.delete(update.item.id);
              return;
            }

            if (existingCrdt) {
              existingCrdt.applyUpdate(update.item, update.metadata);
              updatedIds.add(update.item.id);
            } else {
              const newCrdt = createFeedItemCRDT(update.item, update.metadata.replicaId);
              newState.crdts.set(update.item.id, newCrdt);
              newState.items = [...newState.items, newCrdt.toFeedItem()];
            }
          });

          // Update all modified items
          newState.items = newState.items.map(item => {
            if (updatedIds.has(item.id)) {
              const crdt = newState.crdts.get(item.id);
              return crdt ? crdt.toFeedItem() : item;
            }
            return item;
          });

          return newState;
        });
      },

      applyOptimisticUpdate: (update: FeedUpdate & { updateId: string }) => {
        setState((prevState) => {
          const newState = { ...prevState };
          
          // Store the pending update
          newState.pendingUpdates.set(update.updateId, {
            ...update,
            timestamp: Date.now(),
          });

          // Apply the update immediately
          if (update.type === 'insert') {
            const newCrdt = createFeedItemCRDT(update.item, update.metadata.replicaId);
            newState.crdts.set(update.item.id, newCrdt);
            newState.items = [...newState.items, newCrdt.toFeedItem()];
          } else if (update.type === 'update') {
            const existingCrdt = newState.crdts.get(update.item.id);
            if (existingCrdt) {
              existingCrdt.applyUpdate(update.item, update.metadata);
              newState.items = newState.items.map(item =>
                item.id === update.item.id ? existingCrdt.toFeedItem() : item
              );
            }
          } else if (update.type === 'delete') {
            newState.items = newState.items.filter(item => item.id !== update.item.id);
            newState.crdts.delete(update.item.id);
          }

          return newState;
        });
      },

      confirmUpdate: (updateId: string) => {
        setState((prevState) => {
          const newState = { ...prevState };
          const pendingUpdate = newState.pendingUpdates.get(updateId);
          
          if (pendingUpdate) {
            newState.pendingUpdates.delete(updateId);
            newState.confirmedUpdates.add(updateId);
          }

          return newState;
        });
      },

      rollbackUpdate: (updateId: string) => {
        setState((prevState) => {
          const newState = { ...prevState };
          const pendingUpdate = newState.pendingUpdates.get(updateId);
          
          if (!pendingUpdate) {
            return newState; // Nothing to rollback
          }

          // Remove the pending update
          newState.pendingUpdates.delete(updateId);

          // Revert the change
          if (pendingUpdate.type === 'insert') {
            // Remove the inserted item
            newState.items = newState.items.filter(item => item.id !== pendingUpdate.item.id);
            newState.crdts.delete(pendingUpdate.item.id);
          } else if (pendingUpdate.type === 'update') {
            // Revert to previous state by reapplying all other updates
            const itemId = pendingUpdate.item.id;
            const crdt = newState.crdts.get(itemId);
            
            if (crdt) {
              // Reset and reapply all confirmed updates for this item
              const confirmedUpdates = Array.from(newState.confirmedUpdates)
                .map(id => {
                  const update = Array.from(newState.pendingUpdates.values())
                    .find(u => u.updateId === id);
                  return update;
                })
                .filter(update => update && update.item.id === itemId);

              // Reset to base state and reapply confirmed updates
              const baseItem = crdt.toFeedItem();
              const resetCrdt = createFeedItemCRDT(baseItem, options.replicaId);
              
              confirmedUpdates.forEach(update => {
                if (update) {
                  resetCrdt.applyUpdate(update.item, update.metadata);
                }
              });

              newState.crdts.set(itemId, resetCrdt);
              newState.items = newState.items.map(item =>
                item.id === itemId ? resetCrdt.toFeedItem() : item
              );
            }
          } else if (pendingUpdate.type === 'delete') {
            // Restore the deleted item (we need to fetch it from server or cache)
            // For now, we'll just log this case
            console.warn('Rollback of delete operation requires server fetch');
          }

          return newState;
        });
      },

      getFeedItems: () => {
        return state.items;
      },
    };
  }

  const manager = managerRef.current;

  return {
    state,
    manager,
    feedItems: state.items,
  };
}