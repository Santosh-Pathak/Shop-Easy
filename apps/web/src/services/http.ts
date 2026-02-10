import axios, {
   AxiosInstance,
   AxiosRequestConfig,
   AxiosResponse,
   AxiosError,
   InternalAxiosRequestConfig,
} from 'axios'
import toast from 'react-hot-toast'
import { BASE_URL, STORAGE_KEYS, ROUTES } from '@/constants/urls'

// Backend API Response Types (updated to handle both formats)
export interface BackendApiResponse<T = any> {
   status: 'success' | 'fail' | 'error' | number
   message: string
   data?: T
   errors?: Record<string, string[]>
   meta?: {
      total?: number
      page?: number
      limit?: number
      totalPages?: number
   }
}

// Auth tokens type matching backend response format
export interface AuthTokens {
   accessToken?: string
   refreshToken?: string
   access?: {
      token: string
      expires: string
   }
   refresh?: {
      token: string
      expires: string
   }
}

export class ApiError extends Error {
   constructor(
      public message: string,
      public status: number,
      public data?: any,
      public errors?: Record<string, string[]>
   ) {
      super(message)
      this.name = 'ApiError'
   }
}

export interface RequestConfig extends AxiosRequestConfig {
   skipAuth?: boolean
   skipErrorHandler?: boolean
   showErrorToast?: boolean
   suppressErrorLogging?: boolean
}

// Extended config for request metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
   metadata?: {
      startTime: Date
   }
}

/**
 * Production-ready HTTP service with proper token management and automatic retry
 * Features:
 * - Automatic access token refresh on expiration
 * - Automatic retry of failed requests after token refresh
 * - Queue management for concurrent requests during token refresh
 * - Proper error handling and user feedback
 * Designed specifically for your backend API format
 */
class HttpService {
   private readonly instance: AxiosInstance
   private refreshTokenPromise: Promise<string> | null = null
   private isRefreshing = false
   private isLoggingOut = false
   private failedQueue: Array<{
      resolve: (token: string) => void
      reject: (error: any) => void
   }> = []

   constructor(baseURL: string = BASE_URL) {
      this.instance = axios.create({
         baseURL,
         timeout: 30000,
         headers: {
            'Content-Type': 'application/json',
         },
      })

      this.setupInterceptors()
   }

   /**
    * Process failed queue with new token
    */
   private processQueue(error: any, token: string | null = null): void {
      this.failedQueue.forEach(({ resolve, reject }) => {
         if (error) {
            reject(error)
         } else if (token) {
            resolve(token)
         } else {
            reject(new Error('No token available'))
         }
      })

      this.failedQueue = []
   }

   /**
    * Get access token from cookies
    */
   private getAccessToken(): string | null {
      if (typeof window === 'undefined') return null
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find((cookie) =>
         cookie.trim().startsWith(`${STORAGE_KEYS.ACCESS_TOKEN}=`)
      )
      return tokenCookie ? tokenCookie.split('=')[1] : null
   }

   /**
    * Get refresh token from cookies
    */
   private getRefreshToken(): string | null {
      if (typeof window === 'undefined') return null
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find((cookie) =>
         cookie.trim().startsWith(`${STORAGE_KEYS.REFRESH_TOKEN}=`)
      )
      return tokenCookie ? tokenCookie.split('=')[1] : null
   }

   /**
    * Update access token in cookie
    */
   private updateAccessToken(newToken: string): void {
      if (typeof window === 'undefined') return

      const isProduction = process.env.NODE_ENV === 'production'
      const secure = isProduction ? '; secure' : ''

      // Set new access token (no expiry - let server handle it)
      document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${newToken}; path=/; samesite=strict${secure}`

      console.log('Access token updated in cookies')
   }

   /**
    * Clear all authentication tokens
    */
   private clearTokens(): void {
      if (typeof window === 'undefined') return

      document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = `${STORAGE_KEYS.REFRESH_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = `${STORAGE_KEYS.USER}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
   }

   /**
    * Handle authentication failure and logout
    */
   private handleAuthenticationFailure(): void {
      console.log('Authentication failure detected, initiating logout...')

      // Prevent multiple concurrent logout attempts
      if (this.isLoggingOut) {
         console.log('Logout already in progress, skipping...')
         return
      }

      this.isLoggingOut = true
      this.clearTokens()

      // Use the auth store to handle logout
      if (typeof window !== 'undefined') {
         try {
            import('@/store/auth.store')
               .then(({ useAuthStore }) => {
                  const logout = useAuthStore.getState().logout
                  logout()
               })
               .catch(console.error)

            // Show a user-friendly message
            toast.error('Your session has expired. Please log in again.')

            // Small delay to allow the toast to show before redirect
            setTimeout(() => {
               window.location.href = ROUTES.LOGIN
            }, 1000)
         } catch (error) {
            console.error('Error during logout process:', error)
            // Fallback: direct redirect
            window.location.href = ROUTES.LOGIN
         } finally {
            // Reset the flag after a delay
            setTimeout(() => {
               this.isLoggingOut = false
            }, 2000)
         }
      }
   }

   /**
    * Refresh access token using your specific API
    */
   private async refreshAccessToken(): Promise<string | null> {
      if (this.refreshTokenPromise) {
         console.log('Token refresh already in progress, waiting...')
         return this.refreshTokenPromise
      }

      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
         console.log('No refresh token available')
         this.handleAuthenticationFailure()
         throw new Error('No refresh token available')
      }

      console.log('Starting token refresh process')
      this.refreshTokenPromise = this.performTokenRefresh(refreshToken)

      try {
         const newToken = await this.refreshTokenPromise
         console.log('Token refresh completed successfully')
         return newToken
      } catch (error) {
         console.log('Token refresh failed:', error)
         throw error
      } finally {
         this.refreshTokenPromise = null
      }
   }

   /**
    * Perform the actual token refresh call using the backend /refresh endpoint
    */
   private async performTokenRefresh(refreshToken: string): Promise<string> {
      try {
         console.log(
            'Making token refresh request to:',
            `${BASE_URL}/api/v1/auth/refresh`
         )

         const headers: any = {
            'Content-Type': 'application/json',
         }

         const response = await axios.post<BackendApiResponse<AuthTokens>>(
            `${BASE_URL}/api/v1/auth/refresh`,
            { refreshToken },
            { headers }
         )

         console.log('Token refresh response status:', response.status)
         console.log('Token refresh response data:', response.data)

         // Check for success status
         const isSuccessResponse =
            response.status === 200 && response.data.status === 'success'

         if (!isSuccessResponse || !response.data.data) {
            console.log('Token refresh failed - invalid response structure')
            throw new Error('Token refresh failed - invalid response')
         }

         // Backend returns tokens in nested format: { access: { token, expires }, refresh: { token, expires } }
         const tokensData = response.data.data
         const accessToken =
            'accessToken' in tokensData
               ? tokensData.accessToken
               : tokensData.access?.token

         if (!accessToken) {
            console.log('No access token found in response')
            throw new Error('No access token received from server')
         }

         console.log('New access token received, updating cookies')

         // Update the access token in cookies
         this.updateAccessToken(accessToken)

         // Update the auth store
         if (typeof window !== 'undefined') {
            import('@/store/auth.store')
               .then(({ useAuthStore }) => {
                  const refreshAccessToken =
                     useAuthStore.getState().refreshAccessToken
                  refreshAccessToken(accessToken)
               })
               .catch(console.error)
         }

         return accessToken
      } catch (error: any) {
         console.log('Token refresh error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
         })

         // Check if it's a refresh token failure
         const errorData = error.response?.data
         const isRefreshTokenInvalid =
            error.response?.status === 401 ||
            errorData?.status === 'fail' ||
            errorData?.message?.includes('Invalid or expired token') ||
            errorData?.message?.includes('refresh token') ||
            errorData?.message === 'Invalid or expired refresh token' ||
            errorData?.message === 'Invalid refresh token' ||
            errorData?.message === 'Refresh token not found'

         if (isRefreshTokenInvalid) {
            console.log('Refresh token is invalid, will trigger logout')
         }

         throw error
      }
   }

   /**
    * Get JWT cookie for requests (used in token refresh)
    */
   private getJwtCookie(): string | null {
      if (typeof window === 'undefined') return null
      const cookies = document.cookie.split(';')
      const jwtCookie = cookies.find((cookie) =>
         cookie.trim().startsWith('jwt=')
      )
      return jwtCookie ? jwtCookie.split('=')[1] : null
   }

   /**
    * Setup request and response interceptors
    */
   private setupInterceptors(): void {
      // Request interceptor
      this.instance.interceptors.request.use(
         (config: InternalAxiosRequestConfig) => {
            const skipAuth = (config as any).skipAuth

            if (!skipAuth) {
               const token = this.getAccessToken()
               if (token) {
                  config.headers.Authorization = `Bearer ${token}`
               }
            }

            // Add request timestamp for debugging
            ;(config as ExtendedAxiosRequestConfig).metadata = {
               startTime: new Date(),
            }

            return config
         },
         (error: AxiosError) => {
            return Promise.reject(this.normalizeError(error))
         }
      )

      // Response interceptor
      this.instance.interceptors.response.use(
         (response: AxiosResponse) => {
            // Log response time in development
            if (process.env.NODE_ENV === 'development') {
               const config = response.config as ExtendedAxiosRequestConfig
               const endTime = new Date()
               const duration =
                  endTime.getTime() -
                  (config.metadata?.startTime?.getTime() || 0)
               console.log(`API Request to ${config.url} took ${duration}ms`)
            }

            return response
         },
         async (error: AxiosError) => {
            const originalRequest = error.config as any

            // Handle specific account status errors first
            const errorData = error.response?.data as any
            const errorMessage = errorData?.message || ''

            // Handle deactivated account (don't trigger token refresh)
            if (errorMessage.toLowerCase().includes('deactivated')) {
               console.log('Account deactivated error detected')
               toast.error(
                  'Your account has been deactivated. Please contact support to reactivate your account.'
               )
               return Promise.reject(
                  new ApiError(
                     'Account deactivated',
                     error.response?.status || 403,
                     errorData
                  )
               )
            }

            // Handle 401 errors with proper token refresh logic and automatic retry
            if (error.response?.status === 401 && !originalRequest._retry) {
               const errorData = error.response.data as any
               console.log('Received 401 error with data:', errorData)

               // Check if this matches your specific API error format
               const isTokenExpired =
                  errorData?.status === 'fail' &&
                  errorData?.message === 'Invalid or expired token'

               console.log('Is token expired?', isTokenExpired)

               // Only try to refresh if we have a refresh token and it's a token expiry error
               const refreshToken = this.getRefreshToken()
               console.log('Have refresh token?', !!refreshToken)

               if (refreshToken && isTokenExpired) {
                  // If already refreshing, add to queue
                  if (this.isRefreshing) {
                     console.log(
                        'Token refresh in progress, adding request to queue'
                     )

                     return new Promise((resolve, reject) => {
                        this.failedQueue.push({
                           resolve: async (token: string) => {
                              try {
                                 originalRequest.headers.Authorization = `Bearer ${token}`
                                 console.log(
                                    `Retrying queued request: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`
                                 )
                                 const response =
                                    await this.instance(originalRequest)
                                 resolve(response)
                              } catch (retryError) {
                                 reject(retryError)
                              }
                           },
                           reject,
                        })
                     })
                  }

                  originalRequest._retry = true
                  this.isRefreshing = true

                  try {
                     console.log(
                        'Access token expired, attempting to refresh...'
                     )
                     const newToken = await this.refreshAccessToken()

                     if (newToken) {
                        console.log(
                           'Token refreshed successfully, processing queue and retrying original request'
                        )

                        // Process the failed queue first
                        this.processQueue(null, newToken)

                        // Update the authorization header with the new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`

                        // Retry the original request with the new token
                        console.log(
                           `Retrying original request: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`
                        )

                        try {
                           const retryResponse =
                              await this.instance(originalRequest)
                           console.log('Original request retry successful')
                           return retryResponse
                        } catch (retryError: any) {
                           console.log(
                              'Original request retry failed:',
                              retryError
                           )

                           // If the retry also fails, return the retry error
                           // This ensures the caller gets the most recent error
                           throw retryError
                        }
                     } else {
                        console.log('Token refresh did not return a new token')
                        this.processQueue(
                           new ApiError('Failed to refresh token', 401),
                           null
                        )
                        this.handleAuthenticationFailure()
                        return Promise.reject(
                           new ApiError('Failed to refresh token', 401)
                        )
                     }
                  } catch (refreshError: any) {
                     console.log('Token refresh failed:', refreshError)

                     // Process the queue with the error
                     this.processQueue(refreshError, null)

                     const refreshErrorData = refreshError.response?.data
                     const isRefreshTokenInvalid =
                        refreshError.response?.status === 401 ||
                        refreshErrorData?.status === 'fail' ||
                        refreshErrorData?.message?.includes('refresh token')

                     if (isRefreshTokenInvalid) {
                        console.log('Refresh token is invalid, logging out')
                        this.handleAuthenticationFailure()
                        return Promise.reject(
                           new ApiError('Session expired', 401, refreshError)
                        )
                     }

                     // If it's not a refresh token issue, just return the error
                     console.log(
                        'Token refresh failed but not due to invalid refresh token'
                     )
                     return Promise.reject(
                        new ApiError('Authentication failed', 401, refreshError)
                     )
                  } finally {
                     this.isRefreshing = false
                  }
               } else if (!refreshToken) {
                  // No refresh token available
                  console.log('No refresh token available, logging out')
                  this.handleAuthenticationFailure()
                  return Promise.reject(
                     new ApiError('No refresh token available', 401)
                  )
               } else {
                  // 401 but not a token expiry error, might be permissions issue
                  console.log(
                     '401 error but not a token expiry, passing through error'
                  )
                  return Promise.reject(this.normalizeError(error))
               }
            }

            // Handle other errors
            return Promise.reject(this.normalizeError(error))
         }
      )
   }

   /**
    * Normalize errors to a consistent format
    */
   private normalizeError(error: AxiosError): ApiError {
      console.log('normalizeError called with:', error)
      console.log('Error response:', error.response)
      console.log('Error response data:', error.response?.data)
      console.log('Error response status:', error.response?.status)

      const status = error.response?.status || 500
      const data = error.response?.data as any

      let message = 'An unexpected error occurred'

      // Handle your backend's error format
      if (data?.message) {
         message = data.message
         console.log('Using message from response data:', message)
      } else if (error.message) {
         message = error.message
         console.log('Using error.message:', message)
      }

      // Check if this is an authentication error
      const isAuthError =
         status === 401 ||
         message.includes('Invalid or expired token') ||
         message.includes('Unauthorized') ||
         message.includes('Authentication failed')

      const apiError = new ApiError(message, status, data?.data, data?.errors)

      // Show error toast if not explicitly disabled and not an auth error
      // (auth errors are handled by the auth system)
      const config = error.config as any
      const shouldShowToast = config?.showErrorToast !== false && !isAuthError

      // Only log to console if not explicitly disabled
      const shouldLogError = config?.suppressErrorLogging !== true
      if (shouldLogError) {
         console.log('Created ApiError:', apiError)
      }

      if (shouldShowToast && typeof window !== 'undefined') {
         // Don't show toast for token refresh failures as they're handled automatically
         if (!error.config?.url?.includes('/get-access-token')) {
            toast.error(message)
         }
      }

      return apiError
   }

   /**
    * HTTP GET request
    */
   async get<T>(url: string, config?: RequestConfig): Promise<T> {
      try {
         const response = await this.instance.get<BackendApiResponse<T>>(
            url,
            config
         )

         // Handle both string and number status formats
         const isFail =
            response.data.status === 'error' ||
            response.data.status === 'fail' ||
            (typeof response.data.status === 'number' &&
               response.data.status >= 400)

         if (isFail) {
            throw new ApiError(
               response.data.message,
               typeof response.data.status === 'number'
                  ? response.data.status
                  : response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data.data!
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * HTTP POST request
    */
   async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
      try {
         const response = await this.instance.post<BackendApiResponse<T>>(
            url,
            data,
            config
         )

         // Handle both string and number status formats
         const isFail =
            response.data.status === 'error' ||
            response.data.status === 'fail' ||
            (typeof response.data.status === 'number' &&
               response.data.status >= 400)

         if (isFail) {
            throw new ApiError(
               response.data.message,
               typeof response.data.status === 'number'
                  ? response.data.status
                  : response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data.data!
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * HTTP PUT request
    */
   async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
      try {
         const response = await this.instance.put<BackendApiResponse<T>>(
            url,
            data,
            config
         )

         // Handle both string and number status formats
         const isFail =
            response.data.status === 'error' ||
            response.data.status === 'fail' ||
            (typeof response.data.status === 'number' &&
               response.data.status >= 400)

         if (isFail) {
            throw new ApiError(
               response.data.message,
               typeof response.data.status === 'number'
                  ? response.data.status
                  : response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data.data!
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * HTTP PATCH request
    */
   async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
      try {
         const response = await this.instance.patch<BackendApiResponse<T>>(
            url,
            data,
            config
         )

         if (
            response.data.status === 'error' ||
            response.data.status === 'fail'
         ) {
            throw new ApiError(
               response.data.message,
               response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data.data!
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * HTTP DELETE request
    */
   async delete<T>(url: string, config?: RequestConfig): Promise<T> {
      try {
         const response = await this.instance.delete<BackendApiResponse<T>>(
            url,
            config
         )

         if (
            response.data.status === 'error' ||
            response.data.status === 'fail'
         ) {
            throw new ApiError(
               response.data.message,
               response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data.data!
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * Upload file with progress tracking
    */
   async upload<T>(
      url: string,
      formData: FormData,
      onProgress?: (progress: number) => void,
      config?: RequestConfig
   ): Promise<T> {
      try {
         const response = await this.instance.post<BackendApiResponse<T>>(
            url,
            formData,
            {
               ...config,
               headers: {
                  'Content-Type': 'multipart/form-data',
                  ...config?.headers,
               },
               onUploadProgress: (progressEvent) => {
                  if (onProgress && progressEvent.total) {
                     const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                     )
                     onProgress(progress)
                  }
               },
            }
         )

         if (
            response.data.status === 'error' ||
            response.data.status === 'fail'
         ) {
            throw new ApiError(
               response.data.message,
               response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data.data!
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * Download file
    */
   async download(url: string, config?: RequestConfig): Promise<Blob> {
      try {
         const response = await this.instance.get(url, {
            ...config,
            responseType: 'blob',
         })
         return response.data
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * GET request that returns full backend response (data + meta)
    * Useful for paginated endpoints
    */
   async getWithMeta<T>(
      url: string,
      config?: RequestConfig
   ): Promise<BackendApiResponse<T>> {
      try {
         const response = await this.instance.get<BackendApiResponse<T>>(
            url,
            config
         )

         const isFail =
            response.data.status === 'error' ||
            response.data.status === 'fail' ||
            (typeof response.data.status === 'number' &&
               response.data.status >= 400)

         if (isFail) {
            throw new ApiError(
               response.data.message,
               typeof response.data.status === 'number'
                  ? response.data.status
                  : response.status,
               response.data.data,
               response.data.errors
            )
         }

         return response.data
      } catch (error) {
         throw error instanceof ApiError
            ? error
            : this.normalizeError(error as AxiosError)
      }
   }

   /**
    * Get axios instance for advanced usage
    */
   getInstance(): AxiosInstance {
      return this.instance
   }
}

// Create and export singleton instance
export const httpService = new HttpService()

// Export the class for custom instances
export { HttpService }

// Legacy compatibility export
export const apiClient = httpService
