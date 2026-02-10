'use client'
import { IconMoon, IconSun, IconDeviceDesktop } from '@tabler/icons-react'
import { cn } from '@/lib/theme-utils'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
   className?: string
   variant?: 'navbar' | 'floating' | 'button' | 'dropdown'
   showLabels?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
   className = '',
   variant = 'button',
   showLabels = false,
}) => {
   const { mode, setMode, resolvedMode, toggleMode } = useTheme()

   const currentTheme = mode === 'system' ? resolvedMode : mode

   if (variant === 'dropdown') {
      return (
         <div className={cn('flex flex-col gap-1', className)}>
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
               <button
                  key={themeOption}
                  onClick={() => setMode(themeOption)}
                  className={cn(
                     'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                     'hover:bg-[var(--bg-secondary)]',
                     mode === themeOption
                        ? 'bg-[var(--interactive-primary)] text-white'
                        : 'text-[var(--fg-primary)]'
                  )}
               >
                  {themeOption === 'light' && <IconSun className="size-4" />}
                  {themeOption === 'dark' && <IconMoon className="size-4" />}
                  {themeOption === 'system' && (
                     <IconDeviceDesktop className="size-4" />
                  )}
                  {showLabels && (
                     <span className="capitalize">{themeOption}</span>
                  )}
               </button>
            ))}
         </div>
      )
   }

   const baseClasses =
      'relative inline-flex items-center justify-center transition-all duration-200'

   const variantClasses = {
      navbar: cn(
         'p-2 rounded-lg',
         'hover:bg-[var(--bg-secondary)]',
         'text-[var(--fg-primary)]'
      ),
      floating: cn(
         'p-3 rounded-full shadow-lg transform hover:scale-105',
         'bg-[var(--surface-elevated)] hover:shadow-xl',
         'text-[var(--fg-primary)]'
      ),
      button: cn(
         'p-2 rounded-lg border transition-colors',
         'border-[var(--border-default)]',
         'hover:bg-[var(--bg-secondary)]',
         'text-[var(--fg-primary)]'
      ),
   }

   const getThemeIcon = () => {
      if (mode === 'system') {
         return <IconDeviceDesktop className="size-6" />
      }
      return currentTheme === 'light' ? (
         <IconMoon className="size-6" />
      ) : (
         <IconSun className="size-6 text-[var(--warning-500)]" />
      )
   }

   const getThemeLabel = () => {
      if (mode === 'system') return 'System'
      return currentTheme === 'light' ? 'Light' : 'Dark'
   }

   return (
      <button
         onClick={toggleMode}
         className={cn(baseClasses, variantClasses[variant], className)}
         aria-label={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
         title={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
      >
         <div className="relative flex size-6 items-center justify-center">
            {getThemeIcon()}
         </div>
         {showLabels && <span className="ml-2 text-sm">{getThemeLabel()}</span>}
      </button>
   )
}
