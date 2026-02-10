import { toast } from 'react-hot-toast'
import type { AuthError, BackendResponse } from '@/types/auth'

/**
 * Enhanced Authentication Error Handler
 * Handles all auth-related errors based on backend API documentation
 */

export function handleAuthError(error: any): AuthError {
   console.error('Auth Error:', error)

   // Handle network errors
   if (!error.response) {
      return {
         message: 'Network error. Please check your connection and try again.',
         code: 'NETWORK_ERROR',
         type: 'network',
         timestamp: new Date(),
      }
   }

   // Handle backend response errors
   const response = error.response?.data as BackendResponse

   if (response) {
      // Handle specific backend error structure - support both "error" and "fail" status
      if (response.status === 'error' || response.status === 'fail') {
         const errorCode = response.error?.code || 'UNKNOWN_ERROR'
         const errorDetails = response.error?.details || []

         // Map specific error codes to user-friendly messages
         const errorMessage = getErrorMessage(
            response.message,
            errorCode,
            error.response.status
         )

         return {
            message: errorMessage,
            code: errorCode,
            type: getErrorType(error.response.status),
            details: {
               originalMessage: response.message,
               details: errorDetails,
               statusCode: error.response.status,
            },
            timestamp: new Date(),
         }
      }
   }

   // Handle HTTP status code errors
   const status = error.response?.status
   const statusMessage = getStatusMessage(status)

   return {
      message: statusMessage,
      code: `HTTP_${status}`,
      type: getErrorType(status),
      details: {
         statusCode: status,
         originalError: error.message,
      },
      timestamp: new Date(),
   }
}

/**
 * Show authentication error with toast notification
 */
export function showAuthError(error: AuthError): void {
   toast.error(error.message, {
      duration: 5000,
      position: 'top-right',
   })
}

/**
 * Show success notification for auth actions
 */
export function showSuccessToast(message: string): void {
   toast.success(message, {
      duration: 4000,
      position: 'top-right',
   })
}

/**
 * Show error notification
 */
export function showErrorToast(message: string): void {
   toast.error(message, {
      duration: 5000,
      position: 'top-right',
   })
}

/**
 * Show info notification
 */
export function showInfoToast(message: string): void {
   toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
         background: '#3b82f6',
         color: 'white',
      },
   })
}

/**
 * Get user-friendly error message based on error code and status
 */
function getErrorMessage(
   originalMessage: string,
   errorCode: string,
   statusCode: number
): string {
   // Map specific error codes to user-friendly messages
   const errorCodeMessages: Record<string, string> = {
      VALIDATION_ERROR: 'Please check your input and try again.',
      EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
      EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
      INVALID_CREDENTIALS: 'Invalid email or password.',
      USER_NOT_FOUND: 'User not found.',
      INVALID_TOKEN: 'Invalid or expired token.',
      TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
      REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
      INSUFFICIENT_PERMISSIONS:
         'You do not have permission to perform this action.',
      ACCOUNT_DISABLED: 'Your account has been disabled.',
      ACCOUNT_DEACTIVATED:
         'Your account has been deactivated. Please contact support.',
      TOO_MANY_ATTEMPTS: 'Too many attempts. Please try again later.',
      OTP_EXPIRED: 'OTP has expired. Please request a new one.',
      INVALID_OTP: 'Invalid OTP. Please check and try again.',
      PASSWORD_TOO_WEAK:
         'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.',
   }

   // Handle specific message patterns
   if (originalMessage?.toLowerCase().includes('deactivated')) {
      return 'Your account has been deactivated. Please contact support to reactivate your account.'
   }

   if (originalMessage?.toLowerCase().includes('disabled')) {
      return 'Your account has been disabled. Please contact support.'
   }

   // Return mapped message or original message
   return (
      errorCodeMessages[errorCode] ||
      originalMessage ||
      getStatusMessage(statusCode)
   )
}

/**
 * Get user-friendly message based on HTTP status code
 */
function getStatusMessage(status: number): string {
   const statusMessages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You do not have permission.',
      404: 'The requested resource was not found.',
      409: 'A conflict occurred. Please try again.',
      422: 'Invalid data provided. Please check your input.',
      429: 'Too many requests. Please wait and try again.',
      500: 'Server error. Please try again later.',
      502: 'Service temporarily unavailable.',
      503: 'Service temporarily unavailable.',
      504: 'Request timeout. Please try again.',
   }

   return (
      statusMessages[status] ||
      'An unexpected error occurred. Please try again.'
   )
}

/**
 * Determine error type based on status code
 */
function getErrorType(status: number): AuthError['type'] {
   if (status >= 400 && status < 500) {
      if (status === 401) return 'authentication'
      if (status === 403) return 'authorization'
      if (status === 422) return 'validation'
      return 'validation'
   }

   if (status >= 500) return 'server'

   return 'network'
}

/**
 * Extract user-friendly error message from API error
 */
export function extractApiErrorMessage(error: any): string {
   // Handle network errors
   if (!error.response) {
      return 'Network error. Please check your connection and try again.'
   }

   const response = error.response?.data

   // Handle backend error response
   if (response?.status === 'error' || response?.status === 'fail') {
      const message = response.message || 'An error occurred'

      // Handle specific error messages
      if (message?.toLowerCase().includes('deactivated')) {
         return 'Your account has been deactivated. Please contact support to reactivate your account.'
      }

      if (message?.toLowerCase().includes('disabled')) {
         return 'Your account has been disabled. Please contact support.'
      }

      // Handle specific error types
      const duplicateKeyMessage = handleDuplicateKeyError(message)
      if (duplicateKeyMessage) return duplicateKeyMessage

      const validationMessage = handleValidationError(
         error.response?.status,
         message
      )
      if (validationMessage) return validationMessage

      const codeBasedMessage = handleErrorCode(response.error?.code)
      if (codeBasedMessage) return codeBasedMessage

      return message
   }

   // Fallback to status-based messages
   return getStatusMessage(error.response?.status || 500)
}

/**
 * Handle MongoDB duplicate key errors
 */
function handleDuplicateKeyError(message: string): string | null {
   if (!message.includes('E11000 duplicate key error')) return null

   if (message.includes('phone_1')) {
      return 'A lead with this phone number already exists. Please use a different phone number.'
   }
   if (message.includes('email_1')) {
      return 'A lead with this email address already exists. Please use a different email address.'
   }
   return 'This information already exists. Please check your input and try again.'
}

/**
 * Handle validation errors
 */
function handleValidationError(status: number, message: string): string | null {
   if (status === 422 || status === 400) {
      return message
   }
   return null
}

/**
 * Handle specific error codes
 */
function handleErrorCode(errorCode: any): string | null {
   if (errorCode === 11000) {
      return 'This information already exists in the system. Please use different details.'
   }
   return null
}

/**
 * Handle and display API errors with automatic retry for certain errors
 */
export async function handleApiError<T>(
   apiCall: () => Promise<T>,
   options: {
      showToast?: boolean
      retryCount?: number
      retryDelay?: number
   } = {}
): Promise<T> {
   const { showToast = true, retryCount = 0, retryDelay = 1000 } = options

   try {
      return await apiCall()
   } catch (error) {
      const authError = handleAuthError(error)

      // Show toast notification if enabled
      if (showToast) {
         showAuthError(authError)
      }

      // Retry for network errors
      if (authError.type === 'network' && retryCount > 0) {
         await new Promise((resolve) => setTimeout(resolve, retryDelay))
         return handleApiError(apiCall, {
            ...options,
            retryCount: retryCount - 1,
            showToast: false, // Don't show toast for retries
         })
      }

      throw authError
   }
}

/**
 * Parse validation errors from backend response
 */
export function parseValidationErrors(
   error: AuthError
): Record<string, string> {
   const validationErrors: Record<string, string> = {}

   if (error.details?.details && Array.isArray(error.details.details)) {
      error.details.details.forEach((detail: string) => {
         // Try to extract field name from error message
         const regex = /^(\w+)\s+(.+)/
         const fieldMatch = regex.exec(detail)
         if (fieldMatch) {
            validationErrors[fieldMatch[1]] = fieldMatch[2]
         } else {
            validationErrors.general = detail
         }
      })
   }

   return validationErrors
}

/**
 * Create a standardized error response
 */
export function createAuthError(
   message: string,
   code?: string,
   type: AuthError['type'] = 'validation'
): AuthError {
   return {
      message,
      code,
      type,
      timestamp: new Date(),
   }
}

/**
 * Legacy function for backward compatibility
 */
export function parseApiError(error: any): Record<string, string> {
   const authError = handleAuthError(error)
   return parseValidationErrors(authError)
}
