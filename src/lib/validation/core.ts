import { z } from 'zod';

// Common validation patterns
export const VALIDATION_PATTERNS = {
  // Phone number: +1 followed by 10 digits
  phone: /^\+1\d{10}$/,
  
  // Email: standard email format
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // URL: http/https URL
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  
  // Color hex code: # followed by 3 or 6 hex digits
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  
  // Username: 3-20 characters, alphanumeric, underscores, hyphens
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  
  // Display name: 1-50 characters, letters, spaces, hyphens, apostrophes
  displayName: /^[a-zA-Z\s\-']{1,50}$/,
  
  // UUID: standard UUID format
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  // ZIP code: 5 digits or 5+4 format
  zipCode: /^\d{5}(-\d{4})?$/,
  
  // Coordinates: -90 to 90 for latitude, -180 to 180 for longitude
  latitude: /^-?([0-8]?[0-9]|90)(\.[0-9]+)?$/,
  longitude: /^-?((1[0-7][0-9])|([0-9]?[0-9]))(\.[0-9]+)?$/,
} as const;

// Common string validations
export const stringValidations = {
  // Required string with min/max length
  requiredString: (min: number = 1, max: number = 255) => 
    z.string().min(min, `Must be at least ${min} characters`).max(max, `Must be at most ${max} characters`),
  
  // Optional string with max length
  optionalString: (max: number = 255) => 
    z.string().max(max, `Must be at most ${max} characters`).optional().nullable(),
  
  // URL validation
  url: z.string().regex(VALIDATION_PATTERNS.url, 'Must be a valid URL').optional().nullable(),
  
  // Color validation
  hexColor: z.string().regex(VALIDATION_PATTERNS.hexColor, 'Must be a valid hex color').optional().nullable(),
  
  // UUID validation
  uuid: z.string().regex(VALIDATION_PATTERNS.uuid, 'Must be a valid UUID'),
  
  // Phone validation
  phone: z.string().regex(VALIDATION_PATTERNS.phone, 'Must be a valid US phone number (+1XXXXXXXXXX)'),
  
  // Email validation
  email: z.string().regex(VALIDATION_PATTERNS.email, 'Must be a valid email address'),
  
  // Username validation
  username: z.string().regex(VALIDATION_PATTERNS.username, 'Username must be 3-20 characters, alphanumeric, underscores, or hyphens'),
  
  // Display name validation
  displayName: z.string().regex(VALIDATION_PATTERNS.displayName, 'Name must be 1-50 characters, letters, spaces, hyphens, or apostrophes'),
  
  // ZIP code validation
  zipCode: z.string().regex(VALIDATION_PATTERNS.zipCode, 'Must be a valid ZIP code (5 digits or 5+4 format)'),
  
  // Coordinates
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
} as const;

// File validation schemas
export const fileSchema = {
  // Image file validation
  image: z.object({
    size: z.number().max(5 * 1024 * 1024, 'Image must be less than 5MB'),
    type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/i, 'Must be a valid image format (JPEG, PNG, GIF, WebP)'),
  }),
  
  // Video file validation
  video: z.object({
    size: z.number().max(100 * 1024 * 1024, 'Video must be less than 100MB'),
    type: z.string().regex(/^video\/(mp4|mov|avi|webm)$/i, 'Must be a valid video format (MP4, MOV, AVI, WebM)'),
  }),
  
  // General file validation
  file: (maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = []) => 
    z.object({
      size: z.number().max(maxSize, `File must be less than ${maxSize / (1024 * 1024)}MB`),
      type: allowedTypes.length > 0 
        ? z.string().refine(
            (type) => allowedTypes.some(allowed => type.includes(allowed)),
            `Must be one of: ${allowedTypes.join(', ')}`
          )
        : z.string(),
    }),
} as const;

// Date validation
export const dateSchema = {
  // Future date validation
  futureDate: z.string().datetime().refine(
    (date) => new Date(date) > new Date(),
    'Date must be in the future'
  ),
  
  // Past date validation
  pastDate: z.string().datetime().refine(
    (date) => new Date(date) < new Date(),
    'Date must be in the past'
  ),
  
  // ISO date string
  isoDate: z.string().datetime(),
  
  // Optional date
  optionalDate: z.string().datetime().optional().nullable(),
} as const;

// Numeric validations
export const numericValidations = {
  // Positive integer
  positiveInt: z.number().int().positive('Must be a positive integer'),
  
  // Non-negative integer
  nonNegativeInt: z.number().int().nonnegative('Must be a non-negative integer'),
  
  // Percentage (0-100)
  percentage: z.number().min(0, 'Must be between 0 and 100').max(100, 'Must be between 0 and 100'),
  
  // Score/rating (0-5)
  rating: z.number().min(0, 'Must be between 0 and 5').max(5, 'Must be between 0 and 5'),
  
  // XP points
  xpPoints: z.number().int().nonnegative('XP must be a non-negative integer').max(1000000, 'XP cannot exceed 1,000,000'),
  
  // Streak count
  streakCount: z.number().int().nonnegative('Streak must be a non-negative integer').max(365, 'Streak cannot exceed 365 days'),
  
  // Latitude (-90 to 90)
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  
  // Longitude (-180 to 180)
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
} as const;

// Pagination validation
export const paginationSchema = z.object({
  limit: z.number().int().positive().max(100, 'Limit cannot exceed 100').default(10),
  offset: z.number().int().nonnegative().default(0),
  cursor: z.string().optional(),
});

// ID validation
export const idSchema = {
  // Required ID
  required: z.string().uuid('Must be a valid UUID'),
  
  // Optional ID
  optional: z.string().uuid('Must be a valid UUID').optional().nullable(),
};

// Enum validation helper
export const createEnumSchema = <T extends string>(enumObj: Record<string, T>) => {
  const values = Object.values(enumObj) as T[];
  return z.enum(values as [T, ...T[]]);
};

// Coordinate validation
export const coordinateSchema = z.object({
  latitude: numericValidations.latitude,
  longitude: numericValidations.longitude,
});

// Location validation
export const locationSchema = z.object({
  latitude: numericValidations.latitude,
  longitude: numericValidations.longitude,
  address: stringValidations.optionalString(500),
  city: stringValidations.requiredString(1, 100),
  state: stringValidations.requiredString(2, 50),
  country: stringValidations.requiredString(2, 100),
  zip_code: stringValidations.zipCode,
});

// Export all core schemas
export const coreSchemas = {
  stringValidations,
  fileSchema,
  dateSchema,
  numericValidations,
  paginationSchema,
  idSchema,
  coordinateSchema,
  locationSchema,
} as const;

export type CoreSchemas = typeof coreSchemas;