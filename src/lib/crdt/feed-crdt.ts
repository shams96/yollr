/**
 * CRDT implementations for Yollr feed items
 * Handles merging of heists, polls, and moments with conflict resolution
 */

import type { FeedItem, PollOption } from '@/types/feed';
import {
  LWWRegister,
  GCounter,
  PNCounter,
  ORSet,
  MVRegister,
  type CRDTMetadata,
} from './types';

export interface FeedItemCRDT {
  id: string;
  type: 'heist' | 'poll' | 'moment';
  campusId: string;
  
  // Common fields with CRDT wrappers
  score: LWWRegister<number>;
  isActive: LWWRegister<boolean>;
  createdAt: LWWRegister<string>;
  
  // Heist-specific CRDT fields
  title?: LWWRegister<string>;
  description?: LWWRegister<string>;
  phase?: LWWRegister<string>;
  totalSubmissions?: GCounter;
  totalVotes?: GCounter;
  
  // Poll-specific CRDT fields
  question?: LWWRegister<string>;
  pollTotalVotes?: GCounter;
  options?: ORSet<string>; // Set of option IDs
  optionData?: Map<string, {
    text: LWWRegister<string>;
    votes: GCounter;
    position: LWWRegister<number>;
  }>;
  
  // Moment-specific CRDT fields
  caption?: LWWRegister<string | null>;
  viewCount?: GCounter;
  reactionCount?: GCounter;
  commentCount?: GCounter;
  
  // Reactions (applicable to all types)
  reactions?: ORSet<string>; // Set of user IDs who reacted
  
  // Metadata for tracking
  lastUpdated: LWWRegister<string>;
}

export class FeedItemCRDTImpl implements FeedItemCRDT {
  id: string;
  type: 'heist' | 'poll' | 'moment';
  campusId: string;
  score: LWWRegister<number>;
  isActive: LWWRegister<boolean>;
  createdAt: LWWRegister<string>;
  lastUpdated: LWWRegister<string>;

  // Heist fields
  title?: LWWRegister<string>;
  description?: LWWRegister<string>;
  phase?: LWWRegister<string>;
  totalSubmissions?: GCounter;
  totalVotes?: GCounter;

  // Poll fields
  question?: LWWRegister<string>;
  pollTotalVotes?: GCounter;
  options?: ORSet<string>;
  optionData?: Map<string, {
    text: LWWRegister<string>;
    votes: GCounter;
    position: LWWRegister<number>;
  }>;

  // Moment fields
  caption?: LWWRegister<string | null>;
  viewCount?: GCounter;
  reactionCount?: GCounter;
  commentCount?: GCounter;

  // Common
  reactions?: ORSet<string>;

  constructor(
    item: FeedItem,
    replicaId: string,
    metadata?: Partial<CRDTMetadata>
  ) {
    this.id = item.id;
    this.type = item.type;
    this.campusId = item.campus_id;

    const defaultMetadata: CRDTMetadata = {
      replicaId,
      timestamp: Date.now(),
      wallClock: new Date().toISOString(),
      ...metadata,
    };

    // Initialize common fields
    this.score = new LWWRegister(item.score, replicaId);
    this.isActive = new LWWRegister(
      item.heist_is_active ?? item.poll_is_active ?? item.moment_is_active ?? true,
      replicaId
    );
    this.createdAt = new LWWRegister(item.created_at, replicaId);
    this.lastUpdated = new LWWRegister(defaultMetadata.wallClock, replicaId);

    // Initialize type-specific fields
    switch (item.type) {
      case 'heist':
        this.initializeHeistFields(item, replicaId);
        break;
      case 'poll':
        this.initializePollFields(item, replicaId);
        break;
      case 'moment':
        this.initializeMomentFields(item, replicaId);
        break;
    }
  }

  private initializeHeistFields(item: FeedItem, replicaId: string): void {
    if (item.title) this.title = new LWWRegister(item.title, replicaId);
    if (item.description) this.description = new LWWRegister(item.description, replicaId);
    if (item.phase) this.phase = new LWWRegister(item.phase, replicaId);
    
    this.totalSubmissions = new GCounter(replicaId, item.total_submissions || 0);
    this.totalVotes = new GCounter(replicaId, item.heist_total_votes || 0);
    this.reactions = new ORSet<string>();
  }

  private initializePollFields(item: FeedItem, replicaId: string): void {
    if (item.question) this.question = new LWWRegister(item.question, replicaId);
    this.pollTotalVotes = new GCounter(replicaId, item.poll_total_votes || 0);
    
    this.options = new ORSet<string>();
    this.optionData = new Map();
    
    if (item.options) {
      item.options.forEach((option) => {
        this.options!.add(option.id, replicaId);
        this.optionData!.set(option.id, {
          text: new LWWRegister(option.option_text, replicaId),
          votes: new GCounter(replicaId, option.vote_count),
          position: new LWWRegister(option.position, replicaId),
        });
      });
    }
    
    this.reactions = new ORSet<string>();
  }

  private initializeMomentFields(item: FeedItem, replicaId: string): void {
    if (item.moment_caption !== undefined) {
      this.caption = new LWWRegister(item.moment_caption, replicaId);
    }
    
    this.viewCount = new GCounter(replicaId, item.moment_view_count || 0);
    this.reactionCount = new GCounter(replicaId, item.moment_reaction_count || 0);
    this.commentCount = new GCounter(replicaId, item.comment_count || 0);
    this.reactions = new ORSet<string>();
  }

  /**
   * Merge another CRDT into this one
   */
  merge(other: FeedItemCRDTImpl): void {
    if (this.id !== other.id || this.type !== other.type) {
      throw new Error('Cannot merge CRDTs with different IDs or types');
    }

    // Merge common fields
    this.score.merge(other.score);
    this.isActive.merge(other.isActive);
    this.createdAt.merge(other.createdAt);
    this.lastUpdated.merge(other.lastUpdated);

    // Merge type-specific fields
    switch (this.type) {
      case 'heist':
        this.mergeHeistFields(other);
        break;
      case 'poll':
        this.mergePollFields(other);
        break;
      case 'moment':
        this.mergeMomentFields(other);
        break;
    }

    // Merge reactions
    if (this.reactions && other.reactions) {
      this.reactions.merge(other.reactions);
    }
  }

  private mergeHeistFields(other: FeedItemCRDTImpl): void {
    if (this.title && other.title) this.title.merge(other.title);
    if (this.description && other.description) this.description.merge(other.description);
    if (this.phase && other.phase) this.phase.merge(other.phase);
    if (this.totalSubmissions && other.totalSubmissions) {
      this.totalSubmissions.merge(other.totalSubmissions);
    }
    if (this.totalVotes && other.totalVotes) {
      this.totalVotes.merge(other.totalVotes);
    }
  }

  private mergePollFields(other: FeedItemCRDTImpl): void {
    if (this.question && other.question) this.question.merge(other.question);
    if (this.pollTotalVotes && other.pollTotalVotes) {
      this.pollTotalVotes.merge(other.pollTotalVotes);
    }
    
    if (this.options && other.options) {
      this.options.merge(other.options);
      
      // Merge option data
      if (this.optionData && other.optionData) {
        other.optionData.forEach((otherOptionData, optionId) => {
          const thisOptionData = this.optionData!.get(optionId);
          if (thisOptionData) {
            thisOptionData.text.merge(otherOptionData.text);
            thisOptionData.votes.merge(otherOptionData.votes);
            thisOptionData.position.merge(otherOptionData.position);
          } else {
            this.optionData!.set(optionId, otherOptionData);
          }
        });
      }
    }
  }

  private mergeMomentFields(other: FeedItemCRDTImpl): void {
    if (this.caption && other.caption) this.caption.merge(other.caption);
    if (this.viewCount && other.viewCount) this.viewCount.merge(other.viewCount);
    if (this.reactionCount && other.reactionCount) {
      this.reactionCount.merge(other.reactionCount);
    }
    if (this.commentCount && other.commentCount) {
      this.commentCount.merge(other.commentCount);
    }
  }

  /**
   * Convert back to plain FeedItem for UI
   */
  toFeedItem(): FeedItem {
    const baseItem: FeedItem = {
      id: this.id,
      type: this.type,
      score: this.score.get(),
      created_at: this.createdAt.get(),
      campus_id: this.campusId,
      is_stale: false,
    };

    switch (this.type) {
      case 'heist':
        return {
          ...baseItem,
          title: this.title?.get(),
          description: this.description?.get(),
          phase: this.phase?.get() as any,
          total_submissions: this.totalSubmissions?.value,
          heist_total_votes: this.totalVotes?.value,
          heist_is_active: this.isActive.get(),
        };
      
      case 'poll':
        const options: PollOption[] = [];
        if (this.options && this.optionData) {
          this.options.values.forEach((optionId) => {
            const data = this.optionData!.get(optionId);
            if (data) {
              options.push({
                id: optionId,
                option_text: data.text.get(),
                vote_count: data.votes.value,
                position: data.position.get(),
              });
            }
          });
        }
        
        return {
          ...baseItem,
          question: this.question?.get(),
          poll_total_votes: this.pollTotalVotes?.value,
          poll_is_active: this.isActive.get(),
          options: options.sort((a, b) => a.position - b.position),
        };
      
      case 'moment':
        return {
          ...baseItem,
          moment_caption: this.caption?.get() ?? null,
          moment_view_count: this.viewCount?.value,
          moment_reaction_count: this.reactionCount?.value,
          comment_count: this.commentCount?.value,
          moment_is_active: this.isActive.get(),
        };
      
      default:
        return baseItem;
    }
  }

  /**
   * Apply a real-time update to this CRDT
   */
  applyUpdate(update: Partial<FeedItem>, metadata: CRDTMetadata): void {
    // Update common fields
    if (update.score !== undefined) {
      this.score.set(update.score, metadata);
    }
    if (update.heist_is_active !== undefined || update.poll_is_active !== undefined || update.moment_is_active !== undefined) {
      const isActive = update.heist_is_active ?? update.poll_is_active ?? update.moment_is_active;
      if (isActive !== undefined) {
        this.isActive.set(isActive, metadata);
      }
    }

    // Update type-specific fields
    switch (this.type) {
      case 'heist':
        this.applyHeistUpdate(update, metadata);
        break;
      case 'poll':
        this.applyPollUpdate(update, metadata);
        break;
      case 'moment':
        this.applyMomentUpdate(update, metadata);
        break;
    }

    // Update last updated timestamp
    this.lastUpdated.set(metadata.wallClock, metadata);
  }

  private applyHeistUpdate(update: Partial<FeedItem>, metadata: CRDTMetadata): void {
    if (update.title && this.title) this.title.set(update.title, metadata);
    if (update.description && this.description) this.description.set(update.description, metadata);
    if (update.phase && this.phase) this.phase.set(update.phase, metadata);
    
    if (update.total_submissions !== undefined && this.totalSubmissions) {
      const current = this.totalSubmissions.value;
      const delta = update.total_submissions - current;
      if (delta !== 0) {
        this.totalSubmissions.increment(metadata.replicaId, delta);
      }
    }
    
    if (update.heist_total_votes !== undefined && this.totalVotes) {
      const current = this.totalVotes.value;
      const delta = update.heist_total_votes - current;
      if (delta !== 0) {
        this.totalVotes.increment(metadata.replicaId, delta);
      }
    }
  }

  private applyPollUpdate(update: Partial<FeedItem>, metadata: CRDTMetadata): void {
    if (update.question && this.question) this.question.set(update.question, metadata);
    
    if (update.poll_total_votes !== undefined && this.pollTotalVotes) {
      const current = this.pollTotalVotes.value;
      const delta = update.poll_total_votes - current;
      if (delta !== 0) {
        this.pollTotalVotes.increment(metadata.replicaId, delta);
      }
    }
    
    if (update.options && this.options && this.optionData) {
      update.options.forEach((option) => {
        const existing = this.optionData!.get(option.id);
        if (existing) {
          // Update existing option
          existing.text.set(option.option_text, metadata);
          existing.position.set(option.position, metadata);
          
          const voteDelta = option.vote_count - existing.votes.value;
          if (voteDelta !== 0) {
            existing.votes.increment(metadata.replicaId, voteDelta);
          }
        } else {
          // Add new option
          this.options!.add(option.id, metadata.replicaId);
          this.optionData!.set(option.id, {
            text: new LWWRegister(option.option_text, metadata.replicaId),
            votes: new GCounter(metadata.replicaId, option.vote_count),
            position: new LWWRegister(option.position, metadata.replicaId),
          });
        }
      });
    }
  }

  private applyMomentUpdate(update: Partial<FeedItem>, metadata: CRDTMetadata): void {
    if (update.moment_caption !== undefined && this.caption) {
      this.caption.set(update.moment_caption, metadata);
    }
    
    if (update.moment_view_count !== undefined && this.viewCount) {
      const current = this.viewCount.value;
      const delta = update.moment_view_count - current;
      if (delta !== 0) {
        this.viewCount.increment(metadata.replicaId, delta);
      }
    }
    
    if (update.moment_reaction_count !== undefined && this.reactionCount) {
      const current = this.reactionCount.value;
      const delta = update.moment_reaction_count - current;
      if (delta !== 0) {
        this.reactionCount.increment(metadata.replicaId, delta);
      }
    }
    
    if (update.comment_count !== undefined && this.commentCount) {
      const current = this.commentCount.value;
      const delta = update.comment_count - current;
      if (delta !== 0) {
        this.commentCount.increment(metadata.replicaId, delta);
      }
    }
  }
}

/**
 * Create a CRDT from a feed item
 */
export function createFeedItemCRDT(
  item: FeedItem,
  replicaId: string
): FeedItemCRDTImpl {
  return new FeedItemCRDTImpl(item, replicaId);
}

/**
 * Merge multiple CRDTs for the same feed item
 */
export function mergeFeedItemCRDTs(
  crdts: FeedItemCRDTImpl[],
  replicaId: string
): FeedItemCRDTImpl {
  if (crdts.length === 0) {
    throw new Error('Cannot merge empty CRDT array');
  }

  // Start with the first CRDT
  const result = crdts[0];

  // Merge remaining CRDTs
  for (let i = 1; i < crdts.length; i++) {
    result.merge(crdts[i]);
  }

  // Update last updated timestamp
  const now = new Date().toISOString();
  result.lastUpdated.set(now, {
    replicaId,
    timestamp: Date.now(),
    wallClock: now,
  });

  return result;
}