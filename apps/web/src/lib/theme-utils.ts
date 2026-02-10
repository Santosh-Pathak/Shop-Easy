/**
 * Theme Utilities
 *
 * Helper functions and utilities for working with the theme system
 */

import { colorPalette, ThemeConfig } from '@/config/theme.config'

// CSS Class generation utilities
export const themeClasses = {
   // Background classes
   bg: {
      primary: 'bg-[var(--bg-primary)]',
      secondary: 'bg-[var(--bg-secondary)]',
      tertiary: 'bg-[var(--bg-tertiary)]',
   },

   // Text classes
   text: {
      primary: 'text-[var(--fg-primary)]',
      secondary: 'text-[var(--fg-secondary)]',
      muted: 'text-[var(--fg-muted)]',
   },

   // Border classes
   border: {
      default: 'border-[var(--border-default)]',
      muted: 'border-[var(--border-muted)]',
      strong: 'border-[var(--border-strong)]',
   },

   // Interactive classes
   interactive: {
      primary:
         'bg-[var(--interactive-primary)] hover:bg-[var(--interactive-primary-hover)] active:bg-[var(--interactive-primary-active)]',
      secondary:
         'bg-[var(--interactive-secondary)] hover:bg-[var(--interactive-secondary-hover)] active:bg-[var(--interactive-secondary-active)]',
   },
}

// Tailwind-compatible color classes using CSS variables
export const dynamicColors = {
   // Primary colors
   'primary-50': 'var(--primary-50)',
   'primary-100': 'var(--primary-100)',
   'primary-200': 'var(--primary-200)',
   'primary-300': 'var(--primary-300)',
   'primary-400': 'var(--primary-400)',
   'primary-500': 'var(--primary-500)',
   'primary-600': 'var(--primary-600)',
   'primary-700': 'var(--primary-700)',
   'primary-800': 'var(--primary-800)',
   'primary-900': 'var(--primary-900)',
   'primary-950': 'var(--primary-950)',

   // Secondary colors
   'secondary-50': 'var(--secondary-50)',
   'secondary-100': 'var(--secondary-100)',
   'secondary-200': 'var(--secondary-200)',
   'secondary-300': 'var(--secondary-300)',
   'secondary-400': 'var(--secondary-400)',
   'secondary-500': 'var(--secondary-500)',
   'secondary-600': 'var(--secondary-600)',
   'secondary-700': 'var(--secondary-700)',
   'secondary-800': 'var(--secondary-800)',
   'secondary-900': 'var(--secondary-900)',
   'secondary-950': 'var(--secondary-950)',

   // Neutral colors
   'neutral-50': 'var(--neutral-50)',
   'neutral-100': 'var(--neutral-100)',
   'neutral-200': 'var(--neutral-200)',
   'neutral-300': 'var(--neutral-300)',
   'neutral-400': 'var(--neutral-400)',
   'neutral-500': 'var(--neutral-500)',
   'neutral-600': 'var(--neutral-600)',
   'neutral-700': 'var(--neutral-700)',
   'neutral-800': 'var(--neutral-800)',
   'neutral-900': 'var(--neutral-900)',
   'neutral-950': 'var(--neutral-950)',

   // Semantic colors
   'success-50': 'var(--success-50)',
   'success-500': 'var(--success-500)',
   'success-600': 'var(--success-600)',
   'success-700': 'var(--success-700)',

   'warning-50': 'var(--warning-50)',
   'warning-500': 'var(--warning-500)',
   'warning-600': 'var(--warning-600)',
   'warning-700': 'var(--warning-700)',

   'error-50': 'var(--error-50)',
   'error-500': 'var(--error-500)',
   'error-600': 'var(--error-600)',
   'error-700': 'var(--error-700)',

   'info-50': 'var(--info-50)',
   'info-500': 'var(--info-500)',
   'info-600': 'var(--info-600)',
   'info-700': 'var(--info-700)',
}

// Utility function to get color value by path
export function getColorValue(
   colorPath: string,
   colors = colorPalette
): string {
   const path = colorPath.split('.')
   let current: any = colors

   for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
         current = current[key]
      } else {
         throw new Error(`Color path "${colorPath}" not found`)
      }
   }

   if (typeof current !== 'string') {
      throw new Error(
         `Color path "${colorPath}" does not resolve to a string value`
      )
   }

   return current
}

// Generate Tailwind classes for a color palette
export function generateTailwindClasses(
   prefix: string,
   colors: Record<string, string>
): Record<string, string> {
   const classes: Record<string, string> = {}

   Object.entries(colors).forEach(([shade, color]) => {
      classes[`${prefix}-${shade}`] = color
   })

   return classes
}

// Color manipulation utilities
export function hexToRgb(
   hex: string
): { r: number; g: number; b: number } | null {
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
   return result
      ? {
           r: parseInt(result[1], 16),
           g: parseInt(result[2], 16),
           b: parseInt(result[3], 16),
        }
      : null
}

export function rgbToHex(r: number, g: number, b: number): string {
   return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Convert hex to HSL
export function hexToHsl(
   hex: string
): { h: number; s: number; l: number } | null {
   const rgb = hexToRgb(hex)
   if (!rgb) return null

   const { r, g, b } = rgb
   const rNorm = r / 255
   const gNorm = g / 255
   const bNorm = b / 255

   const max = Math.max(rNorm, gNorm, bNorm)
   const min = Math.min(rNorm, gNorm, bNorm)

   let h = 0
   let s = 0
   const l = (max + min) / 2

   if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
         case rNorm:
            h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
            break
         case gNorm:
            h = (bNorm - rNorm) / d + 2
            break
         case bNorm:
            h = (rNorm - gNorm) / d + 4
            break
      }
      h /= 6
   }

   return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
   }
}

// Generate a complete color palette from a base color
export function generateColorPalette(baseColor: string, paletteName: string) {
   const hsl = hexToHsl(baseColor)
   if (!hsl) throw new Error('Invalid base color')

   const { h, s } = hsl

   return {
      [`${paletteName}-50`]: `hsl(${h}, ${Math.min(s + 20, 100)}%, 97%)`,
      [`${paletteName}-100`]: `hsl(${h}, ${Math.min(s + 15, 100)}%, 94%)`,
      [`${paletteName}-200`]: `hsl(${h}, ${Math.min(s + 10, 100)}%, 86%)`,
      [`${paletteName}-300`]: `hsl(${h}, ${s}%, 77%)`,
      [`${paletteName}-400`]: `hsl(${h}, ${s}%, 65%)`,
      [`${paletteName}-500`]: baseColor,
      [`${paletteName}-600`]: `hsl(${h}, ${s}%, 45%)`,
      [`${paletteName}-700`]: `hsl(${h}, ${Math.min(s + 5, 100)}%, 38%)`,
      [`${paletteName}-800`]: `hsl(${h}, ${Math.min(s + 10, 100)}%, 32%)`,
      [`${paletteName}-900`]: `hsl(${h}, ${Math.min(s + 15, 100)}%, 26%)`,
      [`${paletteName}-950`]: `hsl(${h}, ${Math.min(s + 20, 100)}%, 16%)`,
   }
}

// Theme-aware CSS class builder
export function cn(
   ...classes: (string | undefined | null | boolean)[]
): string {
   return classes.filter(Boolean).join(' ')
}

// Get contrasting text color for a background
export function getContrastingTextColor(
   backgroundColor: string,
   lightColor = '#ffffff',
   darkColor = '#000000'
): string {
   const rgb = hexToRgb(backgroundColor)
   if (!rgb) return darkColor

   // Calculate luminance
   const { r, g, b } = rgb
   const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

   return luminance > 0.5 ? darkColor : lightColor
}

// Create a theme-aware style object
export function createThemeStyles(theme: ThemeConfig) {
   return {
      background: {
         primary: { backgroundColor: theme.background.primary },
         secondary: { backgroundColor: theme.background.secondary },
         tertiary: { backgroundColor: theme.background.tertiary },
      },
      text: {
         primary: { color: theme.foreground.primary },
         secondary: { color: theme.foreground.secondary },
         muted: { color: theme.foreground.muted },
      },
      border: {
         default: { borderColor: theme.border.default },
         muted: { borderColor: theme.border.muted },
         strong: { borderColor: theme.border.strong },
      },
      interactive: {
         primary: {
            backgroundColor: theme.interactive.primary,
            color: getContrastingTextColor(theme.interactive.primary),
         },
         secondary: {
            backgroundColor: theme.interactive.secondary,
            color: getContrastingTextColor(theme.interactive.secondary),
         },
      },
   }
}
