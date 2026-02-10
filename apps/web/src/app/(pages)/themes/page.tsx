/**
 * Enhanced Theme Management Page
 * 
 * Improvements:
 * - Responsive design for all screen sizes
 * - Better error handling with toast notifications
 * - Improved accessibility and keyboard navigation
 * - Smooth animations and transitions
 * - Mobile-first approach
 * - Production-ready code quality
 */

'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import { AuthGuard } from '@/components/guards/AuthGuard'
import ThemeConfigurator from '@/components/ThemeConfigurator'
import ThemeModeToggle from '@/components/ThemeModeToggle'
import { ToastProvider, useToastActions } from '@/components/ui/toast'
import { ThemeErrorBoundary } from '@/components/ui/error-boundary'
import { UserRole } from '@/types/auth'
import {
  Theme,
  ThemeValidationResult,
  ThemeExportOptions,
  CreateThemeDto,
  UpdateThemeDto
} from '@/types/theme'

interface ThemeCardProps {
  theme: Theme
  isActive: boolean
  isDefault: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  onDuplicate: () => void
  onPreview: () => void
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  isActive,
  isDefault,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  onDuplicate,
  onPreview
}) => {
  const { success, error, warning } = useToastActions()
  
  const handleDelete = useCallback(async () => {
    try {
      await onDelete()
      success('Theme deleted successfully')
    } catch (err) {
      error('Failed to delete theme', err instanceof Error ? err.message : 'Unknown error')
    }
  }, [onDelete, success, error])

  const handleSetDefault = useCallback(async () => {
    try {
      await onSetDefault()
      success(`'${theme.name}' set as default theme`)
    } catch (err) {
      error('Failed to set default theme', err instanceof Error ? err.message : 'Unknown error')
    }
  }, [onSetDefault, theme.name, success, error])

  const handleDuplicate = useCallback(async () => {
    try {
      await onDuplicate()
      success(`Theme '${theme.name}' duplicated successfully`)
    } catch (err) {
      error('Failed to duplicate theme', err instanceof Error ? err.message : 'Unknown error')
    }
  }, [onDuplicate, theme.name, success, error])

  return (
    <div
      className={cn(
        'group relative p-4 sm:p-6 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2',
        isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
          : 'theme-border hover:border-[var(--border-strong)] theme-bg-primary hover:shadow-md'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Select theme ${theme.name}`}
    >
      {/* Theme Preview Colors */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colorPalette.primary['500'] }}
            title="Primary color"
          />
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colorPalette.secondary['500'] }}
            title="Secondary color"
          />
          <div 
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: theme.colorPalette.neutral['500'] }}
            title="Neutral color"
          />
        </div>
        <div className="flex items-center space-x-2">
          {/* Dark Mode Support Indicator */}
          {theme.lightTheme && theme.darkTheme && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full flex items-center space-x-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
              <span className="hidden sm:inline">Dual Mode</span>
            </span>
          )}
          {isDefault && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              Default
            </span>
          )}
        </div>
      </div>

      {/* Theme Info */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {theme.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Version {theme.version}
        </p>
        {theme.description && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {theme.description}
          </p>
        )}
        <div className="text-xs text-gray-400 dark:text-gray-600 mt-2">
          Created: {new Date(theme.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t theme-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
            tabIndex={-1}
          >
            Preview
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDuplicate()
            }}
            className="text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            Duplicate
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {!isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSetDefault()
              }}
              className="text-xs font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
              tabIndex={-1}
            >
              Set Default
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDefault}
            tabIndex={-1}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-3 right-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-500 dark:text-gray-400">{message}</p>
  </div>
)

const EmptyState: React.FC<{ 
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto mb-6 rounded-full theme-bg-secondary flex items-center justify-center">
      <span className="text-4xl">🎨</span>
    </div>
    <h3 className="text-lg font-semibold theme-text-primary mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
)

const ThemeManagementPage: React.FC = () => {
  return (
    <ThemeErrorBoundary>
      <ToastProvider>
        <AuthGuard requiredRoles={['superAdmin' as UserRole]}>
          <ThemeManagementPageContent />
        </AuthGuard>
      </ToastProvider>
    </ThemeErrorBoundary>
  )
}

const ThemeManagementPageContent: React.FC = () => {
  const router = useRouter()
  const {
    themes,
    currentTheme,
    defaultTheme,
    isLoading,
    error,
    loadThemes,
    createTheme,
    updateTheme,
    deleteTheme,
    setActiveTheme,
    cloneTheme,
    previewTheme,
    exitPreview,
    validateTheme,
    exportTheme,
    importTheme
  } = useTheme()

  const { success, error: showError, warning, info } = useToastActions()

  // Local state
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'updated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isCreating, setIsCreating] = useState(false)
  const [validationResult, setValidationResult] = useState<ThemeValidationResult | undefined>(undefined)

  // Load themes on mount
  useEffect(() => {
    loadThemes().catch((err) => {
      showError('Failed to load themes', err instanceof Error ? err.message : 'Unknown error')
    })
  }, [loadThemes, showError])

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError('Theme operation failed', error)
    }
  }, [error, showError])

  // Filter and sort themes
  const filteredAndSortedThemes = React.useMemo(() => {
    // Safety check: ensure themes is an array
    const themesArray = Array.isArray(themes) ? themes : []
    
    let filtered = themesArray.filter(theme =>
      theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (theme.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [themes, searchTerm, sortBy, sortOrder])

  // Generate unique theme name
  const generateUniqueThemeName = useCallback(() => {
    const baseName = 'New Theme'
    const existingNames = themes.map(theme => theme.name)
    
    if (!existingNames.includes(baseName)) {
      return baseName
    }
    
    let counter = 1
    while (existingNames.includes(`${baseName} ${counter}`)) {
      counter++
    }
    
    return `${baseName} ${counter}`
  }, [themes])

  // Handle theme creation
  const handleCreateTheme = useCallback(async () => {
    try {
      setIsCreating(true)
      
      const newThemeData: Partial<Theme> = {
        name: generateUniqueThemeName(),
        version: '1.0.0',
        description: 'A new custom theme',
        colorPalette: {
          primary: {
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
          },
          secondary: {
            '50': '#f8fafc',
            '100': '#f1f5f9',
            '200': '#e2e8f0',
            '300': '#cbd5e1',
            '400': '#94a3b8',
            '500': '#64748b',
            '600': '#475569',
            '700': '#334155',
            '800': '#1e293b',
            '900': '#0f172a',
            '950': '#020617'
          },
          neutral: {
            '50': '#f9fafb',
            '100': '#f3f4f6',
            '200': '#e5e7eb',
            '300': '#d1d5db',
            '400': '#9ca3af',
            '500': '#6b7280',
            '600': '#4b5563',
            '700': '#374151',
            '800': '#1f2937',
            '900': '#111827',
            '950': '#030712'
          },
          success: {
            '50': '#f0fdf4',
            '500': '#22c55e',
            '600': '#16a34a',
            '700': '#15803d'
          },
          warning: {
            '50': '#fffbeb',
            '500': '#f59e0b',
            '600': '#d97706',
            '700': '#b45309'
          },
          error: {
            '50': '#fef2f2',
            '500': '#ef4444',
            '600': '#dc2626',
            '700': '#b91c1c'
          },
          info: {
            '50': '#f0f9ff',
            '500': '#0ea5e9',
            '600': '#0284c7',
            '700': '#0369a1'
          }
        },
        lightTheme: {
          background: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            tertiary: '#f1f5f9'
          },
          foreground: {
            primary: '#1f2937',
            secondary: '#6b7280',
            muted: '#9ca3af'
          },
          border: {
            default: '#e5e7eb',
            muted: '#d1d5db',
            strong: '#f3f4f6'
          },
          surface: {
            default: '#ffffff',
            elevated: '#ffffff',
            overlay: 'rgba(0, 0, 0, 0.5)'
          },
          interactive: {
            primary: '#3b82f6',
            primaryHover: '#2563eb',
            primaryActive: '#1d4ed8',
            secondary: '#64748b',
            secondaryHover: '#475569',
            secondaryActive: '#334155'
          }
        },
        darkTheme: {
          background: {
            primary: '#111827',
            secondary: '#1f2937',
            tertiary: '#374151'
          },
          foreground: {
            primary: '#f9fafb',
            secondary: '#d1d5db',
            muted: '#9ca3af'
          },
          border: {
            default: '#374151',
            muted: '#4b5563',
            strong: '#6b7280'
          },
          surface: {
            default: '#1f2937',
            elevated: '#374151',
            overlay: 'rgba(0, 0, 0, 0.8)'
          },
          interactive: {
            primary: '#60a5fa',
            primaryHover: '#93c5fd',
            primaryActive: '#bfdbfe',
            secondary: '#94a3b8',
            secondaryHover: '#cbd5e1',
            secondaryActive: '#e2e8f0'
          }
        }
      }

      const newTheme = await createTheme(newThemeData)
      setSelectedTheme(newTheme)
      setIsConfiguratorOpen(true)
      success('New theme created successfully', 'You can now customize colors and settings')
    } catch (error) {
      console.error('Failed to create theme:', error)
      showError('Failed to create theme', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsCreating(false)
    }
  }, [createTheme, generateUniqueThemeName, success, showError])

  // Handle theme updates
  const handleThemeUpdate = useCallback(async (themeId: string, updates: Partial<Theme>) => {
    try {
      const updatedTheme = await updateTheme(themeId, updates)
      setSelectedTheme(updatedTheme)
      return updatedTheme
    } catch (error) {
      console.error('Failed to update theme:', error)
      throw error
    }
  }, [updateTheme])

  // Handle theme validation
  const handleThemeValidation = useCallback(async (theme: Theme) => {
    try {
      const result = await validateTheme(theme)
      setValidationResult(result)
      return result
    } catch (error) {
      console.error('Validation failed:', error)
      return null
    }
  }, [validateTheme])

  // Handle theme save
  const handleThemeSave = useCallback(async () => {
    if (!selectedTheme) return

    try {
      // First validate the theme
      const validationResult = await handleThemeValidation(selectedTheme)
      if (validationResult && !validationResult.isValid) {
        warning('Theme validation failed', 'Please fix the issues before saving')
        return
      }

      // Update the theme in the backend
      const updatedTheme = await handleThemeUpdate(selectedTheme._id, selectedTheme)
      
      // Close the configurator and refresh the themes list
      setIsConfiguratorOpen(false)
      setSelectedTheme(null)
      
      // Reload themes to get the latest data
      await loadThemes()
      
      success('Theme saved successfully', `'${updatedTheme.name}' has been updated`)
    } catch (error) {
      console.error('Failed to save theme:', error)
      showError('Failed to save theme', error instanceof Error ? error.message : 'Unknown error')
    }
  }, [selectedTheme, handleThemeValidation, handleThemeUpdate, loadThemes, success, showError, warning])

  // Handle theme cancel
  const handleThemeCancel = useCallback(() => {
    setIsConfiguratorOpen(false)
    setSelectedTheme(null)
    setValidationResult(undefined)
    info('Theme editing cancelled', 'Your changes were not saved')
  }, [info])

  // Handle file import
  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const themeData = JSON.parse(text)
      const importedTheme = await importTheme(themeData)
      setSelectedTheme(importedTheme)
      setIsConfiguratorOpen(true)
      success('Theme imported successfully', `'${importedTheme.name}' is ready for editing`)
    } catch (error) {
      console.error('Failed to import theme:', error)
      showError('Failed to import theme', 'Please check the file format and try again')
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = ''
    }
  }, [importTheme, success, showError])

  // Handle theme configuration changes
  const handleThemeChange = useCallback((updates: Partial<Theme>) => {
    if (selectedTheme) {
      setSelectedTheme({ ...selectedTheme, ...updates })
    }
  }, [selectedTheme])

  if (isConfiguratorOpen && selectedTheme) {
    return (
      <div className="min-h-screen theme-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <ThemeConfigurator
            theme={selectedTheme}
            onChange={handleThemeChange}
            onSave={handleThemeSave}
            onCancel={handleThemeCancel}
            isLoading={isLoading}
            validationResult={validationResult}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Theme Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and customize application themes
              </p>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              {/* Theme Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
                <ThemeModeToggle 
                  variant="segmented" 
                  size="sm" 
                  showLabel={false}
                />
              </div>
              <div className="flex space-x-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="import-theme"
                />
                <label
                  htmlFor="import-theme"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  Import Theme
                </label>
                <button
                  onClick={handleCreateTheme}
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {isCreating && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isCreating ? 'Creating...' : 'Create Theme'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="name">Sort by Name</option>
                <option value="created">Sort by Created</option>
                <option value="updated">Sort by Updated</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && themes.length === 0 ? (
          <LoadingSpinner message="Loading themes..." />
        ) : (
          <>
            {/* Theme Grid */}
            {filteredAndSortedThemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSortedThemes.map((theme) => (
                  <Suspense key={theme._id} fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-xl"></div>}>
                    <ThemeCard
                      theme={theme}
                      isActive={currentTheme?._id === theme._id}
                      isDefault={defaultTheme?._id === theme._id}
                      onSelect={() => setActiveTheme(theme._id)}
                      onEdit={() => {
                        setSelectedTheme(theme)
                        setIsConfiguratorOpen(true)
                      }}
                      onDelete={() => deleteTheme(theme._id)}
                      onSetDefault={() => setActiveTheme(theme._id)}
                      onDuplicate={() => cloneTheme(theme._id)}
                      onPreview={() => previewTheme(theme)}
                    />
                  </Suspense>
                ))}
              </div>
            ) : (
              <EmptyState
                title={searchTerm ? 'No themes found' : 'No themes available'}
                description={
                  searchTerm 
                    ? 'Try adjusting your search terms or create a new theme.' 
                    : 'Get started by creating your first custom theme.'
                }
                actionLabel={!searchTerm ? 'Create Your First Theme' : undefined}
                onAction={!searchTerm ? handleCreateTheme : undefined}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ThemeManagementPage