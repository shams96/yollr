'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';

interface OTPInputProps {
  onSubmit: (otp: string) => void;
  onResend: () => void;
  loading: boolean;
  error: string | null;
  phone: string;
}

export function OTPInput({ onSubmit, onResend, loading, error, phone }: OTPInputProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const otpString = newOtp.join('');
    if (otpString.length === 6) {
      onSubmit(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    const otpString = newOtp.join('');
    
    if (otpString.length === 6) {
      onSubmit(otpString);
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const maskedPhone = phone.replace(/(\d{3})\d{3}(\d{4})/, '($1) ***-$2');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-graphite/50 border border-cloud/20 neon-glow-pink/30">
          <Lock className="h-6 w-6 text-cosmic-pink" />
        </div>
        <h2 className="mt-4 text-lg font-bold gradient-text animate-gradient">
          Enter verification code
        </h2>
        <p className="mt-1 text-sm text-cloud/70">
          We sent a 6-digit code to <span className="font-mono text-cosmic-pink">{maskedPhone}</span>
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const otpString = otp.join('');
          if (otpString.length === 6) {
            onSubmit(otpString);
          }
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-cloud/80 mb-3">
            Verification Code
          </label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-lg font-bold bg-graphite/30 border border-cloud/20 rounded-md text-cloud focus:outline-none focus:border-cosmic-pink focus:ring-2 focus:ring-cosmic-pink/20 focus:neon-glow-pink transition-all duration-200 haptic-tap disabled:opacity-50 disabled:cursor-not-allowed transform focus:scale-105"
                maxLength={1}
                disabled={loading}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
          {error && (
            <p className="mt-2 text-sm text-electric-peach text-center animate-pulse">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full flex justify-center py-3 px-4 rounded-md text-sm font-bold text-white gradient-btn haptic-tap disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
        >
          <span className="relative z-10">
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Verifying...
              </span>
            ) : 'Verify Code'}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={onResend}
          disabled={resendDisabled || loading}
          className="text-sm text-cosmic-pink hover:text-cosmic-pink/80 disabled:text-cloud/40 disabled:cursor-not-allowed transition-all duration-200 haptic-tap"
        >
          {resendDisabled ? (
            <span className="flex items-center justify-center">
              <span className="inline-block w-3 h-3 border-2 border-cosmic-pink border-t-transparent rounded-full animate-spin mr-2"></span>
              Resend code in {countdown}s
            </span>
          ) : (
            'Resend code'
          )}
        </button>
      </div>
    </div>
  );
}