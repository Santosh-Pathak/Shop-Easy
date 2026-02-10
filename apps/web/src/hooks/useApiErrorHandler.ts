import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/urls'

/**
 * Custom hook for handling API errors
 *
 * This hook provides centralized error handling for API calls,
 * including authentication errors, network errors, and user-friendly messages.
 */
export function useApiErrorHandler() {
   const router = useRouter()
   const { isAuthenticated, logout } = useAuth()

   const handleError = useCallback(
      (error: any) => {
         console.error('API Error:', error)

         if (!error) {
            toast.error('An unexpected error occurred')
            return
         }

         const status = error.status || error.response?.status
         const message =
            error.message ||
            error.response?.data?.message ||
            'An unexpected error occurred'

         // Handle authentication errors
         if (status === 401 || message.includes('Invalid or expired token')) {
            if (isAuthenticated) {
               toast.error('Your session has expired. Please log in again.')
               logout()
               setTimeout(() => {
                  router.push(ROUTES.LOGIN)
               }, 1000)
            }
            return
         }

         // Handle forbidden errors
         if (status === 403) {
            toast.error("You don't have permission to perform this action")
            return
         }

         // Handle not found errors
         if (status === 404) {
            toast.error('The requested resource was not found')
            return
         }

         // Handle server errors
         if (status >= 500) {
            toast.error('A server error occurred. Please try again later.')
            return
         }

         // Handle network errors
         if (
            message.includes('Network Error') ||
            message.includes('ERR_NETWORK')
         ) {
            toast.error(
               'Network connection error. Please check your internet connection.'
            )
            return
         }

         // Handle timeout errors
         if (message.includes('timeout')) {
            toast.error('Request timed out. Please try again.')
            return
         }

         // Default error handling
         const userFriendlyMessage = getUserFriendlyMessage(message)
         toast.error(userFriendlyMessage)
      },
      [isAuthenticated, logout, router]
   )

   return { handleError }
}

/**
 * Convert technical error messages to user-friendly ones
 */
function getUserFriendlyMessage(message: string): string {
   const errorMap: Record<string, string> = {
      'Invalid or expired token':
         'Your session has expired. Please log in again.',
      Unauthorized: 'You are not authorized to perform this action.',
      Forbidden: "You don't have permission to access this resource.",
      'Bad Request':
         'There was an error with your request. Please check your input.',
      'Internal Server Error':
         'A server error occurred. Please try again later.',
      'Service Unavailable':
         'The service is temporarily unavailable. Please try again later.',
      'Too Many Requests':
         'Too many requests. Please wait a moment and try again.',
      'Validation failed': 'Please check your input and try again.',
   }

   // Check for exact matches first
   if (errorMap[message]) {
      return errorMap[message]
   }

   // Check for partial matches
   for (const [key, value] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
         return value
      }
   }

   // Return the original message if no mapping found
   return message.length > 100
      ? 'An error occurred. Please try again.'
      : message
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsyncOperation() {
   const { handleError } = useApiErrorHandler()

   const executeAsync = useCallback(
      async <T>(
         operation: () => Promise<T>,
         options?: {
            loadingMessage?: string
            successMessage?: string
            onSuccess?: (result: T) => void
            onError?: (error: any) => void
         }
      ): Promise<T | null> => {
         const { loadingMessage, successMessage, onSuccess, onError } =
            options || {}

         let loadingToast: string | undefined

         try {
            if (loadingMessage) {
               loadingToast = toast.loading(loadingMessage)
            }

            const result = await operation()

            if (loadingToast) {
               toast.dismiss(loadingToast)
            }

            if (successMessage) {
               toast.success(successMessage)
            }

            if (onSuccess) {
               onSuccess(result)
            }

            return result
         } catch (error) {
            if (loadingToast) {
               toast.dismiss(loadingToast)
            }

            if (onError) {
               onError(error)
            } else {
               handleError(error)
            }

            return null
         }
      },
      [handleError]
   )

   return { executeAsync }
}

/**
 * Hook for retrying failed operations
 */
export function useRetry() {
   const { handleError } = useApiErrorHandler()

   const retry = useCallback(
      async <T>(
         operation: () => Promise<T>,
         maxAttempts = 3,
         delay = 1000
      ): Promise<T | null> => {
         let lastError: any

         for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
               return await operation()
            } catch (error) {
               lastError = error

               if (attempt === maxAttempts) {
                  handleError(error)
                  return null
               }

               // Don't retry authentication errors
               const status =
                  (error as any)?.status || (error as any)?.response?.status
               if (status === 401 || status === 403) {
                  handleError(error)
                  return null
               }

               // Wait before retrying
               await new Promise((resolve) =>
                  setTimeout(resolve, delay * attempt)
               )
            }
         }

         return null
      },
      [handleError]
   )

   return { retry }
}

export default useApiErrorHandler
