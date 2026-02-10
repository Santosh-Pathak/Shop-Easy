'use client'

import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Whether to show the password visibility toggle button
   * @default true
   */
  showToggle?: boolean
  /**
   * Whether to restrict copy and paste operations
   * @default true
   */
  restrictCopyPaste?: boolean
  /**
   * Custom class name for the container
   */
  containerClassName?: string
  /**
   * Custom class name for the toggle button
   */
  toggleClassName?: string
  /**
   * Icon to display on the left side of the input
   */
  leftIcon?: React.ReactNode
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      containerClassName,
      toggleClassName,
      showToggle = true,
      restrictCopyPaste = true,
      leftIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const handleCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (restrictCopyPaste) {
        e.preventDefault()
        // Optional: Show a toast or notification here
        console.log('Copy/paste is restricted for password fields')
      }
    }

    const handleContextMenu = (e: React.MouseEvent<HTMLInputElement>) => {
      if (restrictCopyPaste) {
        e.preventDefault() // Prevent right-click context menu for copy/paste
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (restrictCopyPaste) {
        // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
          e.preventDefault()
        }
      }
      
      // Call the original onKeyDown if provided
      if (props.onKeyDown) {
        props.onKeyDown(e)
      }
    }

    return (
      <div className={cn('relative', containerClassName)}>
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transform z-10">
            {leftIcon}
          </div>
        )}
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn(
            leftIcon ? 'pl-10' : '',
            showToggle ? 'pr-12' : '',
            className
          )}
          disabled={disabled}
          onCopy={handleCopyPaste}
          onPaste={handleCopyPaste}
          onCut={handleCopyPaste}
          onContextMenu={handleContextMenu}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {showToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              'absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent',
              'theme-text-secondary hover:theme-text-primary',
              toggleClassName
            )}
            onClick={togglePasswordVisibility}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }