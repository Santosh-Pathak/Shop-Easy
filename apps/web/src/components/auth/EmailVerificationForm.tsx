'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Shield, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from '@/components/ui/card'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import AuthService from '@/services/apis/auth.service'
import { authSelectors } from '@/store/auth.store'
import { ROUTES } from '@/constants/urls'
import { cn } from '@/lib/theme-utils'
import { showSuccessToast, showErrorToast } from '@/utils/error'

const verifyEmailSchema = z.object({
   email: z
      .string()
      .min(1, 'Email is required')
      .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
         message: 'Please enter a valid email address',
      }),
   otp: z
      .string()
      .min(6, 'OTP must be 6 digits')
      .max(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only numbers'),
})

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>

interface EmailVerificationFormProps {
   readonly onSuccess?: () => void
   readonly onBack?: () => void
   readonly className?: string
}

export function EmailVerificationForm({
   onSuccess,
   onBack,
   className,
}: EmailVerificationFormProps) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const isLoading = authSelectors.isLoading()
   const [isResending, setIsResending] = useState(false)
   const [resendCooldown, setResendCooldown] = useState(0)
   const [isVerified, setIsVerified] = useState(false)

   const emailFromParams = searchParams.get('email') || ''

   const form = useForm<VerifyEmailFormValues>({
      resolver: zodResolver(verifyEmailSchema),
      defaultValues: {
         email: emailFromParams,
         otp: '',
      },
      mode: 'onChange',
   })

   const onSubmit = async (values: VerifyEmailFormValues) => {
      try {
         await AuthService.verifyEmail(values)

         setIsVerified(true)
         showSuccessToast('Email verified successfully!')

         setTimeout(() => {
            if (onSuccess) {
               onSuccess()
            } else {
               router.push(ROUTES.LOGIN)
            }
         }, 2000)
      } catch (error: any) {
         console.error('Email verification failed:', error)
         const errorMessage = error?.message || 'Email verification failed. Please try again.'
         showErrorToast(errorMessage)
      }
   }

   const handleResendOTP = async () => {
      const email = form.getValues('email')
      if (!email) {
         form.setError('email', { message: 'Please enter your email first' })
         return
      }

      try {
         setIsResending(true)
         await AuthService.sendVerificationEmail(email)

         showSuccessToast('Verification email sent!')

         // Set cooldown for 10 seconds
         setResendCooldown(10)
         const timer = setInterval(() => {
            setResendCooldown((prev) => {
               if (prev <= 1) {
                  clearInterval(timer)
                  return 0
               }
               return prev - 1
            })
         }, 1000)
      } catch (error: any) {
         console.error('Failed to resend OTP:', error)
         const errorMessage = error?.message || 'Failed to resend verification email. Please try again.'
         showErrorToast(errorMessage)
      } finally {
         setIsResending(false)
      }
   }

   const handleBack = () => {
      if (onBack) {
         onBack()
      } else {
         router.back()
      }
   }

   if (isVerified) {
      return (
         <Card
            className={cn(
               'mx-auto w-full max-w-md border-0 shadow-lg',
               'bg-white/95 backdrop-blur-sm dark:bg-gray-900/95',
               className
            )}
         >
            <CardHeader className="space-y-1 pb-6">
               <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
               </div>
               <CardTitle className="text-center text-2xl font-bold text-green-600 dark:text-green-400">
                  Email Verified!
               </CardTitle>
               <CardDescription className="text-muted-foreground text-center">
                  Your email has been successfully verified. Redirecting to
                  login...
               </CardDescription>
            </CardHeader>
         </Card>
      )
   }

   return (
      <Card
         className={cn(
            'mx-auto w-full max-w-md border-0 shadow-lg',
            'bg-white/95 backdrop-blur-sm dark:bg-gray-900/95',
            className
         )}
      >
         <CardHeader className="space-y-1 pb-6">
            <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
               <Shield className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
               Verify Your Email
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
               We&apos;ve sent a 6-digit verification code to your email
               address. Please enter it below.
            </CardDescription>
         </CardHeader>

         <CardContent className="space-y-4">
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
               >
                  {/* Email Field */}
                  <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-sm font-medium">
                              Email Address
                           </FormLabel>
                           <FormControl>
                              <div className="relative">
                                 <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                 <Input
                                    {...field}
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-11 pl-10"
                                    disabled={isLoading || !!emailFromParams}
                                 />
                              </div>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* OTP Field */}
                  <FormField
                     control={form.control}
                     name="otp"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-sm font-medium">
                              Verification Code
                           </FormLabel>
                           <FormControl>
                              <Input
                                 {...field}
                                 type="text"
                                 placeholder="Enter 6-digit code"
                                 className="h-11 text-center text-lg tracking-widest"
                                 maxLength={6}
                                 disabled={isLoading}
                                 onChange={(e) => {
                                    const value = e.target.value.replace(
                                       /\D/g,
                                       ''
                                    )
                                    field.onChange(value)
                                 }}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Resend OTP Button */}
                  <div className="text-center">
                     <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOTP}
                        disabled={
                           isResending || resendCooldown > 0 || isLoading
                        }
                        className="text-primary hover:underline"
                     >
                        {(() => {
                           if (isResending) {
                              return (
                                 <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                 </>
                              )
                           }
                           if (resendCooldown > 0) {
                              return `Resend code in ${resendCooldown}s`
                           }
                           return "Didn't receive the code? Resend"
                        })()}
                     </Button>
                  </div>

                  {/* Submit Button */}
                  <Button
                     type="submit"
                     className="h-11 w-full font-medium"
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Verifying...
                        </>
                     ) : (
                        <>
                           <Shield className="mr-2 h-4 w-4" />
                           Verify Email
                        </>
                     )}
                  </Button>
               </form>
            </Form>

            {/* Back Button */}
            <div className="border-t pt-4 text-center">
               <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground"
               >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to signup
               </Button>
            </div>
         </CardContent>
      </Card>
   )
}

export default EmailVerificationForm
