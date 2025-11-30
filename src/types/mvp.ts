// =============================================
// YOLLR MVP TYPES (Phase A)
// Simplified types for MVP schema
// =============================================

// =============================================
// ENUMS
// =============================================

export type CampusTier = 'high_school' | 'university';

export type GamificationAction =
  | 'poll_vote'
  | 'moment_post'
  | 'drop_submit'
  | 'drop_vote_received';

export type DropStatus =
  | 'planning'
  | 'submission'
  | 'voting'
  | 'execution'
  | 'closed';

// =============================================
// DATABASE MODELS
// =============================================

export interface Campus {
  id: string; // UUID
  name: string;
  slug: string; // Unique
  location: string;
  emoji: string;
  tier: CampusTier;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string; // UUID
  device_id: string; // Unique
  campus_id: string;
  username: string;
  avatar_emoji: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Poll {
  id: string;
  campus_id: string;
  creator_user_id: string;
  question: string;
  options: [string, string, string, string];
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface PollVote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: 0 | 1 | 2 | 3;
  voted_at: string;
}

export interface Moment {
  id: string;
  campus_id: string;
  creator_user_id: string;
  video_url: string;
  caption?: string;
  drop_id?: string | null;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface Drop {
  id: string;
  campus_id: string;
  title: string;
  guardrails: string[];
  submission_phase_start: string;
  submission_phase_end: string;
  voting_phase_start: string;
  voting_phase_end: string;
  status: DropStatus;
  winner_user_id?: string | null;
  winner_submission_id?: string | null;
  week_of: string;
  created_at: string;
  updated_at: string;
}

export interface DropSubmission {
  id: string;
  drop_id: string;
  user_id: string;
  video_url: string;
  text_description: string;
  created_at: string;
}

export interface DropVote {
  id: string;
  drop_id: string;
  submission_id: string;
  user_id: string;
  voted_at: string;
}

export interface Point {
  id: string;
  user_id: string;
  campus_id: string;
  action: GamificationAction;
  points_earned: number;
  week_of: string;
  created_at: string;
}

// =============================================
// VIEWS
// =============================================

export interface PollResult {
  id: string;
  question: string;
  options: [string, string, string, string];
  campus_id: string;
  option_index: number;
  vote_count: number;
}

export interface WeeklyLeaderboardEntry {
  id: string;
  username: string;
  avatar_emoji: string;
  campus_id: string;
  total_points: number;
  week_of: string;
}

// =============================================
// REQUEST/RESPONSE TYPES
// =============================================

export interface CreatePollRequest {
  question: string;
  options: [string, string, string, string];
}

export interface VotePollRequest {
  poll_id: string;
  option_index: 0 | 1 | 2 | 3;
}

export interface CreateMomentRequest {
  video_url: string;
  caption?: string;
  drop_id?: string;
}

export interface CreateDropSubmissionRequest {
  drop_id: string;
  video_url: string;
  text_description: string;
}

export interface VoteDropSubmissionRequest {
  drop_id: string;
  submission_id: string;
}

export interface CreateUserRequest {
  device_id: string;
  campus_id: string;
  username: string;
}

// =============================================
// UTILITY TYPES
// =============================================

export interface FeedCard {
  type: 'poll' | 'moment' | 'drop_plan' | 'drop_lab';
  id: string;
  campus_id: string;
  creator: {
    user_id: string;
    username: string;
    avatar_emoji: string;
  };
  created_at: string;
  data: Poll | Moment | DropSubmission | Drop;
}

export interface SharedContent {
  type: 'poll' | 'moment' | 'drop';
  id: string;
  title: string;
  description?: string;
  image_url?: string;
}

// =============================================
// API RESPONSES
// =============================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface PollResultsResponse {
  poll: Poll;
  results: Array<{
    option_index: number;
    vote_count: number;
    percentage: number;
  }>;
  user_voted: boolean;
  user_choice?: number;
}

// =============================================
// END TYPES
// =============================================
