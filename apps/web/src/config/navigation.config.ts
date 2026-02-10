/**
 * Dynamic Navigation Configuration
 *
 * This file contains the complete navigation structure for the application
 * with role-based access control, submenu support, and production optimizations.
 */

import {
   IconDashboard,
   IconUsers,
   IconUserCheck,
   IconUserCircle,
   IconBuildingStore,
   IconPalette,
   IconUser,
   IconFileText,
   IconShoppingCart,
   IconTool,
} from '@tabler/icons-react'
import type { UserRole } from '@/types/auth'

// Navigation item type with submenu support
export interface NavigationItem {
   id: string
   name: string
   href?: string
   icon: React.ComponentType<{ className?: string }>
   badge?: string | number

   // Role-based access control
   roles: UserRole[]
   permissions?: string[]

   // Submenu support
   children?: NavigationItem[]
   isExpandable?: boolean
   defaultExpanded?: boolean

   // Visual and behavioral options
   external?: boolean
   disabled?: boolean
   divider?: boolean
   description?: string

   // Analytics and tracking
   trackingId?: string
   category?: string
}

export interface NavigationSection {
   id: string
   name: string
   items: NavigationItem[]
   roles?: UserRole[]
   collapsible?: boolean
   defaultCollapsed?: boolean
}

// Core navigation items
export const NAVIGATION_ITEMS: NavigationItem[] = [
   {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
      icon: IconDashboard,
      roles: ['customer', 'admin', 'superAdmin'],
      permissions: ['view_dashboard'],
      trackingId: 'nav_dashboard',
      category: 'overview',
   },
   {
      id: 'leads',
      name: 'Lead',
      href: '/lead-management',
      icon: IconUserCheck,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_leads'],
      trackingId: 'nav_leads',
      category: 'sales',
   },
   {
      id: 'quotes',
      name: 'Quote',
      href: '/quotes',
      icon: IconFileText,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_quotes'],
      trackingId: 'nav_quotes',
      category: 'sales',
      description: 'Manage quotes and proposals',
   },
   {
      id: 'purchase-orders',
      name: 'PO',
      href: '/purchase-orders',
      icon: IconShoppingCart,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_purchase_orders'],
      trackingId: 'nav_purchase_orders',
      category: 'sales',
      description: 'Manage purchase orders and procurement',
   },
   {
      id: 'customers',
      name: 'Customer',
      href: '/customer-management',
      icon: IconUserCircle,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_customers'],
      trackingId: 'nav_customers',
      category: 'sales',
      description: 'Manage customers and their information',
   },
   {
      id: 'service-management',
      name: 'Service',
      href: '/service-management',
      icon: IconBuildingStore,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_services'],
      trackingId: 'nav_service_management',
      category: 'admin',
      description: 'Manage service categories, services, and sub-services',
   },
   {
      id: 'labour-materials',
      name: 'Labour & Materials',
      href: '/labour-materials',
      icon: IconTool,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_labour_materials'],
      trackingId: 'nav_labour_materials',
      category: 'admin',
      description: 'Manage labour rates and material costs',
   },
   {
      id: 'user-management',
      name: 'User',
      href: '/user-management',
      icon: IconUsers,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_users'],
      trackingId: 'nav_user_management',
      category: 'admin',
   },
   {
      id: 'theme-management',
      name: 'Theme',
      href: '/themes',
      icon: IconPalette,
      roles: ['admin', 'superAdmin'],
      permissions: ['manage_themes'],
      trackingId: 'nav_theme_management',
      category: 'customization',
      description: 'Customize application themes and appearance',
   },
   {
      id: 'profile',
      name: 'Profile',
      href: '/profile',
      icon: IconUser,
      roles: ['customer', 'admin', 'superAdmin'],
      permissions: ['view_profile'],
      trackingId: 'nav_profile',
      category: 'account',
      description: 'Manage your profile and account settings',
   },
]

// Navigation sections for organized display
export const NAVIGATION_SECTIONS: NavigationSection[] = [
   {
      id: 'main',
      name: 'Main',
      items: NAVIGATION_ITEMS,
   },
]

// Permission mappings for different actions
export const PERMISSION_MAPPINGS = {
   // Dashboard permissions
   view_dashboard: ['customer', 'admin', 'superAdmin'],

   // Lead management permissions
   manage_leads: ['admin', 'superAdmin'],
   view_leads: ['admin', 'superAdmin'],
   create_leads: ['admin', 'superAdmin'],
   edit_leads: ['admin', 'superAdmin'],
   delete_leads: ['superAdmin'],

   // Customer management permissions
   manage_customers: ['admin', 'superAdmin'],
   view_customers: ['admin', 'superAdmin'],
   create_customers: ['admin', 'superAdmin'],
   edit_customers: ['admin', 'superAdmin'],
   delete_customers: ['superAdmin'],
   bulk_import_customers: ['admin', 'superAdmin'],

   // Quote management permissions
   manage_quotes: ['admin', 'superAdmin'],
   view_quotes: ['admin', 'superAdmin'],
   create_quotes: ['admin', 'superAdmin'],
   edit_quotes: ['admin', 'superAdmin'],
   delete_quotes: ['superAdmin'],

   // Purchase Order management permissions
   manage_purchase_orders: ['admin', 'superAdmin'],
   view_purchase_orders: ['admin', 'superAdmin'],
   create_purchase_orders: ['admin', 'superAdmin'],
   edit_purchase_orders: ['admin', 'superAdmin'],
   delete_purchase_orders: ['superAdmin'],

   // Service management permissions
   manage_services: ['admin', 'superAdmin'],
   view_services: ['customer', 'admin', 'superAdmin'],
   create_services: ['admin', 'superAdmin'],
   edit_services: ['admin', 'superAdmin'],
   delete_services: ['superAdmin'],

   // Labour & Materials management permissions
   manage_labour_materials: ['admin', 'superAdmin'],
   view_labour_materials: ['admin', 'superAdmin'],
   create_labour_materials: ['admin', 'superAdmin'],
   edit_labour_materials: ['admin', 'superAdmin'],
   delete_labour_materials: ['superAdmin'],

   // User management permissions
   manage_users: ['admin', 'superAdmin'],
   view_users: ['admin', 'superAdmin'],
   create_users: ['admin', 'superAdmin'],
   edit_users: ['admin', 'superAdmin'],
   delete_users: ['superAdmin'],
   change_user_roles: ['superAdmin'],

   // Theme management permissions
   manage_themes: ['admin', 'superAdmin'],
   view_themes: ['admin', 'superAdmin'],
   create_themes: ['admin', 'superAdmin'],
   edit_themes: ['admin', 'superAdmin'],
   delete_themes: ['superAdmin'],

   // Profile permissions
   view_profile: ['customer', 'admin', 'superAdmin'],
   edit_profile: ['customer', 'admin', 'superAdmin'],
   change_password: ['customer', 'admin', 'superAdmin'],

   // Special permissions
   access_admin_panel: ['admin', 'superAdmin'],
   system_admin: ['superAdmin'],
} as const

// Utility functions for navigation
export class NavigationUtils {
   /**
    * Filter navigation items based on user role and permissions
    */
   static filterByRole(
      items: NavigationItem[],
      userRole?: UserRole
   ): NavigationItem[] {
      if (!userRole) return []

      return items
         .filter((item) => item.roles.includes(userRole))
         .map((item) => ({
            ...item,
            children: item.children
               ? this.filterByRole(item.children, userRole)
               : undefined,
         }))
         .filter((item) => !item.children || item.children.length > 0)
   }

   /**
    * Filter navigation sections based on user role
    */
   static filterSectionsByRole(
      sections: NavigationSection[],
      userRole?: UserRole
   ): NavigationSection[] {
      if (!userRole) return []

      return sections
         .filter(
            (section) => !section.roles || section.roles.includes(userRole)
         )
         .map((section) => ({
            ...section,
            items: this.filterByRole(section.items, userRole),
         }))
         .filter((section) => section.items.length > 0)
   }

   /**
    * Check if user has permission for a navigation item
    */
   static hasPermission(
      item: NavigationItem,
      userRole?: UserRole,
      permissions?: string[]
   ): boolean {
      if (!userRole) return false

      // Check role-based access
      if (!item.roles.includes(userRole)) return false

      // Check permission-based access if specified
      if (item.permissions && permissions) {
         return item.permissions.some((permission) =>
            permissions.includes(permission)
         )
      }

      return true
   }

   /**
    * Get flattened navigation items (including children)
    */
   static getFlattenedItems(items: NavigationItem[]): NavigationItem[] {
      const flattened: NavigationItem[] = []

      items.forEach((item) => {
         flattened.push(item)
         if (item.children) {
            flattened.push(...this.getFlattenedItems(item.children))
         }
      })

      return flattened
   }

   /**
    * Find navigation item by ID
    */
   static findItemById(
      items: NavigationItem[],
      id: string
   ): NavigationItem | null {
      for (const item of items) {
         if (item.id === id) return item
         if (item.children) {
            const found = this.findItemById(item.children, id)
            if (found) return found
         }
      }
      return null
   }

   /**
    * Find navigation item by href
    */
   static findItemByHref(
      items: NavigationItem[],
      href: string
   ): NavigationItem | null {
      for (const item of items) {
         if (item.href === href) return item
         if (item.children) {
            const found = this.findItemByHref(item.children, href)
            if (found) return found
         }
      }
      return null
   }

   /**
    * Get breadcrumb path for a given href
    */
   static getBreadcrumbPath(
      items: NavigationItem[],
      href: string
   ): NavigationItem[] {
      for (const item of items) {
         if (item.href === href) {
            return [item]
         }
         if (item.children) {
            const childPath = this.getBreadcrumbPath(item.children, href)
            if (childPath.length > 0) {
               return [item, ...childPath]
            }
         }
      }
      return []
   }

   /**
    * Check if navigation item is currently active
    */
   static isItemActive(item: NavigationItem, currentPath: string): boolean {
      if (!item.href) return false

      // Exact match
      if (item.href === currentPath) return true

      // Check if current path starts with item href (for nested routes)
      // Ensure we don't match partial segments by checking the next character
      if (currentPath.startsWith(item.href)) {
         const remaining = currentPath.slice(item.href.length)
         // If remaining path starts with '/' or is empty, it's a valid match
         if (remaining === '' || remaining.startsWith('/')) {
            return true
         }
      }

      // Check children
      if (item.children) {
         return item.children.some((child) =>
            this.isItemActive(child, currentPath)
         )
      }

      return false
   }

   /**
    * Get navigation statistics for analytics
    */
   static getNavigationStats(items: NavigationItem[], userRole?: UserRole) {
      const filteredItems = this.filterByRole(items, userRole)
      const flatItems = this.getFlattenedItems(filteredItems)

      return {
         totalItems: flatItems.length,
         expandableItems: flatItems.filter((item) => item.isExpandable).length,
         categoryCounts: flatItems.reduce(
            (acc, item) => {
               if (item.category) {
                  acc[item.category] = (acc[item.category] || 0) + 1
               }
               return acc
            },
            {} as Record<string, number>
         ),
         roleSpecificItems: {
            admin: this.filterByRole(items, 'admin').length,
            superAdmin: this.filterByRole(items, 'superAdmin').length,
         },
      }
   }
}

// Export default navigation configuration
export const navigationConfig = {
   items: NAVIGATION_ITEMS,
   sections: NAVIGATION_SECTIONS,
   permissions: PERMISSION_MAPPINGS,
   utils: NavigationUtils,
}

export default navigationConfig
