'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Lock, CheckCircle, Mail } from 'lucide-react'
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

const resetPasswordSchema = z
   .object({
      email: z
         .string()
         .min(1, 'Email is required')
         .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
            message: 'Please enter a valid email address',
         }),
      password: z
         .string()
         .min(8, 'Password must be at least 8 characters')
         .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
         ),
      confirmPassword: z.string(),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
   })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
   readonly onSuccess?: () => void
   readonly className?: string
}

export function ResetPasswordForm({
   onSuccess,
   className,
}: ResetPasswordFormProps) {
   const router = useRouter()
   const searchParams = useSearchParams()
   const { isLoading, setLoading, setError } = useAuthStore()
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   const [isResetComplete, setIsResetComplete] = useState(false)

   const emailFromParams = searchParams.get('email') || ''

   const form = useForm<ResetPasswordFormValues>({
      resolver: zodResolver(resetPasswordSchema),
      defaultValues: {
         email: emailFromParams,
         password: '',
         confirmPassword: '',
      },
      mode: 'onChange',
   })

   const onSubmit = async (values: ResetPasswordFormValues) => {
      try {
         setLoading(true)
         setError(null)

         await AuthService.resetPassword({
            email: values.email,
            password: values.password,
         })

         setIsResetComplete(true)
         toast.success('Password reset successfully!')

         setTimeout(() => {
            if (onSuccess) {
               onSuccess()
            } else {
               router.push(ROUTES.LOGIN)
            }
         }, 3000)
      } catch (error: any) {
         console.error('Password reset failed:', error)
         const errorMessage = error.message || 'Password reset failed. Please try again.'
         setError(errorMessage)
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   const togglePasswordVisibility = () => setShowPassword(!showPassword)
   const toggleConfirmPasswordVisibility = () =>
      setShowConfirmPassword(!showConfirmPassword)

   const handlePasswordCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      console.log('Copy/paste is restricted for password fields')
   }

   const handlePasswordContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
      e.preventDefault() // Prevent right-click context menu for copy/paste
   }

   const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
         e.preventDefault()
      }
   }

   if (isResetComplete) {
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
                  Password Reset Complete!
               </CardTitle>
               <CardDescription className="text-muted-foreground text-center">
                  Your password has been successfully reset. You can now log in
                  with your new password.
               </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
               <p className="text-muted-foreground mb-4 text-sm">
                  Redirecting to login page in a few seconds...
               </p>
               <Button
                  onClick={() => router.push(ROUTES.LOGIN)}
                  className="h-11 w-full font-medium"
               >
                  Go to Login
               </Button>
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
               <Lock className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">
               Reset Your Password
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
               Please enter your new password. Make sure it's strong and secure.
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

                  {/* New Password Field */}
                  <FormField
                     control={form.control}
                     name="password"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-sm font-medium">
                              New Password
                           </FormLabel>
                           <FormControl>
                              <div className="relative">
                                 <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                 <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your new password"
                                    className="h-11 pr-10 pl-10"
                                    disabled={isLoading}
                                    onCopy={handlePasswordCopyPaste}
                                    onPaste={handlePasswordCopyPaste}
                                    onCut={handlePasswordCopyPaste}
                                    onContextMenu={handlePasswordContextMenu}
                                    onKeyDown={handlePasswordKeyDown}
                                    spellCheck={false}
                                 />
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={togglePasswordVisibility}
                                    tabIndex={-1}
                                 >
                                    {showPassword ? (
                                       <EyeOff className="h-4 w-4" />
                                    ) : (
                                       <Eye className="h-4 w-4" />
                                    )}
                                 </Button>
                              </div>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Confirm New Password Field */}
                  <FormField
                     control={form.control}
                     name="confirmPassword"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-sm font-medium">
                              Confirm New Password
                           </FormLabel>
                           <FormControl>
                              <div className="relative">
                                 <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                 <Input
                                    {...field}
                                    type={
                                       showConfirmPassword ? 'text' : 'password'
                                    }
                                    placeholder="Confirm your new password"
                                    className="h-11 pr-10 pl-10"
                                    disabled={isLoading}
                                    onCopy={handlePasswordCopyPaste}
                                    onPaste={handlePasswordCopyPaste}
                                    onCut={handlePasswordCopyPaste}
                                    onContextMenu={handlePasswordContextMenu}
                                    onKeyDown={handlePasswordKeyDown}
                                    spellCheck={false}
                                 />
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={toggleConfirmPasswordVisibility}
                                    tabIndex={-1}
                                 >
                                    {showConfirmPassword ? (
                                       <EyeOff className="h-4 w-4" />
                                    ) : (
                                       <Eye className="h-4 w-4" />
                                    )}
                                 </Button>
                              </div>
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {/* Password Requirements */}
                  <div className="text-muted-foreground space-y-1 text-xs">
                     <p className="font-medium">Password requirements:</p>
                     <ul className="ml-4 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• One uppercase letter</li>
                        <li>• One lowercase letter</li>
                        <li>• One number</li>
                        <li>• One special character (@$!%*?&)</li>
                     </ul>
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
                           Resetting Password...
                        </>
                     ) : (
                        <>
                           <Lock className="mr-2 h-4 w-4" />
                           Reset Password
                        </>
                     )}
                  </Button>
               </form>
            </Form>
         </CardContent>
      </Card>
   )
}

export default ResetPasswordForm
