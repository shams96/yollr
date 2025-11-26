import { z } from 'zod';
import { 
  stringValidations, 
  numericValidations, 
  idSchema,
  createEnumSchema,
  locationSchema,
  coordinateSchema 
} from './core';
import type { Database } from '@/types/database';

// Get enum types from database
type CampusType = Database['public']['Enums']['campus_type'];
type CampusRole = Database['public']['Enums']['campus_role'];

// Campus type enum
export const campusTypeSchema = createEnumSchema({
  university: 'university',
  college: 'college',
  high_school: 'high_school',
  community_college: 'community_college',
} as const);

// Campus role enum
export const campusRoleSchema = createEnumSchema({
  member: 'member',
  moderator: 'moderator',
  admin: 'admin',
} as const);

// Domain validation
export const domainSchema = z.string()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
    'Must be a valid domain name (e.g., example.edu)'
  )
  .optional()
  .nullable();

// Timezone validation
export const timezoneSchema = z.string()
  .regex(
    /^[A-Z][a-zA-Z_]+\/[A-Z][a-zA-Z_]+$/,
    'Must be a valid timezone (e.g., America/New_York)'
  );

// Color validation
export const colorSchema = z.string()
  .regex(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    'Must be a valid hex color code'
  )
  .optional()
  .nullable();

// Logo URL validation
export const logoUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Banner URL validation
export const bannerUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// Campus creation schema
export const createCampusSchema = z.object({
  name: stringValidations.requiredString(2, 100),
  short_name: stringValidations.requiredString(2, 20),
  campus_type: campusTypeSchema,
  domain: domainSchema,
  location: locationSchema.optional().nullable(),
  address: stringValidations.optionalString(500),
  city: stringValidations.requiredString(1, 100),
  state: stringValidations.requiredString(2, 50),
  country: stringValidations.requiredString(2, 100),
  timezone: timezoneSchema,
  primary_color: colorSchema,
  secondary_color: colorSchema,
  logo_url: logoUrlSchema,
  banner_url: bannerUrlSchema,
  is_active: z.boolean().default(true),
});

// Campus update schema
export const updateCampusSchema = z.object({
  name: stringValidations.requiredString(2, 100).optional(),
  short_name: stringValidations.requiredString(2, 20).optional(),
  campus_type: campusTypeSchema.optional(),
  domain: domainSchema,
  location: locationSchema.optional().nullable(),
  address: stringValidations.optionalString(500),
  city: stringValidations.requiredString(1, 100).optional(),
  state: stringValidations.requiredString(2, 50).optional(),
  country: stringValidations.requiredString(2, 100).optional(),
  timezone: timezoneSchema.optional(),
  primary_color: colorSchema,
  secondary_color: colorSchema,
  logo_url: logoUrlSchema,
  banner_url: bannerUrlSchema,
  is_active: z.boolean().optional(),
});

// Campus membership schema
export const campusMembershipSchema = z.object({
  user_id: idSchema.required,
  campus_id: idSchema.required,
  role: campusRoleSchema.default('member'),
});

// Campus membership update schema
export const updateCampusMembershipSchema = z.object({
  role: campusRoleSchema,
  is_active: z.boolean().optional(),
});

// Campus statistics schema
export const campusStatsSchema = z.object({
  campus_id: idSchema.required,
  total_users: numericValidations.nonNegativeInt,
  active_users: numericValidations.nonNegativeInt,
  total_moments: numericValidations.nonNegativeInt,
  total_polls: numericValidations.nonNegativeInt,
  total_heist_submissions: numericValidations.nonNegativeInt,
  total_reactions: numericValidations.nonNegativeInt,
  total_xp_awarded: numericValidations.xpPoints,
  engagement_rate: numericValidations.percentage,
});

// Campus weekly stats schema
export const campusWeeklyStatsSchema = z.object({
  campus_id: idSchema.required,
  week_start_date: z.string().datetime(),
  total_users: numericValidations.nonNegativeInt,
  active_users: numericValidations.nonNegativeInt,
  total_moments: numericValidations.nonNegativeInt,
  total_polls: numericValidations.nonNegativeInt,
  total_heist_submissions: numericValidations.nonNegativeInt,
  total_reactions: numericValidations.nonNegativeInt,
  total_xp_awarded: numericValidations.xpPoints,
  engagement_rate: numericValidations.percentage,
});

// Campus legacy stats schema
export const campusLegacyStatsSchema = z.object({
  campus_id: idSchema.required,
  total_users_all_time: numericValidations.nonNegativeInt,
  total_moments_all_time: numericValidations.nonNegativeInt,
  total_polls_all_time: numericValidations.nonNegativeInt,
  total_heist_submissions_all_time: numericValidations.nonNegativeInt,
  total_reactions_all_time: numericValidations.nonNegativeInt,
  total_xp_awarded_all_time: numericValidations.xpPoints,
  longest_streak_record: numericValidations.streakCount,
});

// Geolocation inference schema
export const geoInferRequestSchema = z.object({
  latitude: numericValidations.latitude.optional(),
  longitude: numericValidations.longitude.optional(),
  zip_code: stringValidations.zipCode.optional(),
}).refine(
  (data) => {
    const hasCoords = data.latitude !== undefined && data.longitude !== undefined;
    const hasZip = data.zip_code !== undefined;
    return hasCoords || hasZip;
  },
  {
    message: 'Either latitude/longitude or zip_code must be provided',
  }
);

// Export all campus schemas
export const campusSchemas = {
  campusType: campusTypeSchema,
  campusRole: campusRoleSchema,
  domain: domainSchema,
  timezone: timezoneSchema,
  color: colorSchema,
  logoUrl: logoUrlSchema,
  bannerUrl: bannerUrlSchema,
  createCampus: createCampusSchema,
  updateCampus: updateCampusSchema,
  membership: campusMembershipSchema,
  updateMembership: updateCampusMembershipSchema,
  stats: campusStatsSchema,
  weeklyStats: campusWeeklyStatsSchema,
  legacyStats: campusLegacyStatsSchema,
  geoInferRequest: geoInferRequestSchema,
} as const;

export type CampusSchemas = typeof campusSchemas;