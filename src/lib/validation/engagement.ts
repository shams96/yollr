import { z } from 'zod';
import { 
  stringValidations, 
  numericValidations, 
  idSchema,
  createEnumSchema,
  fileSchema,
  dateSchema 
} from './core';
import type { Database } from '@/types/database';

// Get enum types from database
type PollCategory = Database['public']['Enums']['poll_category'];
type ReactionType = Database['public']['Enums']['reaction_type'];
type MomentSource = Database['public']['Enums']['moment_source'];
type ModerationContentType = Database['public']['Enums']['moderation_content_type'];
type ModerationStatus = Database['public']['Enums']['moderation_status'];
type ModerationDecisionType = Database['public']['Enums']['moderation_decision_type'];

// Poll category enum
export const pollCategorySchema = createEnumSchema({
  sports: 'sports',
  campus_life: 'campus_life',
  food: 'food',
  entertainment: 'entertainment',
  academics: 'academics',
  weekend_plans: 'weekend_plans',
} as const);

// Reaction type enum
export const reactionTypeSchema = createEnumSchema({
  fire: 'fire',
  laugh: 'laugh',
  heart: 'heart',
  clap: 'clap',
  mind_blown: 'mind_blown',
  sad: 'sad',
  angry: 'angry',
  star: 'star',
} as const);

// Moment source enum
export const momentSourceSchema = createEnumSchema({
  camera: 'camera',
  upload: 'upload',
  screen_record: 'screen_record',
} as const);

// Moderation content type enum
export const moderationContentTypeSchema = createEnumSchema({
  moment: 'moment',
  heist_submission: 'heist_submission',
  poll: 'poll',
} as const);

// Moderation status enum
export const moderationStatusSchema = createEnumSchema({
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  escalated: 'escalated',
} as const);

// Moderation decision type enum
export const moderationDecisionTypeSchema = createEnumSchema({
  approve: 'approve',
  reject: 'reject',
  escalate: 'escalate',
  shadow_ban: 'shadow_ban',
} as const);

// Poll question validation
export const pollQuestionSchema = z.string()
  .min(5, 'Question must be at least 5 characters')
  .max(200, 'Question must be at most 200 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_!?.&]+$/,
    'Question can only contain letters, numbers, spaces, and basic punctuation'
  );

// Poll option text validation
export const pollOptionTextSchema = z.string()
  .min(1, 'Option text is required')
  .max(100, 'Option must be at most 100 characters');

// Poll image URL validation
export const pollImageUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Poll creation schema
export const createPollSchema = z.object({
  campus_id: idSchema.required,
  author_id: idSchema.required,
  question: pollQuestionSchema,
  category: pollCategorySchema,
  image_url: pollImageUrlSchema,
  closes_at: dateSchema.futureDate,
  is_active: z.boolean().default(true),
}).refine(
  (data) => new Date(data.closes_at) > new Date(),
  {
    message: 'Poll close time must be in the future',
    path: ['closes_at'],
  }
);

// Poll update schema
export const updatePollSchema = z.object({
  question: pollQuestionSchema.optional(),
  category: pollCategorySchema.optional(),
  image_url: pollImageUrlSchema,
  closes_at: dateSchema.futureDate.optional(),
  is_active: z.boolean().optional(),
  total_votes: numericValidations.nonNegativeInt.optional(),
});

// Poll option creation schema
export const createPollOptionSchema = z.object({
  poll_id: idSchema.required,
  option_text: pollOptionTextSchema,
  position: numericValidations.nonNegativeInt,
});

// Poll option update schema
export const updatePollOptionSchema = z.object({
  option_text: pollOptionTextSchema.optional(),
  vote_count: numericValidations.nonNegativeInt.optional(),
  position: numericValidations.nonNegativeInt.optional(),
});

// Poll vote schema
export const createPollVoteSchema = z.object({
  poll_id: idSchema.required,
  user_id: idSchema.required,
  option_id: idSchema.required,
  points_awarded: numericValidations.xpPoints.default(0),
});

// Poll vote update schema
export const updatePollVoteSchema = z.object({
  option_id: idSchema.required,
  points_awarded: numericValidations.xpPoints.optional(),
});

// Moment caption validation
export const momentCaptionSchema = z.string()
  .max(500, 'Caption must be at most 500 characters')
  .optional()
  .nullable();

// Moment video URL validation
export const momentVideoUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(mp4|mov|avi|webm)$/i, 'Must be a valid video URL');

// Moment thumbnail URL validation
export const momentThumbnailUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Moment creation schema
export const createMomentSchema = z.object({
  campus_id: idSchema.required,
  user_id: idSchema.required,
  squad_id: idSchema.optional,
  athletics_event_id: idSchema.optional,
  caption: momentCaptionSchema,
  video_url: momentVideoUrlSchema,
  thumbnail_url: momentThumbnailUrlSchema,
  source: momentSourceSchema,
  expires_at: dateSchema.futureDate,
  is_active: z.boolean().default(true),
}).refine(
  (data) => new Date(data.expires_at) > new Date(),
  {
    message: 'Expiration time must be in the future',
    path: ['expires_at'],
  }
);

// Moment update schema
export const updateMomentSchema = z.object({
  squad_id: idSchema.optional,
  athletics_event_id: idSchema.optional,
  caption: momentCaptionSchema,
  thumbnail_url: momentThumbnailUrlSchema,
  source: momentSourceSchema.optional(),
  view_count: numericValidations.nonNegativeInt.optional(),
  reaction_count: numericValidations.nonNegativeInt.optional(),
  comment_count: numericValidations.nonNegativeInt.optional(),
  is_active: z.boolean().optional(),
  expires_at: dateSchema.futureDate.optional(),
});

// Reaction creation schema
export const createReactionSchema = z.object({
  moment_id: idSchema.required,
  user_id: idSchema.required,
  reaction_type: reactionTypeSchema,
  points_awarded: numericValidations.xpPoints.default(0),
});

// Reaction update schema
export const updateReactionSchema = z.object({
  reaction_type: reactionTypeSchema.optional(),
  points_awarded: numericValidations.xpPoints.optional(),
});

// Comment creation schema
export const createCommentSchema = z.object({
  moment_id: idSchema.required,
  user_id: idSchema.required,
  text: z.string().min(1, 'Comment text is required').max(1000, 'Comment must be at most 1000 characters'),
  parent_comment_id: idSchema.optional,
});

// Comment update schema
export const updateCommentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(1000, 'Comment must be at most 1000 characters'),
  is_active: z.boolean().optional(),
});

// Moderation queue schema
export const createModerationQueueSchema = z.object({
  content_type: moderationContentTypeSchema,
  content_id: idSchema.required,
  campus_id: idSchema.required,
  reporter_id: idSchema.optional,
  reason: z.string().max(500, 'Reason must be at most 500 characters').optional(),
});

// Moderation decision schema
export const moderationDecisionSchema = z.object({
  moderator_id: idSchema.required,
  decision: moderationDecisionTypeSchema,
  decision_notes: z.string().max(1000, 'Notes must be at most 1000 characters').optional(),
});

// Engagement statistics schema
export const engagementStatsSchema = z.object({
  campus_id: idSchema.required,
  total_moments: numericValidations.nonNegativeInt,
  total_polls: numericValidations.nonNegativeInt,
  total_reactions: numericValidations.nonNegativeInt,
  total_comments: numericValidations.nonNegativeInt,
  daily_active_users: numericValidations.nonNegativeInt,
  engagement_rate: numericValidations.percentage,
});

// Trending content schema
export const trendingContentSchema = z.object({
  campus_id: idSchema.required,
  limit: z.number().int().positive().max(50, 'Limit cannot exceed 50').default(20),
  time_range: z.enum(['1h', '6h', '24h', '7d', '30d']).default('24h'),
});

// Export all engagement schemas
export const engagementSchemas = {
  pollCategory: pollCategorySchema,
  reactionType: reactionTypeSchema,
  momentSource: momentSourceSchema,
  moderationContentType: moderationContentTypeSchema,
  moderationStatus: moderationStatusSchema,
  moderationDecisionType: moderationDecisionTypeSchema,
  pollQuestion: pollQuestionSchema,
  pollOptionText: pollOptionTextSchema,
  pollImageUrl: pollImageUrlSchema,
  createPoll: createPollSchema,
  updatePoll: updatePollSchema,
  createPollOption: createPollOptionSchema,
  updatePollOption: updatePollOptionSchema,
  createPollVote: createPollVoteSchema,
  updatePollVote: updatePollVoteSchema,
  momentCaption: momentCaptionSchema,
  momentVideoUrl: momentVideoUrlSchema,
  momentThumbnailUrl: momentThumbnailUrlSchema,
  createMoment: createMomentSchema,
  updateMoment: updateMomentSchema,
  createReaction: createReactionSchema,
  updateReaction: updateReactionSchema,
  createComment: createCommentSchema,
  updateComment: updateCommentSchema,
  createModerationQueue: createModerationQueueSchema,
  moderationDecision: moderationDecisionSchema,
  engagementStats: engagementStatsSchema,
  trendingContent: trendingContentSchema,
} as const;

export type EngagementSchemas = typeof engagementSchemas;