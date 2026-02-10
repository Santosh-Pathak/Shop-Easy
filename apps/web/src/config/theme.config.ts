/**
 * Global Theme Configuration
 *
 * This file contains all color definitions and theme configurations for the entire project.
 * To update the project's color scheme, modify the colors in this file.
 *
 * Color Palette: Deep Blue, Light Blue, and White combination
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ColorPalette {
   // Primary Colors (Deep Blue)
   primary: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
      950: string
   }

   // Secondary Colors (Light Blue)
   secondary: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
      950: string
   }

   // Neutral Colors (Grays with blue undertones)
   neutral: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
      950: string
   }

   // Semantic Colors
   success: {
      50: string
      500: string
      600: string
      700: string
   }

   warning: {
      50: string
      500: string
      600: string
      700: string
   }

   error: {
      50: string
      500: string
      600: string
      700: string
   }

   info: {
      50: string
      500: string
      600: string
      700: string
   }
}

// Global Color Palette - Deep Blue, Light Blue, White Theme
export const colorPalette: ColorPalette = {
   // Primary Colors - Deep Blue
   primary: {
      50: '#f0f7ff',
      100: '#e0effe',
      200: '#b9dffd',
      300: '#7cc4fc',
      400: '#36a6f8',
      500: '#0c8ce9',
      600: '#0070c7', // Main primary color
      700: '#0158a1',
      800: '#064b85',
      900: '#0c406e',
      950: '#082749',
   },

   // Secondary Colors - Light Blue
   secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main secondary color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
   },

   // Neutral Colors - Blue-tinted grays
   neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
   },

   // Semantic Colors
   success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
   },

   warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
   },

   error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
   },

   info: {
      50: '#f0f9ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
   },
}

// Theme-specific color mappings
export interface ThemeConfig {
   background: {
      primary: string
      secondary: string
      tertiary: string
   }

   foreground: {
      primary: string
      secondary: string
      muted: string
   }

   border: {
      default: string
      muted: string
      strong: string
   }

   surface: {
      default: string
      elevated: string
      overlay: string
   }

   interactive: {
      primary: string
      primaryHover: string
      primaryActive: string
      secondary: string
      secondaryHover: string
      secondaryActive: string
   }
}

export const lightTheme: ThemeConfig = {
   background: {
      primary: '#ffffff',
      secondary: colorPalette.neutral[50],
      tertiary: colorPalette.neutral[100],
   },

   foreground: {
      primary: colorPalette.neutral[900],
      secondary: colorPalette.neutral[700],
      muted: colorPalette.neutral[500],
   },

   border: {
      default: colorPalette.neutral[200],
      muted: colorPalette.neutral[100],
      strong: colorPalette.neutral[300],
   },

   surface: {
      default: '#ffffff',
      elevated: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
   },

   interactive: {
      primary: colorPalette.primary[600],
      primaryHover: colorPalette.primary[700],
      primaryActive: colorPalette.primary[800],
      secondary: colorPalette.secondary[500],
      secondaryHover: colorPalette.secondary[600],
      secondaryActive: colorPalette.secondary[700],
   },
}

export const darkTheme: ThemeConfig = {
   background: {
      primary: colorPalette.neutral[900],
      secondary: colorPalette.neutral[800],
      tertiary: colorPalette.neutral[700],
   },

   foreground: {
      primary: colorPalette.neutral[50],
      secondary: colorPalette.neutral[200],
      muted: colorPalette.neutral[400],
   },

   border: {
      default: colorPalette.neutral[700],
      muted: colorPalette.neutral[800],
      strong: colorPalette.neutral[600],
   },

   surface: {
      default: colorPalette.neutral[800],
      elevated: colorPalette.neutral[700],
      overlay: 'rgba(0, 0, 0, 0.8)',
   },

   interactive: {
      primary: colorPalette.primary[400],
      primaryHover: colorPalette.primary[300],
      primaryActive: colorPalette.primary[200],
      secondary: colorPalette.secondary[400],
      secondaryHover: colorPalette.secondary[300],
      secondaryActive: colorPalette.secondary[200],
   },
}

// CSS Custom Properties Generator
export const generateCSSVariables = (
   theme: ThemeConfig,
   mode: 'light' | 'dark'
) => {
   const prefix = mode === 'dark' ? '.dark' : ':root'

   return `
${prefix} {
  /* Background Colors */
  --bg-primary: ${theme.background.primary};
  --bg-secondary: ${theme.background.secondary};
  --bg-tertiary: ${theme.background.tertiary};
  
  /* Foreground Colors */
  --fg-primary: ${theme.foreground.primary};
  --fg-secondary: ${theme.foreground.secondary};
  --fg-muted: ${theme.foreground.muted};
  
  /* Border Colors */
  --border-default: ${theme.border.default};
  --border-muted: ${theme.border.muted};
  --border-strong: ${theme.border.strong};
  
  /* Surface Colors */
  --surface-default: ${theme.surface.default};
  --surface-elevated: ${theme.surface.elevated};
  --surface-overlay: ${theme.surface.overlay};
  
  /* Interactive Colors */
  --interactive-primary: ${theme.interactive.primary};
  --interactive-primary-hover: ${theme.interactive.primaryHover};
  --interactive-primary-active: ${theme.interactive.primaryActive};
  --interactive-secondary: ${theme.interactive.secondary};
  --interactive-secondary-hover: ${theme.interactive.secondaryHover};
  --interactive-secondary-active: ${theme.interactive.secondaryActive};
  
  /* Primary Palette */
  --primary-50: ${colorPalette.primary[50]};
  --primary-100: ${colorPalette.primary[100]};
  --primary-200: ${colorPalette.primary[200]};
  --primary-300: ${colorPalette.primary[300]};
  --primary-400: ${colorPalette.primary[400]};
  --primary-500: ${colorPalette.primary[500]};
  --primary-600: ${colorPalette.primary[600]};
  --primary-700: ${colorPalette.primary[700]};
  --primary-800: ${colorPalette.primary[800]};
  --primary-900: ${colorPalette.primary[900]};
  --primary-950: ${colorPalette.primary[950]};
  
  /* Secondary Palette */
  --secondary-50: ${colorPalette.secondary[50]};
  --secondary-100: ${colorPalette.secondary[100]};
  --secondary-200: ${colorPalette.secondary[200]};
  --secondary-300: ${colorPalette.secondary[300]};
  --secondary-400: ${colorPalette.secondary[400]};
  --secondary-500: ${colorPalette.secondary[500]};
  --secondary-600: ${colorPalette.secondary[600]};
  --secondary-700: ${colorPalette.secondary[700]};
  --secondary-800: ${colorPalette.secondary[800]};
  --secondary-900: ${colorPalette.secondary[900]};
  --secondary-950: ${colorPalette.secondary[950]};
  
  /* Neutral Palette */
  --neutral-50: ${colorPalette.neutral[50]};
  --neutral-100: ${colorPalette.neutral[100]};
  --neutral-200: ${colorPalette.neutral[200]};
  --neutral-300: ${colorPalette.neutral[300]};
  --neutral-400: ${colorPalette.neutral[400]};
  --neutral-500: ${colorPalette.neutral[500]};
  --neutral-600: ${colorPalette.neutral[600]};
  --neutral-700: ${colorPalette.neutral[700]};
  --neutral-800: ${colorPalette.neutral[800]};
  --neutral-900: ${colorPalette.neutral[900]};
  --neutral-950: ${colorPalette.neutral[950]};
  
  /* Semantic Colors */
  --success-50: ${colorPalette.success[50]};
  --success-500: ${colorPalette.success[500]};
  --success-600: ${colorPalette.success[600]};
  --success-700: ${colorPalette.success[700]};
  
  --warning-50: ${colorPalette.warning[50]};
  --warning-500: ${colorPalette.warning[500]};
  --warning-600: ${colorPalette.warning[600]};
  --warning-700: ${colorPalette.warning[700]};
  
  --error-50: ${colorPalette.error[50]};
  --error-500: ${colorPalette.error[500]};
  --error-600: ${colorPalette.error[600]};
  --error-700: ${colorPalette.error[700]};
  
  --info-50: ${colorPalette.info[50]};
  --info-500: ${colorPalette.info[500]};
  --info-600: ${colorPalette.info[600]};
  --info-700: ${colorPalette.info[700]};
}`
}

// Utility function to get theme colors
export const getThemeConfig = (mode: 'light' | 'dark'): ThemeConfig => {
   return mode === 'dark' ? darkTheme : lightTheme
}

// Export theme object for easy access
export const theme = {
   colors: colorPalette,
   light: lightTheme,
   dark: darkTheme,
   modes: ['light', 'dark', 'system'] as const,
}

export default theme
