'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/theme-utils'

interface AppLayoutProps {
   children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
   const [isCollapsed, setIsCollapsed] = useState(false)
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
   const [mounted, setMounted] = useState(false)
   // Theme context available for future enhancements
   useTheme()

   useEffect(() => {
      setMounted(true)
   }, [])

   const handleMobileMenuToggle = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen)
   }

   const handleSidebarToggle = () => {
      setIsCollapsed(!isCollapsed)
   }

   if (!mounted) {
      return (
         <div className="theme-bg-primary flex h-screen w-screen items-center justify-center">
            <div className="animate-pulse">
               <div className="theme-bg-secondary h-8 w-32 rounded"></div>
            </div>
         </div>
      )
   }

   return (
      <div
         className={cn(
            'flex h-screen w-screen flex-col overflow-hidden',
            'theme-bg-secondary'
         )}
      >
         {/* Navbar */}
         <Navbar
            onMobileMenuClick={handleMobileMenuToggle}
            onSidebarToggle={handleSidebarToggle}
            isCollapsed={isCollapsed}
         />

         {/* Main Content Area */}
         <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
               isCollapsed={isCollapsed}
               setIsCollapsed={setIsCollapsed}
               isMobileMenuOpen={isMobileMenuOpen}
               setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Main Content */}
            <main
               className={cn(
                  'flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
                  'theme-bg-secondary w-full pt-16',
                  mounted && isCollapsed
                     ? 'lg:pl-20'
                     : 'lg:pl-64'
               )}
            >
               <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4 lg:p-4 xl:p-6">
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3 }}
                     className={cn(
                        'theme-bg-primary theme-border min-h-full rounded-lg border shadow-sm',
                        'max-w-full mx-auto'
                     )}
                  >
                     <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">{children}</div>
                  </motion.div>
               </div>
            </main>
         </div>
      </div>
   )
}

export default AppLayout
