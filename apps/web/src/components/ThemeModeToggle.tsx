/**
 * Theme Mode Toggle Component
 * 
 * A component that allows users to switch between light, dark, and system theme modes.
 * Integrates with the ThemeContext to provide seamless mode switching.
 */

'use client'

import React from 'react'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeMode } from '@/types/theme'

interface ThemeModeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'button' | 'dropdown' | 'segmented'
  showLabel?: boolean
  disabled?: boolean
}

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  className,
  size = 'md',
  variant = 'button',
  showLabel = false,
  disabled = false
}) => {
  const { mode, resolvedMode, setMode, toggleMode, currentTheme } = useTheme()

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  }

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const modes: { value: ThemeMode; label: string; icon: React.ComponentType<any> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ]

  const currentModeData = modes.find(m => m.value === mode) || modes[0]
  const Icon = currentModeData.icon

  // Check if current theme supports both light and dark modes
  const supportsDarkMode = currentTheme?.lightTheme && currentTheme?.darkTheme

  // Simple toggle button variant
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleMode}
        disabled={disabled || !supportsDarkMode}
        className={cn(
          'inline-flex items-center justify-center rounded-lg theme-border theme-bg-primary theme-text-primary shadow-sm transition-all hover:theme-bg-secondary focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        title={supportsDarkMode ? `Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode` : 'Current theme does not support dark mode'}
        aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
      >
        <Icon className={iconSizeClasses[size]} />
        {showLabel && (
          <span className="ml-2 hidden sm:inline">
            {currentModeData.label}
          </span>
        )}
      </button>
    )
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative inline-block', className)}>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as ThemeMode)}
          disabled={disabled || !supportsDarkMode}
          className={cn(
            'inline-flex items-center justify-center rounded-lg theme-border theme-bg-primary px-3 py-2 text-sm font-medium theme-text-primary shadow-sm transition-all hover:theme-bg-secondary focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size]
          )}
          title={supportsDarkMode ? 'Select theme mode' : 'Current theme does not support dark mode'}
        >
          {modes.map((modeOption) => (
            <option key={modeOption.value} value={modeOption.value}>
              {modeOption.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Segmented control variant
  if (variant === 'segmented') {
    return (
      <div className={cn('inline-flex rounded-lg theme-border theme-bg-secondary p-1', className)}>
        {modes.map((modeOption) => {
          const ModeIcon = modeOption.icon
          const isActive = mode === modeOption.value
          const isDisabled = disabled || (!supportsDarkMode && modeOption.value !== 'light')

          return (
            <button
              key={modeOption.value}
              type="button"
              onClick={() => setMode(modeOption.value)}
              disabled={isDisabled}
              className={cn(
                'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                isActive
                  ? 'theme-bg-primary theme-text-primary shadow-sm'
                  : 'theme-text-secondary hover:theme-text-primary',
                iconSizeClasses[size]
              )}
              title={supportsDarkMode ? `Switch to ${modeOption.label.toLowerCase()} mode` : 'Current theme does not support dark mode'}
              aria-label={`Switch to ${modeOption.label.toLowerCase()} mode`}
            >
              <ModeIcon className={iconSizeClasses[size]} />
              {showLabel && (
                <span className="ml-2 hidden sm:inline">
                  {modeOption.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return null
}

export default ThemeModeToggle