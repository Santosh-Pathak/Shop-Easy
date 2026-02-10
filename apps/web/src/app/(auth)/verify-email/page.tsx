'use client'

import EmailVerificationForm from '@/components/auth/EmailVerificationForm'
import AuthLayout from '@/components/auth/AuthLayout'

export default function VerifyEmailPage() {
   return (
      <AuthLayout>
         <EmailVerificationForm />
      </AuthLayout>
   )
}
