'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { IconNetwork } from '@tabler/icons-react'

import { useTheme } from '@/contexts/ThemeContext'

/**
 * Dynamic Loading Component
 * 
 * Features:
 * - Dynamic theme color integration
 * - Smooth animations
 * - Brand consistency
 * - Multiple loading indicators
 */
export default function Loading() {
   const { getCurrentColors, resolvedMode } = useTheme()
   const colors = getCurrentColors()
   const isDark = resolvedMode === 'dark'

   return (
      <div 
         className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
         style={{
            background: isDark
               ? `linear-gradient(135deg, ${colors.primary[950]} 0%, ${colors.secondary[950]} 100%)`
               : `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`
         }}
      >
         {/* Animated Background */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
               animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
               }}
               transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
               }}
               className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full"
               style={{
                  background: `radial-gradient(circle, ${colors.primary[500]}20 0%, transparent 70%)`
               }}
            />
         </div>

         {/* Main Loading Content */}
         <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Logo with Pulse Animation */}
            <motion.div
               animate={{
                  scale: [1, 1.1, 1],
               }}
               transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
               }}
               className="relative"
            >
               <div 
                  className="p-6 rounded-2xl"
                  style={{ backgroundColor: colors.primary[600] + '20' }}
               >
                  <IconNetwork 
                     className="w-16 h-16" 
                     style={{ color: colors.primary[600] }}
                  />
               </div>
               
               {/* Ripple Effect */}
               <motion.div
                  animate={{
                     scale: [1, 2.5],
                     opacity: [0.5, 0],
                  }}
                  transition={{
                     duration: 2,
                     repeat: Infinity,
                     ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-2xl"
                  style={{ 
                     border: `2px solid ${colors.primary[500]}`,
                     borderRadius: '1rem'
                  }}
               />
            </motion.div>

            {/* Loading Text */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="text-center space-y-2"
            >
               <h2 className="text-2xl font-bold theme-text-primary">
                  projectname
               </h2>
               <p className="theme-text-secondary">
                  Loading your telecom experience...
               </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-64 h-1 rounded-full overflow-hidden"
               style={{ backgroundColor: colors.primary[200] }}
            >
               <motion.div
                  animate={{
                     x: ["-100%", "100%"],
                  }}
                  transition={{
                     duration: 1.5,
                     repeat: Infinity,
                     ease: "easeInOut"
                  }}
                  className="h-full w-1/3 rounded-full"
                  style={{ 
                     background: `linear-gradient(90deg, transparent, ${colors.primary[500]}, transparent)`
                  }}
               />
            </motion.div>

            {/* Floating Dots */}
            <div className="flex space-x-2">
               {[0, 1, 2].map((index) => (
                  <motion.div
                     key={index}
                     animate={{
                        y: [-10, 10, -10],
                     }}
                     transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                     }}
                     className="w-3 h-3 rounded-full"
                     style={{ backgroundColor: colors.secondary[500] }}
                  />
               ))}
            </div>
         </div>
      </div>
   )
}