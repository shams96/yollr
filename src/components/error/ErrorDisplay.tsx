'use client';

import { useState } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  message?: string;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  message = "We're sorry, but something unexpected happened. Please try again."
}: ErrorDisplayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const getErrorDetails = () => {
    if (process.env.NODE_ENV === 'development' && error) {
      return error.message;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-electric-peach/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-electric-peach" />
          </div>
          
          <h2 className="text-2xl font-bold gradient-text mb-2">
            {title}
          </h2>
          
          <p className="text-cloud/70 mb-4">
            {message}
          </p>

          {getErrorDetails() && (
            <div className="mt-4 p-3 bg-graphite/50 rounded-lg">
              <p className="text-sm text-cloud/60 font-mono">
                {getErrorDetails()}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="gradient-btn haptic-tap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => window.location.href = '/'}
            className="glass-card px-4 py-3 text-cloud hover:text-cosmic-pink transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}