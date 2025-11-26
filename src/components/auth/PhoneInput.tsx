'use client';

import { useState, useEffect } from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { formatPhoneNumber, getCountryCode, getSupportedCountries, getE164PhoneNumber } from '@/lib/validation/phone';
import type { SupportedCountryCode } from '@/lib/validation/phone';

interface PhoneInputProps {
  onSubmit: (phoneData: { phone: string; countryCode: string }) => void;
  loading: boolean;
  error: string | null;
}

export function PhoneInput({ onSubmit, loading, error }: PhoneInputProps) {
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState<SupportedCountryCode>('US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countries, setCountries] = useState<Array<{ code: string; name: string; dialCode: string }>>([]);

  useEffect(() => {
    // Get user's country code on component mount
    const userCountry = getCountryCode();
    setCountryCode(userCountry);
    
    // Load supported countries
    setCountries(getSupportedCountries());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const e164Phone = getE164PhoneNumber(phone, countryCode);
    if (e164Phone) {
      onSubmit({ phone: e164Phone, countryCode });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code as SupportedCountryCode);
    setShowCountryDropdown(false);
  };

  const selectedCountry = countries.find(c => c.code === countryCode);
  const isValidPhone = phone.replace(/\D/g, '').length >= 7; // Minimum phone length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-cloud/80 mb-3">
          Phone Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Phone className="h-5 w-5 text-cloud/50 group-focus-within:text-cosmic-pink transition-colors duration-200" />
          </div>
          <div className="flex group">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-cloud/20 bg-graphite/50 text-cloud/70 text-sm transition-all duration-200 group-focus-within:border-cosmic-pink group-focus-within:text-cosmic-pink group-focus-within:neon-glow-pink/30 hover:bg-graphite/70"
              disabled={loading}
            >
              {selectedCountry ? (
                <span className="flex items-center gap-1">
                  <span>{selectedCountry.dialCode}</span>
                  <ChevronDown className="h-3 w-3" />
                </span>
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="flex-1 pl-3 pr-10 py-3 block w-full rounded-r-md bg-graphite/30 border border-cloud/20 text-cloud placeholder-cloud/50 focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/20 focus:neon-glow-pink transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={selectedCountry ? `Enter phone number` : 'Select country first'}
              required
              disabled={loading || !selectedCountry}
            />
          </div>
          
          {showCountryDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-graphite/90 border border-cloud/20 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountryChange(country.code)}
                  className="w-full px-3 py-2 text-left text-sm text-cloud hover:bg-graphite/70 transition-colors duration-150 flex items-center justify-between"
                >
                  <span>{country.name}</span>
                  <span className="text-cloud/60">{country.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-electric-peach animate-pulse">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !isValidPhone}
        className="w-full flex justify-center py-3 px-4 rounded-md text-sm font-bold text-white gradient-btn haptic-tap disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
      >
        <span className="relative z-10">
          {loading ? (
            <span className="flex items-center justify-center">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Sending...
            </span>
          ) : 'Send Code'}
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
      </button>

      <div className="text-center">
        <p className="text-sm text-cloud/60">
          We'll send you a one-time code to verify your phone number
        </p>
      </div>
    </form>
  );
}