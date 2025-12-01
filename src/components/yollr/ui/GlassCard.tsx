'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'light' | 'medium' | 'heavy';
  gradient?: 'mint' | 'lilac' | 'coral' | 'honey' | 'sky' | 'energyLime' | 'energyPink' | 'primaryCTA' | 'socialHeat' | 'reward' | 'athletics' | 'none';
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * GlassCard - Base glass-matte card component for all Yollr feed cards
 * Features: backdrop blur, gradient borders, soft shadows, optional glow
 * Updated with Pantone 2025/26 Digital-First palette
 */
export function GlassCard({
  variant = 'medium',
  gradient = 'none',
  glow = false,
  children,
  className,
  ...motionProps
}: GlassCardProps) {
  const glassOpacity = {
    light: 'bg-glass-light',
    medium: 'bg-glass-medium',
    heavy: 'bg-glass-heavy',
  };

  const gradientBorder = {
    mint: 'before:bg-gradient-to-r before:from-accent-mint before:to-accent-mint-light',
    lilac: 'before:bg-gradient-to-r before:from-accent-lilac before:to-accent-lilac-light',
    coral: 'before:bg-gradient-to-r before:from-accent-pop-coral before:to-accent-pop-coral-light',
    honey: 'before:bg-gradient-to-r before:from-accent-honey before:to-accent-honey-light',
    sky: 'before:bg-gradient-to-r before:from-accent-sky before:to-accent-sky-light',
    energyLime: 'before:bg-gradient-to-r before:from-energy-lime before:to-energy-lime-light',
    energyPink: 'before:bg-gradient-to-r before:from-energy-pink before:to-energy-pink-light',
    primaryCTA: 'before:bg-gradient-to-r before:from-accent-mint before:to-accent-lilac',
    socialHeat: 'before:bg-gradient-to-r before:from-accent-pop-coral before:to-energy-pink',
    reward: 'before:bg-gradient-to-r before:from-accent-honey before:to-energy-lime',
    athletics: 'before:bg-gradient-to-r before:from-sport-blue before:to-accent-sky',
    none: '',
  };

  const glowEffect = glow && gradient !== 'none'
    ? `shadow-lg ${
        gradient === 'mint' ? 'shadow-accent-mint-glow' :
        gradient === 'lilac' ? 'shadow-accent-lilac-glow' :
        gradient === 'coral' ? 'shadow-accent-pop-coral-glow' :
        gradient === 'honey' ? 'shadow-accent-honey-glow' :
        gradient === 'sky' ? 'shadow-accent-sky-glow' :
        gradient === 'energyLime' ? 'shadow-energy-lime-glow' :
        gradient === 'energyPink' ? 'shadow-energy-pink-glow' :
        gradient === 'primaryCTA' ? 'shadow-accent-mint-glow' :
        gradient === 'socialHeat' ? 'shadow-accent-pop-coral-glow' :
        gradient === 'reward' ? 'shadow-accent-honey-glow' :
        gradient === 'athletics' ? 'shadow-sport-blue-glow' :
        'shadow-accent-mint-glow'
      }`
    : 'shadow-md';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative rounded-xl backdrop-blur-md overflow-hidden',
        glassOpacity[variant],
        glowEffect,
        'before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:-z-10',
        gradientBorder[gradient],
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
