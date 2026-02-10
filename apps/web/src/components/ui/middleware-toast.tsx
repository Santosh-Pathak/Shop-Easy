'use client'

import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

/**
 * Component to handle toast messages from middleware headers
 * This runs on the client side to show toast messages for route protection
 */
export function MiddlewareToastHandler() {
   useEffect(() => {
      // Check for middleware toast headers
      const checkForToastHeaders = () => {
         if (typeof window !== 'undefined') {
            // Get any pending toast messages from sessionStorage
            // (middleware can't directly trigger client-side toasts)
            const pendingToast = sessionStorage.getItem('middleware-toast')
            
            if (pendingToast) {
               try {
                  const { message, type } = JSON.parse(pendingToast)
                  
                  switch (type) {
                     case 'error':
                        toast.error(message, {
                           duration: 5000,
                           position: 'top-center',
                        })
                        break
                     case 'warning':
                        toast(message, {
                           icon: '⚠️',
                           duration: 5000,
                           position: 'top-center',
                           style: {
                              background: '#f59e0b',
                              color: 'white',
                           },
                        })
                        break
                     case 'info':
                        toast(message, {
                           icon: 'ℹ️',
                           duration: 4000,
                           position: 'top-center',
                           style: {
                              background: '#3b82f6',
                              color: 'white',
                           },
                        })
                        break
                     default:
                        toast.error(message)
                  }
                  
                  // Clear the pending toast
                  sessionStorage.removeItem('middleware-toast')
               } catch (error) {
                  console.error('Error parsing middleware toast:', error)
                  sessionStorage.removeItem('middleware-toast')
               }
            }
         }
      }

      // Check immediately
      checkForToastHeaders()

      // Also check on navigation events
      const handleNavigation = () => {
         setTimeout(checkForToastHeaders, 100)
      }

      // Listen for navigation changes
      window.addEventListener('popstate', handleNavigation)
      
      // For Next.js app router navigation
      const handleRouteChange = () => {
         setTimeout(checkForToastHeaders, 100)
      }

      // Listen for route changes if Next.js router is available
      if (typeof window !== 'undefined' && window.history) {
         const originalPushState = window.history.pushState
         const originalReplaceState = window.history.replaceState

         window.history.pushState = function(...args) {
            originalPushState.apply(window.history, args)
            handleRouteChange()
         }

         window.history.replaceState = function(...args) {
            originalReplaceState.apply(window.history, args)
            handleRouteChange()
         }

         return () => {
            window.history.pushState = originalPushState
            window.history.replaceState = originalReplaceState
            window.removeEventListener('popstate', handleNavigation)
         }
      }

      return () => {
         window.removeEventListener('popstate', handleNavigation)
      }
   }, [])

   return null
}

/**
 * Utility function to set toast message for middleware redirects
 * Call this before navigation to show toast after redirect
 */
export function setMiddlewareToast(message: string, type: 'error' | 'warning' | 'info' = 'error') {
   if (typeof window !== 'undefined') {
      sessionStorage.setItem('middleware-toast', JSON.stringify({ message, type }))
   }
}