import type { Database } from './database';

export type HeistPhase = Database['public']['Enums']['heist_phase'];
export type PollCategory = Database['public']['Enums']['poll_category'];
export type MomentSource = Database['public']['Enums']['moment_source'];
export type ReactionType = Database['public']['Enums']['reaction_type'];

export interface FeedItem {
  id: string;
  type: 'heist' | 'poll' | 'moment';
  score: number;
  created_at: string;
  campus_id: string;
  
  // Heist fields
  title?: string;
  description?: string;
  phase?: HeistPhase;
  submission_opens_at?: string;
  submission_closes_at?: string;
  voting_opens_at?: string;
  voting_closes_at?: string;
  execution_week_start?: string;
  execution_week_end?: string;
  winner_submission_id?: string;
  total_submissions?: number;
  heist_total_votes?: number;
  heist_is_active?: boolean;
  
  // Poll fields
  question?: string;
  category?: PollCategory;
  poll_image_url?: string;
  poll_closes_at?: string;
  poll_is_active?: boolean;
  poll_total_votes?: number;
  options?: PollOption[];
  user_voted?: boolean;
  
  // Moment fields
  video_url?: string;
  moment_thumbnail_url?: string;
  moment_caption?: string | null;
  moment_user_id?: string;
  moment_squad_id?: string | null;
  moment_athletics_event_id?: string | null;
  source?: MomentSource;
  moment_view_count?: number;
  moment_reaction_count?: number;
  comment_count?: number;
  moment_is_active?: boolean;
  expires_at?: string;
  
  // Author info for moments
  author?: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  
  // Common engagement
  is_stale?: boolean;
}

export interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
  position: number;
}

export interface Reaction {
  reaction_type: ReactionType;
  user_id: string;
}

export interface FeedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  is_stale: boolean;
}