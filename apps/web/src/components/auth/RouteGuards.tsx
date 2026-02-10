import React, { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useAuthGuard, useGuestGuard, useRoleGuard } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/urls'
import type { UserRole } from '@/types/auth'

// Loading component
const LoadingSpinner = () => (
   <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
   </div>
)

// Unauthorized component
const UnauthorizedPage = () => (
   <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
         <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
         <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
         <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
         >
            Go Back
         </button>
      </div>
   </div>
)

interface ProtectedRouteProps {
   children: ReactNode
   requiredRoles?: UserRole[]
   fallback?: ReactNode
   unauthorizedComponent?: ReactNode
   showLoading?: boolean
}

/**
 * Component to protect routes that require authentication
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
   children,
   requiredRoles,
   fallback,
   unauthorizedComponent,
   showLoading = true,
}) => {
   const { isAuthenticated, isLoading: authLoading } = useAuthGuard()
   const {
      hasPermission,
      isLoading: roleLoading,
   } = useRoleGuard(requiredRoles || [], ROUTES.UNAUTHORIZED)

   // Show loading spinner while checking authentication
   if ((authLoading || roleLoading) && showLoading) {
      return fallback || <LoadingSpinner />
   }

   // If not authenticated, useAuthGuard will handle redirect
   if (!isAuthenticated) {
      return null
   }

   // If no role requirements, just check authentication
   if (!requiredRoles) {
      return <>{children}</>
   }

   // If role requirements not met, show unauthorized component
   if (!hasPermission) {
      return unauthorizedComponent || <UnauthorizedPage />
   }

   return <>{children}</>
}

interface GuestOnlyRouteProps {
   children: ReactNode
   fallback?: ReactNode
   showLoading?: boolean
}

/**
 * Component to protect routes that should only be accessible to guests (non-authenticated users)
 */
export const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({
   children,
   fallback,
   showLoading = true,
}) => {
   const { isGuest, isLoading } = useGuestGuard()

   // Show loading spinner while checking authentication
   if (isLoading && showLoading) {
      return fallback || <LoadingSpinner />
   }

   // If authenticated, useGuestGuard will handle redirect
   if (!isGuest) {
      return null
   }

   return <>{children}</>
}

interface ConditionalRenderProps {
   children: ReactNode
   condition: boolean
   fallback?: ReactNode
}

/**
 * Conditionally render content based on authentication state
 */
export const IfAuthenticated: React.FC<ConditionalRenderProps> = ({
   children,
   condition,
   fallback = null,
}) => {
   const { isAuthenticated } = useAuth()
   
   if (condition !== undefined ? condition : isAuthenticated) {
      return <>{children}</>
   }
   
   return <>{fallback}</>
}

/**
 * Conditionally render content for guests only
 */
export const IfGuest: React.FC<ConditionalRenderProps> = ({
   children,
   condition,
   fallback = null,
}) => {
   const { isAuthenticated } = useAuth()
   
   if (condition !== undefined ? condition : !isAuthenticated) {
      return <>{children}</>
   }
   
   return <>{fallback}</>
}

interface RoleBasedRenderProps {
   children: ReactNode
   roles: UserRole[]
   fallback?: ReactNode
   requireAll?: boolean
}

/**
 * Conditionally render content based on user roles
 */
export const IfHasRole: React.FC<RoleBasedRenderProps> = ({
   children,
   roles,
   fallback = null,
   requireAll = false,
}) => {
   const { hasAnyRole, hasRole, user } = useAuth()
   
   if (!user) {
      return <>{fallback}</>
   }
   
   const hasPermission = requireAll 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles)
   
   if (hasPermission) {
      return <>{children}</>
   }
   
   return <>{fallback}</>
}

interface PermissionBasedRenderProps {
   children: ReactNode
   permission: string
   fallback?: ReactNode
}

/**
 * Conditionally render content based on specific permissions
 */
export const IfHasPermission: React.FC<PermissionBasedRenderProps> = ({
   children,
   permission,
   fallback = null,
}) => {
   const { user } = useAuth()
   
   // Implement your permission checking logic here
   const hasPermission = (permission: string): boolean => {
      if (!user) return false
      
      // Example permission logic - adapt to your needs
      switch (permission) {
         case 'view_admin_panel':
            return ['admin', 'superAdmin'].includes(user.role)
         case 'manage_users':
            return ['admin', 'superAdmin'].includes(user.role)
         case 'view_analytics':
            return ['admin', 'superAdmin'].includes(user.role)
         case 'manage_system':
            return user.role === 'superAdmin'
         default:
            return false
      }
   }
   
   if (hasPermission(permission)) {
      return <>{children}</>
   }
   
   return <>{fallback}</>
}

// Higher-order component for route protection
export const withAuth = <P extends object>(
   WrappedComponent: React.ComponentType<P>,
   requiredRoles?: UserRole[]
) => {
   const AuthenticatedComponent = (props: P) => {
      return (
         <ProtectedRoute requiredRoles={requiredRoles}>
            <WrappedComponent {...props} />
         </ProtectedRoute>
      )
   }
   
   AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
   
   return AuthenticatedComponent
}

// Higher-order component for guest-only routes
export const withGuestOnly = <P extends object>(
   WrappedComponent: React.ComponentType<P>
) => {
   const GuestOnlyComponent = (props: P) => {
      return (
         <GuestOnlyRoute>
            <WrappedComponent {...props} />
         </GuestOnlyRoute>
      )
   }
   
   GuestOnlyComponent.displayName = `withGuestOnly(${WrappedComponent.displayName || WrappedComponent.name})`
   
   return GuestOnlyComponent
}