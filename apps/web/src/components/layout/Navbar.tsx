'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
   IconMenu2,
   IconBell,
   IconChevronDown,
   IconLogout,
   IconUser,
   IconSettings,
   IconChevronLeft,
   IconChevronRight,
} from '@tabler/icons-react'

import { useAuthStore } from '@/store/auth.store'
import { AuthService } from '@/services/apis/auth.service'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeModeToggle from '@/components/ThemeModeToggle'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavbarProps {
   onMobileMenuClick: () => void
   onSidebarToggle: () => void
   isCollapsed: boolean
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

export const Navbar: React.FC<NavbarProps> = ({
   onMobileMenuClick,
   onSidebarToggle,
   isCollapsed,
}) => {
   const { user } = useAuthStore()
   const router = useRouter()
   // Theme context available for future enhancements
   useTheme()

   const handleLogout = async () => {
      await AuthService.logout()
      router.push('/login')
   }

   return (
      <header
         className={cn(
            'fixed left-0 right-0 top-0 z-50 h-16',
            'flex items-center justify-between px-4 lg:px-6',
            'theme-bg-primary theme-border-b border-b'
         )}
      >
         {/* Left side */}
         <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
               variant="ghost"
               size="sm"
               className="theme-text-primary hover:theme-bg-secondary lg:hidden"
               onClick={onMobileMenuClick}
            >
               <IconMenu2 className="h-6 w-6" />
            </Button>

            {/* Desktop Sidebar Toggle */}
            <Button
               variant="ghost"
               size="sm"
               className="theme-text-primary hover:theme-bg-secondary hidden lg:flex"
               onClick={onSidebarToggle}
            >
               {isCollapsed ? (
                  <IconChevronRight className="h-5 w-5" />
               ) : (
                  <IconChevronLeft className="h-5 w-5" />
               )}
            </Button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
               <div className="flex items-center">
                  <img 
                     src="/images/projectname-logo.svg" 
                     alt="projectname Logo" 
                     className="h-8 w-auto object-contain"
                  />
               </div>
            </Link>
         </div>

         {/* Right side */}
         <div className="flex items-center gap-4">
            {/* Theme Mode Toggle */}
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
                        {(user?.photo || user?.avatar) ? (
                           <AvatarImage 
                              src={user.photo || user.avatar} 
                              alt={user.name || 'Profile photo'}
                              className="object-cover"
                              onError={(e) => {
                                 console.log('Image failed to load:', user.photo || user.avatar)
                                 // Hide the broken image
                                 e.currentTarget.style.display = 'none'
                              }}
                           />
                        ) : null}
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
                  <DropdownMenuItem className="theme-text-secondary hover:theme-bg-secondary" asChild>
                     <Link href="/profile">
                        <IconUser className="mr-2 h-4 w-4" />
                        Profile
                     </Link>
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
   )
}

export default Navbar
