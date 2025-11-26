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
type ProfileSportType = Database['public']['Enums']['profile_sport_type'];

// Profile sport type enum
export const profileSportTypeSchema = createEnumSchema({
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
} as const);

// Phone number validation (updated to support international numbers)
export const phoneSchema = z.string()
  .refine((phone) => {
    // Try to parse as E.164 first
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    if (e164Regex.test(phone)) {
      const { parsePhoneNumberFromString } = require('libphonenumber-js');
      const phoneNumber = parsePhoneNumberFromString(phone);
      return phoneNumber ? phoneNumber.isValid() : false;
    }
    return false;
  }, {
    message: 'Please enter a valid phone number',
  })
  .transform((phone) => {
    // Ensure it's in E.164 format
    const { parsePhoneNumberFromString } = require('libphonenumber-js');
    const phoneNumber = parsePhoneNumberFromString(phone);
    return phoneNumber ? phoneNumber.format('E.164') : phone;
  });

// OTP validation
export const otpSchema = z.string()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits');

// Username validation
export const usernameSchema = z.string()
  .regex(/^[a-zA-Z0-9_-]{3,20}$/, 'Username must be 3-20 characters, alphanumeric, underscores, or hyphens')
  .transform(val => val.toLowerCase());

// Display name validation
export const displayNameSchema = z.string()
  .regex(/^[a-zA-Z\s\-']{1,50}$/, 'Display name must be 1-50 characters, letters, spaces, hyphens, or apostrophes');

// Bio validation
export const bioSchema = z.string()
  .max(500, 'Bio must be at most 500 characters')
  .optional()
  .nullable();

// Avatar URL validation
export const avatarUrlSchema = z.string()
  .url('Must be a valid URL')
  .regex(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i, 'Must be a valid image URL')
  .optional()
  .nullable();

// User creation schema (for phone auth)
export const createUserSchema = z.object({
  phone: phoneSchema,
});

// User update schema
export const updateUserSchema = z.object({
  phone: phoneSchema.optional(),
  is_banned: z.boolean().optional(),
});

// Profile creation schema
export const createProfileSchema = z.object({
  id: idSchema.required,
  username: usernameSchema,
  display_name: displayNameSchema,
  avatar_url: avatarUrlSchema,
  bio: bioSchema,
  sport_type: profileSportTypeSchema.optional().nullable(),
});

// Profile update schema
export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  display_name: displayNameSchema.optional(),
  avatar_url: avatarUrlSchema,
  bio: bioSchema,
  sport_type: profileSportTypeSchema.optional().nullable(),
  total_xp: numericValidations.xpPoints.optional(),
  current_streak: numericValidations.streakCount.optional(),
  longest_streak: numericValidations.streakCount.optional(),
  mystery_boxes_available: numericValidations.nonNegativeInt.optional(),
});

// Phone verification schema
export const phoneVerificationSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

// OTP request schema
export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

// OTP verification schema
export const otpVerificationSchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
  session_token: z.string().optional(),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: stringValidations.email,
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
});

// Update preferences schema
export const updatePreferencesSchema = z.object({
  notifications_enabled: z.boolean().optional(),
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().length(2, 'Language code must be 2 characters').optional(),
});

// Streak update schema
export const streakUpdateSchema = z.object({
  user_id: idSchema.required,
  streak_type: z.enum(['daily_login', 'yollr_bell', 'heist_participation']),
  current_streak: numericValidations.streakCount,
  longest_streak: numericValidations.streakCount,
  last_activity_at: dateSchema.isoDate,
  grace_period_used: z.boolean().optional(),
});

// XP transaction schema
export const xpTransactionSchema = z.object({
  user_id: idSchema.required,
  xp_amount: numericValidations.xpPoints,
  source: z.string().min(1, 'Source is required').max(100, 'Source must be at most 100 characters'),
  reference_id: idSchema.optional,
});

// Mystery box schema
export const mysteryBoxSchema = z.object({
  user_id: idSchema.required,
  box_type: z.string().min(1, 'Box type is required').max(50, 'Box type must be at most 50 characters'),
  is_opened: z.boolean().default(false),
  reward_type: z.enum(['xp_boost', 'mystery_box', 'badge', 'streak_freeze', 'custom_title']).optional().nullable(),
  reward_value: z.any().optional().nullable(),
});

// User reward schema
export const userRewardSchema = z.object({
  user_id: idSchema.required,
  reward_type: z.enum(['xp_boost', 'mystery_box', 'badge', 'streak_freeze', 'custom_title']),
  reward_value: z.any(),
  is_active: z.boolean().default(true),
  expires_at: dateSchema.futureDate.optional().nullable(),
});

// Ban user schema
export const banUserSchema = z.object({
  user_id: idSchema.required,
  reason: z.string().min(1, 'Ban reason is required').max(500, 'Reason must be at most 500 characters'),
  duration_days: z.number().int().positive('Duration must be a positive number of days').optional(),
});

// Unban user schema
export const unbanUserSchema = z.object({
  user_id: idSchema.required,
  reason: z.string().min(1, 'Unban reason is required').max(500, 'Reason must be at most 500 characters').optional(),
});

// Export all user schemas
export const userSchemas = {
  phone: phoneSchema,
  otp: otpSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
  bio: bioSchema,
  avatarUrl: avatarUrlSchema,
  sportType: profileSportTypeSchema,
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  createProfile: createProfileSchema,
  updateProfile: updateProfileSchema,
  phoneVerification: phoneVerificationSchema,
  otpRequest: otpRequestSchema,
  otpVerification: otpVerificationSchema,
  passwordResetRequest: passwordResetRequestSchema,
  passwordReset: passwordResetSchema,
  changePassword: changePasswordSchema,
  updatePreferences: updatePreferencesSchema,
  streakUpdate: streakUpdateSchema,
  xpTransaction: xpTransactionSchema,
  mysteryBox: mysteryBoxSchema,
  userReward: userRewardSchema,
  banUser: banUserSchema,
  unbanUser: unbanUserSchema,
} as const;

export type UserSchemas = typeof userSchemas;