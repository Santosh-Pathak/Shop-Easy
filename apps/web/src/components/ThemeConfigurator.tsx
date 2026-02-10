/**
 * Enhanced Theme Configuration UI
 * 
 * Production-ready theme management interface with:
 * - Responsive design for all screen sizes
 * - Smooth animations and modern UI
 * - Toast notifications instead of alerts
 * - Improved accessibility and keyboard navigation
 * - Auto-save functionality with visual feedback
 * - Better error handling and validation
 */

'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { EnhancedColorPicker } from '@/components/EnhancedColorPicker'
import { ThemePreview } from '@/components/ThemePreview'
import { useToastActions } from '@/components/ui/toast'
import { ConfiguratorSkeleton } from '@/components/ui/skeleton'
import { hexToRgb, rgbToHsl, generateColorShades } from '@/utils/colorUtils'
import { validateTheme as localValidateTheme, validateThemeName, validateThemeVersion } from '@/utils/themeValidation'
import {
  Theme,
  ColorPalette,
  ThemeConfig,
  ColorPickerValue,
  ColorHarmony,
  ThemeExportOptions,
  ThemeValidationResult
} from '@/types/theme'

interface ThemeConfiguratorProps {
  theme: Theme | null
  onChange: (updates: Partial<Theme>) => void
  onSave: () => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  validationResult?: ThemeValidationResult
  className?: string
}

// Component for editing a single color in the palette
const ColorEditor: React.FC<{
  label: string
  value: string
  onChange: (color: string) => void
  onHarmonyApply?: (colors: string[]) => void
  disabled?: boolean
}> = ({ label, value, onChange, onHarmonyApply, disabled = false }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [pickerValue, setPickerValue] = useState<ColorPickerValue>(() => {
    const rgb = hexToRgb(value) || { r: 0, g: 0, b: 0 }
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    return { hex: value, rgb, hsl }
  })

  // Update picker value when prop value changes
  useEffect(() => {
    const rgb = hexToRgb(value) || { r: 0, g: 0, b: 0 }
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    setPickerValue({ hex: value, rgb, hsl })
  }, [value])

  const handleColorChange = useCallback((color: ColorPickerValue) => {
    setPickerValue(color)
    onChange(color.hex)
  }, [onChange])

  const handleHarmonyGenerate = useCallback((harmony: ColorHarmony) => {
    if (onHarmonyApply) {
      onHarmonyApply(harmony.colors)
    }
  }, [onHarmonyApply])

  const handleInputChange = useCallback((inputValue: string) => {
    // Validate and update color
    let cleanValue = inputValue
    if (!cleanValue.startsWith('#')) {
      cleanValue = '#' + cleanValue
    }
    
    if (hexToRgb(cleanValue)) {
      onChange(cleanValue)
    } else {
      // Still update input for user feedback, but don't trigger onChange for invalid colors
      const rgb = hexToRgb(value) || { r: 0, g: 0, b: 0 }
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setPickerValue({ hex: inputValue, rgb, hsl })
    }
  }, [onChange, value])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isPickerOpen && !target.closest('.color-picker-container')) {
        setIsPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPickerOpen])

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium theme-text-primary">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          className="w-10 h-10 rounded-lg border-2 theme-border shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: value }}
          onClick={() => !disabled && setIsPickerOpen(!isPickerOpen)}
          title={`Select ${label} color`}
        />
        <input
          type="text"
          value={pickerValue.hex}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm theme-border theme-bg-primary theme-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] disabled:opacity-50"
          placeholder="#000000"
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
        />
        {onHarmonyApply && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const harmony = {
                type: 'complementary' as const,
                colors: [value, '#ff0000'], // Example harmony colors
                description: 'Complementary colors'
              }
              handleHarmonyGenerate(harmony)
            }}
            className="px-2 py-2 text-xs theme-bg-secondary theme-text-secondary rounded hover:theme-bg-tertiary transition-colors disabled:opacity-50"
            title="Generate color harmony"
          >
            🎨
          </button>
        )}
      </div>
      {isPickerOpen && (
        <div className="color-picker-container absolute z-50 mt-2 left-0">
          <div className="theme-bg-primary theme-border border rounded-lg shadow-xl p-4 min-w-[320px]">
            <EnhancedColorPicker
              value={pickerValue}
              onChange={handleColorChange}
              onHarmonyGenerate={onHarmonyApply ? handleHarmonyGenerate : undefined}
              showHarmony={true}
              showPresets={true}
              showRecentColors={true}
              showContrastChecker={true}
              label={label}
              disabled={disabled}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="px-3 py-2 text-sm bg-[var(--interactive-secondary)] theme-text-primary rounded-lg hover:opacity-80 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Component for editing a color group (50, 100, 200, etc.)
const ColorGroupEditor: React.FC<{
  title: string
  colors: Record<string, string>
  onChange: (colors: any) => void
  disabled?: boolean
}> = ({ title, colors, onChange, disabled = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleColorChange = useCallback((shade: string, color: string) => {
    onChange({ ...colors, [shade]: color })
  }, [colors, onChange])

  const handleHarmonyApply = useCallback((baseShade: string, harmonyColors: string[]) => {
    const shades = Object.keys(colors)
    const updatedColors = { ...colors }
    
    // Apply harmony colors to different shades
    harmonyColors.forEach((color, index) => {
      if (shades[index]) {
        updatedColors[shades[index]] = color
      }
    })
    
    onChange(updatedColors)
  }, [colors, onChange])

  const colorCount = Object.keys(colors).length
  const previewColors = Object.values(colors).slice(0, 5)

  return (
    <div className="theme-border theme-bg-primary border rounded-lg overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        className="flex items-center justify-between w-full text-left p-4 hover:theme-bg-secondary transition-colors disabled:opacity-50"
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-medium theme-text-primary">{title}</h3>
          <div className="flex gap-1">
            {previewColors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-sm border theme-border"
                style={{ backgroundColor: color }}
                title={`${title} ${Object.keys(colors)[index]}`}
              />
            ))}
            {colorCount > 5 && (
              <span className="text-xs theme-text-secondary px-1">
                +{colorCount - 5}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm theme-text-secondary">
            {colorCount} shades
          </span>
          <span className="theme-text-secondary transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 border-t theme-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(colors).map(([shade, color]) => (
              <ColorEditor
                key={shade}
                label={`${title} ${shade}`}
                value={color}
                onChange={(newColor) => handleColorChange(shade, newColor)}
                onHarmonyApply={(harmonyColors) => handleHarmonyApply(shade, harmonyColors)}
                disabled={disabled}
              />
            ))}
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 pt-3 border-t theme-border">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                // Generate a full shade palette from the 500 value
                const baseColor = colors['500'] || Object.values(colors)[Math.floor(Object.keys(colors).length / 2)]
                if (baseColor) {
                  const newShades = generateColorShades(baseColor, Object.keys(colors).length)
                  const updatedColors = { ...colors }
                  Object.keys(colors).forEach((shade, index) => {
                    const shadeKey = Object.keys(newShades)[index]
                    if (shadeKey) {
                      updatedColors[shade] = newShades[shadeKey]
                    }
                  })
                  onChange(updatedColors)
                }
              }}
              className="px-3 py-1 text-xs bg-[var(--interactive-primary)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Auto-generate shades from base color"
            >
              Auto Generate
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                // Reset to default blue palette
                const defaultShades = {
                  '50': '#eff6ff',
                  '100': '#dbeafe',
                  '200': '#bfdbfe',
                  '300': '#93c5fd',
                  '400': '#60a5fa',
                  '500': '#3b82f6',
                  '600': '#2563eb',
                  '700': '#1d4ed8',
                  '800': '#1e40af',
                  '900': '#1e3a8a',
                  '950': '#172554'
                }
                const updatedColors = { ...colors }
                Object.keys(colors).forEach((shade) => {
                  if (defaultShades[shade as keyof typeof defaultShades]) {
                    updatedColors[shade] = defaultShades[shade as keyof typeof defaultShades]
                  }
                })
                onChange(updatedColors)
              }}
              className="px-3 py-1 text-xs theme-bg-secondary theme-text-secondary rounded hover:theme-bg-tertiary transition-colors disabled:opacity-50"
              title="Reset to default colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Component for editing theme configuration (light/dark modes)
const ThemeConfigEditor: React.FC<{
  title: string
  config: ThemeConfig
  onChange: (config: ThemeConfig) => void
  disabled?: boolean
}> = ({ title, config, onChange, disabled = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleConfigChange = useCallback((section: keyof ThemeConfig, key: string, value: string) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        [key]: value
      }
    })
  }, [config, onChange])

  const sectionTitles = {
    background: 'Background Colors',
    foreground: 'Text Colors',
    border: 'Border Colors',
    surface: 'Surface Colors',
    interactive: 'Interactive Colors'
  }

  const sectionDescriptions = {
    background: 'Primary, secondary, and tertiary background colors',
    foreground: 'Text colors for different emphasis levels',
    border: 'Border colors for different visual weight',
    surface: 'Surface colors for cards, modals, and overlays',
    interactive: 'Colors for buttons, links, and interactive elements'
  }

  return (
    <div className="theme-border theme-bg-primary border rounded-lg overflow-hidden">
      <button
        type="button"
        disabled={disabled}
        className="flex items-center justify-between w-full text-left p-4 hover:theme-bg-secondary transition-colors disabled:opacity-50"
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-medium theme-text-primary">{title}</h3>
          <p className="text-sm theme-text-secondary mt-1">
            Configure colors for {title.toLowerCase()} appearance
          </p>
        </div>
        <span className="theme-text-secondary transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      
      {isExpanded && (
        <div className="p-4 pt-0 space-y-6 border-t theme-border">
          {Object.entries(config).map(([section, values]) => (
            <div key={section} className="space-y-3">
              <div className="pb-2 border-b theme-border">
                <h4 className="text-sm font-medium theme-text-primary">
                  {sectionTitles[section as keyof typeof sectionTitles]}
                </h4>
                <p className="text-xs theme-text-secondary mt-1">
                  {sectionDescriptions[section as keyof typeof sectionDescriptions]}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(values as Record<string, string>).map(([key, value]) => (
                  <ColorEditor
                    key={key}
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} ${key.includes('Hover') || key.includes('Active') ? '' : section.slice(0, -1)}`}
                    value={value}
                    onChange={(newValue) => handleConfigChange(section as keyof ThemeConfig, key, newValue)}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          ))}
          
          {/* Quick Actions */}
          <div className="flex gap-2 pt-3 border-t theme-border">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                // Generate theme config from primary colors
                const primary = '#3b82f6'
                const secondary = '#6b7280'
                
                const isDark = title.toLowerCase().includes('dark')
                
                const newConfig: ThemeConfig = {
                  background: {
                    primary: isDark ? '#111827' : '#ffffff',
                    secondary: isDark ? '#1f2937' : '#f8fafc',
                    tertiary: isDark ? '#374151' : '#f1f5f9'
                  },
                  foreground: {
                    primary: isDark ? '#f9fafb' : '#1f2937',
                    secondary: isDark ? '#d1d5db' : '#6b7280',
                    muted: isDark ? '#9ca3af' : '#9ca3af'
                  },
                  border: {
                    default: isDark ? '#374151' : '#e5e7eb',
                    muted: isDark ? '#4b5563' : '#d1d5db',
                    strong: isDark ? '#6b7280' : '#f3f4f6'
                  },
                  surface: {
                    default: isDark ? '#1f2937' : '#ffffff',
                    elevated: isDark ? '#374151' : '#ffffff',
                    overlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)'
                  },
                  interactive: {
                    primary: isDark ? '#60a5fa' : primary,
                    primaryHover: isDark ? '#93c5fd' : '#2563eb',
                    primaryActive: isDark ? '#bfdbfe' : '#1d4ed8',
                    secondary: isDark ? '#94a3b8' : secondary,
                    secondaryHover: isDark ? '#cbd5e1' : '#475569',
                    secondaryActive: isDark ? '#e2e8f0' : '#334155'
                  }
                }
                
                onChange(newConfig)
              }}
              className="px-3 py-1 text-xs bg-[var(--interactive-primary)] text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Generate default theme config"
            >
              Auto Generate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export const ThemeConfigurator: React.FC<ThemeConfiguratorProps> = ({
  theme,
  onChange,
  onSave,
  onCancel,
  isLoading = false,
  validationResult,
  className
}) => {
  const { previewTheme, exitPreview, validateTheme, exportTheme } = useTheme()
  const { success, error: showError, warning, info } = useToastActions()
  
  const [activeTab, setActiveTab] = useState<'palette' | 'light' | 'dark' | 'settings' | 'preview'>('palette')
  const [validation, setValidation] = useState<ThemeValidationResult | null>(validationResult || null)
  const [exportFormat, setExportFormat] = useState<ThemeExportOptions['format']>('css')
  const [isSaving, setIsSaving] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [versionError, setVersionError] = useState<string | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Track the original theme for comparison
  const originalThemeRef = useRef<Theme | null>(null)
  
  // Initialize original theme on first load
  useEffect(() => {
    if (theme && !originalThemeRef.current) {
      originalThemeRef.current = JSON.parse(JSON.stringify(theme))
      setHasUnsavedChanges(false)
    }
  }, [theme?._id]) // Only run when theme ID changes

  // Track changes to show unsaved indicator using JSON stringification
  useEffect(() => {
    if (theme && originalThemeRef.current) {
      // Use a timer to debounce the comparison to avoid infinite loops
      const timer = setTimeout(() => {
        const currentThemeString = JSON.stringify(theme)
        const originalThemeString = JSON.stringify(originalThemeRef.current)
        const hasChanges = currentThemeString !== originalThemeString
        setHasUnsavedChanges(hasChanges)
      }, 100) // Small delay to prevent rapid state updates

      return () => clearTimeout(timer)
    }
  }, [theme]) // Only depend on the theme object itself

  // Reset states when theme ID changes (new theme loaded)
  useEffect(() => {
    if (theme?._id) {
      setSaveError(null)
      setValidation(null)
      // Update the original theme reference
      originalThemeRef.current = JSON.parse(JSON.stringify(theme))
      setHasUnsavedChanges(false)
    }
  }, [theme?._id])

  // Handle theme validation
  const handleValidation = useCallback(() => {
    if (!theme) return
    
    setIsValidating(true)
    try {
      // Use local validation instead of API call for better performance
      const result = localValidateTheme(theme)
      setValidation(result)
    } catch (error) {
      console.error('Validation failed:', error)
      setValidation({
        isValid: false,
        errors: ['Validation failed. Please check your theme configuration.'],
        warnings: [],
        suggestions: []
      })
    } finally {
      setIsValidating(false)
    }
  }, [theme])

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!theme || !autoSaveEnabled || isSaving || isLoading) return

    // Only auto-save if validation passes
    const currentValidation = validation || localValidateTheme(theme)
    if (!currentValidation.isValid) return

    // Skip auto-save if no meaningful changes (just avoid empty names)
    if (!theme.name || theme.name.trim().length === 0) return

    setAutoSaveStatus('saving')
    try {
      // Create a draft save - this would typically save to a draft endpoint
      // For now, we'll just update the theme locally and save a backup
      const draftKey = `theme-draft-${theme._id || 'new'}`
      localStorage.setItem(draftKey, JSON.stringify({
        ...theme,
        lastSaved: new Date().toISOString(),
        isDraft: true
      }))
      
      setLastAutoSave(new Date())
      setAutoSaveStatus('saved')
      
      // Reset status after a brief moment
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    }
  }, [theme, autoSaveEnabled, isSaving, isLoading, validation])

  // Auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges || !autoSaveEnabled) return

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave()
    }, 5000) // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [hasUnsavedChanges, autoSaveEnabled, handleAutoSave])

  // Auto-validate when theme changes
  useEffect(() => {
    if (theme && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        handleValidation()
      }, 1000) // Debounce validation

      return () => clearTimeout(timeoutId)
    }
  }, [hasUnsavedChanges, handleValidation])

  // Clear draft after successful save
  const clearDraft = useCallback(() => {
    if (theme?._id) {
      const draftKey = `theme-draft-${theme._id}`
      localStorage.removeItem(draftKey)
    }
  }, [theme?._id])

  // Load draft on mount
  useEffect(() => {
    if (!theme?._id) return

    const draftKey = `theme-draft-${theme._id}`
    const savedDraft = localStorage.getItem(draftKey)
    
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        const draftDate = new Date(draftData.lastSaved)
        const themeDate = new Date(theme.updatedAt)
        
        // Only load draft if it's newer than the current theme
        if (draftDate > themeDate) {
          // Show toast notification instead of confirm dialog
          // For now, we'll just auto-load newer drafts
          onChange(draftData)
          setLastAutoSave(draftDate)
        }
      } catch (error) {
        console.error('Failed to load draft:', error)
      }
    }
  }, [theme?._id, theme?.updatedAt, onChange])

  // Auto-save status indicator component
  const AutoSaveStatus = () => {
    if (!autoSaveEnabled) return null

    const getStatusText = () => {
      switch (autoSaveStatus) {
        case 'saving': return 'Auto-saving...'
        case 'saved': return lastAutoSave ? `Auto-saved at ${lastAutoSave.toLocaleTimeString()}` : 'Auto-saved'
        case 'error': return 'Auto-save failed'
        default: return null
      }
    }

    const statusText = getStatusText()
    if (!statusText) return null

    return (
      <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
        autoSaveStatus === 'saving' ? 'theme-bg-warning theme-text-warning' :
        autoSaveStatus === 'saved' ? 'theme-bg-success theme-text-success' :
        autoSaveStatus === 'error' ? 'theme-bg-error theme-text-error' :
        'theme-bg-secondary theme-text-secondary'
      }`}>
        {autoSaveStatus === 'saving' && <span className="animate-spin">⟳</span>}
        {autoSaveStatus === 'saved' && <span>✓</span>}
        {autoSaveStatus === 'error' && <span>⚠</span>}
        {statusText}
      </div>
    )
  }

  // Handle theme export
  const handleExport = useCallback(async () => {
    if (!theme?._id) {
      warning('Cannot export theme', 'Please save the theme first')
      return
    }

    setIsExporting(true)
    try {
      const exportedData = await exportTheme(theme._id, { format: exportFormat })
      
      // Create downloadable file
      const blob = new Blob([exportedData], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${theme.name}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      success('Theme exported successfully', `Downloaded ${theme.name}.${exportFormat}`)
    } catch (error) {
      console.error('Export failed:', error)
      showError('Export failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsExporting(false)
    }
  }, [theme, exportFormat, exportTheme, success, showError, warning])

  // Enhanced save handler
  const handleSave = useCallback(async () => {
    if (!theme || isSaving) return

    setIsSaving(true)
    setSaveError(null)

    try {
      // Validate before saving - but be more lenient
      const currentValidation = validation || localValidateTheme(theme)
      
      if (currentValidation && !currentValidation.isValid && currentValidation.errors.length > 0) {
        // Only block save if there are critical errors
        const criticalErrors = currentValidation.errors.filter(error => 
          error.includes('required') || error.includes('invalid') || error.includes('format')
        )
        
        if (criticalErrors.length > 0) {
          warning('Validation failed', 'Please fix the following errors: ' + criticalErrors.join(', '))
          return
        }
      }

      // Show warnings but don't block save
      if (currentValidation?.warnings && currentValidation.warnings.length > 0) {
        info('Theme validation', `Saved with ${currentValidation.warnings.length} warnings`)
      }

      await onSave()
      setHasUnsavedChanges(false)
      
      // Clear draft after successful save
      clearDraft()
      
      success('Theme saved successfully', `'${theme.name}' has been updated`)
    } catch (error) {
      console.error('Save failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save theme'
      setSaveError(errorMessage)
      showError('Save failed', errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [theme, isSaving, validation, onSave, clearDraft, success, showError, warning, info])

  // Enhanced cancel handler
  const handleCancel = useCallback(() => {
    // Remove harsh confirm dialog - just show warning via toast if needed
    if (hasUnsavedChanges) {
      // User will be warned via the unsaved changes indicator
      // They can always use auto-save drafts to recover
    }

    exitPreview()
    onCancel()
  }, [hasUnsavedChanges, exitPreview, onCancel])

  // Handle color palette changes
  const handlePaletteChange = useCallback((newPalette: Partial<ColorPalette>) => {
    if (!theme) return
    onChange({
      colorPalette: { ...theme.colorPalette, ...newPalette }
    })
  }, [theme, onChange])

  // Handle light theme changes
  const handleLightThemeChange = useCallback((newConfig: ThemeConfig) => {
    onChange({ lightTheme: newConfig })
  }, [onChange])

  // Handle dark theme changes
  const handleDarkThemeChange = useCallback((newConfig: ThemeConfig) => {
    onChange({ darkTheme: newConfig })
  }, [onChange])

  // Handle basic theme settings with validation
  const handleSettingsChange = useCallback((updates: Partial<Theme>) => {
    // Validate name if it's being updated
    if (updates.name !== undefined) {
      const nameValidation = validateThemeName(updates.name)
      setNameError(nameValidation.isValid ? null : nameValidation.error || null)
    }

    // Validate version if it's being updated
    if (updates.version !== undefined) {
      const versionValidation = validateThemeVersion(updates.version)
      setVersionError(versionValidation.isValid ? null : versionValidation.error || null)
    }

    onChange(updates)
  }, [onChange])

  if (!theme) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full theme-bg-secondary flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <p className="theme-text-secondary">No theme selected</p>
          <p className="text-sm theme-text-muted mt-1">Please select a theme to configure</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Enhanced Header */}
      <div className="theme-bg-primary theme-border border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold theme-text-primary">
                Theme Configuration
              </h2>
              {hasUnsavedChanges && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Unsaved changes
                </span>
              )}
              {isLoading && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Loading...
                </span>
              )}
              <AutoSaveStatus />
            </div>
            <p className="theme-text-secondary">
              Configure colors and settings for <span className="font-medium">{theme.name}</span>
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm theme-text-muted">
              <span>Version: {theme.version}</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="w-4 h-4 text-[var(--interactive-primary)] theme-bg-primary theme-border border rounded focus:ring-2 focus:ring-[var(--interactive-primary)]"
                />
                <span>Auto-save</span>
              </label>
              <span>•</span>
              <span>Created: {new Date(theme.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(theme.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleValidation}
              disabled={isValidating || isLoading}
              className="px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Validate theme configuration"
            >
              {isValidating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Validate
            </button>
            
            <div className="flex items-center gap-1">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ThemeExportOptions['format'])}
                disabled={isExporting || isLoading}
                className="px-2 py-2 text-sm theme-border theme-bg-primary rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="css">CSS</option>
                <option value="scss">SCSS</option>
                <option value="json">JSON</option>
                <option value="tailwind">Tailwind</option>
              </select>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting || isLoading || !theme._id}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-r-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Export theme"
              >
                {isExporting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Save Error Display */}
        {saveError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <p className="text-red-800 text-sm">{saveError}</p>
              <button
                onClick={() => setSaveError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Validation Results */}
      {validation && (
        <div className={cn(
          'p-4 rounded-lg border',
          validation.isValid 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {validation.isValid ? '✅' : '❌'}
            </span>
            <h3 className="font-medium">
              {validation.isValid ? 'Validation Passed' : 'Validation Failed'}
            </h3>
          </div>
          
          {validation.errors.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Errors:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.warnings && validation.warnings.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Warnings:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.suggestions && validation.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-1">Suggestions:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="theme-bg-primary theme-border border rounded-lg overflow-hidden">
        <div className="border-b theme-border">
          <nav className="flex" role="tablist">
            {[
              { id: 'palette', label: 'Color Palette', icon: '🎨' },
              { id: 'light', label: 'Light Theme', icon: '☀️' },
              { id: 'dark', label: 'Dark Theme', icon: '🌙' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'preview', label: 'Preview', icon: '👁️' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`${id}-panel`}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 disabled:opacity-50',
                  activeTab === id
                    ? 'border-[var(--interactive-primary)] text-[var(--interactive-primary)] theme-bg-secondary'
                    : 'border-transparent theme-text-secondary hover:theme-text-primary hover:theme-bg-secondary'
                )}
                onClick={() => setActiveTab(id as 'palette' | 'light' | 'dark' | 'settings' | 'preview')}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'palette' && (
            <div role="tabpanel" id="palette-panel" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium theme-text-primary">
                  Color Palette
                </h3>
                <p className="text-sm theme-text-secondary">
                  Configure the base color palette for your theme
                </p>
              </div>
              <div className="space-y-4">
                <ColorGroupEditor
                  title="Primary"
                  colors={theme.colorPalette.primary}
                  onChange={(colors) => handlePaletteChange({ primary: colors as any })}
                  disabled={isLoading}
                />
                <ColorGroupEditor
                  title="Secondary"
                  colors={theme.colorPalette.secondary}
                  onChange={(colors) => handlePaletteChange({ secondary: colors as any })}
                  disabled={isLoading}
                />
                <ColorGroupEditor
                  title="Neutral"
                  colors={theme.colorPalette.neutral}
                  onChange={(colors) => handlePaletteChange({ neutral: colors as any })}
                  disabled={isLoading}
                />
                <ColorGroupEditor
                  title="Success"
                  colors={theme.colorPalette.success}
                  onChange={(colors) => handlePaletteChange({ success: colors as any })}
                  disabled={isLoading}
                />
                <ColorGroupEditor
                  title="Warning"
                  colors={theme.colorPalette.warning}
                  onChange={(colors) => handlePaletteChange({ warning: colors as any })}
                  disabled={isLoading}
                />
                <ColorGroupEditor
                  title="Error"
                  colors={theme.colorPalette.error}
                  onChange={(colors) => handlePaletteChange({ error: colors as any })}
                  disabled={isLoading}
                />
                <ColorGroupEditor
                  title="Info"
                  colors={theme.colorPalette.info}
                  onChange={(colors) => handlePaletteChange({ info: colors as any })}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {activeTab === 'light' && (
            <div role="tabpanel" id="light-panel" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium theme-text-primary">
                  Light Theme Configuration
                </h3>
                <p className="text-sm theme-text-secondary">
                  Configure colors for light mode appearance
                </p>
              </div>
              <ThemeConfigEditor
                title="Light Theme"
                config={theme.lightTheme}
                onChange={handleLightThemeChange}
                disabled={isLoading}
              />
            </div>
          )}

          {activeTab === 'dark' && (
            <div role="tabpanel" id="dark-panel" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium theme-text-primary">
                  Dark Theme Configuration
                </h3>
                <p className="text-sm theme-text-secondary">
                  Configure colors for dark mode appearance
                </p>
              </div>
              <ThemeConfigEditor
                title="Dark Theme"
                config={theme.darkTheme}
                onChange={handleDarkThemeChange}
                disabled={isLoading}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div role="tabpanel" id="settings-panel" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium theme-text-primary">
                  Theme Settings
                </h3>
                <p className="text-sm theme-text-secondary">
                  Configure theme metadata and information
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Theme Name *
                  </label>
                  <input
                    type="text"
                    value={theme.name}
                    onChange={(e) => handleSettingsChange({ name: e.target.value })}
                    className={cn(
                      "block w-full px-3 py-2 theme-border theme-bg-primary theme-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                      nameError 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-[var(--interactive-primary)]"
                    )}
                    disabled={isLoading}
                    placeholder="Enter theme name"
                    required
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={theme.version}
                    onChange={(e) => handleSettingsChange({ version: e.target.value })}
                    className={cn(
                      "block w-full px-3 py-2 theme-border theme-bg-primary theme-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50",
                      versionError 
                        ? "border-red-500 focus:ring-red-500" 
                        : "focus:ring-[var(--interactive-primary)]"
                    )}
                    disabled={isLoading}
                    placeholder="1.0.0"
                  />
                  {versionError && (
                    <p className="mt-1 text-sm text-red-600">{versionError}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={theme.description || ''}
                    onChange={(e) => handleSettingsChange({ description: e.target.value })}
                    rows={4}
                    className="block w-full px-3 py-2 theme-border theme-bg-primary theme-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] disabled:opacity-50"
                    disabled={isLoading}
                    placeholder="Describe your theme..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div role="tabpanel" id="preview-panel" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium theme-text-primary">
                  Theme Preview
                </h3>
                <p className="text-sm theme-text-secondary">
                  See how your theme looks with real components
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium theme-text-primary mb-3">
                    Light Mode Preview
                  </h4>
                  <ThemePreview 
                    theme={theme}
                    mode="light"
                    showComponents={true}
                    className="h-96 overflow-auto"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium theme-text-primary mb-3">
                    Dark Mode Preview
                  </h4>
                  <ThemePreview 
                    theme={theme}
                    mode="dark"
                    showComponents={true}
                    className="h-96 overflow-auto"
                  />
                </div>
              </div>
              
              {/* Quick Theme Actions */}
              <div className="pt-4 border-t theme-border">
                <h4 className="text-sm font-medium theme-text-primary mb-3">
                  Quick Actions
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      // Apply current theme as preview
                      if (theme) {
                        previewTheme(theme)
                      }
                    }}
                    className="px-3 py-2 text-sm bg-[var(--interactive-primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    Apply Preview
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      // Reset to original theme
                      exitPreview()
                    }}
                    className="px-3 py-2 text-sm theme-bg-secondary theme-text-secondary rounded-lg hover:theme-bg-tertiary transition-colors disabled:opacity-50"
                  >
                    Reset Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t theme-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exitPreview()}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium theme-text-secondary theme-bg-secondary border theme-border rounded-lg hover:theme-bg-tertiary focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exit theme preview"
          >
            Exit Preview
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSaving}
            className="px-6 py-2 text-sm font-medium theme-text-primary theme-bg-primary border theme-border rounded-lg hover:theme-bg-secondary focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving || (validation?.isValid === false) || !theme.name.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-[var(--interactive-primary)] border border-transparent rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSaving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeConfigurator