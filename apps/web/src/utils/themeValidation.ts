/**
 * Theme Validation Utilities
 *
 * Comprehensive validation system for theme configurations with detailed
 * error messages, warnings, and suggestions for improvements.
 */

import {
   Theme,
   ThemeValidationResult,
   ColorPalette,
   ThemeConfig,
} from '@/types/theme'
import { hexToRgb, isValidHex, getContrastRatio } from '@/utils/colorUtils'

interface ValidationContext {
   isValid: boolean
   errors: string[]
   warnings: string[]
   suggestions: string[]
}

// Validation rules for theme configuration
const VALIDATION_RULES = {
   name: {
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
   },
   version: {
      pattern: /^\d+\.\d+\.\d+$/,
   },
   description: {
      maxLength: 500,
   },
   colors: {
      minContrast: 4.5, // WCAG AA standard
      preferredContrast: 7, // WCAG AAA standard
      requiredShades: [
         '50',
         '100',
         '200',
         '300',
         '400',
         '500',
         '600',
         '700',
         '800',
         '900',
      ],
   },
}

/**
 * Validates basic theme metadata
 */
function validateThemeMetadata(
   theme: Partial<Theme>,
   context: ValidationContext
): void {
   // Validate theme name
   if (!theme.name) {
      context.errors.push('Theme name is required')
      context.isValid = false
   } else {
      if (theme.name.length < VALIDATION_RULES.name.minLength) {
         context.errors.push('Theme name must be at least 1 character long')
         context.isValid = false
      }

      if (theme.name.length > VALIDATION_RULES.name.maxLength) {
         context.errors.push(
            `Theme name must be less than ${VALIDATION_RULES.name.maxLength} characters`
         )
         context.isValid = false
      }

      if (!VALIDATION_RULES.name.pattern.test(theme.name)) {
         context.errors.push(
            'Theme name can only contain letters, numbers, spaces, hyphens, and underscores'
         )
         context.isValid = false
      }
   }

   // Validate version
   if (theme.version && !VALIDATION_RULES.version.pattern.test(theme.version)) {
      context.errors.push(
         'Version must follow semantic versioning format (e.g., 1.0.0)'
      )
      context.isValid = false
   }

   // Validate description
   if (
      theme.description &&
      theme.description.length > VALIDATION_RULES.description.maxLength
   ) {
      context.warnings.push(
         `Description is quite long (${theme.description.length} characters). Consider keeping it under ${VALIDATION_RULES.description.maxLength} characters.`
      )
   }

   // Check for missing description
   if (!theme.description || theme.description.trim().length === 0) {
      context.suggestions.push(
         'Consider adding a description to help users understand what this theme is for'
      )
   }
}

/**
 * Validates color palette structure and values
 */
function validateColorPalette(
   palette: Partial<ColorPalette>,
   context: ValidationContext
): void {
   if (!palette) {
      context.errors.push('Color palette is required')
      context.isValid = false
      return
   }

   const requiredColorGroups = [
      'primary',
      'secondary',
      'neutral',
      'success',
      'warning',
      'error',
      'info',
   ]
   const missingGroups: string[] = []

   requiredColorGroups.forEach((group) => {
      if (!palette[group as keyof ColorPalette]) {
         missingGroups.push(group)
      }
   })

   if (missingGroups.length > 0) {
      context.errors.push(
         `Missing required color groups: ${missingGroups.join(', ')}`
      )
      context.isValid = false
   }

   // Validate each color group
   Object.entries(palette).forEach(([groupName, colors]) => {
      if (!colors) return

      validateColorGroup(groupName, colors, context)
   })
}

/**
 * Validates individual color group
 */
function validateColorGroup(
   groupName: string,
   colors: Record<string, string>,
   context: ValidationContext
): void {
   const invalidColors: string[] = []
   const missingShades: string[] = []

   // Check for invalid hex colors
   Object.entries(colors).forEach(([shade, color]) => {
      if (!isValidHex(color)) {
         invalidColors.push(`${groupName}.${shade}: ${color}`)
      }
   })

   if (invalidColors.length > 0) {
      context.errors.push(
         `Invalid hex colors found: ${invalidColors.join(', ')}`
      )
      context.isValid = false
   }

   // Check for recommended shades (only for main color groups)
   if (['primary', 'secondary', 'neutral'].includes(groupName)) {
      VALIDATION_RULES.colors.requiredShades.forEach((shade) => {
         if (!colors[shade]) {
            missingShades.push(shade)
         }
      })

      if (missingShades.length > 0) {
         context.warnings.push(
            `${groupName} color group is missing recommended shades: ${missingShades.join(', ')}`
         )
      }
   }

   // Check color progression (lighter to darker)
   const shadeEntries = Object.entries(colors)
      .filter(([shade]) => !isNaN(Number(shade)))
      .sort(([a], [b]) => Number(a) - Number(b))

   if (shadeEntries.length >= 3) {
      for (let i = 1; i < shadeEntries.length; i++) {
         const [prevShade, prevColor] = shadeEntries[i - 1]
         const [currentShade, currentColor] = shadeEntries[i]

         const prevRgb = hexToRgb(prevColor)
         const currentRgb = hexToRgb(currentColor)

         if (prevRgb && currentRgb) {
            // Calculate brightness
            const prevBrightness =
               (prevRgb.r * 299 + prevRgb.g * 587 + prevRgb.b * 114) / 1000
            const currentBrightness =
               (currentRgb.r * 299 + currentRgb.g * 587 + currentRgb.b * 114) /
               1000

            if (prevBrightness <= currentBrightness) {
               context.warnings.push(
                  `${groupName} color progression may be incorrect: ${prevShade} (${prevColor}) should be lighter than ${currentShade} (${currentColor})`
               )
            }
         }
      }
   }
}

/**
 * Validates theme configuration for light/dark modes
 */
function validateThemeConfig(
   config: Partial<ThemeConfig>,
   mode: 'light' | 'dark',
   context: ValidationContext
): void {
   if (!config) {
      context.errors.push(`${mode} theme configuration is required`)
      context.isValid = false
      return
   }

   const requiredSections = [
      'background',
      'foreground',
      'border',
      'surface',
      'interactive',
   ]
   const missingSection: string[] = []

   requiredSections.forEach((section) => {
      if (!config[section as keyof ThemeConfig]) {
         missingSection.push(section)
      }
   })

   if (missingSection.length > 0) {
      context.errors.push(
         `${mode} theme is missing required sections: ${missingSection.join(', ')}`
      )
      context.isValid = false
   }

   // Validate color values in each section
   Object.entries(config).forEach(([sectionName, colors]) => {
      if (!colors) return

      Object.entries(colors as Record<string, string>).forEach(
         ([key, color]) => {
            if (
               !isValidHex(color) &&
               !color.startsWith('rgba(') &&
               !color.startsWith('rgb(')
            ) {
               context.errors.push(
                  `Invalid color in ${mode} theme ${sectionName}.${key}: ${color}`
               )
               context.isValid = false
            }
         }
      )
   })

   // Check accessibility - contrast between foreground and background
   if (config.foreground?.primary && config.background?.primary) {
      const contrastRatio = getContrastRatio(
         config.foreground.primary,
         config.background.primary
      )

      if (contrastRatio < VALIDATION_RULES.colors.minContrast) {
         context.errors.push(
            `${mode} theme has insufficient contrast ratio (${contrastRatio.toFixed(2)}:1) between primary text and background. ` +
               `Minimum required: ${VALIDATION_RULES.colors.minContrast}:1 for WCAG AA compliance.`
         )
         context.isValid = false
      } else if (contrastRatio < VALIDATION_RULES.colors.preferredContrast) {
         context.warnings.push(
            `${mode} theme contrast ratio (${contrastRatio.toFixed(2)}:1) meets WCAG AA but not AAA standards. ` +
               `Consider improving contrast for better accessibility.`
         )
      }
   }

   // Check interactive color accessibility
   if (config.interactive?.primary && config.background?.primary) {
      const interactiveContrast = getContrastRatio(
         config.interactive.primary,
         config.background.primary
      )

      if (interactiveContrast < VALIDATION_RULES.colors.minContrast) {
         context.warnings.push(
            `${mode} theme interactive primary color may not have sufficient contrast with background (${interactiveContrast.toFixed(2)}:1)`
         )
      }
   }
}

/**
 * Validates theme consistency between light and dark modes
 */
function validateThemeConsistency(
   theme: Partial<Theme>,
   context: ValidationContext
): void {
   if (!theme.lightTheme || !theme.darkTheme) {
      return // Already handled in individual config validation
   }

   // Check that both themes have the same structure
   const lightSections = Object.keys(theme.lightTheme)
   const darkSections = Object.keys(theme.darkTheme)

   const missingInDark = lightSections.filter(
      (section) => !darkSections.includes(section)
   )
   const missingInLight = darkSections.filter(
      (section) => !lightSections.includes(section)
   )

   if (missingInDark.length > 0) {
      context.warnings.push(
         `Dark theme is missing sections that exist in light theme: ${missingInDark.join(', ')}`
      )
   }

   if (missingInLight.length > 0) {
      context.warnings.push(
         `Light theme is missing sections that exist in dark theme: ${missingInLight.join(', ')}`
      )
   }

   // Suggest improvements
   context.suggestions.push(
      'Ensure both light and dark themes provide a consistent user experience'
   )
   context.suggestions.push(
      'Test your theme in both modes to verify readability and accessibility'
   )
}

/**
 * Provides suggestions for theme improvement
 */
function generateSuggestions(
   theme: Partial<Theme>,
   context: ValidationContext
): void {
   // Color palette suggestions
   if (theme.colorPalette) {
      const hasAllMainShades = ['primary', 'secondary', 'neutral'].every(
         (group) => {
            const colors = theme.colorPalette?.[group as keyof ColorPalette]
            return colors && colors['500'] && colors['600'] // Main shades
         }
      )

      if (!hasAllMainShades) {
         context.suggestions.push(
            'Consider using the auto-generate feature to create complete color shade palettes'
         )
      }
   }

   // Naming suggestions
   if (theme.name && theme.name.toLowerCase().includes('new theme')) {
      context.suggestions.push(
         'Consider giving your theme a more descriptive name that reflects its purpose or style'
      )
   }

   // Version suggestions
   if (!theme.version) {
      context.suggestions.push(
         'Add a version number to help track theme updates (e.g., 1.0.0)'
      )
   }

   // General suggestions
   context.suggestions.push(
      'Use the preview tab to see how your theme looks with real components'
   )
   context.suggestions.push(
      'Test your theme with different content to ensure good readability'
   )
   context.suggestions.push(
      'Consider exporting your theme for backup or sharing with others'
   )
}

/**
 * Main theme validation function
 */
export function validateTheme(theme: Partial<Theme>): ThemeValidationResult {
   const context: ValidationContext = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
   }

   try {
      // Only validate essential fields for basic functionality
      // Validate basic metadata - be more lenient for unsaved themes
      if (!theme._id) {
         // For new themes, only require name
         if (!theme.name || theme.name.trim().length === 0) {
            context.errors.push('Theme name is required')
            context.isValid = false
         } else if (theme.name.length > VALIDATION_RULES.name.maxLength) {
            context.errors.push(
               `Theme name must be less than ${VALIDATION_RULES.name.maxLength} characters`
            )
            context.isValid = false
         } else if (!VALIDATION_RULES.name.pattern.test(theme.name)) {
            context.errors.push(
               'Theme name can only contain letters, numbers, spaces, hyphens, and underscores'
            )
            context.isValid = false
         }

         // For new themes, generate missing parts automatically
         if (!theme.colorPalette) {
            context.warnings.push(
               'Color palette will be auto-generated on save'
            )
         }
         if (!theme.lightTheme) {
            context.warnings.push(
               'Light theme configuration will be auto-generated on save'
            )
         }
         if (!theme.darkTheme) {
            context.warnings.push(
               'Dark theme configuration will be auto-generated on save'
            )
         }
      } else {
         // For existing themes, do full validation
         validateThemeMetadata(theme, context)

         // Validate color palette
         if (theme.colorPalette) {
            validateColorPalette(theme.colorPalette, context)
         } else {
            context.errors.push('Color palette is required')
            context.isValid = false
         }

         // Validate light theme configuration
         if (theme.lightTheme) {
            validateThemeConfig(theme.lightTheme, 'light', context)
         } else {
            context.errors.push('Light theme configuration is required')
            context.isValid = false
         }

         // Validate dark theme configuration
         if (theme.darkTheme) {
            validateThemeConfig(theme.darkTheme, 'dark', context)
         } else {
            context.warnings.push(
               "Dark theme configuration is missing. Users won't be able to use dark mode."
            )
         }

         // Validate consistency between themes
         validateThemeConsistency(theme, context)
      }

      // Generate improvement suggestions - but don't make them errors
      generateSuggestions(theme, context)
   } catch (error) {
      console.error('Validation error:', error)
      // Don't fail validation on unexpected errors - just warn
      context.warnings.push(
         `Validation warning: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
   }

   return {
      isValid: context.isValid,
      errors: context.errors,
      warnings: context.warnings,
      suggestions: context.suggestions,
   }
}

/**
 * Quick validation for specific aspects
 */
export function validateThemeName(name: string): {
   isValid: boolean
   error?: string
} {
   if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Theme name is required' }
   }

   if (name.length > VALIDATION_RULES.name.maxLength) {
      return {
         isValid: false,
         error: `Name must be less than ${VALIDATION_RULES.name.maxLength} characters`,
      }
   }

   if (!VALIDATION_RULES.name.pattern.test(name)) {
      return {
         isValid: false,
         error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores',
      }
   }

   return { isValid: true }
}

export function validateThemeVersion(version: string): {
   isValid: boolean
   error?: string
} {
   if (version && !VALIDATION_RULES.version.pattern.test(version)) {
      return {
         isValid: false,
         error: 'Version must follow semantic versioning format (e.g., 1.0.0)',
      }
   }

   return { isValid: true }
}

export function validateColorValue(color: string): {
   isValid: boolean
   error?: string
} {
   if (
      !isValidHex(color) &&
      !color.startsWith('rgba(') &&
      !color.startsWith('rgb(')
   ) {
      return {
         isValid: false,
         error: 'Invalid color format. Use hex (#ffffff) or rgb/rgba format.',
      }
   }

   return { isValid: true }
}
