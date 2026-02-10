'use client'

import React, { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IconX, IconChevronRight } from '@tabler/icons-react'

import { useAuthStore } from '@/store/auth.store'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/theme-utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NavigationUtils, type NavigationItem } from '@/config/navigation.config'
import { useOptimizedNavigation, useNavigationAnalytics } from '@/hooks/useNavigation'

interface SidebarProps {
   isCollapsed: boolean
   setIsCollapsed: (collapsed: boolean) => void
   isMobileMenuOpen: boolean
   setIsMobileMenuOpen: (open: boolean) => void
}

// Utility function to get user initials
const getInitials = (name: string) => {
   return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
}

// Navigation item component with submenu support
const NavigationItemComponent: React.FC<{
   item: NavigationItem
   pathname: string
   isCollapsed: boolean
   level?: number
   onNavigate: () => void
}> = React.memo(({ item, pathname, isCollapsed, level = 0, onNavigate }) => {
   const [isExpanded, setIsExpanded] = useState(item.defaultExpanded || false)
   const Icon = item.icon
   const hasChildren = item.children && item.children.length > 0
   const isActive = NavigationUtils.isItemActive(item, pathname)
   const isParentLevel = level === 0
   
   const handleToggle = useCallback(() => {
      if (hasChildren && !isCollapsed) {
         setIsExpanded(prev => !prev)
      }
   }, [hasChildren, isCollapsed])
   
   const handleClick = useCallback(() => {
      if (item.href) {
         onNavigate()
      } else if (hasChildren) {
         handleToggle()
      }
   }, [item.href, hasChildren, handleToggle, onNavigate])
   
   const itemContent = (
      <div
         className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
            'hover:scale-[1.02] active:scale-[0.98]',
            isActive
               ? 'bg-[var(--interactive-primary)] text-white shadow-md'
               : 'theme-text-secondary hover:theme-bg-secondary hover:theme-text-primary',
            isCollapsed && isParentLevel && 'justify-center px-2',
            level > 0 && 'ml-4 border-l-2 border-transparent hover:border-[var(--interactive-primary)]',
            item.disabled && 'opacity-50 cursor-not-allowed'
         )}
         title={isCollapsed ? item.name : item.description || undefined}
      >
         <Icon className={cn('flex-shrink-0 h-5 w-5', isCollapsed && isParentLevel && 'h-6 w-6')} />
         
         {!isCollapsed && (
            <>
               <span className="flex-1 truncate">{item.name}</span>
               
               {/* Badge */}
               {item.badge && (
                  <span
                     className={cn(
                        'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                        isActive
                           ? 'bg-white/20 text-white'
                           : 'bg-[var(--interactive-primary)] text-white'
                     )}
                  >
                     {item.badge}
                  </span>
               )}
               
               {/* Expand/Collapse indicator */}
               {hasChildren && (
                  <motion.div
                     animate={{ rotate: isExpanded ? 90 : 0 }}
                     transition={{ duration: 0.2 }}
                     className="flex-shrink-0"
                  >
                     <IconChevronRight className="h-4 w-4" />
                  </motion.div>
               )}
            </>
         )}
      </div>
   )
   
   if (item.href && !hasChildren) {
      return (
         <Link href={item.href} onClick={onNavigate} className="block">
            {itemContent}
         </Link>
      )
   }
   
   return (
      <div>
         <button
            onClick={handleClick}
            className="w-full text-left"
            disabled={item.disabled}
         >
            {itemContent}
         </button>
         
         {/* Submenu */}
         {hasChildren && !isCollapsed && (
            <AnimatePresence>
               {isExpanded && (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="overflow-hidden"
                  >
                     <div className="space-y-1 pt-1">
                        {item.children?.map((child) => (
                           <NavigationItemComponent
                              key={child.id}
                              item={child}
                              pathname={pathname}
                              isCollapsed={isCollapsed}
                              level={level + 1}
                              onNavigate={onNavigate}
                           />
                        ))}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         )}
      </div>
   )
})

NavigationItemComponent.displayName = 'NavigationItemComponent'

// Sidebar content component
const SidebarContent: React.FC<{
   navigation: NavigationItem[]
   pathname: string
   user: any
   isCollapsed: boolean
   setIsMobileMenuOpen: (open: boolean) => void
}> = React.memo(({ navigation, pathname, user, isCollapsed, setIsMobileMenuOpen }) => {
   const handleNavigate = useCallback(() => {
      setIsMobileMenuOpen(false)
   }, [setIsMobileMenuOpen])

   return (
      <div
         className={cn(
            'flex h-full flex-col',
            'theme-bg-primary theme-border-r border-r'
         )}
      >
         {/* Mobile Header */}
         <div className="theme-border flex h-16 items-center justify-between border-b px-4 lg:hidden">
            <span className="theme-text-primary text-lg font-semibold">Menu</span>
            <Button
               variant="ghost"
               size="sm"
               onClick={() => setIsMobileMenuOpen(false)}
               className="theme-text-primary hover:theme-bg-secondary"
            >
               <IconX className="h-5 w-5" />
            </Button>
         </div>

         {/* Navigation */}
         <nav className="flex-1 overflow-y-auto py-4">
            <div className={cn('space-y-1 px-3', isCollapsed && 'px-2')}>
               {navigation.map((item) => (
                  <NavigationItemComponent
                     key={item.id}
                     item={item}
                     pathname={pathname}
                     isCollapsed={isCollapsed}
                     onNavigate={handleNavigate}
                  />
               ))}
            </div>
         </nav>

         {/* User Section */}
         {!isCollapsed && (
            <div className="theme-border border-t p-4">
               <div className="theme-bg-secondary flex items-center gap-3 rounded-lg p-3">
                  <Avatar className="h-8 w-8">
                     {(user?.photo || user?.avatar) ? (
                        <AvatarImage 
                           src={user.photo || user.avatar} 
                           alt={user.name || 'Profile photo'}
                           className="object-cover"
                           onError={(e) => {
                              console.log('Sidebar image failed to load:', user.photo || user.avatar)
                              // Hide the broken image
                              e.currentTarget.style.display = 'none'
                           }}
                        />
                     ) : null}
                     <AvatarFallback className="bg-[var(--interactive-primary)] text-xs text-white">
                        {user?.name ? getInitials(user.name) : 'U'}
                     </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                     <p className="theme-text-primary truncate text-sm font-medium">
                        {user?.name || 'User'}
                     </p>
                     <p className="theme-text-muted truncate text-xs">
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                     </p>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
})

SidebarContent.displayName = 'SidebarContent'

export const Sidebar: React.FC<SidebarProps> = ({
   isCollapsed,
   setIsCollapsed,
   isMobileMenuOpen,
   setIsMobileMenuOpen,
}) => {
   const { user } = useAuthStore()
   const pathname = usePathname()
   // Theme context available for future enhancements
   useTheme()

   // Use optimized navigation hooks
   const { navigation } = useOptimizedNavigation()
   const { trackNavigation } = useNavigationAnalytics()

   // Performance optimization: only re-render when necessary
   const memoizedSidebarContent = useMemo(() => (
      <SidebarContent
         navigation={navigation}
         pathname={pathname}
         user={user}
         isCollapsed={isCollapsed}
         setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
   ), [navigation, pathname, user, isCollapsed, setIsMobileMenuOpen])

   return (
      <>
         {/* Desktop Sidebar */}
         <div
            className={cn(
               'fixed bottom-0 left-0 top-16 z-40 hidden transition-all duration-300 lg:flex lg:flex-col',
               isCollapsed ? 'lg:w-20' : 'lg:w-64'
            )}
         >
            {memoizedSidebarContent}
         </div>

         {/* Mobile Sidebar */}
         <AnimatePresence>
            {isMobileMenuOpen && (
               <>
                  {/* Overlay */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                     onClick={() => setIsMobileMenuOpen(false)}
                  />

                  {/* Sidebar */}
                  <motion.div
                     initial={{ x: -280 }}
                     animate={{ x: 0 }}
                     exit={{ x: -280 }}
                     transition={{
                        type: 'spring',
                        damping: 30,
                        stiffness: 300,
                     }}
                     className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
                  >
                     {memoizedSidebarContent}
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </>
   )
}

export default Sidebar