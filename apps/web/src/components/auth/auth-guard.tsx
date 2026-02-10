'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/urls'
import { UserRole } from '@/types/auth'
import { toast } from 'react-hot-toast'

interface AuthGuardProps {
   children: React.ReactNode
   requiredRoles?: UserRole[]
   fallback?: React.ReactNode
   redirect?: string
}

/**
 * Production-ready Authentication Guard Component
 * Handles route protection with role-based access control
 */
export function AuthGuard({ 
   children, 
   requiredRoles, 
   fallback = null,
   redirect 
}: AuthGuardProps) {
   const router = useRouter()
   const pathname = usePathname()
   const { 
      isAuthenticated, 
      isLoading, 
      isInitialized, 
      user, 
      hasAnyRole 
   } = useAuthStore()
   
   const [isChecking, setIsChecking] = useState(true)

   useEffect(() => {
      // Wait for auth store to initialize
      if (!isInitialized) {
         return
      }

      setIsChecking(false)

      // Check authentication
      if (!isAuthenticated || !user) {
         console.log('[AuthGuard] User not authenticated, redirecting to login')
         router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`)
         return
      }

      // Check if user account is active (defensive check)
      if (user.hasOwnProperty('isActive') && !user.isActive) {
         console.log('[AuthGuard] User account is inactive')
         toast.error('Your account is inactive. Please contact support.')
         router.push(ROUTES.UNAUTHORIZED)
         return
      }

      // Check role permissions if required
      if (requiredRoles && requiredRoles.length > 0) {
         if (!hasAnyRole(requiredRoles)) {
            console.log('[AuthGuard] Insufficient permissions', {
               userRole: user.role,
               requiredRoles,
               pathname
            })
            
            toast.error("You don't have permission to access this page.")
            
            if (redirect) {
               router.push(redirect)
            } else {
               router.push(ROUTES.UNAUTHORIZED)
            }
            return
         }
      }

      console.log('[AuthGuard] Access granted', {
         userRole: user.role,
         pathname,
         requiredRoles
      })
   }, [
      isAuthenticated, 
      isInitialized, 
      user, 
      requiredRoles, 
      pathname, 
      router, 
      redirect,
      hasAnyRole
   ])

   // Show loading state while checking auth
   if (isLoading || isChecking || !isInitialized) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
               <p className="text-sm text-gray-600">Checking authentication...</p>
            </div>
         </div>
      )
   }

   // Show fallback if provided and access denied
   if (!isAuthenticated || !user) {
      return fallback
   }

   // Check role access for fallback
   if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return fallback
   }

   // Render children if all checks pass
   return <>{children}</>
}

/**
 * Higher-order component for page-level authentication
 */
export function withAuth<P extends object>(
   WrappedComponent: React.ComponentType<P>,
   options?: {
      requiredRoles?: UserRole[]
      redirect?: string
   }
) {
   const AuthenticatedComponent = (props: P) => {
      return (
         <AuthGuard 
            requiredRoles={options?.requiredRoles}
            redirect={options?.redirect}
         >
            <WrappedComponent {...props} />
         </AuthGuard>
      )
   }

   AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
   
   return AuthenticatedComponent
}

/**
 * Role-based access wrapper component
 */
interface RoleGuardProps {
   children: React.ReactNode
   allowedRoles: UserRole[]
   fallback?: React.ReactNode
   showToast?: boolean
}

export function RoleGuard({ 
   children, 
   allowedRoles, 
   fallback = null,
   showToast = false 
}: RoleGuardProps) {
   const { user, hasAnyRole } = useAuthStore()

   useEffect(() => {
      if (showToast && user && !hasAnyRole(allowedRoles)) {
         toast.error("You don't have permission to access this feature.")
      }
   }, [user, allowedRoles, hasAnyRole, showToast])

   if (!user || !hasAnyRole(allowedRoles)) {
      return <>{fallback}</>
   }

   return <>{children}</>
}

/**
 * Simple authenticated check component
 */
interface RequireAuthProps {
   children: React.ReactNode
   fallback?: React.ReactNode
}

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
   const { isAuthenticated, user } = useAuthStore()

   if (!isAuthenticated || !user) {
      return <>{fallback}</>
   }

   return <>{children}</>
}