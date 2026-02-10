'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/theme-utils'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'

interface AuthLayoutProps {
   readonly children: ReactNode
   readonly className?: string
   readonly showThemeToggle?: boolean
}

export function AuthLayout({
   children,
   className,
   showThemeToggle = true,
}: AuthLayoutProps) {
   return (
      <div
         className={cn(
            // Base layout
            'flex min-h-screen flex-col',
            // Theme-aware background
            'theme-bg-secondary',
            // Mobile optimizations
            'px-4 py-6',
            // Tablet and desktop
            'sm:px-6 lg:px-8',
            className
         )}
      >
         {/* Theme toggle - positioned absolutely on larger screens, inline on mobile */}
         {showThemeToggle && (
            <div
               className={cn(
                  // Mobile: show at top
                  'mb-4 flex justify-end',
                  // Desktop: fixed position
                  'lg:fixed lg:top-6 lg:right-6 lg:mb-0'
               )}
            >
               <ThemeModeToggle variant="button" size="sm" />
            </div>
         )}

         {/* Main content area */}
         <div
            className={cn(
               // Flex grow to center content
               'flex flex-1 items-center justify-center',
               // Mobile spacing adjustment when theme toggle is inline
               showThemeToggle ? 'lg:mt-0' : ''
            )}
         >
            <div
               className={cn(
                  // Base container
                  'w-full',
                  // Mobile: full width with padding
                  'max-w-sm px-2',
                  // Tablet: slightly larger
                  'sm:max-w-md sm:px-0',
                  // Desktop: optimal form width
                  'lg:max-w-lg'
               )}
            >
               {children}
            </div>
         </div>

         {/* Footer space for mobile keyboards */}
         <div className="h-16 lg:h-0" />
      </div>
   )
}

export default AuthLayout
