'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignupPage } from '@/components/auth/SignupPage'
import SignupForm from '@/components/auth/SignupForm'
import EmailVerificationForm from '@/components/auth/EmailVerificationForm'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { IconNetwork } from '@tabler/icons-react'
import { cn } from '@/lib/theme-utils'

export default function RegisterPage() {
   const router = useRouter()
   const [currentStep, setCurrentStep] = useState<'signup' | 'verify-email'>(
      'signup'
   )
   const [userEmail, setUserEmail] = useState('')

   const handleSignupSuccess = (email: string) => {
      setUserEmail(email)
      setCurrentStep('verify-email')
   }

   const handleVerificationSuccess = () => {
      router.push('/login?verified=true')
   }

   const handleBackToSignup = () => {
      setCurrentStep('signup')
      setUserEmail('')
   }

   // If showing signup form, use the full SignupPage layout
   if (currentStep === 'signup') {
      return <SignupPage onSuccess={handleSignupSuccess} />
   }

   // For email verification, use a simplified centered layout
   return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
         <div className="w-full max-w-sm sm:max-w-md">
            {/* Theme Mode Toggle */}
            <div className="mb-6 flex justify-end">
               <ThemeModeToggle variant="button" size="sm" />
            </div>

            {/* Mobile Logo */}
            <div className="mb-8 flex flex-col items-center text-center">
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

            <EmailVerificationForm
               onSuccess={handleVerificationSuccess}
               onBack={handleBackToSignup}
               className={cn(
                  'transform transition-all duration-300 ease-in-out',
                  'animate-in slide-in-from-right-4'
               )}
            />
         </div>
      </div>
   )
}
