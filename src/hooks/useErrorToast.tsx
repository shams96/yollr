'use client';

import { useState, useCallback } from 'react';
import { ErrorToast } from '@/components/error/ErrorToast';
import { logError } from '@/lib/error-handler';

interface UseErrorToastReturn {
  showError: (message: string, error?: unknown) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  ErrorToastComponent: JSX.Element | null;
}

export function useErrorToast(): UseErrorToastReturn {
  const [toast, setToast] = useState<{
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  } | null>(null);

  const showError = useCallback((message: string, error?: unknown) => {
    setToast({ message, type: 'error' });
    if (error) {
      logError(error instanceof Error ? error : new Error(message), {
        component: 'useErrorToast',
      });
    }
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({ message, type: 'success' });
  }, []);

  const showWarning = useCallback((message: string) => {
    setToast({ message, type: 'warning' });
  }, []);

  const showInfo = useCallback((message: string) => {
    setToast({ message, type: 'info' });
  }, []);

  const ErrorToastComponent = toast ? (
    <ErrorToast
      message={toast.message}
      type={toast.type}
      duration={5000}
      onClose={() => setToast(null)}
    />
  ) : null;

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    ErrorToastComponent,
  };
}
