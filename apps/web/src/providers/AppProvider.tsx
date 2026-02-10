'use client'

import React, { useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'

interface AppProviderProps {
   children: ReactNode
}

/**
 * Main application provider using Zustand
 * Replaces Redux Provider with simpler Zustand setup
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
   const { setInitialized, isInitialized } = useAuthStore()

   useEffect(() => {
      // Initialize the app
      const initializeApp = async () => {
         try {
            // The Zustand store with persistence will automatically
            // rehydrate and validate tokens from cookies/localStorage
            
            // Mark as initialized after rehydration
            if (!isInitialized) {
               setInitialized(true)
            }
         } catch (error) {
            console.error('App initialization failed:', error)
            setInitialized(true) // Still mark as initialized to avoid infinite loading
         }
      }

      initializeApp()
   }, [setInitialized, isInitialized])

   return (
      <>
         {children}
      </>
   )
}

export default AppProvider