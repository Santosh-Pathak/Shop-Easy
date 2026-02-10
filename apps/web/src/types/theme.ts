/**
 * Enhanced Theme Types for Dynamic Theme Management
 *
 * These types align with the backend theme system to support
 * dynamic theme loading, color picker integration, and admin management
 */

// Base color palette structure matching backend
export interface ColorPalette {
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

// Theme configuration for light/dark modes
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

// Complete theme structure from backend
export interface Theme {
   _id: string
   name: string
   description?: string
   version: string
   colorPalette: ColorPalette
   lightTheme: ThemeConfig
   darkTheme: ThemeConfig
   isActive: boolean
   isDefault: boolean
   createdBy: {
      _id: string
      name: string
      email: string
   }
   updatedBy?: {
      _id: string
      name: string
      email: string
   }
   metadata: {
      usageCount: number
      exportCount: number
      lastUsed: string
      tags: string[]
   }
   presets?: ThemePreset[]
   createdAt: string
   updatedAt: string
}

// Theme preset for quick color combinations
export interface ThemePreset {
   name: string
   description?: string
   colorPalette: Partial<ColorPalette>
   isDefault: boolean
   category: 'modern' | 'classic' | 'vibrant' | 'minimal' | 'custom'
}

// Theme mode options
export type ThemeMode = 'light' | 'dark' | 'system'

// Color picker integration types
export interface ColorPickerValue {
   hex: string
   rgb: { r: number; g: number; b: number }
   hsl: { h: number; s: number; l: number }
   alpha?: number
}

export interface ColorHarmony {
   type:
      | 'complementary'
      | 'triadic'
      | 'analogous'
      | 'monochromatic'
      | 'split-complementary'
   colors: string[]
   description: string
}

export interface ColorPaletteGenerator {
   baseColor: string
   harmony: ColorHarmony
   generatedPalette: Partial<ColorPalette>
}

// Theme validation types
export interface ThemeValidationResult {
   isValid: boolean
   errors: string[]
   warnings?: string[]
   suggestions?: string[]
}

// Theme export formats
export type ThemeExportFormat = 'json' | 'css' | 'scss' | 'tailwind'

export interface ThemeExportOptions {
   format: ThemeExportFormat
   includeMetadata?: boolean
   minify?: boolean
   variables?: boolean
}

// Theme preview types
export interface ThemePreview {
   css: string
   preview: {
      colors: ColorPalette
      lightTheme: ThemeConfig
      darkTheme: ThemeConfig
   }
   accessibility: {
      contrastRatios: Record<string, number>
      wcagCompliance: 'AA' | 'AAA' | 'fail'
      issues: string[]
   }
}

// API response types
export interface ThemeApiResponse<T = any> {
   status: 'success' | 'error'
   message: string
   data: T
}

export interface ThemeListResponse {
   data: Theme[]
   meta: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
   }
}

// Theme management actions
export interface ThemeAction {
   type:
      | 'LOAD_THEMES'
      | 'SET_ACTIVE_THEME'
      | 'SET_MODE'
      | 'CREATE_THEME'
      | 'UPDATE_THEME'
      | 'DELETE_THEME'
      | 'CLONE_THEME'
      | 'EXPORT_THEME'
      | 'IMPORT_THEME'
      | 'PREVIEW_THEME'
      | 'VALIDATE_THEME'
      | 'RESET_THEME'
      | 'SET_LOADING'
      | 'SET_ERROR'
   payload?: any
}

// Theme context state
export interface ThemeContextState {
   // Current theme state
   currentTheme: Theme | null
   mode: ThemeMode
   resolvedMode: 'light' | 'dark'

   // Available themes
   themes: Theme[]
   activeTheme: Theme | null
   defaultTheme: Theme | null

   // Loading and error states
   isLoading: boolean
   error: string | null

   // Preview state
   previewTheme: Theme | null
   isPreviewMode: boolean

   // Admin management state
   isAdminMode: boolean
   isDirty: boolean

   // Color picker state
   selectedColor: ColorPickerValue | null
   colorHarmony: ColorHarmony | null

   // Cache and sync
   lastSync: Date | null
   isOnline: boolean
}

// Enhanced theme context interface
export interface EnhancedThemeContextType {
   // State from ThemeContextState
   currentTheme: Theme | null
   mode: ThemeMode
   resolvedMode: 'light' | 'dark'
   themes: Theme[]
   activeTheme: Theme | null
   defaultTheme: Theme | null
   isLoading: boolean
   error: string | null
   previewThemeData: Theme | null
   isPreviewMode: boolean
   isAdminMode: boolean
   isDirty: boolean
   selectedColor: ColorPickerValue | null
   colorHarmony: ColorHarmony | null
   lastSync: Date | null
   isOnline: boolean
   // Theme loading and management
   loadThemes: () => Promise<void>
   loadActiveTheme: () => Promise<void>
   setActiveTheme: (themeId: string) => Promise<void>

   // Theme mode management
   setMode: (mode: ThemeMode) => void
   toggleMode: () => void
   resetToSystem: () => void

   // Theme CRUD operations
   createTheme: (theme: Partial<Theme>) => Promise<Theme>
   updateTheme: (themeId: string, updates: Partial<Theme>) => Promise<Theme>
   deleteTheme: (themeId: string) => Promise<void>
   cloneTheme: (themeId: string, name?: string) => Promise<Theme>

   // Theme import/export
   exportTheme: (
      themeId: string,
      options: ThemeExportOptions
   ) => Promise<string>
   importTheme: (themeData: any) => Promise<Theme>

   // Theme preview
   previewTheme: (theme: Partial<Theme>) => void
   exitPreview: () => void
   applyPreview: () => Promise<void>

   // Color picker integration
   updateColor: (colorPath: string, color: ColorPickerValue) => void
   generateHarmony: (
      baseColor: string,
      type: ColorHarmony['type']
   ) => ColorHarmony
   applyColorPalette: (palette: Partial<ColorPalette>) => void

   // Validation and utilities
   validateTheme: (theme: Partial<Theme>) => Promise<ThemeValidationResult>
   resetTheme: () => void
   clearError: () => void

   // Admin management
   enterAdminMode: () => void
   exitAdminMode: () => void
   saveChanges: () => Promise<void>
   discardChanges: () => void

   // Sync and cache
   syncWithServer: () => Promise<void>
   clearCache: () => void

   // Utility getters
   getCurrentColors: () => ColorPalette
   getCurrentThemeConfig: () => ThemeConfig
   getThemeById: (id: string) => Theme | null
   isCurrentTheme: (themeId: string) => boolean
}

// Component prop types
export interface ThemeProviderProps {
   children: React.ReactNode
   apiBaseUrl?: string
   enableCache?: boolean
   enableSync?: boolean
   adminMode?: boolean
}

export interface ColorPickerProps {
   value: ColorPickerValue
   onChange: (color: ColorPickerValue) => void
   onHarmonyGenerate?: (harmony: ColorHarmony) => void
   showHarmony?: boolean
   showPresets?: boolean
   disabled?: boolean
   className?: string
}

export interface ThemePreviewProps {
   theme: Theme | Partial<Theme>
   mode?: ThemeMode
   showComponents?: boolean
   onApply?: () => void
   onDiscard?: () => void
   className?: string
}

export interface ThemeConfiguratorProps {
   theme: Theme | null
   onChange: (updates: Partial<Theme>) => void
   onSave: () => Promise<void>
   onCancel: () => void
   isLoading?: boolean
   validationResult?: ThemeValidationResult
   className?: string
}

// DTOs for API operations
export interface CreateThemeDto {
   name: string
   description?: string
   version?: string
   colorPalette: ColorPalette
   lightTheme: ThemeConfig
   darkTheme: ThemeConfig
   metadata?: {
      tags?: string[]
   }
}

export interface UpdateThemeDto {
   name?: string
   description?: string
   version?: string
   colorPalette?: Partial<ColorPalette>
   lightTheme?: Partial<ThemeConfig>
   darkTheme?: Partial<ThemeConfig>
   metadata?: {
      tags?: string[]
   }
}

// Hook return types
export type UseThemeReturn = EnhancedThemeContextType

export interface UseColorsReturn {
   colors: ColorPalette
   updateColor: (path: string, color: ColorPickerValue) => void
   resetColors: () => void
}

export interface UseThemePreviewReturn {
   previewTheme: Theme | null
   isPreviewMode: boolean
   startPreview: (theme: Partial<Theme>) => void
   exitPreview: () => void
   applyPreview: () => Promise<void>
}

export interface UseThemeAdminReturn {
   isAdminMode: boolean
   isDirty: boolean
   enterAdminMode: () => void
   exitAdminMode: () => void
   saveChanges: () => Promise<void>
   discardChanges: () => void
   createTheme: (theme: Partial<Theme>) => Promise<Theme>
   updateTheme: (themeId: string, updates: Partial<Theme>) => Promise<Theme>
   deleteTheme: (themeId: string) => Promise<void>
   exportTheme: (
      themeId: string,
      options: ThemeExportOptions
   ) => Promise<string>
   importTheme: (themeData: any) => Promise<Theme>
}

// Error types
export class ThemeError extends Error {
   constructor(
      message: string,
      public code: string,
      public details?: any
   ) {
      super(message)
      this.name = 'ThemeError'
   }
}

export class ThemeValidationError extends ThemeError {
   constructor(
      message: string,
      public errors: string[]
   ) {
      super(message, 'VALIDATION_ERROR', { errors })
      this.name = 'ThemeValidationError'
   }
}

export class ThemeApiError extends ThemeError {
   constructor(
      message: string,
      public statusCode: number,
      public response?: any
   ) {
      super(message, 'API_ERROR', { statusCode, response })
      this.name = 'ThemeApiError'
   }
}

// Configuration types
export interface ThemeConfigOptions {
   api: {
      baseUrl: string
      timeout: number
      retryAttempts: number
   }
   cache: {
      enabled: boolean
      ttl: number
      maxSize: number
   }
   sync: {
      enabled: boolean
      interval: number
      onlineOnly: boolean
   }
   features: {
      colorPicker: boolean
      preview: boolean
      export: boolean
      import: boolean
      admin: boolean
   }
}
