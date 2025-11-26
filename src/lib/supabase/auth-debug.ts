import { createClient } from './client';

export interface AuthDebugInfo {
  isConfigured: boolean;
  phoneProvider: string | null;
  error: string | null;
  environment: string;
  supabaseUrl: string;
  hasAnonKey: boolean;
}

export async function debugPhoneAuth(): Promise<AuthDebugInfo> {
  const supabase = createClient();
  const debugInfo: AuthDebugInfo = {
    isConfigured: false,
    phoneProvider: null,
    error: null,
    environment: process.env.NODE_ENV || 'unknown',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not-set',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  try {
    // Try to make a test request to see if phone auth is working
    const { error } = await supabase.auth.signInWithOtp({
      phone: '+15551234567', // Test number
    });

    if (error) {
      debugInfo.error = error.message;
      
      // Check for specific error patterns
      if (error.message.includes('Unsupported phone provider')) {
        debugInfo.phoneProvider = 'none';
      } else if (error.message.includes('Twilio')) {
        debugInfo.phoneProvider = 'twilio';
      } else if (error.message.includes('Vonage')) {
        debugInfo.phoneProvider = 'vonage';
      } else if (error.message.includes('MessageBird')) {
        debugInfo.phoneProvider = 'messagebird';
      }
    } else {
      debugInfo.isConfigured = true;
      debugInfo.phoneProvider = 'configured';
    }
  } catch (err: any) {
    debugInfo.error = err.message || 'Unknown error';
  }

  return debugInfo;
}

export function getPhoneAuthErrorMessage(error: any): string {
  const message = error?.message || 'Unknown error';

  if (message.includes('Unsupported phone provider')) {
    return `
      Phone authentication is not properly configured in Supabase.
      
      To fix this:
      1. Go to your Supabase project dashboard
      2. Navigate to Authentication > Providers
      3. Click on "Phone" provider
      4. Configure one of the SMS providers:
         - Twilio: Enter your Account SID, Auth Token, and Messaging Service SID
         - Vonage: Enter your API Key, API Secret, and From number
         - MessageBird: Enter your Access Key and Originator
      5. Click "Save"
      
      Current error: ${message}
    `;
  }

  if (message.includes('Invalid phone number')) {
    return 'Please enter a valid US phone number in the format: (555) 123-4567';
  }

  if (message.includes('Rate limit exceeded')) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }

  if (message.includes('User not found')) {
    return 'Phone number not found. Please check and try again.';
  }

  return message;
}

export function validatePhoneNumber(phone: string): { isValid: boolean; formatted?: string; error?: string } {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a US number (10 digits) or international
  if (digits.length === 10) {
    // US number - format with +1
    return {
      isValid: true,
      formatted: `+1${digits}`,
    };
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US number with country code
    return {
      isValid: true,
      formatted: `+${digits}`,
    };
  } else if (digits.length > 10) {
    // International number
    return {
      isValid: true,
      formatted: `+${digits}`,
    };
  }

  return {
    isValid: false,
    error: 'Invalid phone number format. Please use 10 digits for US numbers.',
  };
}