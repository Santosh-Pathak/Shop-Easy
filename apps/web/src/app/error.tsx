'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
   IconRefresh, 
   IconHome, 
   IconBug,
   IconAlertTriangle
} from '@tabler/icons-react'

import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/theme-utils'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/urls'

interface ErrorBoundaryProps {
   error: Error & { digest?: string }
   reset: () => void
}

/**
 * Enhanced Error Boundary Component
 * 
 * Features:
 * - Dynamic theme integration
 * - Error reporting
 * - Multiple recovery options
 * - User-friendly messaging
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
   const { getCurrentColors, resolvedMode } = useTheme()
   const { isAuthenticated } = useAuth()
   const colors = getCurrentColors()
   const isDark = resolvedMode === 'dark'

   const handleReportError = () => {
      // In a real app, send error to logging service
      console.error('Error reported:', error)
      
      // Could integrate with services like Sentry, LogRocket, etc.
      if (typeof window !== 'undefined') {
         const errorData = {
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
         }
         
         // Mock error reporting - replace with actual service
         console.log('Error report data:', errorData)
      }
   }

   return (
      <div 
         className="min-h-screen flex flex-col items-center justify-center px-4 py-8 theme-bg-primary"
         style={{
            background: isDark
               ? `linear-gradient(135deg, ${colors.error[700]} 0%, ${colors.primary[700]} 100%)`
               : `linear-gradient(135deg, ${colors.error[50]} 0%, ${colors.primary[50]} 100%)`
         }}
      >
         {/* Animated Background Elements */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
               animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1],
               }}
               transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
               }}
               className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full"
               style={{
                  background: `radial-gradient(circle, ${colors.error[500]}20 0%, transparent 70%)`
               }}
            />
         </div>

         {/* Main Content */}
         <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
            {/* Error Icon */}
            <motion.div
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.8, ease: "backOut" }}
               className="flex justify-center"
            >
               <div 
                  className="p-6 rounded-full"
                  style={{ backgroundColor: colors.error[500] + '20' }}
               >
                  <IconAlertTriangle 
                     className="w-16 h-16 md:w-20 md:h-20"
                     style={{ color: colors.error[500] }}
                  />
               </div>
            </motion.div>

            {/* Title and Description */}
            <motion.div
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="space-y-4"
            >
               <h1 className="text-3xl md:text-4xl font-bold theme-text-primary">
                  Oops! Something went wrong
               </h1>
               <p className="text-lg theme-text-secondary max-w-lg mx-auto leading-relaxed">
                  We encountered an unexpected error. Don't worry, we're working to fix it. 
                  Try refreshing the page or go back to continue using the app.
               </p>
            </motion.div>

            {/* Error Details (in development) */}
            {process.env.NODE_ENV === 'development' && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="p-4 rounded-lg theme-bg-secondary theme-border border max-w-lg mx-auto"
               >
                  <h3 className="text-sm font-semibold theme-text-primary mb-2">
                     Development Error Details:
                  </h3>
                  <p className="text-xs theme-text-muted font-mono break-all">
                     {error.message}
                  </p>
                  {error.digest && (
                     <p className="text-xs theme-text-muted mt-1">
                        Error ID: {error.digest}
                     </p>
                  )}
               </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.6, delay: 0.9 }}
               className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
               <Button
                  onClick={reset}
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
                  <IconRefresh className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  Try Again
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
                        Go to Dashboard
                     </Button>
                  </Link>
               )}

               <Button
                  onClick={handleReportError}
                  variant="ghost"
                  className="group flex items-center gap-2 px-6 py-3 theme-text-muted hover:theme-text-primary transition-all duration-200 hover:scale-105 active:scale-95"
               >
                  <IconBug className="w-5 h-5" />
                  Report Error
               </Button>
            </motion.div>

            {/* Help Text */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 0.6, delay: 1.2 }}
               className="pt-6 text-sm theme-text-muted"
            >
               If this problem continues, please contact our support team.
            </motion.div>
         </div>
      </div>
   )
}