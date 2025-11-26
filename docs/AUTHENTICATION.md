# Yollr Authentication Guide

## Overview

Yollr uses Supabase Auth with phone-based OTP (One-Time Password) authentication. This guide covers the complete authentication flow, security measures, and implementation details.

## Authentication Architecture

### Stack
- **Provider**: Supabase Auth
- **Method**: Phone OTP (SMS-based)
- **Session Management**: JWT tokens with refresh
- **Security**: Row Level Security (RLS) policies
- **Rate Limiting**: Per-IP and per-user limits

### Flow Overview
1. User enters phone number
2. System sends 6-digit OTP via SMS
3. User enters OTP
4. System verifies OTP and creates session
5. User is authenticated and can access the app

## Phone Authentication Implementation

### Phone Number Format

Yollr supports international phone numbers with automatic country code detection:

**Supported Countries**: US, CA, GB, AU, DE, FR, IT, ES, JP, KR, IN, BR, MX, AR, CO, ZA, NG, EG, TR, RU, CN

**Phone Format**: E.164 format (`+1234567890`)

### Phone Input Component

```typescript
// src/components/auth/PhoneInput.tsx
interface PhoneInputProps {
  onSubmit: (phoneData: { phone: string; countryCode: string }) => void;
  loading: boolean;
  error: string | null;
}

export function PhoneInput({ onSubmit, loading, error }: PhoneInputProps) {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>('US');
  
  useEffect(() => {
    // Auto-detect country on mount
    const userCountry = getCountryCode();
    setCountryCode(userCountry);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const e164Phone = getE164PhoneNumber(phone, countryCode);
    if (e164Phone) {
      onSubmit({ phone: e164Phone, countryCode });
    }
  };

  // ... render phone input with country selector
}
```

### Country Detection

```typescript
// src/lib/validation/phone.ts
export function getCountryCode(): SupportedCountryCode {
  try {
    const userLocale = navigator.language || (navigator as any).userLanguage;
    const regionCode = userLocale?.split('-')[1]?.toUpperCase();
    
    const supportedCountry = SUPPORTED_COUNTRIES.find(
      country => country.code === regionCode
    );
    
    return (supportedCountry?.code as SupportedCountryCode) || 'US';
  } catch (error) {
    console.warn('Could not detect user country, defaulting to US:', error);
    return 'US';
  }
}
```

## OTP Flow

### Sending OTP

```typescript
// src/hooks/useAuth.ts
const sendOtp = async (phone: string) => {
  try {
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
      },
    });
    
    if (error) throw error;
    
    setStep('otp');
    setPhone(phone);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Verifying OTP

```typescript
// src/hooks/useAuth.ts
const verifyOtp = async (otp: string) => {
  try {
    setLoading(true);
    setError(null);
    
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });
    
    if (error) throw error;
    
    if (session) {
      // OTP verified successfully
      await handleSuccessfulAuth(session);
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### OTP Input Component

```typescript
// src/components/auth/OTPInput.tsx
interface OTPInputProps {
  onSubmit: (otp: string) => void;
  loading: boolean;
  error: string | null;
  onResend: () => void;
  phone: string;
}

export function OTPInput({ onSubmit, loading, error, onResend, phone }: OTPInputProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (newOtp.every(digit => digit !== '')) {
      onSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ... render 6-digit input fields
}
```

## Session Management

### Session Structure

```typescript
interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: User;
}

interface User {
  id: string;
  phone: string;
  created_at: string;
  updated_at: string;
}
```

### Session Persistence

```typescript
// src/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  return createClientComponentClient({
    cookieOptions: {
      name: 'sb-yollr-auth-token',
      sameSite: 'lax',
      secure: true,
    },
  });
};
```

### Token Refresh

Supabase automatically handles token refresh. The session is refreshed when:
- Access token expires (default: 1 hour)
- User makes an authenticated request
- App regains focus after being backgrounded

## Security Measures

### Rate Limiting

```typescript
// Rate limiting configuration
const RATE_LIMITS = {
  OTP_REQUESTS: {
    window: 60 * 1000, // 1 minute
    max: 3, // 3 requests per minute
  },
  OTP_ATTEMPTS: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  },
  IP_REQUESTS: {
    window: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
  },
};
```

### Implementation in Middleware

```typescript
// middleware.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const supabase = createServerClient();
  
  // Rate limiting
  const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown';
  const rateLimitResult = await checkRateLimit(ip, 'auth');
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... rest of middleware
}
```

### Phone Number Validation

```typescript
// src/lib/validation/phone.ts
export function validatePhoneNumber(phone: string, countryCode: SupportedCountryCode): {
  isValid: boolean;
  error?: string;
  e164?: string;
} {
  try {
    const e164 = getE164PhoneNumber(phone, countryCode);
    
    if (!e164) {
      return {
        isValid: false,
        error: 'Invalid phone number format',
      };
    }
    
    // Additional validation for US/Canada numbers
    if (countryCode === 'US' || countryCode === 'CA') {
      const digits = e164.replace(/\D/g, '');
      if (digits.length !== 11) { // +1 + 10 digits
        return {
          isValid: false,
          error: 'US/Canada numbers must be 10 digits',
        };
      }
    }
    
    return {
      isValid: true,
      e164,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Phone number validation failed',
    };
  }
}
```

## Row Level Security (RLS)

### RLS Policies for Authentication

```sql
-- Profiles table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Public profiles are viewable by campus members
CREATE POLICY "Public profiles are viewable by campus members"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campus_memberships cm
      WHERE cm.user_id = auth.uid()
      AND cm.campus_id IN (
        SELECT campus_id FROM campus_memberships WHERE user_id = profiles.id AND is_active = true
      )
      AND cm.is_active = true
    )
  );
```

## Error Handling

### Authentication Errors

```typescript
// src/lib/error-handler.ts
export enum AuthErrorCode {
  INVALID_PHONE = 'invalid_phone',
  INVALID_OTP = 'invalid_otp',
  EXPIRED_OTP = 'expired_otp',
  RATE_LIMITED = 'rate_limited',
  SESSION_EXPIRED = 'session_expired',
  USER_BANNED = 'user_banned',
}

export const AUTH_ERROR_MESSAGES = {
  [AuthErrorCode.INVALID_PHONE]: 'Please enter a valid phone number',
  [AuthErrorCode.INVALID_OTP]: 'Invalid verification code. Please try again.',
  [AuthErrorCode.EXPIRED_OTP]: 'This code has expired. Please request a new one.',
  [AuthErrorCode.RATE_LIMITED]: 'Too many attempts. Please try again later.',
  [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [AuthErrorCode.USER_BANNED]: 'This account has been suspended.',
};
```

### Error Handling in Components

```typescript
// src/components/auth/PhoneInput.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const validation = validatePhoneNumber(phone, countryCode);
  if (!validation.isValid) {
    setError(validation.error || 'Invalid phone number');
    return;
  }
  
  try {
    await onSubmit({ phone: validation.e164!, countryCode });
  } catch (error) {
    const errorMessage = AUTH_ERROR_MESSAGES[error.code] || 'An error occurred';
    setError(errorMessage);
  }
};
```

## Testing Authentication

### Unit Tests

```typescript
// src/__tests__/components/auth/PhoneInput.test.tsx
describe('PhoneInput', () => {
  it('should validate US phone number', () => {
    const validation = validatePhoneNumber('(555) 123-4567', 'US');
    expect(validation.isValid).toBe(true);
    expect(validation.e164).toBe('+15551234567');
  });

  it('should reject invalid phone number', () => {
    const validation = validatePhoneNumber('123', 'US');
    expect(validation.isValid).toBe(false);
  });

  it('should auto-detect country from locale', () => {
    const countryCode = getCountryCode();
    expect(countryCode).toBeDefined();
    expect(SUPPORTED_COUNTRIES.find(c => c.code === countryCode)).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// src/__tests__/hooks/useAuth.test.ts
describe('useAuth', () => {
  it('should send OTP successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.sendOtp('+15551234567');
    });
    
    expect(result.current.step).toBe('otp');
    expect(result.current.error).toBeNull();
  });

  it('should verify OTP and authenticate', async () => {
    const { result } = renderHook(() => useAuth());
    
    // First send OTP
    await act(async () => {
      await result.current.sendOtp('+15551234567');
    });
    
    // Then verify
    await act(async () => {
      await result.current.verifyOtp('123456');
    });
    
    expect(result.current.session).toBeDefined();
  });
});
```

## Best Practices

### Security
1. **Never log sensitive data**: Don't log phone numbers or OTPs
2. **Use HTTPS only**: All auth requests must be over HTTPS
3. **Implement rate limiting**: Prevent brute force attacks
4. **Validate all inputs**: Use Zod schemas for validation
5. **Secure cookies**: Use httpOnly, secure, sameSite flags

### User Experience
1. **Auto-detect country**: Reduce user friction
2. **Format phone numbers**: Show formatted numbers as user types
3. **Clear error messages**: Help users understand what went wrong
4. **Resend OTP option**: Allow users to request new codes
5. **Session persistence**: Keep users logged in across page refreshes

### Performance
1. **Lazy load auth components**: Reduce initial bundle size
2. **Cache validation results**: Avoid re-validating phone numbers
3. **Optimize re-renders**: Use React.memo and useCallback
4. **Debounced input**: Reduce validation calls while typing

## Troubleshooting

### Common Issues

**OTP Not Received**
- Check phone number format (E.164)
- Verify SMS provider configuration in Supabase
- Check rate limits
- Verify phone number is not on do-not-disturb

**Invalid OTP Error**
- OTP expires after 15 minutes
- Check for typos in OTP entry
- Ensure OTP is entered within time limit
- Request new OTP if expired

**Session Issues**
- Check token expiration
- Verify JWT secret matches
- Check for cookie blocking
- Ensure https is enforced

**Rate Limiting**
- Too many OTP requests (max 3 per minute)
- Too many OTP attempts (max 5 per 15 minutes)
- Too many requests from IP (max 10 per minute)
- Wait for rate limit window to reset

### Debug Mode

Enable debug logging:

```typescript
// In .env.local
NEXT_PUBLIC_DEBUG=true

// In code
if (process.env.NEXT_PUBLIC_DEBUG) {
  console.log('Auth debug:', { phone, countryCode, step });
}
```

## Migration Guide

### From Email to Phone Auth

If migrating from email to phone authentication:

1. **Update user profiles**: Add phone column
2. **Migrate existing users**: Prompt for phone numbers
3. **Update RLS policies**: Add phone-based policies
4. **Test thoroughly**: Ensure backward compatibility
5. **Communicate changes**: Notify users of authentication changes

### Adding New Countries

To add support for new countries:

1. **Update SUPPORTED_COUNTRIES** in `src/lib/validation/phone.ts`
2. **Add country-specific formatting** in `applyBasicFormatting`
3. **Update validation rules** if needed
4. **Test phone numbers** from the new country
5. **Update documentation**

## Support

For authentication support:
- **Documentation**: [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- **Issues**: [GitHub Issues](https://github.com/your-org/yollr/issues)
- **Email**: support@yollr.com
- **Discord**: [Yollr Developer Community](https://discord.gg/yollr)