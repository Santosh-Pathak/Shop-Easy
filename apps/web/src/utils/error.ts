/**
 * Error handling utilities for API errors
 */

import { ApiError } from '@/services/http'
import { AxiosError } from 'axios'

// Re-export ApiError for convenience
export { ApiError }

export interface ApiErrorInterface {
   message: string
   status: number
   data?: any
   errors?: Record<string, string[]>
}

/**
 * Handle authentication errors consistently
 * @param error - The error object to handle
 * @returns The processed error with proper structure
 */
export function handleAuthError(error: any): ApiError {
   // If it's already an ApiError, return it as is
   if (error instanceof ApiError) {
      return error
   }

   // If it's an axios error with response (this is the most common case for backend errors)
   if (error?.response) {
      const status = error.response.status
      const responseData = error.response.data

      // Backend sends: { status: 'error'|'success', message: string, data?: any }
      const message =
         responseData?.message || error.message || 'An error occurred'

      return new ApiError(
         message,
         status || 500,
         responseData?.data,
         responseData?.errors
      )
   }

   // If it's a basic error with message
   if (error?.message) {
      return new ApiError(
         error.message,
         error.status || error.statusCode || 500,
         error.data,
         error.errors
      )
   }

   // If error is empty object, try to extract from other properties
   if (error && typeof error === 'object' && Object.keys(error).length === 0) {
      console.warn(
         'Received empty error object, this indicates an issue in the error handling chain'
      )
      return new ApiError(
         'An error occurred but details were lost in transmission',
         500
      )
   }

   // Fallback for unknown error types
   console.warn('Unhandled error type:', error, typeof error)
   return new ApiError('An unexpected error occurred', 500)
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: any): boolean {
   const status = error?.status || error?.response?.status
   const message = error?.message || ''

   return (
      status === 401 ||
      message.includes('Invalid or expired token') ||
      message.includes('Unauthorized') ||
      message.includes('Authentication failed')
   )
}

/**
 * Extract user-friendly error message from error object
 */
export function getErrorMessage(error: any): string {
   if (error instanceof ApiError) {
      return error.message
   }

   // Check axios error response first (backend format)
   if (error?.response?.data?.message) {
      return error.response.data.message
   }

   // Check direct message property
   if (error?.message) {
      return error.message
   }

   return 'An unexpected error occurred'
}

/**
 * Check if error is a dependency/reference error
 */
export function isDependencyError(error: any): boolean {
   const message = getErrorMessage(error)
   return (
      message.includes('referenced by') ||
      message.includes('being used by') ||
      message.includes('Cannot delete')
   )
}

/**
 * Get detailed error information for logging
 */
export function getErrorDetails(error: any): {
   message: string
   status: number
   stack?: string
   response?: any
   type?: string
} {
   try {
      if (error instanceof ApiError) {
         return {
            message: error.message,
            status: error.status,
            stack: error.stack,
            response: error.data,
            type: 'ApiError',
         }
      }

      // Handle axios errors
      if (error?.response) {
         return {
            message: getErrorMessage(error),
            status: error.response.status || 500,
            stack: error?.stack,
            response: error.response.data,
            type: 'AxiosError',
         }
      }

      // Handle generic errors
      return {
         message: getErrorMessage(error),
         status: error?.status || error?.statusCode || 500,
         stack: error?.stack,
         response: error?.response?.data,
         type: 'GenericError',
      }
   } catch (detailsError) {
      console.warn('Error extracting error details:', detailsError)
      return {
         message: 'Error processing failed',
         status: 500,
         type: 'ProcessingError',
      }
   }
}

/**
 * Extract API error message (alias for getErrorMessage for backward compatibility)
 */
export function extractApiErrorMessage(error: any): string {
   return getErrorMessage(error)
}

/**
 * Show error toast with proper formatting
 */
export function showErrorToast(
   error: Error | ApiError | AxiosError | unknown,
   customMessage?: string
): void {
   const message = customMessage || getErrorMessage(error)

   // Use the toast function from sonner if available
   if (typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('sonner')
         .then(({ toast }) => {
            if (isDependencyError(error)) {
               toast.error(message, { duration: 5000 })
            } else {
               toast.error(message, { duration: 4000 })
            }
         })
         .catch(() => {
            // Fallback to console if toast is not available
            console.error('Error:', message)
         })
   }
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string): void {
   if (typeof window !== 'undefined') {
      import('sonner')
         .then(({ toast }) => {
            toast.success(message)
         })
         .catch(() => {
            console.log('Success:', message)
         })
   }
}
