import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

// Supported countries for phone authentication
export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IT', name: 'Italy', dialCode: '+39' },
  { code: 'ES', name: 'Spain', dialCode: '+34' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', dialCode: '+82' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'MX', name: 'Mexico', dialCode: '+52' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'EG', name: 'Egypt', dialCode: '+20' },
  { code: 'TR', name: 'Turkey', dialCode: '+90' },
  { code: 'RU', name: 'Russia', dialCode: '+7' },
  { code: 'CN', name: 'China', dialCode: '+86' },
] as const;

export type SupportedCountryCode = typeof SUPPORTED_COUNTRIES[number]['code'];

/**
 * Get user's country code from browser locale
 * Defaults to 'US' if detection fails
 */
export function getCountryCode(): SupportedCountryCode {
  try {
    const userLocale = navigator.language || (navigator as any).userLanguage;
    const regionCode = userLocale?.split('-')[1]?.toUpperCase();
    
    // Check if the detected region is in our supported countries
    const supportedCountry = SUPPORTED_COUNTRIES.find(
      country => country.code === regionCode
    );
    
    return (supportedCountry?.code as SupportedCountryCode) || 'US';
  } catch (error) {
    console.warn('Could not detect user country, defaulting to US:', error);
    return 'US';
  }
}

/**
 * Get list of supported countries with their dial codes
 */
export function getSupportedCountries() {
  return SUPPORTED_COUNTRIES.map(country => ({
    code: country.code,
    name: country.name,
    dialCode: country.dialCode,
  }));
}

/**
 * Format phone number according to country-specific rules
 * @param phone - Phone number to format
 * @param countryCode - Country code (e.g., 'US', 'GB')
 * @returns Formatted phone number or original if formatting fails
 */
export function formatPhoneNumber(phone: string, countryCode: SupportedCountryCode): string {
  try {
    // Remove all non-digit characters except leading +
    const cleaned = phone.replace(/(?!^\+)\D/g, '');
    
    // Parse the phone number
    const phoneNumber = parsePhoneNumberFromString(cleaned, countryCode as CountryCode);
    
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.formatNational();
    }
    
    // If parsing fails, apply basic formatting based on country
    return applyBasicFormatting(cleaned, countryCode);
  } catch (error) {
    console.warn('Phone formatting error:', error);
    return phone;
  }
}

/**
 * Apply basic phone formatting when libphonenumber-js parsing fails
 */
function applyBasicFormatting(phone: string, countryCode: SupportedCountryCode): string {
  const digits = phone.replace(/\D/g, '');
  
  switch (countryCode) {
    case 'US':
    case 'CA':
      // US/Canada: (123) 456-7890
      if (digits.length >= 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length >= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else if (digits.length >= 3) {
        return `(${digits}`;
      }
      break;
      
    case 'GB':
      // UK: +44 7700 900123
      if (digits.length >= 10) {
        return `${digits.slice(0, 5)} ${digits.slice(5, 9)} ${digits.slice(9)}`;
      }
      break;
      
    case 'AU':
      // Australia: 0412 345 678
      if (digits.length >= 9) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      }
      break;
      
    case 'DE':
    case 'FR':
    case 'IT':
    case 'ES':
      // European: group in pairs
      return digits.match(/.{1,2}/g)?.join(' ') || digits;
      
    default:
      // Default: group in 3-4 digits
      if (digits.length > 6) {
        return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      }
  }
  
  return phone;
}

/**
 * Convert phone number to E.164 format for Supabase Auth
 * @param phone - Phone number (can be formatted or raw)
 * @param countryCode - Country code (e.g., 'US', 'GB')
 * @returns E.164 formatted phone number or null if invalid
 */
export function getE164PhoneNumber(phone: string, countryCode: SupportedCountryCode): string | null {
  try {
    // Clean the phone number
    const cleaned = phone.replace(/(?!^\+)\D/g, '');
    
    // Parse with country code
    const phoneNumber = parsePhoneNumberFromString(cleaned, countryCode as CountryCode);
    
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.format('E.164');
    }
    
    // If parsing fails, manually construct E.164
    const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    if (!country) return null;
    
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length >= 7) { // Minimum phone length
      // Remove leading 0 if present (common in international numbers)
      const normalized = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
      return `${country.dialCode}${normalized}`;
    }
    
    return null;
  } catch (error) {
    console.warn('E.164 conversion error:', error);
    return null;
  }
}

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @param countryCode - Country code (e.g., 'US', 'GB')
 * @returns Validation result
 */
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

/**
 * Auto-detect country from phone number
 * @param phone - Phone number with country code (e.g., +1234567890)
 * @returns Detected country code or null
 */
export function detectCountryFromPhone(phone: string): SupportedCountryCode | null {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (phoneNumber && phoneNumber.isValid()) {
      const country = phoneNumber.country as SupportedCountryCode;
      // Check if detected country is supported
      if (SUPPORTED_COUNTRIES.find(c => c.code === country)) {
        return country;
      }
    }
    return null;
  } catch (error) {
    console.warn('Country detection error:', error);
    return null;
  }
}

/**
 * Format phone number for display
 * @param phone - Phone number in any format
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone);
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.formatInternational();
    }
    return phone;
  } catch (error) {
    console.warn('Display formatting error:', error);
    return phone;
  }
}

/**
 * Check if phone number is valid for a specific country
 * @param phone - Phone number to check
 * @param countryCode - Country code to check against
 * @returns Whether the phone is valid for the country
 */
export function isValidForCountry(phone: string, countryCode: SupportedCountryCode): boolean {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, countryCode as CountryCode);
    return phoneNumber ? phoneNumber.isValid() : false;
  } catch (error) {
    return false;
  }
}

/**
 * Get example phone number for a country
 * @param countryCode - Country code
 * @returns Example phone number
 */
export function getExamplePhoneNumber(countryCode: SupportedCountryCode): string {
  const examples: Record<SupportedCountryCode, string> = {
    US: '(555) 123-4567',
    CA: '(555) 123-4567',
    GB: '7700 900123',
    AU: '0412 345 678',
    DE: '1512 3456789',
    FR: '612 345 678',
    IT: '312 3456789',
    ES: '612 345 678',
    JP: '090-1234-5678',
    KR: '010-1234-5678',
    IN: '81234 56789',
    BR: '(11) 91234-5678',
    MX: '55 1234 5678',
    AR: '11 1234-5678',
    CO: '312 3456789',
    ZA: '71 123 4567',
    NG: '802 123 4567',
    EG: '100 123 4567',
    TR: '501 234 5678',
    RU: '912 345-67-89',
    CN: '138 0013 8000',
  };
  
  return examples[countryCode] || '123-456-7890';
}