'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ErrorToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function ErrorToast({ 
  message, 
  type = 'error', 
  duration = 5000, 
  onClose 
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  if (!isVisible) return null;

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-electric-peach" />,
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  const bgColors = {
    error: 'bg-electric-peach/10 border-electric-peach/30',
    success: 'bg-green-400/10 border-green-400/30',
    warning: 'bg-yellow-400/10 border-yellow-400/30',
    info: 'bg-blue-400/10 border-blue-400/30',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div className={`glass-card p-4 ${bgColors[type]} border rounded-lg shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-cloud font-medium break-words">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-cloud/50 hover:text-cloud transition-colors"
            aria-label="Close error message"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}