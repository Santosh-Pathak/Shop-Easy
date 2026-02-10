'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
   Mail,
   Shield,
   Loader2,
   CheckCircle,
   ArrowLeft,
   KeyRound,
} from 'lucide-react'
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
import { useAuthStore } from '@/store/auth.store'
import { AuthService } from '@/services/apis/auth.service'
import { ROUTES } from '@/constants/urls'
import { cn } from '@/lib/theme-utils'
import toast from 'react-hot-toast'

const verifyOTPSchema = z.object({
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

type VerifyOTPFormValues = z.infer<typeof verifyOTPSchema>

interface OTPVerificationFormProps {
   readonly onSuccess?: (email: string) => void
   readonly onBack?: () => void
   readonly className?: string
   readonly type?: 'email-verification' | 'password-reset'
}

export function OTPVerificationForm({
   onSuccess,
   onBack,
   className,
   type = 'password-reset',
}: OTPVerificationFormProps) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const { isLoading, setLoading, setError } = useAuthStore()
   const [isResending, setIsResending] = useState(false)
   const [resendCooldown, setResendCooldown] = useState(0)
   const [isVerified, setIsVerified] = useState(false)

   const emailFromParams = searchParams.get('email') || ''
   const typeFromParams = searchParams.get('type') || type

   const form = useForm<VerifyOTPFormValues>({
      resolver: zodResolver(verifyOTPSchema),
      defaultValues: {
         email: emailFromParams,
         otp: '',
      },
      mode: 'onChange',
   })

   const onSubmit = async (values: VerifyOTPFormValues) => {
      try {
         setLoading(true)
         setError(null)

         await AuthService.verifyOTP({
            email: values.email,
            otp: values.otp,
         })

         setIsVerified(true)
         toast.success('OTP verified successfully!')

         setTimeout(() => {
            if (onSuccess) {
               onSuccess(values.email)
            } else {
               // Navigate to reset password page
               router.push(
                  `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(values.email)}`
               )
            }
         }, 2000)
      } catch (error: any) {
         console.error('OTP verification failed:', error)
         const errorMessage = error.message || 'OTP verification failed. Please try again.'
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setLoading(false)
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
         setError(null)

         if (typeFromParams === 'password-reset') {
            await AuthService.forgotPassword(email)

            toast.success('Verification code sent!')

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
         } else {
            // For email verification
            await AuthService.sendVerificationEmail(email)
            toast.success('Verification code sent!')

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
         }
      } catch (error: any) {
         console.error('Failed to resend OTP:', error)
         const errorMessage = error.message || 'Failed to resend verification code. Please try again.'
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setIsResending(false)
      }
   }

   const handleBack = () => {
      if (onBack) {
         onBack()
      } else if (typeFromParams === 'password-reset') {
         router.push(ROUTES.FORGOT_PASSWORD)
      } else {
         router.back()
      }
   }

   const getTitle = () => {
      return typeFromParams === 'password-reset'
         ? 'Verify Reset Code'
         : 'Verify Your Email'
   }

   const getDescription = () => {
      return typeFromParams === 'password-reset'
         ? "We've sent a 6-digit verification code to your email for password reset."
         : "We've sent a 6-digit verification code to your email address."
   }

   const getIcon = () => {
      return typeFromParams === 'password-reset' ? KeyRound : Shield
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
                  Code Verified!
               </CardTitle>
               <CardDescription className="text-muted-foreground text-center">
                  {typeFromParams === 'password-reset'
                     ? 'Redirecting to password reset...'
                     : 'Your email has been verified. Redirecting...'}
               </CardDescription>
            </CardHeader>
         </Card>
      )
   }

   const Icon = getIcon()

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
               <Icon className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
               {getTitle()}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
               {getDescription()}
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
                           <Icon className="mr-2 h-4 w-4" />
                           Verify Code
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
                  {typeFromParams === 'password-reset'
                     ? 'Back to forgot password'
                     : 'Back'}
               </Button>
            </div>
         </CardContent>
      </Card>
   )
}

export default OTPVerificationForm
