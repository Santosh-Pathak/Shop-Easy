'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
   IconArrowLeft, 
   IconHome, 
   IconRefresh, 
   IconBug,
   IconTool,
   IconSearch,
   IconMail
} from '@tabler/icons-react'

import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/theme-utils'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/urls'

/**
 * Enhanced 404 Not Found Page
 * 
 * Features:
 * - Dynamic theme color integration
 * - Animated elements
 * - Multiple navigation options
 * - Role-based dashboard redirect
 * - Development status indicator
 * - Responsive design
 */
export default function NotFound() {
   const router = useRouter()
   const { getCurrentColors, resolvedMode } = useTheme()
   const { isAuthenticated, user } = useAuth()
   const colors = getCurrentColors()
   const isDark = resolvedMode === 'dark'
   
   const [mounted, setMounted] = useState(false)

   useEffect(() => {
      setMounted(true)
   }, [])

   const handleGoBack = () => {
      if (window.history.length > 1) {
         router.back()
      } else {
         router.push(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN)
      }
   }

   const handleRefresh = () => {
      window.location.reload()
   }

   if (!mounted) {
      return (
         <div className="min-h-screen flex items-center justify-center theme-bg-primary">
            <div className="animate-pulse">
               <div className="theme-bg-secondary h-8 w-32 rounded"></div>
            </div>
         </div>
      )
   }

   return (
      <div 
         className="min-h-screen flex flex-col items-center justify-center px-4 py-8 theme-bg-primary"
         style={{
            background: isDark
               ? `linear-gradient(135deg, ${colors.primary[950]} 0%, ${colors.secondary[950]} 100%)`
               : `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`
         }}
      >
         {/* Animated Background Elements */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
               animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
               }}
               transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
               }}
               className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
               style={{
                  background: `radial-gradient(circle, ${colors.primary[500]}20 0%, transparent 70%)`
               }}
            />
            <motion.div
               animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.1, 0.2, 0.1],
               }}
               transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
               }}
               className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
               style={{
                  background: `radial-gradient(circle, ${colors.secondary[500]}20 0%, transparent 70%)`
               }}
            />
         </div>

         {/* Main Content */}
         <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            {/* 404 Number with Animation */}
            <motion.div
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8, ease: "backOut" }}
               className="relative"
            >
               <h1 
                  className="text-8xl md:text-9xl font-bold tracking-tight"
                  style={{ 
                     backgroundImage: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.secondary[500]})`,
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text'
                  }}
               >
                  404
               </h1>
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4"
               >
                  <IconTool 
                     className="w-12 h-12 md:w-16 md:h-16"
                     style={{ color: colors.warning[500] }}
                  />
               </motion.div>
            </motion.div>

            {/* Title and Description */}
            <motion.div
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="space-y-4"
            >
               <h2 className="text-3xl md:text-4xl font-bold theme-text-primary">
                  Oops! Page Under Development
               </h2>
               <p className="text-lg md:text-xl theme-text-secondary max-w-lg mx-auto leading-relaxed">
                  The page you're looking for is currently under construction. 
                  We're working hard to bring you amazing new features!
               </p>
            </motion.div>

            {/* Development Status Badge */}
            <motion.div
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.5, delay: 0.6 }}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
               style={{
                  backgroundColor: isDark ? colors.warning[700] + '40' : colors.warning[50],
                  borderColor: colors.warning[500],
                  color: colors.warning[600]
               }}
            >
               <IconBug className="w-4 h-4" />
               <span className="text-sm font-medium">Under Development</span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 0.9 }}
               className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
               <Button
                  onClick={handleGoBack}
                  className="group flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 min-w-[160px]"
                  style={{
                     backgroundColor: colors.primary[600],
                     boxShadow: `0 4px 20px ${colors.primary[500]}40`
                  }}
                  onMouseEnter={(e) => {
                     e.currentTarget.style.backgroundColor = colors.primary[700]
                  }}
                  onMouseLeave={(e) => {
                     e.currentTarget.style.backgroundColor = colors.primary[600]
                  }}
               >
                  <IconArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Go Back
               </Button>

               {isAuthenticated && (
                  <Link href={ROUTES.DASHBOARD}>
                     <Button
                        className="group flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 min-w-[160px]"
                        variant="outline"
                        style={{
                           borderColor: colors.secondary[500],
                           color: colors.secondary[600]
                        }}
                        onMouseEnter={(e) => {
                           e.currentTarget.style.backgroundColor = colors.secondary[100]
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                     >
                        <IconHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Dashboard
                     </Button>
                  </Link>
               )}

               <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  className="group flex items-center gap-2 px-6 py-3 theme-text-muted hover:theme-text-primary transition-all duration-200 hover:scale-105 active:scale-95"
               >
                  <IconRefresh className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh
               </Button>
            </motion.div>

            {/* Additional Help Section */}
            <motion.div
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 1.2 }}
               className="pt-8 border-t theme-border"
            >
               <h3 className="text-lg font-semibold theme-text-primary mb-4">
                  Need Help?
               </h3>
               <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                  <Link 
                     href="/help" 
                     className="flex items-center gap-2 theme-text-secondary hover:theme-text-primary transition-colors"
                  >
                     <IconSearch className="w-4 h-4" />
                     Search Help Center
                  </Link>
                  <span className="hidden sm:block theme-text-muted">•</span>
                  <Link 
                     href="/contact" 
                     className="flex items-center gap-2 theme-text-secondary hover:theme-text-primary transition-colors"
                  >
                     <IconMail className="w-4 h-4" />
                     Contact Support
                  </Link>
               </div>
            </motion.div>

            {/* User Info (if authenticated) */}
            {isAuthenticated && user && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 }}
                  className="pt-4 text-xs theme-text-muted"
               >
                  Logged in as: {user.name} ({user.role})
               </motion.div>
            )}
         </div>

         {/* Footer */}
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="absolute bottom-4 left-0 right-0 text-center"
         >
            <p className="text-sm theme-text-muted">
               projectname &copy; {new Date().getFullYear()} | Building the Future of Telecom
            </p>
         </motion.div>
      </div>
   )
}