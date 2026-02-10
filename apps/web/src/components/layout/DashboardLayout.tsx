'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
   IconMenu2,
   IconBell,
   IconChevronDown,
   IconLogout,
   IconUser,
   IconSettings,
   IconDashboard,
   IconUsers,
   IconCreditCard,
   IconFileText,
   IconUserCheck,
   IconBuilding,
   IconChartDots3,
   IconTool,
} from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useAuthStore } from '@/store/auth.store'
import { AuthService } from '@/services/apis/auth.service'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { cn } from '@/lib/theme-utils'
import { Button } from '@/components/ui/button'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface DashboardLayoutProps {
   readonly children: React.ReactNode
}

interface NavigationItem {
   name: string
   href: string
   icon: React.ComponentType<{ className?: string }>
   badge?: string
   isActive?: boolean
}

interface SidebarProps {
   navigation: NavigationItem[]
   pathname: string
   user: any
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

const Sidebar = ({ navigation, pathname, user }: SidebarProps) => {
   return (
      <div
         className={cn(
            'flex h-full flex-col',
            'theme-bg-primary theme-border-r border-r'
         )}
      >
         {/* Logo */}
         <div className="theme-border flex h-16 items-center justify-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-3">
               <div className="flex items-center">
                  <img 
                     src="/images/projectname-logo.svg" 
                     alt="projectname Logo" 
                     className="h-8 w-auto object-contain"
                  />
               </div>
               <span className="theme-text-primary text-xl font-bold">
                  projectname
               </span>
            </Link>
         </div>

         {/* Navigation */}
         <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
               {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                     <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                           'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                           isActive
                              ? 'bg-[var(--interactive-primary)] text-white'
                              : 'theme-text-secondary hover:theme-bg-secondary hover:theme-text-primary'
                        )}
                     >
                        <Icon className="h-5 w-5" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                           <span
                              className={cn(
                                 'rounded-full px-2 py-0.5 text-xs',
                                 isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[var(--interactive-primary)] text-white'
                              )}
                           >
                              {item.badge}
                           </span>
                        )}
                     </Link>
                  )
               })}
            </div>
         </nav>

         {/* User Section */}
         <div className="theme-border border-t p-4">
            <div className="theme-bg-secondary flex items-center gap-3 rounded-lg p-3">
               <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[var(--interactive-primary)] text-xs text-white">
                     {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
               </Avatar>
               <div className="min-w-0 flex-1">
                  <p className="theme-text-primary truncate text-sm font-medium">
                     {user?.name || 'User'}
                  </p>
                  <p className="theme-text-muted truncate text-xs">
                     {user?.email}
                  </p>
               </div>
            </div>
         </div>
      </div>
   )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
   const [sidebarOpen, setSidebarOpen] = useState(false)
   const { user } = useAuthStore()
   const router = useRouter()
   const pathname = usePathname()
   // Theme hook available for future enhancements
   useTheme()

   // Base navigation items
   const baseNavigation: NavigationItem[] = [
      {
         name: 'Dashboard',
         href: '/dashboard',
         icon: IconDashboard,
      },
      {
         name: 'Lead Management',
         href: '/lead-management',
         icon: IconUserCheck,
      },
      {
         name: 'Quotations',
         href: '/quotations',
         icon: IconFileText,
         badge: '5',
      },
      {
         name: 'Purchase Orders',
         href: '/purchase-orders',
         icon: IconCreditCard,
      },
      {
         name: 'Reports',
         href: '/reports',
         icon: IconChartDots3,
      },
   ]

   // Admin/SuperAdmin specific navigation items
   const adminNavigation: NavigationItem[] = [
      {
         name: 'Labour & Materials',
         href: '/labour-materials',
         icon: IconTool,
      },
      {
         name: 'User Management',
         href: '/user-management',
         icon: IconUsers,
      },
   ]

   // Filter navigation based on user role
   const navigation: NavigationItem[] = useMemo(() => {
      const userRole = user?.role
      const isAdminOrSuperAdmin = userRole === 'admin' || userRole === 'superAdmin'
      
      return [
         ...baseNavigation,
         ...(isAdminOrSuperAdmin ? adminNavigation : [])
      ]
   }, [user?.role])

   const handleLogout = async () => {
      await AuthService.logout()
      router.push('/login')
   }

   return (
      <div className="theme-bg-primary flex h-screen">
         {/* Desktop Sidebar */}
         <div className="hidden lg:flex lg:w-64 lg:flex-col">
            <Sidebar navigation={navigation} pathname={pathname} user={user} />
         </div>

         {/* Mobile Sidebar */}
         <AnimatePresence>
            {sidebarOpen && (
               <>
                  {/* Overlay */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                     onClick={() => setSidebarOpen(false)}
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
                     <Sidebar
                        navigation={navigation}
                        pathname={pathname}
                        user={user}
                     />
                  </motion.div>
               </>
            )}
         </AnimatePresence>

         {/* Main Content */}
         <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Navigation */}
            <header className="theme-border theme-bg-primary flex h-16 items-center justify-between border-b px-4 lg:px-6">
               {/* Left side */}
               <div className="flex items-center gap-4">
                  <Button
                     variant="ghost"
                     size="sm"
                     className="theme-text-primary hover:theme-bg-secondary lg:hidden"
                     onClick={() => setSidebarOpen(true)}
                  >
                     <IconMenu2 className="h-6 w-6" />
                  </Button>

                  <div>
                     <h1 className="theme-text-primary text-xl font-semibold">
                        {navigation.find((item) => item.href === pathname)
                           ?.name || 'Dashboard'}
                     </h1>
                  </div>
               </div>

               {/* Right side */}
               <div className="flex items-center gap-4">
                  {/* Theme Toggle */}
                  <ThemeModeToggle variant="button" size="sm" />

                  {/* Notifications */}
                  <Button
                     variant="ghost"
                     size="sm"
                     className="theme-text-secondary hover:theme-text-primary hover:theme-bg-secondary relative"
                  >
                     <IconBell className="h-5 w-5" />
                     <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--error-500)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                     </span>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                        <Button
                           variant="ghost"
                           className="hover:theme-bg-secondary flex items-center gap-2"
                        >
                           <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-[var(--interactive-primary)] text-sm text-white">
                                 {user?.name ? getInitials(user.name) : 'U'}
                              </AvatarFallback>
                           </Avatar>
                           <div className="hidden text-left md:block">
                              <p className="theme-text-primary text-sm font-medium">
                                 {user?.name || 'User'}
                              </p>
                              <p className="theme-text-muted text-xs capitalize">
                                 {user?.role || 'User'}
                              </p>
                           </div>
                           <IconChevronDown className="theme-text-muted h-4 w-4" />
                        </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent
                        align="end"
                        className="theme-bg-primary theme-border w-56"
                     >
                        <DropdownMenuLabel className="theme-text-primary">
                           My Account
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="theme-border" />
                        <DropdownMenuItem className="theme-text-secondary hover:theme-bg-secondary">
                           <IconUser className="mr-2 h-4 w-4" />
                           Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="theme-text-secondary hover:theme-bg-secondary">
                           <IconSettings className="mr-2 h-4 w-4" />
                           Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="theme-border" />
                        <DropdownMenuItem
                           className="theme-text-secondary hover:theme-bg-secondary text-[var(--error-500)]"
                           onClick={handleLogout}
                        >
                           <IconLogout className="mr-2 h-4 w-4" />
                           Sign out
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </header>

            {/* Page Content */}
            <main className="theme-bg-secondary flex-1 overflow-auto p-4 lg:p-6">
               <div className="mx-auto max-w-7xl">{children}</div>
            </main>
         </div>
      </div>
   )
}
