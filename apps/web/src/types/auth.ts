// ==================== CORE AUTH TYPES ====================
export interface Token {
   token: string
   expires: string // ISO date string from backend
}

export interface Tokens {
   access: Token
   refresh: Token
}

// Simple token format from new API
export interface SimpleTokens {
   accessToken: string
   refreshToken: string
}

// Backend User interface based on API documentation
export interface User {
   _id?: string // Old format
   id: string // New format - primary identifier
   name: string
   email: string
   mobile?: string
   phone?: string // Backend field name
   photo?: string // Profile photo URL
   postalCode?: string
   role: UserRole
   dateOfBirth?: string // ISO date string
   gender?: 'MALE' | 'FEMALE' | 'OTHER'
   address?: string
   isEmailVerified?: boolean
   isActive?: boolean
   lastLogin?: string // ISO date string
   createdAt?: string // ISO date string
   updatedAt?: string // ISO date string

   // Additional frontend properties for compatibility
   avatar?: string
   permissions?: Permission[]
   preferences?: UserPreferences
   profile?: UserProfile
}

export interface UserProfile {
   firstName?: string
   lastName?: string
   phoneNumber?: string
   address?: Address
   dateOfBirth?: Date
   gender?: 'MALE' | 'FEMALE' | 'OTHER'
   nationality?: string
}

export interface Address {
   street?: string
   city?: string
   state?: string
   country?: string
   zipCode?: string
}

export interface UserPreferences {
   theme?: 'light' | 'dark' | 'system'
   language?: string
   timezone?: string
   notifications?: NotificationSettings
}

export interface NotificationSettings {
   email?: boolean
   push?: boolean
   sms?: boolean
   marketing?: boolean
}

// ==================== AUTH REQUEST/RESPONSE TYPES ====================
export interface BackendResponse<T = any> {
   status: 'success' | 'error' | 'fail'
   message: string
   data?: T
   statusCode?: number
   error?: {
      code?: string
      details?: string[]
      statusCode?: number
      status?: string
      isOperational?: boolean
   }
}

export interface AuthResponse {
   tokens: Tokens
   user: User
}

export interface LoginCredentials {
   email: string
   password: string
   rememberMe?: boolean
}

export interface SignupCredentials {
   name: string
   email: string
   password: string
   role?: UserRole
}

export interface RegisterCredentials extends SignupCredentials {
   confirmPassword: string
   acceptTerms?: boolean
}

export interface ForgotPasswordRequest {
   email: string
}

export interface ResetPasswordRequest {
   email: string
   password: string
}

export interface ChangePasswordRequest {
   currentPassword: string
   password: string
   confirmPassword: string
}

export interface VerifyEmailRequest {
   email: string
   otp: string
}

export interface VerifyOTPRequest {
   email: string
   otp: string
}

export interface ResendVerificationRequest {
   email: string
}

export interface RefreshTokenRequest {
   refreshToken: string
}

export interface AccessTokenResponse {
   accessToken: string
}

// ==================== AUTH STATE & STORE ====================
export interface AuthState {
   user: User | null
   tokens: Tokens | null
   isAuthenticated: boolean
   isLoading: boolean
   error: string | null
   isInitialized: boolean
   lastActivity?: Date
   sessionExpiry?: Date
}

export interface AuthActions {
   // Core auth actions - matching backend API
   login: (credentials: LoginCredentials) => Promise<void>
   signup: (credentials: SignupCredentials) => Promise<void>
   register: (credentials: RegisterCredentials) => Promise<void>
   logout: () => void
   refreshTokens: () => Promise<void>
   getAccessToken: () => Promise<string>

   // Email verification
   sendVerificationEmail: (email: string) => Promise<void>
   verifyEmail: (data: VerifyEmailRequest) => Promise<void>

   // Password management
   forgotPassword: (email: string) => Promise<void>
   verifyOTP: (data: VerifyOTPRequest) => Promise<void>
   resetPassword: (data: ResetPasswordRequest) => Promise<void>
   updatePassword: (data: ChangePasswordRequest) => Promise<void>

   // Profile management
   getProfile: () => Promise<void>
   updateProfile: (profile: Partial<User>) => Promise<void>
   deleteAccount: () => Promise<void>

   // Utility actions
   clearError: () => void
   setLoading: (loading: boolean) => void
   checkAuth: () => void
   initialize: () => Promise<void>
   updateUser: (user: Partial<User>) => void

   // Session management
   updateLastActivity: () => void
   extendSession: () => Promise<void>
   checkSessionExpiry: () => boolean
}

export interface AuthStore extends AuthState, AuthActions {}

// ==================== ROLE & PERMISSION TYPES ====================
export type UserRole = 'superAdmin' | 'admin' | 'staff' | 'customer'

export interface Permission {
   id: string
   resource: string
   action: string
   scope?: string
   conditions?: Record<string, any>
}

export interface RolePermissions {
   [role: string]: Permission[]
}

export interface RouteProtection {
   requireAuth: boolean
   allowedRoles?: UserRole[]
   permissions?: Permission[]
   redirectTo?: string
   fallbackComponent?: React.ComponentType
}

// ==================== ERROR TYPES ====================
export interface AuthError {
   message: string
   code?: string
   field?: string
   type?:
      | 'validation'
      | 'authentication'
      | 'authorization'
      | 'network'
      | 'server'
   details?: Record<string, any>
   timestamp?: Date
}

export interface ValidationError {
   field: string
   message: string
   code?: string
}

export interface ApiErrorResponse {
   message: string
   errors?: ValidationError[]
   code?: string
   timestamp?: string
}

// ==================== SESSION TYPES ====================
export interface SessionInfo {
   id: string
   userId: string
   deviceInfo?: DeviceInfo
   ipAddress?: string
   userAgent?: string
   createdAt: Date
   lastActivity: Date
   expiresAt: Date
   isActive: boolean
}

export interface DeviceInfo {
   type: 'desktop' | 'mobile' | 'tablet'
   os?: string
   browser?: string
   location?: string
}

// ==================== HOOKS TYPES ====================
export interface UseAuthReturn {
   user: User | null
   isAuthenticated: boolean
   isLoading: boolean
   error: string | null
   login: (credentials: LoginCredentials) => Promise<void>
   register: (credentials: RegisterCredentials) => Promise<void>
   logout: () => void
   clearError: () => void
}

export interface UsePermissionsReturn {
   hasPermission: (permission: string | Permission) => boolean
   hasRole: (role: UserRole) => boolean
   hasAnyRole: (roles: UserRole[]) => boolean
   hasAllRoles: (roles: UserRole[]) => boolean
   userPermissions: Permission[]
   userRole: UserRole | null
}

// ==================== UTILITY TYPES ====================
export type AuthEventType =
   | 'login'
   | 'logout'
   | 'register'
   | 'passwordChange'
   | 'emailVerified'
   | 'profileUpdate'
   | 'sessionExpiry'
   | 'tokenRefresh'

export interface AuthEvent {
   type: AuthEventType
   userId?: string
   timestamp: Date
   data?: Record<string, any>
}

export type AuthEventListener = (event: AuthEvent) => void

// ==================== FORM TYPES ====================
export interface LoginFormData {
   email: string
   password: string
   rememberMe: boolean
}

export interface RegisterFormData {
   name: string
   email: string
   password: string
   confirmPassword: string
   acceptTerms: boolean
}

export interface ForgotPasswordFormData {
   email: string
}

export interface ResetPasswordFormData {
   password: string
   confirmPassword: string
}

export interface ChangePasswordFormData {
   currentPassword: string
   newPassword: string
   confirmPassword: string
}
