import {
  phoneSchema,
  otpSchema,
  usernameSchema,
  displayNameSchema,
  bioSchema,
  avatarUrlSchema,
  profileSportTypeSchema,
  createUserSchema,
  updateUserSchema,
  createProfileSchema,
  updateProfileSchema,
  phoneVerificationSchema,
  otpRequestSchema,
  otpVerificationSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  updatePreferencesSchema,
  streakUpdateSchema,
  xpTransactionSchema,
  mysteryBoxSchema,
  userRewardSchema,
  banUserSchema,
  unbanUserSchema,
} from '@/lib/validation/user';

describe('User Validation Schemas', () => {
  describe('phoneSchema', () => {
    it('should validate correct phone numbers', () => {
      expect(phoneSchema.parse('+12147143597')).toBe('+12147143597');
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('2147143597')).toThrow(); // missing +1
      expect(() => phoneSchema.parse('+1214714359')).toThrow(); // too short
      expect(() => phoneSchema.parse('+121471435970')).toThrow(); // too long
      expect(() => phoneSchema.parse('+11234567890a')).toThrow(); // non-numeric
    });
  });

  describe('otpSchema', () => {
    it('should validate 6-digit OTPs', () => {
      expect(otpSchema.parse('123456')).toBe('123456');
      expect(otpSchema.parse('000000')).toBe('000000');
    });

    it('should reject invalid OTPs', () => {
      expect(() => otpSchema.parse('12345')).toThrow(); // too short
      expect(() => otpSchema.parse('1234567')).toThrow(); // too long
      expect(() => otpSchema.parse('12345a')).toThrow(); // non-numeric
      expect(() => otpSchema.parse('')).toThrow(); // empty
    });
  });

  describe('usernameSchema', () => {
    it('should validate correct usernames', () => {
      expect(usernameSchema.parse('johndoe')).toBe('johndoe');
      expect(usernameSchema.parse('user_123')).toBe('user_123');
      expect(usernameSchema.parse('Test-User')).toBe('test-user'); // transformed to lowercase
    });

    it('should reject invalid usernames', () => {
      expect(() => usernameSchema.parse('ab')).toThrow(); // too short
      expect(() => usernameSchema.parse('thisusernameistoolongforvalidation')).toThrow(); // too long
      expect(() => usernameSchema.parse('user@name')).toThrow(); // invalid character
      expect(() => usernameSchema.parse('')).toThrow(); // empty
    });
  });

  describe('displayNameSchema', () => {
    it('should validate correct display names', () => {
      expect(displayNameSchema.parse('John Doe')).toBe('John Doe');
      expect(displayNameSchema.parse("Mary O'Brien")).toBe("Mary O'Brien");
      expect(displayNameSchema.parse('Jean-Paul')).toBe('Jean-Paul');
    });

    it('should reject invalid display names', () => {
      expect(() => displayNameSchema.parse('')).toThrow(); // empty
      expect(() => displayNameSchema.parse('Name123')).toThrow(); // contains numbers
      expect(() => displayNameSchema.parse('a'.repeat(51))).toThrow(); // too long
    });
  });

  describe('bioSchema', () => {
    it('should validate bios', () => {
      expect(bioSchema.parse('This is my bio')).toBe('This is my bio');
      expect(bioSchema.parse('')).toBe(''); // empty string is allowed
      expect(bioSchema.parse(null)).toBeNull();
      expect(bioSchema.parse(undefined)).toBeUndefined();
    });

    it('should reject bios that are too long', () => {
      const longBio = 'a'.repeat(501);
      expect(() => bioSchema.parse(longBio)).toThrow();
    });
  });

  describe('avatarUrlSchema', () => {
    it('should validate avatar URLs', () => {
      expect(avatarUrlSchema.parse('https://example.com/avatar.jpg')).toBe('https://example.com/avatar.jpg');
      expect(avatarUrlSchema.parse('http://example.com/avatar.png')).toBe('http://example.com/avatar.png');
      expect(avatarUrlSchema.parse(null)).toBeNull();
      expect(avatarUrlSchema.parse(undefined)).toBeUndefined();
    });

    it('should reject invalid avatar URLs', () => {
      expect(() => avatarUrlSchema.parse('not-a-url')).toThrow();
      expect(() => avatarUrlSchema.parse('https://example.com/document.pdf')).toThrow();
    });
  });

  describe('profileSportTypeSchema', () => {
    it('should validate sport types', () => {
      expect(profileSportTypeSchema.parse('football')).toBe('football');
      expect(profileSportTypeSchema.parse('basketball')).toBe('basketball');
      expect(profileSportTypeSchema.parse('other')).toBe('other');
    });

    it('should reject invalid sport types', () => {
      expect(() => profileSportTypeSchema.parse('invalid-sport')).toThrow();
      expect(() => profileSportTypeSchema.parse('')).toThrow();
    });
  });

  describe('createUserSchema', () => {
    it('should validate user creation', () => {
      const validUser = { phone: '+12147143597' };
      expect(createUserSchema.parse(validUser)).toEqual(validUser);
    });

    it('should reject invalid user creation data', () => {
      expect(() => createUserSchema.parse({ phone: 'invalid' })).toThrow();
      expect(() => createUserSchema.parse({})).toThrow();
    });
  });

  describe('updateUserSchema', () => {
    it('should validate user updates', () => {
      const validUpdate = { phone: '+12147143597', is_banned: true };
      expect(updateUserSchema.parse(validUpdate)).toEqual(validUpdate);
    });

    it('should allow partial updates', () => {
      expect(updateUserSchema.parse({ phone: '+12147143597' })).toEqual({ phone: '+12147143597' });
      expect(updateUserSchema.parse({ is_banned: false })).toEqual({ is_banned: false });
      expect(updateUserSchema.parse({})).toEqual({});
    });
  });

  describe('createProfileSchema', () => {
    it('should validate profile creation', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'This is my bio',
        sport_type: 'football',
      };
      expect(createProfileSchema.parse(validProfile)).toEqual(validProfile);
    });

    it('should allow null/optional fields', () => {
      const minimalProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'johndoe',
        display_name: 'John Doe',
        avatar_url: null,
        bio: null,
        sport_type: null,
      };
      expect(createProfileSchema.parse(minimalProfile)).toEqual(minimalProfile);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate profile updates', () => {
      const validUpdate = {
        username: 'newusername',
        total_xp: 1000,
        current_streak: 5,
      };
      expect(updateProfileSchema.parse(validUpdate)).toEqual(validUpdate);
    });

    it('should allow partial updates', () => {
      expect(updateProfileSchema.parse({})).toEqual({});
      expect(updateProfileSchema.parse({ bio: 'New bio' })).toEqual({ bio: 'New bio' });
    });
  });

  describe('Phone Verification Schemas', () => {
    describe('phoneVerificationSchema', () => {
      it('should validate phone verification data', () => {
        const validData = { phone: '+12147143597', otp: '123456' };
        expect(phoneVerificationSchema.parse(validData)).toEqual(validData);
      });
    });

    describe('otpRequestSchema', () => {
      it('should validate OTP request data', () => {
        const validData = { phone: '+12147143597' };
        expect(otpRequestSchema.parse(validData)).toEqual(validData);
      });
    });

    describe('otpVerificationSchema', () => {
      it('should validate OTP verification data', () => {
        const validData = { phone: '+12147143597', otp: '123456', session_token: 'token123' };
        expect(otpVerificationSchema.parse(validData)).toEqual(validData);
      });

      it('should allow optional session token', () => {
        const dataWithoutToken = { phone: '+12147143597', otp: '123456' };
        expect(otpVerificationSchema.parse(dataWithoutToken)).toEqual(dataWithoutToken);
      });
    });
  });

  describe('Password Schemas', () => {
    describe('passwordResetRequestSchema', () => {
      it('should validate password reset requests', () => {
        const validRequest = { email: 'test@example.com' };
        expect(passwordResetRequestSchema.parse(validRequest)).toEqual(validRequest);
      });
    });

    describe('passwordResetSchema', () => {
      it('should validate password reset data', () => {
        const validReset = { token: 'reset-token', new_password: 'newpassword123' };
        expect(passwordResetSchema.parse(validReset)).toEqual(validReset);
      });

      it('should reject short passwords', () => {
        expect(() => passwordResetSchema.parse({ token: 'token', new_password: 'short' })).toThrow();
      });
    });

    describe('changePasswordSchema', () => {
      it('should validate password change data', () => {
        const validChange = {
          current_password: 'oldpassword123',
          new_password: 'newpassword123',
        };
        expect(changePasswordSchema.parse(validChange)).toEqual(validChange);
      });
    });
  });

  describe('updatePreferencesSchema', () => {
    it('should validate preference updates', () => {
      const validPrefs = {
        notifications_enabled: true,
        email_notifications: false,
        push_notifications: true,
        theme: 'dark' as const,
        language: 'en',
      };
      expect(updatePreferencesSchema.parse(validPrefs)).toEqual(validPrefs);
    });

    it('should allow partial updates', () => {
      expect(updatePreferencesSchema.parse({ theme: 'light' as const })).toEqual({ theme: 'light' });
    });

    it('should validate language codes', () => {
      expect(() => updatePreferencesSchema.parse({ language: 'eng' })).toThrow(); // too long
      expect(() => updatePreferencesSchema.parse({ language: 'e' })).toThrow(); // too short
    });
  });

  describe('streakUpdateSchema', () => {
    it('should validate streak updates', () => {
      const validStreak = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        streak_type: 'daily_login' as const,
        current_streak: 10,
        longest_streak: 15,
        last_activity_at: new Date().toISOString(),
        grace_period_used: false,
      };
      expect(streakUpdateSchema.parse(validStreak)).toEqual(validStreak);
    });
  });

  describe('xpTransactionSchema', () => {
    it('should validate XP transactions', () => {
      const validTransaction = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        xp_amount: 100,
        source: 'daily_login',
        reference_id: '123e4567-e89b-12d3-a456-426614174001',
      };
      expect(xpTransactionSchema.parse(validTransaction)).toEqual(validTransaction);
    });

    it('should allow optional reference_id', () => {
      const transactionWithoutRef = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        xp_amount: 50,
        source: 'post_creation',
      };
      expect(xpTransactionSchema.parse(transactionWithoutRef)).toEqual(transactionWithoutRef);
    });
  });

  describe('mysteryBoxSchema', () => {
    it('should validate mystery box data', () => {
      const validBox = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        box_type: 'daily',
        is_opened: false,
        reward_type: 'xp_boost' as const,
        reward_value: { multiplier: 2, duration: 3600 },
      };
      expect(mysteryBoxSchema.parse(validBox)).toEqual(validBox);
    });

    it('should use default values', () => {
      const minimalBox = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        box_type: 'daily',
      };
      const result = mysteryBoxSchema.parse(minimalBox);
      expect(result.is_opened).toBe(false);
      expect(result.user_id).toBe(minimalBox.user_id);
      expect(result.box_type).toBe(minimalBox.box_type);
    });
  });

  describe('userRewardSchema', () => {
    it('should validate user reward data', () => {
      const validReward = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        reward_type: 'badge' as const,
        reward_value: { badge_id: 'badge123', name: 'Early Bird' },
        is_active: true,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      };
      expect(userRewardSchema.parse(validReward)).toEqual(validReward);
    });

    it('should use default values', () => {
      const minimalReward = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        reward_type: 'xp_boost' as const,
        reward_value: { amount: 100 },
      };
      const result = userRewardSchema.parse(minimalReward);
      expect(result.is_active).toBe(true);
      expect(result.user_id).toBe(minimalReward.user_id);
      expect(result.reward_type).toBe(minimalReward.reward_type);
      expect(result.reward_value).toEqual(minimalReward.reward_value);
    });
  });

  describe('banUserSchema', () => {
    it('should validate ban user data', () => {
      const validBan = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Violation of community guidelines',
        duration_days: 7,
      };
      expect(banUserSchema.parse(validBan)).toEqual(validBan);
    });

    it('should allow optional duration', () => {
      const banWithoutDuration = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Spam',
      };
      expect(banUserSchema.parse(banWithoutDuration)).toEqual(banWithoutDuration);
    });
  });

  describe('unbanUserSchema', () => {
    it('should validate unban user data', () => {
      const validUnban = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Appeal approved',
      };
      expect(unbanUserSchema.parse(validUnban)).toEqual(validUnban);
    });

    it('should allow optional reason', () => {
      const unbanWithoutReason = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
      };
      expect(unbanUserSchema.parse(unbanWithoutReason)).toEqual(unbanWithoutReason);
    });
  });
});
