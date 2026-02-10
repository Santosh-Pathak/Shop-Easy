'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { SignupForm } from './SignupForm'
import { cn } from '@/lib/theme-utils'
import { IconNetwork, IconShield, IconCheck } from '@tabler/icons-react'

/**
 * Simplified Signup Page - Full Screen Responsive
 *
 * Features:
 * - Clean, minimal design matching login page
 * - Full screen height and width
 * - Responsive for mobile, tablet, desktop, and XL screens
 * - Theme-aware design
 * - No unnecessary scrolling
 */
interface SignupPageProps {
   readonly onSuccess?: (email: string) => void
}

export function SignupPage({ onSuccess }: SignupPageProps) {
   const { mode } = useTheme()
   const isDark = mode === 'dark'

   return (
      <div className="min-h-screen w-full flex">
         {/* Left Side - Brand/Hero Section (Hidden on mobile) */}
         <div className="relative hidden overflow-hidden md:flex md:w-1/2 lg:w-3/5">
            {/* Background with gradient */}
            <div
               className={cn(
                  'absolute inset-0 bg-gradient-to-br',
                  isDark
                     ? 'from-[var(--primary-900)] via-[var(--primary-800)] to-[var(--secondary-900)]'
                     : 'from-[var(--primary-600)] via-[var(--primary-700)] to-[var(--secondary-600)]'
               )}
            >
               {/* Overlay pattern */}
               <div className="absolute inset-0 bg-black/10" />
               <div
                  className="absolute inset-0 opacity-10"
                  style={{
                     backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  }}
               />
            </div>

            {/* Centered Content */}
            <div className="relative z-10 flex flex-col items-center justify-center p-8 text-white text-center">
               {/* Logo and Brand */}
               <div className="mb-12">
                  <div className="mb-6 flex items-center justify-center gap-3">
                     <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                        <IconNetwork className="h-8 w-8 text-white" />
                     </div>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">projectname</h1>
                  <p className="text-xl text-white/90 max-w-md">
                     Join Our Growing Network
                  </p>
                  <p className="text-lg text-white/80 mt-4 max-w-lg">
                     Create your account and start accessing enterprise-grade 
                     telecom services trusted by thousands of businesses worldwide.
                  </p>
               </div>

               {/* Key Benefits */}
               <div className="grid grid-cols-1 gap-6 max-w-md">
                  <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                     <IconNetwork className="h-8 w-8 mx-auto mb-3 text-white" />
                     <h3 className="text-lg font-semibold mb-2">Instant Access</h3>
                     <p className="text-sm text-white/80">Get immediate access to our full suite of telecom services</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                     <IconShield className="h-8 w-8 mx-auto mb-3 text-white" />
                     <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
                     <p className="text-sm text-white/80">Enterprise-grade security with 99.9% uptime guarantee</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                     <IconCheck className="h-8 w-8 mx-auto mb-3 text-white" />
                     <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                     <p className="text-sm text-white/80">Round-the-clock technical support from our specialists</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side - Signup Form */}
         <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8 md:w-1/2 lg:w-2/5 min-h-screen">
            <div className="w-full max-w-sm sm:max-w-md">
               {/* Theme Mode Toggle */}
               <div className="mb-6 flex justify-end">
                  <ThemeModeToggle variant="button" size="sm" />
               </div>

               {/* Mobile Logo */}
               <div className="mb-8 flex flex-col items-center text-center md:hidden">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--interactive-primary)] mb-4">
                     <IconNetwork className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="theme-text-primary text-2xl font-bold mb-2">
                     projectname
                  </h1>
                  <p className="theme-text-secondary text-sm">
                     Professional Telecom Solutions
                  </p>
               </div>

               {/* Signup Form */}
               <div className="space-y-6">
                  <div className="text-center md:text-left">
                     <h2 className="theme-text-primary mb-2 text-2xl sm:text-3xl font-bold">
                        Create Account
                     </h2>
                     <p className="theme-text-secondary text-sm sm:text-base">
                        Join thousands of businesses using our telecom solutions
                     </p>
                  </div>

                  <SignupForm onSuccess={onSuccess} />

                  {/* Login Link */}
                  <div className="pt-4 text-center">
                     <p className="theme-text-secondary text-sm">
                        Already have an account?{' '}
                        <Link
                           href="/login"
                           className="font-medium text-[var(--interactive-primary)] transition-colors hover:text-[var(--interactive-primary-hover)]"
                        >
                           Sign in here
                        </Link>
                     </p>
                  </div>

                  {/* Trust Indicators */}
                  <div className="theme-border border-t pt-6">
                     <div className="theme-text-muted flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
                        <div className="flex items-center gap-1">
                           <IconShield className="h-4 w-4" />
                           <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <IconCheck className="h-4 w-4" />
                           <span>ISO Certified</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <IconNetwork className="h-4 w-4" />
                           <span>Enterprise-Grade</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}