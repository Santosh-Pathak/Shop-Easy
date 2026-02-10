import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Cookies from 'js-cookie'
import { STORAGE_KEYS, ROUTES } from '@/constants/urls'
import type { User, UserRole, Tokens } from '@/types/auth'

export interface AuthTokens {
   accessToken: string
   refreshToken: string
}

export interface AuthState {
   // Core authentication state
   isAuthenticated: boolean
   isLoading: boolean
   isInitialized: boolean
   user: User | null
   tokens: AuthTokens | null

   // Error handling
   error: string | null

   // Session management
   lastActivity: Date | null

   // Upload state
   isUploading: boolean
   uploadProgress: number

   // User preferences
   preferences: {
      rememberMe: boolean
      theme: 'light' | 'dark' | 'system'
      language: string
   }
}

// Helper function to normalize tokens from backend format to store format
const normalizeTokens = (tokens: Tokens | AuthTokens): AuthTokens => {
   // Handle new flat format (direct accessToken/refreshToken)
   if ('accessToken' in tokens && 'refreshToken' in tokens) {
      return {
         accessToken: tokens.accessToken,
         refreshToken: tokens.refreshToken,
      }
   }
   // Handle old nested format (access.token/refresh.token)
   return {
      accessToken: tokens.access.token,
      refreshToken: tokens.refresh.token,
   }
}

export interface AuthActions {
   // Authentication actions
   login: (user: User, tokens: AuthTokens) => void
   logout: () => void
   setUser: (user: User | null) => void
   setTokens: (tokens: AuthTokens | null) => void
   setAuthenticated: (isAuthenticated: boolean) => void

   // Loading and error management
   setLoading: (isLoading: boolean) => void
   setError: (error: string | null) => void
   clearError: () => void

   // Upload management
   setUploading: (isUploading: boolean) => void
   setUploadProgress: (progress: number) => void
   uploadFile: (
      file: File,
      options?: {
         container?: string
         folder?: string
         updateProfile?: boolean
      }
   ) => Promise<any>
   uploadProfilePhoto: (file: File) => Promise<User>

   // Profile management
   updateProfile: (profileData: Partial<User>) => Promise<User>

   // Session management
   updateActivity: () => void
   refreshAccessToken: (newAccessToken: string) => void

   // Preferences
   updatePreferences: (preferences: Partial<AuthState['preferences']>) => void

   // Utility actions
   setInitialized: (isInitialized: boolean) => void
   reset: () => void

   // Role-based access
   hasRole: (role: UserRole) => boolean
   hasAnyRole: (roles: UserRole[]) => boolean
   canAccess: (requiredRoles: UserRole[]) => boolean
}

type AuthStore = AuthState & AuthActions

// Cookie management utilities
const setCookies = (tokens: AuthTokens | Tokens, user: User) => {
   if (typeof window === 'undefined') return

   const isProduction = process.env.NODE_ENV === 'production'

   // Handle both AuthTokens and Tokens format
   const accessToken =
      'accessToken' in tokens ? tokens.accessToken : tokens.access.token
   const refreshToken =
      'refreshToken' in tokens ? tokens.refreshToken : tokens.refresh.token

   // Set access token cookie (NO expiry - let server handle it)
   Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
   })

   // Set refresh token cookie (long expiry)
   Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken, {
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      expires: 30, // 30 days
   })

   // Set user cookie
   Cookies.set(STORAGE_KEYS.USER, JSON.stringify(user), {
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
   })
}

const clearCookies = () => {
   if (typeof window === 'undefined') return

   Cookies.remove(STORAGE_KEYS.ACCESS_TOKEN, { path: '/' })
   Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN, { path: '/' })
   Cookies.remove(STORAGE_KEYS.USER, { path: '/' })
}

const redirectToLogin = () => {
   if (typeof window !== 'undefined') {
      window.location.href = ROUTES.LOGIN
   }
}

// Initial state
const initialState: AuthState = {
   isAuthenticated: false,
   isLoading: false,
   isInitialized: false,
   user: null,
   tokens: null,
   error: null,
   lastActivity: null,
   isUploading: false,
   uploadProgress: 0,
   preferences: {
      rememberMe: false,
      theme: 'system',
      language: 'en',
   },
}

// Create the auth store with persistence
export const useAuthStore = create<AuthStore>()(
   persist(
      immer((set, get) => ({
         // Initial state
         ...initialState,

         // Actions
         login: (user: User, tokens: AuthTokens) => {
            set((state) => {
               state.isAuthenticated = true
               state.isLoading = false
               state.user = user
               state.tokens = tokens
               state.error = null
               state.lastActivity = new Date()
            })

            // Set cookies for middleware access
            setCookies(tokens, user)

            console.log('User logged in successfully:', user.email)
         },

         logout: () => {
            set((state) => {
               state.isAuthenticated = false
               state.isLoading = false
               state.user = null
               state.tokens = null
               state.error = null
               state.lastActivity = null
            })

            // Clear cookies
            clearCookies()

            console.log('User logged out')
         },

         setUser: (user: User | null) => {
            set((state) => {
               state.user = user
               if (user) {
                  state.isAuthenticated = true
                  state.lastActivity = new Date()
               }
            })
         },

         setTokens: (tokens: AuthTokens | null) => {
            set((state) => {
               state.tokens = tokens
               if (tokens && state.user) {
                  setCookies(tokens, state.user)
               }
            })
         },

         setAuthenticated: (isAuthenticated: boolean) => {
            set((state) => {
               state.isAuthenticated = isAuthenticated
               if (!isAuthenticated) {
                  state.user = null
                  state.tokens = null
                  state.lastActivity = null
                  clearCookies()
               }
            })
         },

         setLoading: (isLoading: boolean) => {
            set((state) => {
               state.isLoading = isLoading
            })
         },

         setError: (error: string | null) => {
            set((state) => {
               state.error = error
               if (error) {
                  state.isLoading = false
               }
            })
         },

         clearError: () => {
            set((state) => {
               state.error = null
            })
         },

         setUploading: (isUploading: boolean) => {
            set((state) => {
               state.isUploading = isUploading
               if (!isUploading) {
                  state.uploadProgress = 0
               }
            })
         },

         setUploadProgress: (progress: number) => {
            set((state) => {
               state.uploadProgress = progress
            })
         },

         uploadFile: async (file: File, options = {}) => {
            const state = get()

            try {
               state.setUploading(true)
               state.setError(null)
               state.setUploadProgress(0)

               // Simulate upload progress
               let progress = 0
               const progressInterval = setInterval(() => {
                  progress = Math.min(progress + 10, 90)
                  state.setUploadProgress(progress)
               }, 100)

               const { AuthService } = await import(
                  '@/services/apis/auth.service'
               )
               const result = await AuthService.uploadFile(file, options)

               clearInterval(progressInterval)
               state.setUploadProgress(100)

               // Update user if profile was updated
               if (result.user) {
                  set((state) => {
                     state.user = result.user as any
                  })
               }

               return result
            } catch (error: any) {
               state.setError(error.message || 'Upload failed')
               throw error
            } finally {
               state.setUploading(false)
               setTimeout(() => state.setUploadProgress(0), 1000)
            }
         },

         uploadProfilePhoto: async (file: File) => {
            const result = await get().uploadFile(file, {
               container: 'profile-photos',
               updateProfile: true,
            })

            if (!result.user) {
               throw new Error('Profile update failed')
            }

            return result.user
         },

         updateProfile: async (profileData: Partial<User>) => {
            const { setLoading, setError, setUser } = get()

            try {
               setLoading(true)
               setError(null)

               const { AuthService } = await import(
                  '@/services/apis/auth.service'
               )
               const updatedUser = await AuthService.updateProfile(profileData)

               // Update user in store
               setUser(updatedUser)

               return updatedUser
            } catch (error: any) {
               const errorMessage = error.message || 'Failed to update profile'
               setError(errorMessage)
               throw error
            } finally {
               setLoading(false)
            }
         },

         updateActivity: () => {
            set((state) => {
               state.lastActivity = new Date()
            })
         },

         refreshAccessToken: (newAccessToken: string) => {
            set((state) => {
               if (state.tokens) {
                  const updatedTokens = {
                     ...state.tokens,
                     accessToken: newAccessToken,
                  }
                  state.tokens = updatedTokens
                  state.lastActivity = new Date()

                  // Update cookie with new access token
                  if (typeof window !== 'undefined') {
                     const isProduction = process.env.NODE_ENV === 'production'
                     Cookies.set(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken, {
                        secure: isProduction,
                        sameSite: 'strict',
                        path: '/',
                     })
                  }
               }
            })

            console.log('Access token refreshed successfully')
         },

         updatePreferences: (
            preferences: Partial<AuthState['preferences']>
         ) => {
            set((state) => {
               state.preferences = { ...state.preferences, ...preferences }
            })
         },

         setInitialized: (isInitialized: boolean) => {
            set((state) => {
               state.isInitialized = isInitialized
            })
         },

         reset: () => {
            set(() => ({ ...initialState }))
            clearCookies()
         },

         // Role-based access methods
         hasRole: (role: UserRole) => {
            const state = get()
            return state.user?.role === role
         },

         hasAnyRole: (roles: UserRole[]) => {
            const state = get()
            return state.user?.role ? roles.includes(state.user.role) : false
         },

         canAccess: (requiredRoles: UserRole[]) => {
            const state = get()
            return state.isAuthenticated && state.user?.role
               ? requiredRoles.includes(state.user.role)
               : false
         },
      })),
      {
         name: 'auth-storage',
         // Only persist essential data (not tokens for security)
         partialize: (state) => ({
            user: state.user,
            preferences: state.preferences,
            isAuthenticated: state.isAuthenticated,
         }),
         // Handle rehydration
         onRehydrateStorage: () => (state) => {
            if (state) {
               // Check if we have valid cookies
               const accessToken = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN)
               const refreshToken = Cookies.get(STORAGE_KEYS.REFRESH_TOKEN)

               if (accessToken && refreshToken && state.user) {
                  // Restore tokens from cookies
                  state.tokens = { accessToken, refreshToken }
                  state.isAuthenticated = true
                  state.lastActivity = new Date()
               } else {
                  // Clear authentication if no valid cookies
                  state.isAuthenticated = false
                  state.user = null
                  state.tokens = null
                  clearCookies()
               }

               state.isInitialized = true
               state.isLoading = false
            }
         },
      }
   )
)

// Selectors for easier access
export const authSelectors = {
   isAuthenticated: () => useAuthStore((state) => state.isAuthenticated),
   isLoading: () => useAuthStore((state) => state.isLoading),
   isInitialized: () => useAuthStore((state) => state.isInitialized),
   user: () => useAuthStore((state) => state.user),
   tokens: () => useAuthStore((state) => state.tokens),
   error: () => useAuthStore((state) => state.error),
   preferences: () => useAuthStore((state) => state.preferences),
   userRole: () => useAuthStore((state) => state.user?.role),
   isUploading: () => useAuthStore((state) => state.isUploading),
   uploadProgress: () => useAuthStore((state) => state.uploadProgress),
   hasRole: (role: UserRole) => useAuthStore((state) => state.hasRole(role)),
   hasAnyRole: (roles: UserRole[]) =>
      useAuthStore((state) => state.hasAnyRole(roles)),
   canAccess: (roles: UserRole[]) =>
      useAuthStore((state) => state.canAccess(roles)),
}

// Actions for easier access
export const authActions = {
   login: () => useAuthStore((state) => state.login),
   logout: () => useAuthStore((state) => state.logout),
   setUser: () => useAuthStore((state) => state.setUser),
   setTokens: () => useAuthStore((state) => state.setTokens),
   setAuthenticated: () => useAuthStore((state) => state.setAuthenticated),
   setLoading: () => useAuthStore((state) => state.setLoading),
   setError: () => useAuthStore((state) => state.setError),
   clearError: () => useAuthStore((state) => state.clearError),
   setUploading: () => useAuthStore((state) => state.setUploading),
   setUploadProgress: () => useAuthStore((state) => state.setUploadProgress),
   uploadFile: () => useAuthStore((state) => state.uploadFile),
   uploadProfilePhoto: () => useAuthStore((state) => state.uploadProfilePhoto),
   updateProfile: () => useAuthStore((state) => state.updateProfile),
   updateActivity: () => useAuthStore((state) => state.updateActivity),
   refreshAccessToken: () => useAuthStore((state) => state.refreshAccessToken),
   updatePreferences: () => useAuthStore((state) => state.updatePreferences),
   setInitialized: () => useAuthStore((state) => state.setInitialized),
   reset: () => useAuthStore((state) => state.reset),
}
