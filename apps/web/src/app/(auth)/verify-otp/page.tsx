'use client'

import OTPVerificationForm from '@/components/auth/OTPVerificationForm'
import AuthLayout from '@/components/auth/AuthLayout'

export default function VerifyOTPPage() {
   return (
      <AuthLayout>
         <OTPVerificationForm />
      </AuthLayout>
   )
}
