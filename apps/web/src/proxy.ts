import { NextRequest, NextResponse } from 'next/server'
import { ROUTES, STORAGE_KEYS } from '@/constants/urls'
import { UserRole } from '@/types/auth'

// Define protected routes and their access requirements for CRM system
const protectedRoutes = {
   '/dashboard': {
      requiredRoles: ['superAdmin'] as UserRole[],
   },
   '/profile': {
      requiredRoles: ['superAdmin', 'admin', 'customer'] as UserRole[],
   },
   '/lead-management': {
      requiredRoles: ['superAdmin', 'admin'] as UserRole[],
   },
   '/quotations': {
      requiredRoles: ['superAdmin', 'admin'] as UserRole[],
   },
   '/purchase-orders': {
      requiredRoles: ['superAdmin', 'admin'] as UserRole[],
   },
   '/reports': {
      requiredRoles: ['superAdmin', 'admin'] as UserRole[],
   },
   '/analytics': {
      requiredRoles: ['superAdmin', 'admin'] as UserRole[],
   },
   '/user-management': {
      requiredRoles: ['superAdmin'] as UserRole[],
   },
   '/settings': {
      requiredRoles: ['superAdmin'] as UserRole[],
   },
} as const

// Public routes that don't require authentication
const publicRoutes = [
   '/',
   '/login',
   '/register',
   '/signup',
   '/forgot-password',
   '/reset-password',
   '/verify-email',
   '/verify-otp',
   '/two-factor-authentication',
   '/unauthorized',
   '/not-found',
   '/_next',
   '/api',
   '/favicon.ico',
] as const

// Auth pages that should redirect authenticated users
const authPages = [
   '/login',
   '/register',
   '/signup',
   '/forgot-password',
   '/reset-password',
   '/verify-email',
   '/verify-otp',
] as const

/**
 * Check if user has required role for a route
 */
function hasRequiredRole(
   userRole: UserRole,
   requiredRoles: UserRole[]
): boolean {
   return requiredRoles.includes(userRole)
}

/**
 * Check if user has admin privileges
 */
function isAdmin(userRole: UserRole): boolean {
   return userRole === 'admin' || userRole === 'superAdmin'
}

/**
 * Check if user is super admin
 */
function isSuperAdmin(userRole: UserRole): boolean {
   return userRole === 'superAdmin'
}

/**
 * Get user data from cookies with enhanced validation
 */
function getUserFromCookies(request: NextRequest): {
   isAuthenticated: boolean
   user: {
      _id?: string
      id?: string
      role: UserRole
      isEmailVerified: boolean
      isActive: boolean
   } | null
   accessToken: string | null
} {
   const accessToken = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value
   const userCookie = request.cookies.get(STORAGE_KEYS.USER)?.value

   if (!accessToken || !userCookie) {
      return { isAuthenticated: false, user: null, accessToken: null }
   }

   try {
      const user = JSON.parse(userCookie)

      // Validate user object structure
      if (!user.role) {
         return { isAuthenticated: false, user: null, accessToken: null }
      }

      // Check for required properties with defaults for missing ones
      const isEmailVerified = Object.hasOwn(user, 'isEmailVerified')
         ? user.isEmailVerified
         : true // Default to true for development
      const isActive = Object.hasOwn(user, 'isActive') ? user.isActive : true // Default to true for development

      return {
         isAuthenticated: true,
         user: {
            _id: user._id,
            id: user.id || user._id,
            role: user.role,
            isEmailVerified: isEmailVerified,
            isActive: isActive,
         },
         accessToken,
      }
   } catch (error) {
      console.error('Failed to parse user cookie:', error)
      return { isAuthenticated: false, user: null, accessToken: null }
   }
}

/**
 * Check if the route is public
 */
function isPublicRoute(pathname: string): boolean {
   return publicRoutes.some((route) => {
      if (route === '/') {
         return pathname === '/'
      }
      return pathname.startsWith(route)
   })
}

/**
 * Check if the route is an auth page
 */
function isAuthPage(pathname: string): boolean {
   return authPages.some((route) => pathname.startsWith(route))
}

/**
 * Check if the route requires specific role permissions
 */
function getRoutePermissions(
   pathname: string
): { requiredRoles: UserRole[] } | null {
   // Find exact match first
   if (pathname in protectedRoutes) {
      return protectedRoutes[pathname as keyof typeof protectedRoutes]
   }

   // Check for partial matches (for nested routes)
   for (const [route, permissions] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route + '/')) {
         return permissions
      }
   }

   return null
}

/**
 * Create redirect response with toast message as URL parameters
 */
function createRedirectWithToast(
   url: string,
   request: NextRequest,
   toastMessage?: string,
   toastType: 'error' | 'warning' | 'info' = 'error'
): NextResponse {
   const redirectUrl = new URL(url, request.url)

   // Add toast message as URL parameters
   if (toastMessage) {
      redirectUrl.searchParams.set('toast', encodeURIComponent(toastMessage))
      redirectUrl.searchParams.set('toastType', toastType)
   }

   const response = NextResponse.redirect(redirectUrl)

   // Add security headers
   response.headers.set('X-Frame-Options', 'DENY')
   response.headers.set('X-Content-Type-Options', 'nosniff')
   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
   response.headers.set('X-XSS-Protection', '1; mode=block')

   return response
}

/**
 * Create authenticated response with user context headers
 */
function createAuthenticatedResponse(
   request: NextRequest,
   user: {
      _id?: string
      id?: string
      role: UserRole
      isEmailVerified: boolean
      isActive: boolean
   }
): NextResponse {
   const response = NextResponse.next()

   // Add security headers
   response.headers.set('X-Frame-Options', 'DENY')
   response.headers.set('X-Content-Type-Options', 'nosniff')
   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
   response.headers.set('X-XSS-Protection', '1; mode=block')

   // Add user context headers (for server-side usage)
   if (user.id || user._id) {
      response.headers.set('X-User-ID', user.id || user._id || '')
   }
   response.headers.set('X-User-Role', user.role)
   response.headers.set(
      'X-User-Email-Verified',
      user.isEmailVerified.toString()
   )
   response.headers.set('X-User-Active', user.isActive.toString())

   return response
}

/**
 * Main proxy function (previously called middleware)
 */
export default function proxy(request: NextRequest) {
   const { pathname } = request.nextUrl

   // Allow public routes (but handle auth pages separately)
   if (isPublicRoute(pathname) && !isAuthPage(pathname)) {
      return NextResponse.next()
   }

   // Check authentication for protected routes
   const { isAuthenticated, user, accessToken } = getUserFromCookies(request)

   // Handle auth pages (redirect authenticated users away)
   if (isAuthPage(pathname)) {
      if (isAuthenticated && user) {
         return createRedirectWithToast(
            ROUTES.DASHBOARD,
            request,
            'You are already logged in',
            'info'
         )
      }
      return NextResponse.next()
   }

   // Check if this is a protected route
   const routePermissions = getRoutePermissions(pathname)

   if (!routePermissions) {
      // Not a specifically protected route, allow access
      return NextResponse.next()
   }

   // Protected route - check authentication
   if (!isAuthenticated || !user || !accessToken) {
      return createRedirectWithToast(
         `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`,
         request,
         'Please log in to access this page'
      )
   }

   // Check if user account is active (defensive check)
   if (user.hasOwnProperty('isActive') && !user.isActive) {
      return createRedirectWithToast(
         ROUTES.UNAUTHORIZED,
         request,
         'Your account is inactive. Please contact support.'
      )
   }

   // Check if user email is verified (defensive check)
   if (user.hasOwnProperty('isEmailVerified') && !user.isEmailVerified) {
      return createRedirectWithToast(
         ROUTES.LOGIN,
         request,
         'Please verify your email address before accessing this page'
      )
   }

   // Check role-based permissions
   const { requiredRoles } = routePermissions

   if (!hasRequiredRole(user.role, requiredRoles)) {
      return createRedirectWithToast(
         ROUTES.UNAUTHORIZED,
         request,
         'You do not have permission to access this page'
      )
   }

   return createAuthenticatedResponse(request, user)
}

/**
 * Middleware configuration
 */
export const config = {
   matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public folder files
       */
      '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
   ],
}
