'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
   email: z.email('Please enter a valid email address'),
   password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters long'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
   const router = useRouter()
   const [showPassword, setShowPassword] = useState(false)
   const { isLoading } = useAuthStore()

   const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema as any),
      defaultValues: {
         email: '',
         password: '',
      },
      mode: 'onChange',
   })

   const onSubmit = async (values: LoginFormValues) => {
      await AuthService.login(values)
      
      // Check if login was successful by checking auth state
      const { isAuthenticated, error } = useAuthStore.getState()
      
      if (isAuthenticated) {
         // Success - redirect to dashboard
         setTimeout(() => {
            router.push(ROUTES.DASHBOARD)
         }, 1000)
      }
      // If there's an error, it's already handled by AuthService and shown in toast
   }

   const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
   }

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
      <Card className="theme-bg-primary theme-border shadow-lg">
         <CardContent className="p-8">
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
               >
                  <FormField
                     control={form.control}
                     name="email"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel
                              className="theme-text-primary text-sm font-medium"
                              htmlFor="email"
                           >
                              Email Address{' '}
                              <span className="text-[var(--error-500)]">*</span>
                           </FormLabel>
                           <FormControl>
                              <Input
                                 {...field}
                                 id="email"
                                 type="email"
                                 placeholder="Enter your email"
                                 inputMode="email"
                                 autoCapitalize="none"
                                 spellCheck={false}
                                 autoComplete="email"
                                 disabled={isLoading}
                                 aria-invalid={!!form.formState.errors.email}
                                 className="theme-bg-primary theme-border theme-text-primary h-12 transition-colors focus:border-[var(--interactive-primary)] focus:ring-2 focus:ring-[var(--interactive-primary)]"
                              />
                           </FormControl>
                           <FormMessage className="text-[var(--error-500)]" />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="password"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel
                              className="theme-text-primary text-sm font-medium"
                              htmlFor="password"
                           >
                              Password{' '}
                              <span className="text-[var(--error-500)]">*</span>
                           </FormLabel>
                           <FormControl>
                              <div className="relative">
                                 <Input
                                    {...field}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    aria-invalid={
                                       !!form.formState.errors.password
                                    }
                                    className="theme-bg-primary theme-border theme-text-primary h-12 pr-12 transition-colors focus:border-[var(--interactive-primary)] focus:ring-2 focus:ring-[var(--interactive-primary)]"
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
                                    className="theme-text-secondary hover:theme-text-primary absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={togglePasswordVisibility}
                                    disabled={isLoading}
                                    aria-label={
                                       showPassword
                                          ? 'Hide password'
                                          : 'Show password'
                                    }
                                    aria-pressed={showPassword}
                                 >
                                    {showPassword ? (
                                       <EyeOff className="h-4 w-4" />
                                    ) : (
                                       <Eye className="h-4 w-4" />
                                    )}
                                 </Button>
                              </div>
                           </FormControl>
                           <FormMessage className="text-[var(--error-500)]" />
                        </FormItem>
                     )}
                  />

                  <div className="text-right">
                     <Button
                        variant="link"
                        className="h-auto p-0 text-sm font-medium text-[var(--interactive-primary)] hover:text-[var(--interactive-primary-hover)]"
                        onClick={() => router.push(ROUTES.FORGOT_PASSWORD)}
                        disabled={isLoading}
                        type="button"
                     >
                        Forgot your password?
                     </Button>
                  </div>

                  <Button
                     type="submit"
                     className="theme-interactive-primary h-12 w-full text-base font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                     disabled={isLoading || !form.formState.isValid}
                     aria-busy={isLoading}
                  >
                     {isLoading ? (
                        <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           Signing in...
                        </>
                     ) : (
                        'Sign In'
                     )}
                  </Button>
               </form>
            </Form>
         </CardContent>
      </Card>
   )
}

export default LoginForm
