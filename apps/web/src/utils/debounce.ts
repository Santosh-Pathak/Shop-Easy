/**
 * Debounce utility function to limit the rate at which a function can fire.
 * This is particularly useful for search inputs, API calls, and window resize events.
 *
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @param immediate - Whether to trigger the function on the leading edge instead of trailing
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
   func: T,
   delay: number,
   immediate: boolean = false
): (...args: Parameters<T>) => void {
   let timeoutId: NodeJS.Timeout | null = null
   let lastCallTime = 0

   return function debounced(...args: Parameters<T>) {
      const now = Date.now()

      // Clear existing timeout
      if (timeoutId) {
         clearTimeout(timeoutId)
      }

      // Handle immediate execution
      if (immediate && now - lastCallTime > delay) {
         lastCallTime = now
         func(...args)
         return
      }

      // Set new timeout
      timeoutId = setTimeout(() => {
         lastCallTime = Date.now()
         func(...args)
         timeoutId = null
      }, delay)
   }
}

/**
 * Creates a debounced version of a function that also cancels the previous call
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns Object with debounced function and cancel method
 */
export function debouncedWithCancel<T extends (...args: any[]) => any>(
   func: T,
   delay: number
): {
   debounced: (...args: Parameters<T>) => void
   cancel: () => void
   flush: () => void
} {
   let timeoutId: NodeJS.Timeout | null = null
   let lastArgs: Parameters<T> | null = null

   const cancel = () => {
      if (timeoutId) {
         clearTimeout(timeoutId)
         timeoutId = null
      }
   }

   const flush = () => {
      if (timeoutId && lastArgs) {
         cancel()
         func(...lastArgs)
      }
   }

   const debounced = (...args: Parameters<T>) => {
      lastArgs = args
      cancel()

      timeoutId = setTimeout(() => {
         func(...args)
         timeoutId = null
      }, delay)
   }

   return { debounced, cancel, flush }
}

/**
 * Hook for using debounced values in React components
 */
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
   const [debouncedValue, setDebouncedValue] = useState<T>(value)

   useEffect(() => {
      const handler = setTimeout(() => {
         setDebouncedValue(value)
      }, delay)

      return () => {
         clearTimeout(handler)
      }
   }, [value, delay])

   return debouncedValue
}

/**
 * Hook for creating a debounced callback function
 */
import { useCallback, useRef } from 'react'

export function useDebounceCallback<T extends (...args: any[]) => any>(
   callback: T,
   delay: number,
   deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
   const timeoutRef = useRef<NodeJS.Timeout | null>(null)

   return useCallback(
      (...args: Parameters<T>) => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
         }

         timeoutRef.current = setTimeout(() => {
            callback(...args)
         }, delay)
      },
      [callback, delay, ...deps]
   )
}

/**
 * Throttle function - ensures function is called at most once per interval
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
   func: T,
   limit: number
): (...args: Parameters<T>) => void {
   let inThrottle: boolean = false

   return function throttled(...args: Parameters<T>) {
      if (!inThrottle) {
         func(...args)
         inThrottle = true
         setTimeout(() => {
            inThrottle = false
         }, limit)
      }
   }
}

/**
 * Hook for using throttled values in React components
 */
export function useThrottle<T>(value: T, limit: number): T {
   const [throttledValue, setThrottledValue] = useState<T>(value)
   const lastRan = useRef<number>(Date.now())

   useEffect(() => {
      const handler = setTimeout(
         () => {
            if (Date.now() - lastRan.current >= limit) {
               setThrottledValue(value)
               lastRan.current = Date.now()
            }
         },
         limit - (Date.now() - lastRan.current)
      )

      return () => {
         clearTimeout(handler)
      }
   }, [value, limit])

   return throttledValue
}

// Export default debounce for backward compatibility
export default debounce
