'use client'

import React from 'react'
import { useTheme, useColors } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Theme Demo Component
 *
 * This component demonstrates all the features of the theme system:
 * - Light/Dark/System mode switching
 * - Color palette usage
 * - CSS variable usage
 * - Theme-aware conditional styling
 */
export function ThemeDemo() {
   const { mode, setMode, toggleMode, resolvedMode } = useTheme()
   const colors = useColors()
   const isDark = resolvedMode === 'dark'

   const demoCards = [
      {
         title: 'Primary Colors',
         colors: Object.entries(colors.primary).slice(0, 5),
         description: 'Deep blue primary palette',
      },
      {
         title: 'Secondary Colors',
         colors: Object.entries(colors.secondary).slice(0, 5),
         description: 'Light blue secondary palette',
      },
      {
         title: 'Semantic Colors',
         colors: [
            ['success', colors.success[500]],
            ['warning', colors.warning[500]],
            ['error', colors.error[500]],
            ['info', colors.info[500]],
         ],
         description: 'Status and feedback colors',
      },
   ]

   return (
      <div className="theme-bg-primary theme-text-primary min-h-screen p-8 transition-colors duration-300">
         <div className="mx-auto max-w-6xl space-y-8">
            {/* Header */}
            <div className="space-y-4 text-center">
               <h1 className="theme-text-primary text-4xl font-bold">
                  🎨 Theme System Demo
               </h1>
               <p className="theme-text-secondary text-lg">
                  Deep Blue, Light Blue & White Color Palette
               </p>

               {/* Theme Status */}
               <div className="theme-bg-secondary flex items-center justify-center gap-4 rounded-lg p-4">
                  <span className="font-semibold">Current Theme:</span>
                  <span className="rounded-full bg-[var(--interactive-primary)] px-3 py-1 text-white">
                     {mode}
                  </span>
                  <span className="theme-text-muted">
                     ({isDark ? 'Dark' : 'Light'} Mode Active)
                  </span>
               </div>
            </div>

            {/* Theme Controls */}
            <Card className="p-6">
               <h2 className="theme-text-primary mb-4 text-2xl font-semibold">
                  Theme Controls
               </h2>

               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Theme Toggle Variants */}
                  <div className="space-y-3">
                     <h3 className="theme-text-secondary font-medium">
                        Toggle Variants
                     </h3>
                     <div className="space-y-2">
                        <ThemeToggle variant="button" showLabels />
                        <ThemeToggle variant="dropdown" showLabels />
                     </div>
                  </div>

                  {/* Direct Theme Selection */}
                  <div className="space-y-3">
                     <h3 className="theme-text-secondary font-medium">
                        Direct Selection
                     </h3>
                     <div className="space-y-2">
                        {(['light', 'dark', 'system'] as const).map(
                           (themeOption) => (
                              <Button
                                 key={themeOption}
                                 variant={
                                    mode === themeOption
                                       ? 'default'
                                       : 'outline'
                                 }
                                 onClick={() => setMode(themeOption)}
                                 className="w-full"
                              >
                                 {themeOption.charAt(0).toUpperCase() +
                                    themeOption.slice(1)}
                              </Button>
                           )
                        )}
                     </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                     <h3 className="theme-text-secondary font-medium">
                        Quick Actions
                     </h3>
                     <div className="space-y-2">
                        <Button
                           onClick={toggleMode}
                           variant="outline"
                           className="w-full"
                        >
                           🔄 Cycle Themes
                        </Button>
                        <Button
                           onClick={() => setMode('system')}
                           variant="outline"
                           className="w-full"
                        >
                           🖥️ System Default
                        </Button>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Color Palette Showcase */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
               {demoCards.map((card) => (
                  <Card key={card.title} className="p-6">
                     <h3 className="theme-text-primary mb-2 text-xl font-semibold">
                        {card.title}
                     </h3>
                     <p className="theme-text-secondary mb-4">
                        {card.description}
                     </p>

                     <div className="space-y-2">
                        {card.colors.map(([shade, color]) => (
                           <div
                              key={shade}
                              className="theme-bg-tertiary flex items-center gap-3 rounded p-2"
                           >
                              <div
                                 className="theme-border h-8 w-8 rounded border"
                                 style={{ backgroundColor: color }}
                              />
                              <div className="flex-1">
                                 <div className="theme-text-primary font-mono text-sm">
                                    {shade}
                                 </div>
                                 <div className="theme-text-muted font-mono text-xs">
                                    {color}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </Card>
               ))}
            </div>

            {/* Interactive Elements Demo */}
            <Card className="p-6">
               <h2 className="theme-text-primary mb-4 text-2xl font-semibold">
                  Interactive Elements
               </h2>

               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Buttons */}
                  <div className="space-y-3">
                     <h3 className="theme-text-secondary font-medium">
                        Buttons
                     </h3>
                     <div className="space-y-2">
                        <button className="theme-interactive-primary w-full rounded-lg px-4 py-2">
                           Primary Button
                        </button>
                        <button className="theme-interactive-secondary w-full rounded-lg px-4 py-2">
                           Secondary Button
                        </button>
                        <button className="theme-border theme-bg-primary theme-text-primary hover:theme-bg-secondary w-full rounded-lg border px-4 py-2 transition-colors">
                           Outlined Button
                        </button>
                     </div>
                  </div>

                  {/* Form Elements */}
                  <div className="space-y-3">
                     <h3 className="theme-text-secondary font-medium">
                        Form Elements
                     </h3>
                     <div className="space-y-2">
                        <input
                           type="text"
                           placeholder="Text input"
                           className="theme-border theme-bg-primary theme-text-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--interactive-primary)]"
                        />
                        <select className="theme-border theme-bg-primary theme-text-primary w-full rounded-lg border px-3 py-2">
                           <option>Select option</option>
                           <option>Option 1</option>
                           <option>Option 2</option>
                        </select>
                        <textarea
                           placeholder="Textarea"
                           rows={3}
                           className="theme-border theme-bg-primary theme-text-primary w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-[var(--interactive-primary)]"
                        />
                     </div>
                  </div>
               </div>
            </Card>

            {/* CSS Variables Reference */}
            <Card className="p-6">
               <h2 className="theme-text-primary mb-4 text-2xl font-semibold">
                  CSS Variables Reference
               </h2>

               <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                     ['--bg-primary', 'var(--bg-primary)'],
                     ['--bg-secondary', 'var(--bg-secondary)'],
                     ['--fg-primary', 'var(--fg-primary)'],
                     ['--fg-secondary', 'var(--fg-secondary)'],
                     ['--interactive-primary', 'var(--interactive-primary)'],
                     ['--border-default', 'var(--border-default)'],
                  ].map(([varName, varValue]) => (
                     <div key={varName} className="space-y-2">
                        <div className="theme-text-primary font-mono text-sm">
                           {varName}
                        </div>
                        <div
                           className="theme-border flex h-12 items-center justify-center rounded border text-sm text-white"
                           style={{ backgroundColor: varValue }}
                        >
                           Sample
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            {/* Usage Examples */}
            <Card className="p-6">
               <h2 className="theme-text-primary mb-4 text-2xl font-semibold">
                  Code Examples
               </h2>

               <div className="space-y-4">
                  <div>
                     <h3 className="theme-text-secondary mb-2 font-medium">
                        Using CSS Classes:
                     </h3>
                     <pre className="theme-bg-tertiary overflow-x-auto rounded-lg p-3">
                        <code className="theme-text-primary text-sm">
                           {`<div className="theme-bg-primary theme-text-primary">
  <button className="theme-interactive-primary">Click me</button>
</div>`}
                        </code>
                     </pre>
                  </div>

                  <div>
                     <h3 className="theme-text-secondary mb-2 font-medium">
                        Using CSS Variables:
                     </h3>
                     <pre className="theme-bg-tertiary overflow-x-auto rounded-lg p-3">
                        <code className="theme-text-primary text-sm">
                           {`<div style={{ 
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--fg-primary)' 
}}>
  Content
</div>`}
                        </code>
                     </pre>
                  </div>

                  <div>
                     <h3 className="theme-text-secondary mb-2 font-medium">
                        Using React Hooks:
                     </h3>
                     <pre className="theme-bg-tertiary overflow-x-auto rounded-lg p-3">
                        <code className="theme-text-primary text-sm">
                           {`const { theme, isDark, colors } = useTheme()
const primaryColor = colors.primary[600]`}
                        </code>
                     </pre>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   )
}
