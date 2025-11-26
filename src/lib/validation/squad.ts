import { z } from 'zod';
import { 
  stringValidations, 
  numericValidations, 
  idSchema,
  createEnumSchema,
  fileSchema 
} from './core';
import type { Database } from '@/types/database';

// Get enum types from database
type SquadType = Database['public']['Enums']['squad_type'];
type SquadRole = Database['public']['Enums']['squad_role'];
type ProfileSportType = Database['public']['Enums']['profile_sport_type'];

// Squad type enum
export const squadTypeSchema = createEnumSchema({
  sports: 'sports',
  club: 'club',
  greek: 'greek',
  residence: 'residence',
  academic: 'academic',
  social: 'social',
} as const);

// Squad role enum
export const squadRoleSchema = createEnumSchema({
  member: 'member',
  captain: 'captain',
  co_captain: 'co_captain',
} as const);

// Squad name validation
export const squadNameSchema = z.string()
  .min(3, 'Squad name must be at least 3 characters')
  .max(100, 'Squad name must be at most 100 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_!?.&]+$/,
    'Squad name can only contain letters, numbers, spaces, and basic punctuation'
  );

// Squad description validation
export const squadDescriptionSchema = z.string()
  .max(1000, 'Description must be at most 1000 characters')
  .optional()
  .nullable();

// Squad avatar URL validation
export const squadAvatarUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Squad banner URL validation
export const squadBannerUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Squad creation schema
export const createSquadSchema = z.object({
  campus_id: idSchema.required,
  name: squadNameSchema,
  squad_type: squadTypeSchema,
  sport_type: createEnumSchema({
    football: 'football',
    basketball: 'basketball',
    soccer: 'soccer',
    baseball: 'baseball',
    softball: 'softball',
    track: 'track',
    volleyball: 'volleyball',
    tennis: 'tennis',
    swimming: 'swimming',
    golf: 'golf',
    lacrosse: 'lacrosse',
    hockey: 'hockey',
    wrestling: 'wrestling',
    cross_country: 'cross_country',
    gymnastics: 'gymnastics',
    cheer: 'cheer',
    band: 'band',
    other: 'other',
  } as const).optional().nullable(),
  description: squadDescriptionSchema,
  avatar_url: squadAvatarUrlSchema,
  banner_url: squadBannerUrlSchema,
  is_active: z.boolean().default(true),
});

// Squad update schema
export const updateSquadSchema = z.object({
  name: squadNameSchema.optional(),
  squad_type: squadTypeSchema.optional(),
  sport_type: createEnumSchema({
    football: 'football',
    basketball: 'basketball',
    soccer: 'soccer',
    baseball: 'baseball',
    softball: 'softball',
    track: 'track',
    volleyball: 'volleyball',
    tennis: 'tennis',
    swimming: 'swimming',
    golf: 'golf',
    lacrosse: 'lacrosse',
    hockey: 'hockey',
    wrestling: 'wrestling',
    cross_country: 'cross_country',
    gymnastics: 'gymnastics',
    cheer: 'cheer',
    band: 'band',
    other: 'other',
  } as const).optional().nullable(),
  description: squadDescriptionSchema,
  avatar_url: squadAvatarUrlSchema,
  banner_url: squadBannerUrlSchema,
  member_count: numericValidations.nonNegativeInt.optional(),
  is_active: z.boolean().optional(),
});

// Squad membership schema
export const squadMembershipSchema = z.object({
  squad_id: idSchema.required,
  user_id: idSchema.required,
  role: squadRoleSchema.default('member'),
  joined_at: z.string().datetime().default(() => new Date().toISOString()),
});

// Squad membership update schema
export const updateSquadMembershipSchema = z.object({
  role: squadRoleSchema,
  is_active: z.boolean().optional(),
});

// Squad invitation schema
export const squadInvitationSchema = z.object({
  squad_id: idSchema.required,
  invited_by_user_id: idSchema.required,
  invited_user_id: idSchema.required,
  message: z.string().max(500, 'Message must be at most 500 characters').optional(),
  expires_at: z.string().datetime(),
});

// Squad join request schema
export const squadJoinRequestSchema = z.object({
  squad_id: idSchema.required,
  user_id: idSchema.required,
  message: z.string().max(500, 'Message must be at most 500 characters').optional(),
});

// Squad activity schema
export const squadActivitySchema = z.object({
  squad_id: idSchema.required,
  user_id: idSchema.required,
  activity_type: z.enum(['joined', 'left', 'promoted', 'demoted', 'post_created', 'event_created']),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
});

// Squad search schema
export const squadSearchSchema = z.object({
  campus_id: idSchema.required,
  squad_type: squadTypeSchema.optional(),
  sport_type: createEnumSchema({
    football: 'football',
    basketball: 'basketball',
    soccer: 'soccer',
    baseball: 'baseball',
    softball: 'softball',
    track: 'track',
    volleyball: 'volleyball',
    tennis: 'tennis',
    swimming: 'swimming',
    golf: 'golf',
    lacrosse: 'lacrosse',
    hockey: 'hockey',
    wrestling: 'wrestling',
    cross_country: 'cross_country',
    gymnastics: 'gymnastics',
    cheer: 'cheer',
    band: 'band',
    other: 'other',
  } as const).optional().nullable(),
  is_active: z.boolean().optional(),
  limit: z.number().int().positive().max(50, 'Limit cannot exceed 50').default(20),
  offset: z.number().int().nonnegative().default(0),
  search_term: z.string().max(100, 'Search term must be at most 100 characters').optional(),
});

// Squad member search schema
export const squadMemberSearchSchema = z.object({
  squad_id: idSchema.required,
  role: squadRoleSchema.optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().positive().max(50, 'Limit cannot exceed 50').default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Squad statistics schema
export const squadStatsSchema = z.object({
  squad_id: idSchema.required,
  total_members: numericValidations.nonNegativeInt,
  active_members: numericValidations.nonNegativeInt,
  total_posts: numericValidations.nonNegativeInt,
  total_events: numericValidations.nonNegativeInt,
  engagement_rate: z.number().min(0).max(100),
  average_member_xp: numericValidations.xpPoints,
});

// Squad settings schema
export const squadSettingsSchema = z.object({
  squad_id: idSchema.required,
  require_approval: z.boolean().default(false),
  allow_member_invites: z.boolean().default(true),
  max_members: z.number().int().positive().max(1000, 'Max members cannot exceed 1000').optional().nullable(),
  activity_notifications: z.boolean().default(true),
  event_notifications: z.boolean().default(true),
});

// Export all squad schemas
export const squadSchemas = {
  squadType: squadTypeSchema,
  squadRole: squadRoleSchema,
  name: squadNameSchema,
  description: squadDescriptionSchema,
  avatarUrl: squadAvatarUrlSchema,
  bannerUrl: squadBannerUrlSchema,
  createSquad: createSquadSchema,
  updateSquad: updateSquadSchema,
  membership: squadMembershipSchema,
  updateMembership: updateSquadMembershipSchema,
  invitation: squadInvitationSchema,
  joinRequest: squadJoinRequestSchema,
  activity: squadActivitySchema,
  search: squadSearchSchema,
  memberSearch: squadMemberSearchSchema,
  stats: squadStatsSchema,
  settings: squadSettingsSchema,
} as const;

export type SquadSchemas = typeof squadSchemas;