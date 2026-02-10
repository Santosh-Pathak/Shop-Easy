/**
 * Theme Preview Component
 * 
 * Shows a live preview of how the theme will look with real UI components.
 * Provides instant visual feedback when configuring theme colors.
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Theme } from '@/types/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemePreviewProps {
  theme: Theme | Partial<Theme>
  mode?: 'light' | 'dark'
  showComponents?: boolean
  className?: string
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  theme,
  mode = 'light',
  showComponents = true,
  className
}) => {
  const { resolvedMode } = useTheme()
  const currentMode = mode || resolvedMode

  // Get theme config based on mode
  const themeConfig = currentMode === 'dark' ? theme.darkTheme : theme.lightTheme
  const colorPalette = theme.colorPalette

  if (!themeConfig || !colorPalette) {
    return (
      <div className={cn('flex items-center justify-center h-64 theme-bg-secondary rounded-lg', className)}>
        <div className="text-center">
          <span className="text-4xl mb-2 block">🎨</span>
          <p className="theme-text-secondary">Preview will appear here</p>
        </div>
      </div>
    )
  }

  // Apply theme variables for preview
  const previewStyle = {
    '--bg-primary': themeConfig.background.primary,
    '--bg-secondary': themeConfig.background.secondary,
    '--bg-tertiary': themeConfig.background.tertiary,
    '--fg-primary': themeConfig.foreground.primary,
    '--fg-secondary': themeConfig.foreground.secondary,
    '--fg-muted': themeConfig.foreground.muted,
    '--border-default': themeConfig.border.default,
    '--border-muted': themeConfig.border.muted,
    '--border-strong': themeConfig.border.strong,
    '--surface-default': themeConfig.surface.default,
    '--surface-elevated': themeConfig.surface.elevated,
    '--interactive-primary': themeConfig.interactive.primary,
    '--interactive-primary-hover': themeConfig.interactive.primaryHover,
    '--interactive-secondary': themeConfig.interactive.secondary,
    '--interactive-secondary-hover': themeConfig.interactive.secondaryHover,
    '--color-primary': colorPalette.primary?.['600'] || '#3b82f6',
    '--color-secondary': colorPalette.secondary?.['600'] || '#6b7280',
    '--color-success': colorPalette.success?.['600'] || '#16a34a',
    '--color-warning': colorPalette.warning?.['600'] || '#d97706',
    '--color-error': colorPalette.error?.['600'] || '#dc2626',
    '--color-info': colorPalette.info?.['600'] || '#0284c7',
  } as React.CSSProperties

  return (
    <div 
      className={cn('rounded-lg border overflow-hidden', className)}
      style={previewStyle}
    >
      {/* Preview Header */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ 
          backgroundColor: 'var(--bg-primary)', 
          borderColor: 'var(--border-default)',
          color: 'var(--fg-primary)'
        }}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">
            {theme.name || 'Theme Preview'}
          </h3>
          <span 
            className="px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: 'var(--interactive-secondary)', 
              color: 'var(--bg-primary)' 
            }}
          >
            {currentMode}
          </span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-error)' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></div>
        </div>
      </div>

      {/* Preview Content */}
      <div 
        className="p-6 space-y-6"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {showComponents && (
          <>
            {/* Color Palette Display */}
            <div className="space-y-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: 'var(--fg-primary)' }}
              >
                Color Palette
              </h4>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(colorPalette).map(([name, colors]) => {
                  const mainColor = colors?.['500'] || colors?.['600'] || Object.values(colors)[0]
                  return (
                    <div key={name} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-lg border mx-auto mb-1"
                        style={{ 
                          backgroundColor: mainColor,
                          borderColor: 'var(--border-default)'
                        }}
                        title={`${name}: ${mainColor}`}
                      />
                      <span 
                        className="text-xs capitalize"
                        style={{ color: 'var(--fg-secondary)' }}
                      >
                        {name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: 'var(--fg-primary)' }}
              >
                Buttons
              </h4>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'var(--interactive-primary)', 
                    color: 'var(--bg-primary)' 
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--interactive-primary)',
                    borderColor: 'var(--interactive-primary)'
                  }}
                >
                  Secondary Button
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    color: 'var(--fg-primary)',
                    borderColor: 'var(--border-default)'
                  }}
                >
                  Outline Button
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="space-y-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: 'var(--fg-primary)' }}
              >
                Form Elements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Text input"
                  className="px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--fg-primary)',
                    borderColor: 'var(--border-default)'
                  }}
                />
                <select
                  className="px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--fg-primary)',
                    borderColor: 'var(--border-default)'
                  }}
                >
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: 'var(--fg-primary)' }}
              >
                Cards & Surfaces
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--surface-default)', 
                    borderColor: 'var(--border-default)'
                  }}
                >
                  <h5 
                    className="font-medium mb-2"
                    style={{ color: 'var(--fg-primary)' }}
                  >
                    Card Title
                  </h5>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--fg-secondary)' }}
                  >
                    This is a card with some content to show how surfaces look in the theme.
                  </p>
                </div>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: 'var(--surface-elevated)', 
                    borderColor: 'var(--border-default)'
                  }}
                >
                  <h5 
                    className="font-medium mb-2"
                    style={{ color: 'var(--fg-primary)' }}
                  >
                    Elevated Card
                  </h5>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--fg-secondary)' }}
                  >
                    This is an elevated surface showing the elevated background color.
                  </p>
                </div>
              </div>
            </div>

            {/* Status Colors */}
            <div className="space-y-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: 'var(--fg-primary)' }}
              >
                Status Colors
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
                >
                  <div className="text-sm font-medium">Success</div>
                </div>
                <div 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}
                >
                  <div className="text-sm font-medium">Warning</div>
                </div>
                <div 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
                >
                  <div className="text-sm font-medium">Error</div>
                </div>
                <div 
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--color-info)', color: 'white' }}
                >
                  <div className="text-sm font-medium">Info</div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: 'var(--fg-primary)' }}
              >
                Typography
              </h4>
              <div className="space-y-2">
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--fg-primary)' }}
                >
                  Heading 1
                </h1>
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: 'var(--fg-primary)' }}
                >
                  Heading 2
                </h2>
                <p 
                  className="text-base"
                  style={{ color: 'var(--fg-primary)' }}
                >
                  Regular paragraph text with <span style={{ color: 'var(--interactive-primary)' }}>primary colored link</span>.
                </p>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--fg-secondary)' }}
                >
                  Secondary text that's less prominent.
                </p>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--fg-muted)' }}
                >
                  Muted text for captions and footnotes.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Mini Mode Display */}
        {!showComponents && (
          <div className="grid grid-cols-4 gap-4">
            <div 
              className="h-12 rounded"
              style={{ backgroundColor: 'var(--interactive-primary)' }}
              title="Primary Color"
            />
            <div 
              className="h-12 rounded"
              style={{ backgroundColor: 'var(--interactive-secondary)' }}
              title="Secondary Color"
            />
            <div 
              className="h-12 rounded border"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-default)'
              }}
              title="Background"
            />
            <div 
              className="h-12 rounded border"
              style={{ 
                backgroundColor: 'var(--surface-elevated)',
                borderColor: 'var(--border-default)'
              }}
              title="Surface"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ThemePreview