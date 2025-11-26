'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { OTPInput } from '@/components/auth/OTPInput';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSubmit = async (phoneData: { phone: string; countryCode: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we're in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      const useMockSms = process.env.NEXT_PUBLIC_USE_MOCK_SMS === 'true';
      
      console.log('Environment:', { isDevelopment, useMockSms, phoneData });
      
      // For development/testing without SMS provider, use mock OTP
      if (isDevelopment && useMockSms) {
        // In development with mock SMS enabled, simulate OTP sending
        console.log(`[DEV MODE] Mock OTP sent to ${phoneData.phone}: 123456`);
        setPhone(phoneData.phone);
        setStep('otp');
        setLoading(false);
        return;
      }
      
      console.log('Calling supabase.auth.signInWithOtp with:', { phone: phoneData.phone });
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneData.phone,
      });
      
      console.log('Supabase response:', { error });
      
      if (error) {
        console.error('Supabase error details:', error);
        // Handle specific error cases
        if (error.message?.includes('Unsupported phone provider')) {
          console.error('Phone provider error detected');
          setError(
            'Phone authentication is not configured. Please set up an SMS provider (Twilio, Vonage, etc.) in your Supabase project settings, or enable mock SMS for development.'
          );
          setLoading(false);
          return;
        }
        if (error.message?.includes('Rate limit exceeded')) {
          setError('Too many attempts. Please wait a few minutes and try again.');
          setLoading(false);
          return;
        }
        throw error;
      }
      
      console.log('OTP sent successfully, transitioning to OTP step');
      setPhone(phoneData.phone);
      setStep('otp');
    } catch (err: any) {
      console.error('Phone auth error:', err);
      setError(err.message || 'Failed to send OTP. Please check your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (otp: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // For development with mock SMS, accept the mock OTP
      if (isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK_SMS === 'true') {
        if (otp === '123456') {
          console.log('[DEV MODE] Mock OTP verification successful');
          router.push('/feed');
          return;
        } else {
          throw new Error('Invalid OTP. Use 123456 for development.');
        }
      }
      
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      
      if (error) {
        if (error.message?.includes('Invalid OTP')) {
          throw new Error('Invalid OTP. Please check the code and try again.');
        }
        throw error;
      }
      
      router.push('/feed');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment && process.env.NEXT_PUBLIC_USE_MOCK_SMS === 'true') {
        console.log(`[DEV MODE] Mock OTP resent to ${phone}: 123456`);
        return;
      }
      
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      if (error) {
        if (error.message?.includes('Rate limit exceeded')) {
          throw new Error('Too many attempts. Please wait a few minutes before trying again.');
        }
        throw error;
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-graphite to-midnight opacity-50"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-cosmic-pink/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-electric-peach/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black gradient-text mb-2 animate-gradient">
            Yollr
          </h1>
          <p className="text-cloud/70 text-sm">Your campus social feed</p>
        </div>

        <div className="glass-card p-6 glass-card-hover neon-glow-pink/10">
          {step === 'phone' ? (
            <PhoneInput
              onSubmit={handlePhoneSubmit}
              loading={loading}
              error={error}
            />
          ) : (
            <OTPInput
              onSubmit={handleOTPSubmit}
              onResend={handleResendOTP}
              loading={loading}
              error={error}
              phone={phone}
            />
          )}
        </div>

        {/* Session persistence indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-cloud/50">
            Your session is secured and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}