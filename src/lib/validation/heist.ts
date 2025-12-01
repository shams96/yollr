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
type HeistPhase = Database['public']['Enums']['heist_phase'];
type ReactionType = Database['public']['Enums']['reaction_type'];

// Heist phase enum
export const heistPhaseSchema = createEnumSchema({
  submitting: 'submitting',
  voting: 'voting',
  won: 'won',
  executing: 'executing',
  completed: 'completed',
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

// Heist title validation
export const heistTitleSchema = z.string()
  .min(3, 'Heist title must be at least 3 characters')
  .max(100, 'Heist title must be at most 100 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_!?.]+$/,
    'Heist title can only contain letters, numbers, spaces, and basic punctuation'
  );

// Heist description validation
export const heistDescriptionSchema = z.string()
  .min(10, 'Description must be at least 10 characters')
  .max(1000, 'Description must be at most 1000 characters');

// Heist image URL validation
export const heistImageUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Heist creation schema
export const createHeistSchema = z.object({
  campus_id: idSchema.required,
  title: heistTitleSchema,
  description: heistDescriptionSchema,
  phase: heistPhaseSchema.default('submitting'),
  image_url: heistImageUrlSchema,
  submission_opens_at: dateSchema.futureDate,
  submission_closes_at: dateSchema.futureDate,
  voting_opens_at: dateSchema.futureDate,
  voting_closes_at: dateSchema.futureDate,
  execution_week_start: dateSchema.futureDate.optional().nullable(),
  execution_week_end: dateSchema.futureDate.optional().nullable(),
  is_active: z.boolean().default(true),
}).refine(
  (data) => new Date(data.submission_closes_at) > new Date(data.submission_opens_at),
  {
    message: 'Submission close time must be after open time',
    path: ['submission_closes_at'],
  }
).refine(
  (data) => new Date(data.voting_opens_at) > new Date(data.submission_closes_at),
  {
    message: 'Voting must open after submission closes',
    path: ['voting_opens_at'],
  }
).refine(
  (data) => new Date(data.voting_closes_at) > new Date(data.voting_opens_at),
  {
    message: 'Voting close time must be after open time',
    path: ['voting_closes_at'],
  }
);

// Heist update schema
export const updateHeistSchema = z.object({
  title: heistTitleSchema.optional(),
  description: heistDescriptionSchema.optional(),
  phase: heistPhaseSchema.optional(),
  image_url: heistImageUrlSchema,
  submission_opens_at: dateSchema.futureDate.optional(),
  submission_closes_at: dateSchema.futureDate.optional(),
  voting_opens_at: dateSchema.futureDate.optional(),
  voting_closes_at: dateSchema.futureDate.optional(),
  execution_week_start: dateSchema.futureDate.optional().nullable(),
  execution_week_end: dateSchema.futureDate.optional().nullable(),
  winner_submission_id: idSchema.optional,
  total_submissions: numericValidations.nonNegativeInt.optional(),
  total_votes: numericValidations.nonNegativeInt.optional(),
  is_active: z.boolean().optional(),
});

// Heist submission title validation
export const submissionTitleSchema = z.string()
  .min(3, 'Title must be at least 3 characters')
  .max(100, 'Title must be at most 100 characters');

// Heist submission description validation
export const submissionDescriptionSchema = z.string()
  .min(10, 'Description must be at least 10 characters')
  .max(2000, 'Description must be at most 2000 characters');

// Heist submission image URL validation
export const submissionImageUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Heist submission video URL validation
export const submissionVideoUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(mp4|mov|avi|webm)$/i, 'Must be a valid video URL')
  .optional()
  .nullable();

// Heist submission creation schema
export const createHeistSubmissionSchema = z.object({
  heist_id: idSchema.required,
  user_id: idSchema.required,
  title: submissionTitleSchema,
  description: submissionDescriptionSchema,
  image_url: submissionImageUrlSchema,
  video_url: submissionVideoUrlSchema,
  is_winner: z.boolean().default(false),
});

// Heist submission update schema
export const updateHeistSubmissionSchema = z.object({
  title: submissionTitleSchema.optional(),
  description: submissionDescriptionSchema.optional(),
  image_url: submissionImageUrlSchema,
  video_url: submissionVideoUrlSchema,
  vote_count: numericValidations.nonNegativeInt.optional(),
  is_winner: z.boolean().optional(),
});

// Heist vote schema
export const createHeistVoteSchema = z.object({
  heist_id: idSchema.required,
  submission_id: idSchema.required,
  user_id: idSchema.required,
  reaction_type: reactionTypeSchema,
  points_awarded: numericValidations.xpPoints.default(0),
});

// Heist vote update schema
export const updateHeistVoteSchema = z.object({
  reaction_type: reactionTypeSchema.optional(),
  points_awarded: numericValidations.xpPoints.optional(),
});

// Heist phase transition schema
export const heistPhaseTransitionSchema = z.object({
  heist_id: idSchema.required,
  new_phase: heistPhaseSchema,
  reason: z.string().max(500, 'Reason must be at most 500 characters').optional(),
});

// Heist winner selection schema
export const heistWinnerSelectionSchema = z.object({
  heist_id: idSchema.required,
  winner_submission_id: idSchema.required,
  reason: z.string().max(500, 'Reason must be at most 500 characters').optional(),
});

// Heist search schema
export const heistSearchSchema = z.object({
  campus_id: idSchema.required,
  phase: heistPhaseSchema.optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().positive().max(50, 'Limit cannot exceed 50').default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Heist submission search schema
export const heistSubmissionSearchSchema = z.object({
  heist_id: idSchema.required,
  user_id: idSchema.optional,
  is_winner: z.boolean().optional(),
  limit: z.number().int().positive().max(50, 'Limit cannot exceed 50').default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Heist statistics schema
export const heistStatsSchema = z.object({
  heist_id: idSchema.required,
  total_submissions: numericValidations.nonNegativeInt,
  total_votes: numericValidations.nonNegativeInt,
  unique_voters: numericValidations.nonNegativeInt,
  average_submission_score: z.number().min(0).max(100).optional(),
  engagement_rate: numericValidations.percentage,
});

// Export all heist schemas
export const heistSchemas = {
  phase: heistPhaseSchema,
  reactionType: reactionTypeSchema,
  title: heistTitleSchema,
  description: heistDescriptionSchema,
  imageUrl: heistImageUrlSchema,
  createHeist: createHeistSchema,
  updateHeist: updateHeistSchema,
  submissionTitle: submissionTitleSchema,
  submissionDescription: submissionDescriptionSchema,
  submissionImageUrl: submissionImageUrlSchema,
  submissionVideoUrl: submissionVideoUrlSchema,
  createSubmission: createHeistSubmissionSchema,
  updateSubmission: updateHeistSubmissionSchema,
  createVote: createHeistVoteSchema,
  updateVote: updateHeistVoteSchema,
  phaseTransition: heistPhaseTransitionSchema,
  winnerSelection: heistWinnerSelectionSchema,
  search: heistSearchSchema,
  submissionSearch: heistSubmissionSearchSchema,
  stats: heistStatsSchema,
} as const;

export type HeistSchemas = typeof heistSchemas;