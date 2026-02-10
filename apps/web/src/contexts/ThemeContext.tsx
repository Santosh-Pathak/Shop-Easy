'use client'

import {
   createContext,
   useContext,
   useEffect,
   useState,
   useCallback,
   useMemo,
   useReducer,
} from 'react'
import {
   ThemeMode,
   ThemeConfig,
   colorPalette,
   lightTheme,
   darkTheme,
   getThemeConfig,
   generateCSSVariables,
} from '@/config/theme.config'
import {
   Theme,
   EnhancedThemeContextType,
   ThemeContextState,
   ThemeAction,
   ColorPickerValue,
   ColorHarmony,
   ThemeExportOptions,
   ThemeValidationResult,
   ThemeError,
} from '@/types/theme'
import { themeApi } from '@/services/themeApi'

// Theme reducer for complex state management
function themeReducer(state: ThemeContextState, action: ThemeAction): ThemeContextState {
   switch (action.type) {
      case 'SET_LOADING':
         return { ...state, isLoading: action.payload, error: null }
      
      case 'SET_ERROR':
         return { ...state, error: action.payload, isLoading: false }
      
      case 'LOAD_THEMES':
         return { 
            ...state, 
            themes: action.payload, 
            isLoading: false, 
            error: null,
            lastSync: new Date()
         }
      
      case 'SET_ACTIVE_THEME':
         return { 
            ...state, 
            activeTheme: action.payload,
            currentTheme: action.payload,
            isLoading: false 
         }
      
      case 'SET_MODE':
         return {
            ...state,
            mode: action.payload
         }
      
      case 'CREATE_THEME':
         return { 
            ...state, 
            themes: [...state.themes, action.payload],
            isDirty: false
         }
      
      case 'UPDATE_THEME':
         return {
            ...state,
            themes: state.themes.map(theme => 
               theme._id === action.payload._id ? action.payload : theme
            ),
            currentTheme: state.currentTheme?._id === action.payload._id 
               ? action.payload 
               : state.currentTheme,
            isDirty: false
         }
      
      case 'DELETE_THEME':
         return {
            ...state,
            themes: state.themes.filter(theme => theme._id !== action.payload),
         }
      
      case 'PREVIEW_THEME':
         return {
            ...state,
            previewTheme: action.payload,
            isPreviewMode: true
         }
      
      case 'RESET_THEME':
         return {
            ...state,
            previewTheme: null,
            isPreviewMode: false,
            isDirty: false,
            selectedColor: null,
            colorHarmony: null
         }
      
      default:
         return state
   }
}

// Initial state
const initialState: ThemeContextState = {
   currentTheme: null,
   mode: 'system',
   resolvedMode: 'light',
   themes: [],
   activeTheme: null,
   defaultTheme: null,
   isLoading: false,
   error: null,
   previewTheme: null,
   isPreviewMode: false,
   isAdminMode: false,
   isDirty: false,
   selectedColor: null,
   colorHarmony: null,
   lastSync: null,
   isOnline: true,
}

interface ThemeProviderProps {
   readonly children: React.ReactNode
   readonly enableDynamicThemes?: boolean
   readonly enableAdmin?: boolean
}

const ThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined)

export function ThemeProvider({ children, enableDynamicThemes = true, enableAdmin = false }: ThemeProviderProps) {
   const [state, dispatch] = useReducer(themeReducer, initialState)
   const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light')
   const [customColors, setCustomColors] = useState<Partial<typeof colorPalette>>({})

   // Derived state
   const resolvedMode = state.mode === 'system' ? systemTheme : state.mode
   const isDark = resolvedMode === 'dark'
   const currentThemeConfig = getThemeConfig(resolvedMode)
   const mergedColors = useMemo(
      () => ({ ...colorPalette, ...customColors }),
      [customColors]
   )

   // Detect system theme preference
   useEffect(() => {
      if (typeof window === 'undefined') return

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

      const handleChange = (e: MediaQueryListEvent) => {
         setSystemTheme(e.matches ? 'dark' : 'light')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
   }, [])

   // Load themes from API
   const loadThemes = useCallback(async () => {
      if (!enableDynamicThemes) return

      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         const response = await themeApi.getThemes()
         console.log('loadThemes response:', response)
         console.log('response.data:', response.data)
         dispatch({ type: 'LOAD_THEMES', payload: response.data })
      } catch (error) {
         console.error('loadThemes error:', error)
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load themes' })
      }
   }, [enableDynamicThemes])

   // Load active theme
   const loadActiveTheme = useCallback(async () => {
      if (!enableDynamicThemes) return

      try {
         const response = await themeApi.getActiveTheme()
         if (response.data) {
            dispatch({ type: 'SET_ACTIVE_THEME', payload: response.data })
         }
      } catch (error) {
         console.warn('No active theme found, using default')
      }
   }, [enableDynamicThemes])

   // Set active theme
   const setActiveTheme = useCallback(async (themeId: string) => {
      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         const response = await themeApi.activateTheme(themeId)
         dispatch({ type: 'SET_ACTIVE_THEME', payload: response.data })
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to activate theme' })
      }
   }, [])

   // Theme CRUD operations
   const createTheme = useCallback(async (theme: Partial<Theme>): Promise<Theme> => {
      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         const response = await themeApi.createTheme(theme)
         dispatch({ type: 'CREATE_THEME', payload: response.data })
         return response.data
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create theme' })
         throw error
      }
   }, [])

   const updateTheme = useCallback(async (themeId: string, updates: Partial<Theme>): Promise<Theme> => {
      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         const response = await themeApi.updateTheme(themeId, updates)
         dispatch({ type: 'UPDATE_THEME', payload: response.data })
         return response.data
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update theme' })
         throw error
      }
   }, [])

   const deleteTheme = useCallback(async (themeId: string): Promise<void> => {
      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         await themeApi.deleteTheme(themeId)
         dispatch({ type: 'DELETE_THEME', payload: themeId })
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete theme' })
         throw error
      }
   }, [])

   const cloneTheme = useCallback(async (themeId: string, name?: string): Promise<Theme> => {
      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         const response = await themeApi.cloneTheme(themeId)
         if (name && response.data) {
            response.data.name = name
         }
         dispatch({ type: 'CREATE_THEME', payload: response.data })
         return response.data
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clone theme' })
         throw error
      }
   }, [])

   // Theme import/export
   const exportTheme = useCallback(async (themeId: string, options: ThemeExportOptions): Promise<string> => {
      try {
         return await themeApi.exportTheme(themeId, options)
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to export theme' })
         throw error
      }
   }, [])

   const importTheme = useCallback(async (themeData: any): Promise<Theme> => {
      try {
         dispatch({ type: 'SET_LOADING', payload: true })
         const response = await themeApi.importTheme(themeData)
         dispatch({ type: 'CREATE_THEME', payload: response.data })
         return response.data
      } catch (error) {
         dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to import theme' })
         throw error
      }
   }, [])

   // Theme preview
   const previewTheme = useCallback((theme: Partial<Theme>) => {
      dispatch({ type: 'PREVIEW_THEME', payload: theme })
   }, [])

   const exitPreview = useCallback(() => {
      dispatch({ type: 'RESET_THEME' })
   }, [])

   const applyPreview = useCallback(async () => {
      if (state.previewTheme) {
         try {
            if (state.previewTheme._id) {
               await setActiveTheme(state.previewTheme._id)
            }
            dispatch({ type: 'RESET_THEME' })
         } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to apply preview' })
         }
      }
   }, [state.previewTheme, setActiveTheme])

   // Theme mode management
   const setMode = useCallback((mode: ThemeMode) => {
      dispatch({ type: 'SET_MODE', payload: mode })
      if (typeof window !== 'undefined') {
         localStorage.setItem('theme-mode', mode)
      }
   }, [])

   const toggleMode = useCallback(() => {
      const newMode = state.mode === 'light' ? 'dark' : 'light'
      setMode(newMode)
   }, [state.mode, setMode])

   const resetToSystem = useCallback(() => {
      setMode('system')
   }, [setMode])

   // Color management
   const updateColor = useCallback((colorPath: string, color: ColorPickerValue) => {
      // Implementation for updating specific colors in the theme
      console.log('Update color:', colorPath, color)
   }, [])

   const generateHarmony = useCallback((baseColor: string, type: ColorHarmony['type']): ColorHarmony => {
      // Implementation for generating color harmony
      return {
         type,
         colors: [baseColor],
         description: `${type} harmony based on ${baseColor}`
      }
   }, [])

   const applyColorPalette = useCallback((palette: Partial<typeof colorPalette>) => {
      setCustomColors(palette)
   }, [])

   // Validation
   const validateTheme = useCallback(async (theme: Partial<Theme>): Promise<ThemeValidationResult> => {
      try {
         const response = await themeApi.validateTheme(theme)
         return response.data
      } catch (error) {
         throw error
      }
   }, [])

   // Utility functions
   const resetTheme = useCallback(() => {
      dispatch({ type: 'RESET_THEME' })
      setCustomColors({})
   }, [])

   const clearError = useCallback(() => {
      dispatch({ type: 'SET_ERROR', payload: null })
   }, [])

   const enterAdminMode = useCallback(() => {
      if (enableAdmin) {
         dispatch({ type: 'SET_ACTIVE_THEME', payload: { ...state, isAdminMode: true } as any })
      }
   }, [enableAdmin, state])

   const exitAdminMode = useCallback(() => {
      dispatch({ type: 'SET_ACTIVE_THEME', payload: { ...state, isAdminMode: false, isDirty: false } as any })
   }, [state])

   const saveChanges = useCallback(async () => {
      // Implementation for saving theme changes
      console.log('Save changes')
   }, [])

   const discardChanges = useCallback(() => {
      dispatch({ type: 'RESET_THEME' })
   }, [])

   const syncWithServer = useCallback(async () => {
      await loadThemes()
      await loadActiveTheme()
   }, [loadThemes, loadActiveTheme])

   const clearCache = useCallback(() => {
      themeApi.clearCache()
   }, [])

   // Utility getters
   const getCurrentColors = useCallback(() => {
      return state.currentTheme?.colorPalette || colorPalette
   }, [state.currentTheme])

   const getCurrentThemeConfig = useCallback(() => {
      const mode = resolvedMode
      return state.currentTheme 
         ? (mode === 'dark' ? state.currentTheme.darkTheme : state.currentTheme.lightTheme)
         : currentThemeConfig
   }, [state.currentTheme, resolvedMode, currentThemeConfig])

   const getThemeById = useCallback((id: string) => {
      return state.themes.find(theme => theme._id === id) || null
   }, [state.themes])

   const isCurrentTheme = useCallback((themeId: string) => {
      return state.currentTheme?._id === themeId
   }, [state.currentTheme])

   // Load themes on mount
   useEffect(() => {
      if (enableDynamicThemes) {
         loadThemes()
         loadActiveTheme()
      }
   }, [enableDynamicThemes, loadThemes, loadActiveTheme])

   // Load theme mode from localStorage
   useEffect(() => {
      if (typeof window === 'undefined') return

      try {
         const savedMode = localStorage.getItem('theme-mode') as ThemeMode
         if (savedMode && ['dark', 'light', 'system'].includes(savedMode)) {
            dispatch({ type: 'SET_MODE', payload: savedMode })
         }
      } catch (error) {
         console.warn('Failed to load theme mode from localStorage:', error)
      }
   }, []) // Remove state dependency to prevent infinite loop

   // Apply theme styles
   useEffect(() => {
      if (typeof window === 'undefined') return

      const root = window.document.documentElement
      const body = window.document.body

      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      body.classList.remove('light', 'dark')

      // Add current theme class
      root.classList.add(resolvedMode)
      body.classList.add(resolvedMode)

      // Apply theme styles
      let styleElement = document.getElementById('dynamic-theme-vars')
      if (!styleElement) {
         styleElement = document.createElement('style')
         styleElement.id = 'dynamic-theme-vars'
         document.head.appendChild(styleElement)
      }

      // Use current theme or fallback to default
      const themeConfig = getCurrentThemeConfig()
      const colors = getCurrentColors()
      
      const lightVars = generateCSSVariables(
         state.currentTheme?.lightTheme || lightTheme, 
         'light'
      )
      const darkVars = generateCSSVariables(
         state.currentTheme?.darkTheme || darkTheme, 
         'dark'
      )

      styleElement.textContent = `${lightVars}\n${darkVars}`
   }, [resolvedMode, state.currentTheme, getCurrentColors, getCurrentThemeConfig])

   const contextValue = useMemo<EnhancedThemeContextType>(
      () => ({
         // State
         ...state,
         mode: state.mode,
         resolvedMode,
         previewThemeData: state.previewTheme,

         // Theme loading and management
         loadThemes,
         loadActiveTheme,
         setActiveTheme,
         switchTheme: setActiveTheme,
         setDefaultTheme: setActiveTheme,
         duplicateTheme: cloneTheme,

         // Theme mode management
         setMode,
         toggleMode,
         resetToSystem,

         // Theme CRUD operations
         createTheme,
         updateTheme,
         deleteTheme,
         cloneTheme,

         // Theme import/export
         exportTheme,
         importTheme,

         // Theme preview
         previewTheme,
         exitPreview,
         applyPreview,

         // Color picker integration
         updateColor,
         generateHarmony,
         applyColorPalette,

         // Validation and utilities
         validateTheme,
         resetTheme,
         clearError,

         // Admin management
         enterAdminMode,
         exitAdminMode,
         saveChanges,
         discardChanges,

         // Sync and cache
         syncWithServer,
         clearCache,

         // Utility getters
         getCurrentColors,
         getCurrentThemeConfig,
         getThemeById,
         isCurrentTheme,
      }),
      [
         state,
         resolvedMode,
         loadThemes,
         loadActiveTheme,
         setActiveTheme,
         setMode,
         toggleMode,
         resetToSystem,
         createTheme,
         updateTheme,
         deleteTheme,
         cloneTheme,
         exportTheme,
         importTheme,
         previewTheme,
         exitPreview,
         applyPreview,
         updateColor,
         generateHarmony,
         applyColorPalette,
         validateTheme,
         resetTheme,
         clearError,
         enterAdminMode,
         exitAdminMode,
         saveChanges,
         discardChanges,
         syncWithServer,
         clearCache,
         getCurrentColors,
         getCurrentThemeConfig,
         getThemeById,
         isCurrentTheme,
      ]
   )

   return (
      <ThemeContext.Provider value={contextValue}>
         {children}
      </ThemeContext.Provider>
   )
}

export function useTheme() {
   const context = useContext(ThemeContext)
   if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider')
   }
   return context
}

// Convenience hooks for specific theme aspects
export function useColors() {
   const { getCurrentColors } = useTheme()
   return getCurrentColors()
}

export function useCurrentTheme() {
   const { getCurrentThemeConfig } = useTheme()
   return getCurrentThemeConfig()
}

export function useIsDark() {
   const { resolvedMode } = useTheme()
   return resolvedMode === 'dark'
}
