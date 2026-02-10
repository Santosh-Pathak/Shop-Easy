'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-7',
    md: 'h-5 w-9',
    lg: 'h-6 w-11',
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const thumbTransformClasses = {
    sm: checked ? 'translate-x-3' : 'translate-x-0',
    md: checked ? 'translate-x-4' : 'translate-x-0',
    lg: checked ? 'translate-x-5' : 'translate-x-0',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        checked
          ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 shadow-lg'
          : 'bg-gray-300 hover:bg-gray-400',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none relative inline-block rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out',
          thumbSizeClasses[size],
          thumbTransformClasses[size]
        )}
      >
        {/* Inner glow effect */}
        <span
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-300 ease-in-out',
            checked
              ? 'bg-gradient-to-r from-blue-100 to-purple-100 opacity-50'
              : 'bg-gray-50 opacity-0'
          )}
        />

        {/* Animated dot in center */}
        <span
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ease-in-out',
            size === 'sm'
              ? 'h-1 w-1'
              : size === 'md'
                ? 'h-1.5 w-1.5'
                : 'h-2 w-2',
            checked
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 opacity-60'
              : 'bg-gray-400 opacity-30'
          )}
        />
      </span>

      {/* Background pulse effect when active */}
      {checked && (
        <span className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 opacity-20" />
      )}
    </button>
  );
};

export default AnimatedToggle;
