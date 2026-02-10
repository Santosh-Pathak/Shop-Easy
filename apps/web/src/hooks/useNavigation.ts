/**
 * Custom hooks for navigation with performance optimizations
 *
 * These hooks provide optimized navigation functionality with:
 * - Memoization of filtered navigation items
 * - Lazy loading of navigation configurations
 * - Debounced navigation analytics
 * - Preloading of likely navigation targets
 */

import { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import {
   navigationConfig,
   NavigationUtils,
   type NavigationItem,
   type NavigationSection,
} from '@/config/navigation.config'
import type { UserRole } from '@/types/auth'

// Performance-optimized hook for navigation filtering
export const useOptimizedNavigation = () => {
   const { user } = useAuthStore()
   const userRole = user?.role

   // Memoized navigation items with stable reference
   const navigation = useMemo(() => {
      if (!userRole) return []
      return NavigationUtils.filterByRole(navigationConfig.items, userRole)
   }, [userRole])

   // Memoized navigation sections
   const sections = useMemo(() => {
      if (!userRole) return []
      return NavigationUtils.filterSectionsByRole(
         navigationConfig.sections,
         userRole
      )
   }, [userRole])

   // Flattened items for quick lookup
   const flattenedItems = useMemo(() => {
      return NavigationUtils.getFlattenedItems(navigation)
   }, [navigation])

   // Navigation statistics for analytics
   const stats = useMemo(() => {
      return NavigationUtils.getNavigationStats(
         navigationConfig.items,
         userRole
      )
   }, [userRole])

   return {
      navigation,
      sections,
      flattenedItems,
      stats,
      userRole,
      isAdmin: userRole === 'admin' || userRole === 'superAdmin',
      isSuperAdmin: userRole === 'superAdmin',
      isCustomer: userRole === 'customer',
   }
}

// Hook for navigation item lookup with memoization
export const useNavigationLookup = () => {
   const { navigation } = useOptimizedNavigation()

   const findByHref = useCallback(
      (href: string) => {
         return NavigationUtils.findItemByHref(navigation, href)
      },
      [navigation]
   )

   const findById = useCallback(
      (id: string) => {
         return NavigationUtils.findItemById(navigation, id)
      },
      [navigation]
   )

   const getBreadcrumb = useCallback(
      (href: string) => {
         return NavigationUtils.getBreadcrumbPath(navigation, href)
      },
      [navigation]
   )

   const isActive = useCallback((item: NavigationItem, currentPath: string) => {
      return NavigationUtils.isItemActive(item, currentPath)
   }, [])

   return {
      findByHref,
      findById,
      getBreadcrumb,
      isActive,
   }
}

// Analytics hook with debounced tracking
export const useNavigationAnalytics = () => {
   const analyticsQueue = useRef<
      Array<{ event: string; data: any; timestamp: number }>
   >([])
   const flushTimeout = useRef<NodeJS.Timeout | null>(null)

   const trackNavigation = useCallback(
      (item: NavigationItem, action: 'click' | 'hover' | 'expand') => {
         const event = {
            event: `nav_${action}`,
            data: {
               itemId: item.id,
               itemName: item.name,
               itemHref: item.href,
               category: item.category,
               trackingId: item.trackingId,
            },
            timestamp: Date.now(),
         }

         analyticsQueue.current.push(event)

         // Debounced flush every 2 seconds
         if (flushTimeout.current) {
            clearTimeout(flushTimeout.current)
         }

         flushTimeout.current = setTimeout(() => {
            if (analyticsQueue.current.length > 0) {
               // Send analytics batch
               console.log(
                  'Navigation Analytics Batch:',
                  analyticsQueue.current
               )

               // Here you would send to your analytics service
               // Example: sendAnalyticsBatch(analyticsQueue.current)

               analyticsQueue.current = []
            }
         }, 2000)
      },
      []
   )

   useEffect(() => {
      return () => {
         if (flushTimeout.current) {
            clearTimeout(flushTimeout.current)
         }
      }
   }, [])

   return {
      trackNavigation,
   }
}

// Hook for preloading navigation routes
export const useNavigationPreloading = () => {
   const { navigation } = useOptimizedNavigation()
   const preloadedRoutes = useRef<Set<string>>(new Set())

   const preloadRoute = useCallback((href: string) => {
      if (preloadedRoutes.current.has(href)) return

      // Preload the route using Next.js router
      if (typeof window !== 'undefined') {
         const router = (window as any).__NEXT_ROUTER__
         if (router?.prefetch) {
            router.prefetch(href)
            preloadedRoutes.current.add(href)
         }
      }
   }, [])

   const preloadVisibleRoutes = useCallback(() => {
      // Preload all visible navigation routes
      navigation.forEach((item) => {
         if (item.href) {
            preloadRoute(item.href)
         }

         // Preload children routes
         if (item.children) {
            item.children.forEach((child) => {
               if (child.href) {
                  preloadRoute(child.href)
               }
            })
         }
      })
   }, [navigation, preloadRoute])

   // Preload on mount and when navigation changes
   useEffect(() => {
      const timer = setTimeout(preloadVisibleRoutes, 1000) // Delay to avoid blocking initial render
      return () => clearTimeout(timer)
   }, [preloadVisibleRoutes])

   return {
      preloadRoute,
      preloadVisibleRoutes,
   }
}

// Hook for responsive navigation behavior
export const useResponsiveNavigation = () => {
   const [isMobile, setIsMobile] = useState(false)
   const [isTablet, setIsTablet] = useState(false)

   useEffect(() => {
      const checkScreenSize = () => {
         if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth < 768)
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
         }
      }

      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)

      return () => window.removeEventListener('resize', checkScreenSize)
   }, [])

   return {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
   }
}

// Hook for navigation permissions
export const useNavigationPermissions = () => {
   const { user } = useAuthStore()

   const hasPermission = useCallback(
      (item: NavigationItem) => {
         return NavigationUtils.hasPermission(
            item,
            user?.role,
            user?.permissions?.map((p) => p.resource + ':' + p.action)
         )
      },
      [user]
   )

   const canAccessRoute = useCallback(
      (href: string) => {
         const { navigation } = useOptimizedNavigation()
         const item = NavigationUtils.findItemByHref(navigation, href)
         return item ? hasPermission(item) : false
      },
      [hasPermission]
   )

   return {
      hasPermission,
      canAccessRoute,
   }
}

// Combined hook for all navigation functionality
export const useNavigation = () => {
   const optimizedNav = useOptimizedNavigation()
   const lookup = useNavigationLookup()
   const analytics = useNavigationAnalytics()
   const preloading = useNavigationPreloading()
   const responsive = useResponsiveNavigation()
   const permissions = useNavigationPermissions()

   return {
      ...optimizedNav,
      ...lookup,
      ...analytics,
      ...preloading,
      ...responsive,
      ...permissions,
   }
}
