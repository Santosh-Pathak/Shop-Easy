'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

/**
 * Hook to handle toast messages from URL parameters
 * This is used when middleware needs to show messages after redirects
 */
export function useMiddlewareToast() {
   const searchParams = useSearchParams()

   useEffect(() => {
      const toastMessage = searchParams.get('toast')
      const toastType = searchParams.get('toastType') || 'error'

      if (toastMessage) {
         switch (toastType) {
            case 'error':
               toast.error(decodeURIComponent(toastMessage), {
                  duration: 5000,
                  position: 'top-center',
               })
               break
            case 'warning':
               toast(decodeURIComponent(toastMessage), {
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
               toast(decodeURIComponent(toastMessage), {
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
               toast.error(decodeURIComponent(toastMessage))
         }

         // Clean up URL parameters after showing toast
         if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.delete('toast')
            url.searchParams.delete('toastType')
            window.history.replaceState({}, '', url.toString())
         }
      }
   }, [searchParams])
}

/**
 * Component wrapper for the toast hook
 */
export function MiddlewareToastProvider({ children }: { children: React.ReactNode }) {
   useMiddlewareToast()
   return <>{children}</>
}