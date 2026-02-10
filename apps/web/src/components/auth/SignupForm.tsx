'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, UserPlus, Mail, Lock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/urls'
import { cn } from '@/lib/theme-utils'
import { showErrorToast } from '@/utils/error'

const signupSchema = z
   .object({
      name: z
         .string()
         .min(2, 'Name must be at least 2 characters')
         .max(50, 'Name must be less than 50 characters')
         .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
      email: z
         .string()
         .min(1, 'Email is required')
         .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
            message: 'Please enter a valid email address',
         })
         .transform((email) => email.toLowerCase()),
      password: z
         .string()
         .min(8, 'Password must be at least 8 characters')
         .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
         ),
      confirmPassword: z.string(),
      acceptTerms: z.boolean().refine((val) => val === true, {
         message: 'You must accept the terms and conditions',
      }),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
   })

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps {
   readonly onSuccess?: (email: string) => void
   readonly className?: string
}

export function SignupForm({ onSuccess, className }: SignupFormProps) {
   const router = useRouter()
   const [showPassword, setShowPassword] = useState(false)
   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
   
   // Zustand store hooks
   const signup = useAuthStore((state) => state.signup)
   const isLoading = useAuthStore((state) => state.isLoading)
   const error = useAuthStore((state) => state.error)
   const clearError = useAuthStore((state) => state.clearError)

   const form = useForm<SignupFormValues>({
      resolver: zodResolver(signupSchema),
      defaultValues: {
         name: '',
         email: '',
         password: '',
         confirmPassword: '',
         acceptTerms: false,
      },
      mode: 'onChange',
   })

   // Handle errors from the auth store
   useEffect(() => {
      if (error) {
         showErrorToast(error)
         clearError()
      }
   }, [error, clearError])

   const onSubmit = async (values: SignupFormValues) => {
      try {
         // Clear any previous errors
         clearError()

         const signupData = {
            name: values.name,
            email: values.email,
            password: values.password,
            role: 'customer' as const,
         }

         const result = await signup(signupData)

         // Signup successful
         if (onSuccess) {
            onSuccess(values.email)
         } else {
            router.push(
               `${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`
            )
         }
      } catch (error) {
         console.error('Signup failed:', error)
         const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.'
         showErrorToast(errorMessage)
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

   return (
      <div className={cn("w-full", className)}>
         <Form {...form}>
            <form
               onSubmit={form.handleSubmit(onSubmit)}
               className="space-y-4"
            >
               {/* Name Field */}
               <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel className="text-sm font-medium">
                           Full Name
                        </FormLabel>
                        <FormControl>
                           <div className="relative">
                              <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                              <Input
                                 {...field}
                                 type="text"
                                 placeholder="Enter your full name"
                                 className="h-11 pl-10"
                                 disabled={isLoading}
                              />
                           </div>
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

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
                                 disabled={isLoading}
                              />
                           </div>
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               {/* Password Field */}
               <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel className="text-sm font-medium">
                           Password
                        </FormLabel>
                        <FormControl>
                           <div className="relative">
                              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                              <Input
                                 {...field}
                                 type={showPassword ? 'text' : 'password'}
                                 placeholder="Create a strong password"
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

               {/* Confirm Password Field */}
               <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel className="text-sm font-medium">
                           Confirm Password
                        </FormLabel>
                        <FormControl>
                           <div className="relative">
                              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                              <Input
                                 {...field}
                                 type={
                                    showConfirmPassword ? 'text' : 'password'
                                 }
                                 placeholder="Confirm your password"
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

               {/* Terms and Conditions */}
               <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                        <FormControl>
                           <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                           />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                           <FormLabel className="text-sm">
                              I agree to the{' '}
                              <Link
                                 href="/terms"
                                 className="text-[var(--interactive-primary)] hover:text-[var(--interactive-primary-hover)] transition-colors"
                              >
                                 Terms of Service
                              </Link>{' '}
                              and{' '}
                              <Link
                                 href="/privacy"
                                 className="text-[var(--interactive-primary)] hover:text-[var(--interactive-primary-hover)] transition-colors"
                              >
                                 Privacy Policy
                              </Link>
                           </FormLabel>
                           <FormMessage />
                        </div>
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
                        Creating Account...
                     </>
                  ) : (
                     <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                     </>
                  )}
               </Button>
            </form>
         </Form>
      </div>
   )
}

export default SignupForm
