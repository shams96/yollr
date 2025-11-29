'use client';

import { motion } from 'framer-motion';
import { Camera, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick?: () => void;
  icon?: 'camera' | 'plus';
  label?: string;
  position?: 'bottom-right' | 'bottom-center';
  variant?: 'coral' | 'mint' | 'lilac' | 'energyLime' | 'primary';
  className?: string;
}

/**
 * FAB - Floating Action Button for Moment Capture
 * Positioned at bottom-right with gradient background and glow effect
 * Updated with Pantone 2025/26 Digital-First palette
 */
export function FAB({
  onClick,
  icon = 'camera',
  label = 'Capture',
  position = 'bottom-right',
  variant = 'coral',
  className,
}: FABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-6',
    'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
  };

  const variantClasses = {
    coral: 'bg-gradient-to-r from-accent-pop-coral to-accent-pop-coral-light shadow-accent-pop-coral-glow',
    mint: 'bg-gradient-to-r from-accent-mint to-accent-mint-light shadow-accent-mint-glow',
    lilac: 'bg-gradient-to-r from-accent-lilac to-accent-lilac-light shadow-accent-lilac-glow',
    energyLime: 'bg-gradient-to-r from-energy-lime to-energy-lime-light shadow-energy-lime-glow',
    primary: 'bg-gradient-to-r from-accent-mint to-accent-lilac shadow-accent-mint-glow',
  };

  const Icon = icon === 'camera' ? Camera : Plus;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed z-50 flex items-center gap-2 px-6 py-4 rounded-full',
        'text-white font-semibold text-base',
        'shadow-lg backdrop-blur-sm',
        'active:scale-95 transition-transform',
        positionClasses[position],
        variantClasses[variant],
        className
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <Icon className="w-5 h-5" />
      {label && <span>{label}</span>}
    </motion.button>
  );
}
