import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { BASE_URL, STORAGE_KEYS, ROUTES } from '@/constants/urls'

export interface ApiResponse<T = any> {
   data: T
   message: string
   status: 'success' | 'error' | 'fail'
   success?: boolean
   errors?: Record<string, string[]>
   timestamp?: string
}

export class ApiError extends Error {
   constructor(
      message: string,
      public status: number,
      public data?: any
   ) {
      super(message)
      this.name = 'ApiError'
   }
}

class ApiClient {
   private readonly instance: AxiosInstance
   private refreshTokenPromise: Promise<string> | null = null

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

   private setupInterceptors(): void {
      this.instance.interceptors.request.use(
         (config) => {
            const token = this.getAccessToken()
            if (token) {
               config.headers.Authorization = `Bearer ${token}`
            }
            return config
         },
         (error) =>
            Promise.reject(new ApiError(error.message || 'Request failed', 500))
      )

      this.instance.interceptors.response.use(
         (response: AxiosResponse) => response,
         async (error) => {
            const originalRequest = error.config

            if (error.response?.status === 401 && !originalRequest._retry) {
               originalRequest._retry = true

               try {
                  const newToken = await this.refreshAccessToken()
                  if (newToken) {
                     originalRequest.headers.Authorization = `Bearer ${newToken}`
                     return this.instance(originalRequest)
                  }
               } catch (refreshError) {
                  this.clearTokens()
                  if (typeof window !== 'undefined') {
                     window.location.href = ROUTES.LOGIN
                  }
                  return Promise.reject(
                     new ApiError('Authentication failed', 401, refreshError)
                  )
               }
            }

            const apiError = new ApiError(
               error.response?.data?.message || 'An unexpected error occurred',
               error.response?.status || 500,
               error.response?.data
            )

            return Promise.reject(apiError)
         }
      )
   }

   async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response = await this.instance.get<ApiResponse<T>>(url, config)
      return response.data.data
   }

   async post<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
   ): Promise<T> {
      const response = await this.instance.post<ApiResponse<T>>(
         url,
         data,
         config
      )
      return response.data.data
   }

   async put<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
   ): Promise<T> {
      const response = await this.instance.put<ApiResponse<T>>(
         url,
         data,
         config
      )
      return response.data.data
   }

   async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      const response = await this.instance.delete<ApiResponse<T>>(url, config)
      return response.data.data
   }

   async patch<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
   ): Promise<T> {
      const response = await this.instance.patch<ApiResponse<T>>(
         url,
         data,
         config
      )
      return response.data.data
   }

   private getAccessToken(): string | null {
      if (typeof window === 'undefined') return null
      return Cookies.get(STORAGE_KEYS.ACCESS_TOKEN) || null
   }

   private getRefreshToken(): string | null {
      if (typeof window === 'undefined') return null
      return Cookies.get(STORAGE_KEYS.REFRESH_TOKEN) || null
   }

   private async refreshAccessToken(): Promise<string | null> {
      if (this.refreshTokenPromise) {
         return this.refreshTokenPromise
      }

      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
         throw new Error('No refresh token available')
      }

      this.refreshTokenPromise = this.performTokenRefresh(refreshToken)

      try {
         const newToken = await this.refreshTokenPromise
         return newToken
      } finally {
         this.refreshTokenPromise = null
      }
   }

   private async performTokenRefresh(refreshToken: string): Promise<string> {
      try {
         const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
         })

         const { tokens, user } = response.data.data

         // Handle both flat and nested token formats
         let accessToken: string
         let newRefreshToken: string

         if ('accessToken' in tokens && 'refreshToken' in tokens) {
            // New flat format
            accessToken = tokens.accessToken
            newRefreshToken = tokens.refreshToken
         } else {
            // Old nested format
            accessToken = tokens.access.token
            newRefreshToken = tokens.refresh.token
         }

         // Update tokens in cookies
         this.setTokens(accessToken, newRefreshToken, tokens)

         // Update user in cookies
         if (typeof window !== 'undefined') {
            Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), {
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'strict',
            })
         }

         return accessToken
      } catch (error) {
         this.clearTokens()
         throw error
      }
   }

   private clearTokens(): void {
      if (typeof window === 'undefined') return

      Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN)
      Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN)
      Cookies.remove(STORAGE_KEYS.USER)
   }

   setTokens(accessToken: string, refreshToken: string, tokens?: any): void {
      if (typeof window === 'undefined') return

      const accessExpires = tokens?.access?.expires
         ? new Date(tokens.access.expires)
         : new Date(Date.now() + 15 * 60 * 1000) // 15 minutes default
      Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         expires: accessExpires,
      })

      const refreshExpires = tokens?.refresh?.expires
         ? new Date(tokens.refresh.expires)
         : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days default
      Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict',
         expires: refreshExpires,
      })
   }

   getInstance(): AxiosInstance {
      return this.instance
   }
}

export const apiClient = new ApiClient()

export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
   getAll: (filters?: Record<string, any>) => Promise<T[]>
   getById: (id: string) => Promise<T>
   create: (data: CreateT) => Promise<T>
   update: (id: string, data: UpdateT) => Promise<T>
   delete: (id: string) => Promise<void>
}

export interface PaginatedResponse<T> {
   data: T[]
   pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
   }
}
