'use client'

import React from 'react'
import { useAuthStore } from '@/store/auth.store'
import { AppProvider } from '@/providers/AppProvider'

// Loading component for app initialization
const AppLoading = () => (
   <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
         <p className="text-gray-600 text-lg">Initializing application...</p>
      </div>
   </div>
)

interface AppWrapperProps {
   children: React.ReactNode
}

/**
 * App wrapper that handles initialization and provides global context
 */
export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
   return (
      <AppProvider>
         <AppInitializer>
            {children}
         </AppInitializer>
      </AppProvider>
   )
}

/**
 * Component that waits for app initialization before rendering children
 */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
   const { isInitialized, isLoading } = useAuthStore()

   // Show loading screen until app is initialized
   if (!isInitialized || isLoading) {
      return <AppLoading />
   }

   return <>{children}</>
}

export default AppWrapper