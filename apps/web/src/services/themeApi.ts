/**
 * Theme API Service
 *
 * Handles all communication with the backend theme management system.
 * Uses the httpService for consistent auth handling.
 */

import {
   Theme,
   ThemeApiResponse,
   ThemeListResponse,
   ThemeExportOptions,
   ThemeValidationResult,
   ThemePreview,
   ThemeApiError,
} from '@/types/theme'
import { httpService } from '@/services/http'
import { API_ENDPOINTS } from '@/constants/urls'

// Theme API service
export class ThemeApiService {
   constructor() {
      // Use the existing authenticated API client
   }

   // Theme management
   async getThemes(params?: {
      page?: number
      limit?: number
      search?: string
      sort?: string
      filter?: string
   }): Promise<{ data: Theme[] }> {
      const themes = await httpService.get<Theme[]>(
         API_ENDPOINTS.THEME.GET_ALL,
         {
            params,
         }
      )
      return { data: themes }
   }

   async getActiveTheme(): Promise<{ data: Theme }> {
      const theme = await httpService.get<Theme>(API_ENDPOINTS.THEME.GET_ACTIVE)
      return { data: theme }
   }

   async getTheme(id: string): Promise<{ data: Theme }> {
      const theme = await httpService.get<Theme>(
         API_ENDPOINTS.THEME.GET_BY_ID.replace(':id', id)
      )
      return { data: theme }
   }

   async createTheme(theme: Partial<Theme>): Promise<{ data: Theme }> {
      const newTheme = await httpService.post<Theme>(
         API_ENDPOINTS.THEME.CREATE,
         theme
      )
      return { data: newTheme }
   }

   async updateTheme(
      id: string,
      updates: Partial<Theme>
   ): Promise<{ data: Theme }> {
      const updatedTheme = await httpService.put<Theme>(
         API_ENDPOINTS.THEME.UPDATE.replace(':id', id),
         updates
      )
      return { data: updatedTheme }
   }

   async deleteTheme(id: string): Promise<{ data: null }> {
      await httpService.delete(API_ENDPOINTS.THEME.DELETE.replace(':id', id))
      return { data: null }
   }

   // Theme activation
   async activateTheme(id: string): Promise<{ data: Theme }> {
      const theme = await httpService.patch<Theme>(
         API_ENDPOINTS.THEME.ACTIVATE.replace(':id', id)
      )
      return { data: theme }
   }

   async setDefaultTheme(id: string): Promise<{ data: Theme }> {
      const theme = await httpService.patch<Theme>(
         API_ENDPOINTS.THEME.SET_DEFAULT.replace(':id', id)
      )
      return { data: theme }
   }

   // Theme operations
   async cloneTheme(id: string): Promise<{ data: Theme }> {
      const theme = await httpService.post<Theme>(
         API_ENDPOINTS.THEME.DUPLICATE.replace(':id', id)
      )
      return { data: theme }
   }

   async exportTheme(id: string, options: ThemeExportOptions): Promise<string> {
      const params = { format: options.format }
      const response = await httpService.get(
         API_ENDPOINTS.THEME.EXPORT.replace(':id', id),
         { params }
      )

      // Handle different response types based on format
      if (options.format === 'json') {
         return JSON.stringify(response, null, 2)
      }

      return response as string
   }

   async importTheme(themeData: any): Promise<{ data: Theme }> {
      const theme = await httpService.post<Theme>(
         API_ENDPOINTS.THEME.IMPORT,
         themeData
      )
      return { data: theme }
   }

   // Theme validation and preview
   async validateTheme(
      theme: Partial<Theme>
   ): Promise<{ data: ThemeValidationResult }> {
      const result = await httpService.post<ThemeValidationResult>(
         API_ENDPOINTS.THEME.VALIDATE,
         theme
      )
      return { data: result }
   }

   async previewTheme(theme: Partial<Theme>): Promise<{ data: ThemePreview }> {
      const preview = await httpService.post<ThemePreview>(
         '/api/v1/themes/preview',
         theme
      )
      return { data: preview }
   }

   // Cache management - keeping existing methods for compatibility
   clearCache(): void {
      // The underlying axios client handles caching differently
      console.log('Cache cleared')
   }

   clearThemeCache(id?: string): void {
      // The underlying axios client handles caching differently
      console.log('Theme cache cleared for:', id)
   }

   // Health check
   async healthCheck(): Promise<{ status: string; timestamp: string }> {
      return httpService.get('/api/health')
   }
}

// Singleton instance
export const themeApi = new ThemeApiService()

// React Query integration helpers
export const themeQueryKeys = {
   all: ['themes'] as const,
   lists: () => [...themeQueryKeys.all, 'list'] as const,
   list: (params?: any) => [...themeQueryKeys.lists(), params] as const,
   details: () => [...themeQueryKeys.all, 'detail'] as const,
   detail: (id: string) => [...themeQueryKeys.details(), id] as const,
   active: () => [...themeQueryKeys.all, 'active'] as const,
}

// Error handling utilities
export function isThemeApiError(error: any): error is ThemeApiError {
   return error instanceof ThemeApiError
}

export function getErrorMessage(error: any): string {
   if (isThemeApiError(error)) {
      return error.message
   }

   if (error instanceof Error) {
      return error.message
   }

   return 'An unknown error occurred'
}

export default themeApi
