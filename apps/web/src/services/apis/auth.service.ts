import { httpService } from '@/services/http'
import { API_ENDPOINTS } from '@/constants/urls'
import { useAuthStore, type AuthTokens } from '@/store/auth.store'
import toast from 'react-hot-toast'
import type {
   BackendResponse,
   LoginCredentials,
   SignupCredentials,
   RegisterCredentials,
   ResetPasswordRequest,
   ChangePasswordRequest,
   VerifyEmailRequest,
   VerifyOTPRequest,
   User,
} from '@/types/auth'

/**
 * Production-ready Authentication Service using Zustand
 * Handles all authentication API calls with proper state management
 */
export class AuthService {
   /**
    * User login with email and password
    */
   static async login(credentials: LoginCredentials): Promise<void> {
      const { setLoading, setError, login } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         const response = await httpService.post<{
            user: User
            tokens:
               | AuthTokens
               | {
                    access: { token: string; expires: string }
                    refresh: { token: string; expires: string }
                 }
         }>(API_ENDPOINTS.AUTH.LOGIN, credentials)

         // Transform backend tokens to our format (handle both flat and nested formats)
         const tokens: AuthTokens =
            'accessToken' in response.tokens
               ? {
                    accessToken: response.tokens.accessToken,
                    refreshToken: response.tokens.refreshToken,
                 }
               : {
                    accessToken: response.tokens.access.token,
                    refreshToken: response.tokens.refresh.token,
                 }

         // Normalize user data - handle both id and _id
         const user = {
            ...response.user,
            _id: response.user.id || response.user._id,
            id: response.user.id || response.user._id,
         }

         // Update store and cookies
         login(user as User, tokens)

         toast.success('Logged in successfully!')
      } catch (error: any) {
         const errorMessage = error.message || 'Login failed'
         setError(errorMessage)
         // Don't show toast here - HTTP service already handles it
         // Don't re-throw the error to avoid console noise
      } finally {
         setLoading(false)
      }
   }

   /**
    * User signup with email verification
    */
   static async signup(credentials: SignupCredentials): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.post(API_ENDPOINTS.AUTH.SIGNUP, credentials)

         toast.success(
            'Account created! Please check your email for verification.'
         )
      } catch (error: any) {
         const errorMessage = error.message || 'Signup failed'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * User logout - invalidates refresh token
    */
   static async logout(): Promise<void> {
      const { tokens, logout, setLoading } = useAuthStore.getState()

      try {
         setLoading(true)

         if (tokens?.refreshToken) {
            // Call backend logout to invalidate refresh token
            await httpService.post(API_ENDPOINTS.AUTH.LOGOUT, {
               refreshToken: tokens.refreshToken,
            })
         }
      } catch (error) {
         console.error('Logout API call failed:', error)
         // Continue with logout even if API call fails
      } finally {
         // Always clear local state
         logout()
         setLoading(false)
         toast.success('Logged out successfully')
      }
   }

   /**
    * Send email verification OTP
    */
   static async sendVerificationEmail(email: string): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION_EMAIL, {
            email,
         })

         toast.success('Verification email sent!')
      } catch (error: any) {
         const errorMessage =
            error.message || 'Failed to send verification email'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Verify email with OTP
    */
   static async verifyEmail(data: VerifyEmailRequest): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data)

         toast.success('Email verified successfully!')
      } catch (error: any) {
         const errorMessage = error.message || 'Email verification failed'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Initiate password reset process
    */
   static async forgotPassword(email: string): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.post(API_ENDPOINTS.AUTH.FORGET_PASSWORD, { email })

         toast.success('Password reset email sent!')
      } catch (error: any) {
         const errorMessage =
            error.message || 'Failed to send password reset email'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Verify OTP for password reset
    */
   static async verifyOTP(data: VerifyOTPRequest): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data)

         toast.success('OTP verified successfully!')
      } catch (error: any) {
         const errorMessage = error.message || 'OTP verification failed'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Reset password after OTP verification
    */
   static async resetPassword(data: ResetPasswordRequest): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)

         toast.success('Password reset successfully!')
      } catch (error: any) {
         const errorMessage = error.message || 'Password reset failed'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Get user profile (requires authentication)
    */
   static async getProfile(): Promise<User> {
      const { setLoading, setError, setUser } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         const user = await httpService.get<User>(API_ENDPOINTS.AUTH.PROFILE)

         // Update user in store
         setUser(user)

         return user
      } catch (error: any) {
         const errorMessage = error.message || 'Failed to get profile'
         setError(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Update user profile (requires authentication)
    */
   static async updateProfile(profileData: Partial<User>): Promise<User> {
      const { setLoading, setError, setUser } = useAuthStore.getState()

      try {
         // setLoading(true)
         setError(null)

         const updatedUser = await httpService.patch<User>(
            API_ENDPOINTS.AUTH.UPDATE_PROFILE,
            profileData
         )

         // Update user in store
         setUser(updatedUser)

         toast.success('Profile updated successfully!')
         return updatedUser
      } catch (error: any) {
         const errorMessage = error.message || 'Failed to update profile'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         // setLoading(false)
      }
   }

   /**
    * Update user password (requires authentication)
    */
   static async updatePassword(data: ChangePasswordRequest): Promise<void> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         // setLoading(true)
         setError(null)

         await httpService.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, data)

         toast.success('Password updated successfully!')
      } catch (error: any) {
         const errorMessage = error.message || 'Failed to update password'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         // setLoading(false)
      }
   }

   /**
    * Delete user account (requires authentication)
    */
   static async deleteAccount(): Promise<void> {
      const { setLoading, setError, logout } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         await httpService.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT)

         // Logout after account deletion
         logout()

         toast.success('Account deleted successfully')
      } catch (error: any) {
         const errorMessage = error.message || 'Failed to delete account'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Register new user (admin only)
    */
   static async registerUser(userData: RegisterCredentials): Promise<User> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         const user = await httpService.post<User>(
            API_ENDPOINTS.AUTH.REGISTER_USER,
            userData
         )

         toast.success('User registered successfully!')
         return user
      } catch (error: any) {
         const errorMessage = error.message || 'Failed to register user'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Get all users with pagination (admin only)
    */
   static async getUsers(params?: {
      page?: number
      limit?: number
      role?: string
      isEmailVerified?: boolean
   }): Promise<{
      users: User[]
      pagination: {
         page: number
         limit: number
         total: number
         pages: number
      }
   }> {
      const { setLoading, setError } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         const queryParams = new URLSearchParams()
         if (params?.page) queryParams.append('page', params.page.toString())
         if (params?.limit) queryParams.append('limit', params.limit.toString())
         if (params?.role) queryParams.append('role', params.role)
         if (params?.isEmailVerified !== undefined) {
            queryParams.append(
               'isEmailVerified',
               params.isEmailVerified.toString()
            )
         }

         const url = params
            ? `${API_ENDPOINTS.AUTH.GET_USERS}?${queryParams.toString()}`
            : API_ENDPOINTS.AUTH.GET_USERS

         const response = await httpService.get<{
            users: User[]
            pagination: {
               page: number
               limit: number
               total: number
               pages: number
            }
         }>(url)

         return response
      } catch (error: any) {
         const errorMessage = error.message || 'Failed to get users'
         setError(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Upload file (generic)
    */
   static async uploadFile(
      file: File,
      options: {
         container?: string
         folder?: string
         updateProfile?: boolean
      } = {}
   ): Promise<{
      url: string
      fileName: string
      originalName: string
      size: number
      mimeType: string
      container: string
      uploadedAt: string
      user?: User
   }> {
      const { setLoading, setError, setUser } = useAuthStore.getState()

      try {
         setLoading(true)
         setError(null)

         const formData = new FormData()
         formData.append('file', file)

         if (options.container) {
            formData.append('container', options.container)
         }

         if (options.folder) {
            formData.append('folder', options.folder)
         }

         if (options.updateProfile) {
            formData.append('updateProfile', 'true')
         }

         const response = await httpService.post<{
            url: string
            fileName: string
            originalName: string
            size: number
            mimeType: string
            container: string
            uploadedAt: string
            user?: User
         }>(API_ENDPOINTS.AUTH.UPLOAD_FILE, formData, {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         })

         // If updateProfile is true, update user profile with the photo URL
         if (options.updateProfile && response.url) {
            try {
               const updatedUser = await AuthService.updateProfile({
                  photo: response.url,
               })
               response.user = updatedUser
               setUser(updatedUser)
            } catch (updateError) {
               console.error(
                  'Failed to update profile with photo:',
                  updateError
               )
            }
         }

         // Update user in store if profile was updated
         if (response.user) {
            setUser(response.user)
         }

         toast.success('File uploaded successfully!')
         return response
      } catch (error: any) {
         const errorMessage = error.message || 'File upload failed'
         setError(errorMessage)
         toast.error(errorMessage)
         throw error
      } finally {
         setLoading(false)
      }
   }

   /**
    * Upload profile photo
    */
   static async uploadProfilePhoto(file: File): Promise<User> {
      const response = await AuthService.uploadFile(file, {
         container: 'profile-photos',
         updateProfile: true,
      })

      if (!response.user) {
         throw new Error('Profile update failed')
      }

      return response.user
   }

   /**
    * Upload document
    */
   static async uploadDocument(
      file: File,
      folder?: string
   ): Promise<{
      url: string
      fileName: string
      originalName: string
      size: number
      mimeType: string
      container: string
      uploadedAt: string
   }> {
      return AuthService.uploadFile(file, {
         container: 'documents',
         folder,
         updateProfile: false,
      })
   }

   /**
    * Initialize authentication state on app start
    */
   static async initialize(): Promise<void> {
      const { setLoading, setInitialized } = useAuthStore.getState()

      try {
         setLoading(true)

         // The store's rehydration will handle token validation
         // from cookies and localStorage persistence
      } catch (error) {
         console.error('Auth initialization failed:', error)
      } finally {
         setLoading(false)
         setInitialized(true)
      }
   }
}

export default AuthService
