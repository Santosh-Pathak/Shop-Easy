import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/urls'
import type { UserRole } from '@/types/auth'

/**
 * Custom hook for authentication and authorization
 */
export const useAuth = () => {
   const {
      isAuthenticated,
      isLoading,
      isInitialized,
      user,
      tokens,
      error,
      login,
      logout,
      setLoading,
      setError,
      clearError,
      hasRole,
      hasAnyRole,
      canAccess,
   } = useAuthStore()

   return {
      // State
      isAuthenticated,
      isLoading,
      isInitialized,
      user,
      tokens,
      error,

      // Auth checks
      isLoggedIn: isAuthenticated && !!user,
      userRole: user?.role,

      // Actions
      login,
      logout,
      setLoading,
      setError,
      clearError,

      // Role-based checks
      hasRole,
      hasAnyRole,
      canAccess,
   }
}

/**
 * Hook to protect routes that require authentication
 */
export const useAuthGuard = (redirectTo: string = ROUTES.LOGIN) => {
   const { isAuthenticated, isInitialized, isLoading } = useAuth()
   const router = useRouter()

   useEffect(() => {
      if (isInitialized && !isLoading && !isAuthenticated) {
         router.push(redirectTo)
      }
   }, [isAuthenticated, isInitialized, isLoading, redirectTo, router])

   return {
      isAuthenticated,
      isLoading: !isInitialized || isLoading,
   }
}

/**
 * Hook to redirect authenticated users away from auth pages
 */
export const useGuestGuard = (redirectTo: string = ROUTES.DASHBOARD) => {
   const { isAuthenticated, isInitialized, isLoading } = useAuth()
   const router = useRouter()

   useEffect(() => {
      if (isInitialized && !isLoading && isAuthenticated) {
         toast.success(
            'You are already logged in. You have to log out to visit this page.'
         )
         router.push(redirectTo)
      }
   }, [isAuthenticated, isInitialized, isLoading, redirectTo, router])

   return {
      isGuest: !isAuthenticated,
      isLoading: !isInitialized || isLoading,
   }
}

/**
 * Hook to check if user has required role permissions
 */
export const useRoleGuard = (
   requiredRoles: UserRole[],
   redirectTo: string = ROUTES.UNAUTHORIZED
) => {
   const { canAccess, isAuthenticated, isInitialized, isLoading, user } =
      useAuth()
   const router = useRouter()

   const hasPermission = canAccess(requiredRoles)

   useEffect(() => {
      if (isInitialized && !isLoading && isAuthenticated && !hasPermission) {
         toast.error("You don't have access to this page.")
         router.push(redirectTo)
      }
   }, [
      hasPermission,
      isAuthenticated,
      isInitialized,
      isLoading,
      redirectTo,
      router,
   ])

   return {
      hasPermission,
      userRole: user?.role,
      isLoading: !isInitialized || isLoading,
   }
}

/**
 * Combined auth and role guard hook
 */
export const useProtectedRoute = (
   requiredRoles?: UserRole[],
   authRedirectTo: string = ROUTES.LOGIN,
   roleRedirectTo: string = ROUTES.UNAUTHORIZED
) => {
   const { isAuthenticated, isInitialized, isLoading, canAccess, user } =
      useAuth()
   const router = useRouter()

   const hasPermission = requiredRoles ? canAccess(requiredRoles) : true

   useEffect(() => {
      if (!isInitialized || isLoading) return

      if (!isAuthenticated) {
         router.push(authRedirectTo)
         return
      }

      if (requiredRoles && !hasPermission) {
         toast.error("You don't have access to this page.")
         router.push(roleRedirectTo)
         return
      }
   }, [
      isAuthenticated,
      isInitialized,
      isLoading,
      hasPermission,
      requiredRoles,
      authRedirectTo,
      roleRedirectTo,
      router,
   ])

   return {
      isAuthenticated,
      hasPermission,
      userRole: user?.role,
      isLoading: !isInitialized || isLoading,
      canAccess: isAuthenticated && hasPermission,
   }
}

/**
 * Hook for checking specific permissions
 */
export const usePermissions = () => {
   const { user, hasRole, hasAnyRole, canAccess } = useAuth()

   const checkPermission = (permission: string): boolean => {
      // Implement your permission logic here
      // This is a basic example - extend based on your needs
      if (!user) return false

      switch (permission) {
         case 'view_dashboard':
            return hasAnyRole(['customer', 'admin', 'superAdmin'])
         case 'manage_leads':
            return hasAnyRole(['admin', 'superAdmin'])
         case 'manage_users':
            return hasAnyRole(['admin', 'superAdmin'])
         case 'manage_system':
            return hasRole('superAdmin')
         case 'view_analytics':
            return hasAnyRole(['admin', 'superAdmin'])
         case 'manage_bank_partners':
            return hasRole('superAdmin')
         default:
            return false
      }
   }

   return {
      checkPermission,
      hasRole,
      hasAnyRole,
      canAccess,
      userRole: user?.role,
      isAdmin: hasAnyRole(['admin', 'superAdmin']),
      isSuperAdmin: hasRole('superAdmin'),
      isCustomer: hasRole('customer'),
   }
}
