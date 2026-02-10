'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, KeyRound, Loader2, ArrowLeft, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

const forgotPasswordSchema = z.object({
   email: z
      .string()
      .min(1, 'Email is required')
      .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
         message: 'Please enter a valid email address',
      }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
   readonly onSuccess?: (email: string) => void
   readonly onBack?: () => void
   readonly className?: string
}

export function ForgotPasswordForm({
   onSuccess,
   onBack,
   className,
}: ForgotPasswordFormProps) {
   const router = useRouter()
   const { isLoading, setLoading, setError } = useAuthStore()
   const [emailSent, setEmailSent] = useState(false)
   const [sentEmail, setSentEmail] = useState('')
   const [resendCooldown, setResendCooldown] = useState(0)

   const form = useForm<ForgotPasswordFormValues>({
      resolver: zodResolver(forgotPasswordSchema),
      defaultValues: {
         email: '',
      },
      mode: 'onChange',
   })

   const onSubmit = async (data: ForgotPasswordFormValues) => {
      try {
         setLoading(true)
         setError(null)

         await AuthService.forgotPassword(data.email)

         // Save email to localStorage for next step
         localStorage.setItem('resetEmail', data.email)

         toast.success('Password reset code sent successfully!')
         setEmailSent(true)
         setSentEmail(data.email)

         // Start countdown
         setResendCooldown(10)
         const interval = setInterval(() => {
            setResendCooldown((prev) => {
               if (prev <= 1) {
                  clearInterval(interval)
                  return 0
               }
               return prev - 1
            })
         }, 1000)

         if (onSuccess) {
            onSuccess(data.email)
         }
      } catch (error: any) {
         console.error('Forgot password error:', error)
         const errorMessage = error.message || 'Password reset request failed. Please try again.'
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   const handleBack = () => {
      if (onBack) {
         onBack()
      } else {
         router.push(ROUTES.LOGIN)
      }
   }

   const handleGoToVerifyOTP = () => {
      router.push(
         `/verify-otp?email=${encodeURIComponent(sentEmail)}&type=password-reset`
      )
   }

   const handleResendEmail = async () => {
      try {
         setLoading(true)
         setError(null)

         await AuthService.forgotPassword(sentEmail)

         toast.success('Password reset email sent again!')

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
         console.error('Failed to resend email:', error)
         const errorMessage = error.message || 'Failed to resend email. Please try again.'
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   if (emailSent) {
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
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
               </div>
               <CardTitle className="text-center text-2xl font-bold">
                  Check Your Email
               </CardTitle>
               <CardDescription className="text-muted-foreground text-center">
                  We've sent a password reset link and verification code to{' '}
                  <span className="text-foreground font-medium">
                     {sentEmail}
                  </span>
               </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
               <div className="space-y-4 text-center">
                  <p className="text-muted-foreground text-sm">
                     Please check your email and click the reset link or use the
                     verification code to continue.
                  </p>

                  <Button
                     onClick={handleGoToVerifyOTP}
                     className="h-11 w-full font-medium"
                  >
                     <KeyRound className="mr-2 h-4 w-4" />
                     Enter Verification Code
                  </Button>

                  <Button
                     variant="ghost"
                     onClick={handleResendEmail}
                     disabled={isLoading || resendCooldown > 0}
                     className="text-primary w-full hover:underline"
                  >
                     {(() => {
                        if (isLoading) {
                           return (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Sending...
                              </>
                           )
                        }
                        if (resendCooldown > 0) {
                           return `Resend email in ${resendCooldown}s`
                        }
                        return "Didn't receive the email? Resend"
                     })()}
                  </Button>
               </div>

               {/* Back Button */}
               <div className="border-t pt-4 text-center">
                  <Button
                     variant="ghost"
                     onClick={handleBack}
                     className="text-muted-foreground hover:text-foreground"
                  >
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to login
                  </Button>
               </div>
            </CardContent>
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
               <KeyRound className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
               Forgot Password?
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
               No worries! Enter your email address and we'll send you a link to
               reset your password.
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
                                    placeholder="Enter your email address"
                                    className="h-11 pl-10"
                                    disabled={isLoading}
                                 />
                              </div>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Submit Button */}
                  <Button
                     type="submit"
                     className="h-11 w-full font-medium"
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Sending Reset Link...
                        </>
                     ) : (
                        <>
                           <Send className="mr-2 h-4 w-4" />
                           Send Reset Link
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
                  Back to login
               </Button>
            </div>
         </CardContent>
      </Card>
   )
}

export default ForgotPasswordForm
