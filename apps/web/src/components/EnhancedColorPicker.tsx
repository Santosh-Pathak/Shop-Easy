/**
 * Enhanced Color Picker Component
 * 
 * Improvements over the original:
 * - Simplified and more reliable color picker
 * - Better error handling and validation
 * - Improved accessibility and UX
 * - Mobile-friendly responsive design
 * - Reduced complexity for better performance
 */

'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ColorPickerValue, ColorHarmony } from '@/types/theme'
import { 
  hexToRgb, 
  rgbToHex, 
  rgbToHsl, 
  hslToRgb, 
  isValidHex, 
  normalizeHex,
  getContrastRatio
} from '@/utils/colorUtils'

interface EnhancedColorPickerProps {
  value: ColorPickerValue
  onChange: (color: ColorPickerValue) => void
  onHarmonyGenerate?: (harmony: ColorHarmony) => void
  showHarmony?: boolean
  showPresets?: boolean
  disabled?: boolean
  className?: string
  label?: string
  showRecentColors?: boolean
  showContrastChecker?: boolean
}

// Simplified color harmony generator
const generateColorHarmony = (baseColor: string, type: ColorHarmony['type']): ColorHarmony => {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return { type, colors: [baseColor], description: 'Invalid color' }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = [baseColor]

  switch (type) {
    case 'complementary': {
      const compHue = (hsl.h + 180) % 360
      const compRgb = hslToRgb(compHue, hsl.s, hsl.l)
      colors.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b))
      break
    }

    case 'triadic':
      for (let i = 1; i <= 2; i++) {
        const triadicHue = (hsl.h + (120 * i)) % 360
        const triadicRgb = hslToRgb(triadicHue, hsl.s, hsl.l)
        colors.push(rgbToHex(triadicRgb.r, triadicRgb.g, triadicRgb.b))
      }
      break

    case 'analogous':
      for (let i = 1; i <= 2; i++) {
        const analogousHue1 = (hsl.h + (30 * i)) % 360
        const analogousHue2 = (hsl.h - (30 * i) + 360) % 360
        
        const analogousRgb1 = hslToRgb(analogousHue1, hsl.s, hsl.l)
        const analogousRgb2 = hslToRgb(analogousHue2, hsl.s, hsl.l)
        
        colors.push(rgbToHex(analogousRgb1.r, analogousRgb1.g, analogousRgb1.b))
        if (colors.length < 4) {
          colors.push(rgbToHex(analogousRgb2.r, analogousRgb2.g, analogousRgb2.b))
        }
      }
      break

    case 'monochromatic':
      for (let i = 1; i <= 4; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i * 15) - 30))
        const monoRgb = hslToRgb(hsl.h, hsl.s, lightness)
        colors.push(rgbToHex(monoRgb.r, monoRgb.g, monoRgb.b))
      }
      break

    default: {
      // Split complementary
      const splitHue1 = (hsl.h + 150) % 360
      const splitHue2 = (hsl.h + 210) % 360
      
      const splitRgb1 = hslToRgb(splitHue1, hsl.s, hsl.l)
      const splitRgb2 = hslToRgb(splitHue2, hsl.s, hsl.l)
      
      colors.push(rgbToHex(splitRgb1.r, splitRgb1.g, splitRgb1.b))
      colors.push(rgbToHex(splitRgb2.r, splitRgb2.g, splitRgb2.b))
      break
    }
  }

  return {
    type,
    colors: [...new Set(colors)], // Remove duplicates
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} color harmony`
  }
}

// Simplified preset color palettes
const presetPalettes = [
  { 
    name: 'Modern Blues', 
    colors: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'],
    description: 'Professional blue tones'
  },
  { 
    name: 'Nature Greens', 
    colors: ['#10b981', '#22c55e', '#84cc16', '#65a30d'],
    description: 'Fresh green palette'
  },
  { 
    name: 'Warm Sunset', 
    colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308'],
    description: 'Warm sunset colors'
  },
  { 
    name: 'Purple Dreams', 
    colors: ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'],
    description: 'Elegant purple shades'
  },
  { 
    name: 'Neutral Grays', 
    colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db'],
    description: 'Professional neutrals'
  }
]

// Simple Color Swatch Component
const ColorSwatch: React.FC<{
  color: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
  label?: string
}> = ({ color, onClick, size = 'md', selected = false, label }) => {
  const [copied, setCopied] = useState(false)
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(color)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy color:', err)
    }
  }, [color])

  return (
    <div className="relative group">
      <button
        type="button"
        className={cn(
          'rounded-lg border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          sizeClasses[size],
          selected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400',
          onClick && 'cursor-pointer'
        )}
        style={{ backgroundColor: color }}
        onClick={onClick}
        title={label || color}
        aria-label={`Select color ${color}`}
      />
      
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        {label || color}
        <button
          onClick={handleCopy}
          className="ml-1 text-xs hover:text-gray-300"
          title="Copy to clipboard"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  )
}

// Recent Colors Hook
const useRecentColors = () => {
  const [recentColors, setRecentColors] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('recent-colors')
    if (saved) {
      try {
        setRecentColors(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse recent colors:', e)
      }
    }
  }, [])

  const addRecentColor = useCallback((color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color)
      const updated = [color, ...filtered].slice(0, 8) // Keep last 8 colors
      localStorage.setItem('recent-colors', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { recentColors, addRecentColor }
}

export const EnhancedColorPicker: React.FC<EnhancedColorPickerProps> = ({
  value,
  onChange,
  onHarmonyGenerate,
  showHarmony = true,
  showPresets = true,
  showRecentColors = true,
  showContrastChecker = true,
  disabled = false,
  className,
  label
}) => {
  const [activeTab, setActiveTab] = useState<'picker' | 'harmony' | 'presets'>('picker')
  const [harmonyType, setHarmonyType] = useState<ColorHarmony['type']>('complementary')
  const [hexError, setHexError] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [contrastBackground, setContrastBackground] = useState('#ffffff')
  
  const { recentColors, addRecentColor } = useRecentColors()

  // Generate harmony colors
  const harmony = useMemo(() => {
    return generateColorHarmony(value.hex, harmonyType)
  }, [value.hex, harmonyType])

  // Calculate contrast ratio
  const contrastRatio = useMemo(() => {
    try {
      return getContrastRatio(value.hex, contrastBackground)
    } catch {
      return 1
    }
  }, [value.hex, contrastBackground])

  // Handle color change from different inputs
  const handleHexChange = useCallback((hex: string) => {
    if (!hex.startsWith('#')) {
      hex = '#' + hex
    }

    if (!isValidHex(hex)) {
      setHexError('Invalid hex color format')
      return
    }

    setHexError('')
    const rgb = hexToRgb(hex)
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      const newValue = { hex: normalizeHex(hex), rgb, hsl }
      onChange(newValue)
      addRecentColor(normalizeHex(hex))
    }
  }, [onChange, addRecentColor])

  const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...value.rgb, [channel]: Math.max(0, Math.min(255, val)) }
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    const hsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b)
    const newValue = { hex, rgb: newRgb, hsl }
    onChange(newValue)
    addRecentColor(hex)
  }, [value.rgb, onChange, addRecentColor])

  const handleHslChange = useCallback((channel: 'h' | 's' | 'l', val: number) => {
    const newHsl = { ...value.hsl, [channel]: val }
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    const newValue = { hex, rgb, hsl: newHsl }
    onChange(newValue)
    addRecentColor(hex)
  }, [value.hsl, onChange, addRecentColor])

  const handleHarmonyGenerate = useCallback(() => {
    if (onHarmonyGenerate) {
      onHarmonyGenerate(harmony)
    }
  }, [harmony, onHarmonyGenerate])

  const handleCopyColor = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy color:', err)
    }
  }, [value.hex])

  return (
    <div className={cn('space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Color Preview */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div
          className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: value.hex }}
          role="img"
          aria-label={`Color preview: ${value.hex}`}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {value.hex.toUpperCase()}
            </span>
            <button
              onClick={handleCopyColor}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Copy hex code"
              aria-label="Copy hex code to clipboard"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            RGB({value.rgb.r}, {value.rgb.g}, {value.rgb.b})
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            HSL({Math.round(value.hsl.h)}°, {Math.round(value.hsl.s)}%, {Math.round(value.hsl.l)}%)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="-mb-px flex space-x-8" role="tablist">
          {[
            { id: 'picker', label: 'Color' },
            { id: 'harmony', label: 'Harmony' },
            { id: 'presets', label: 'Presets' },
          ].map(({ id, label: tabLabel }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => setActiveTab(id as any)}
            >
              {tabLabel}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* Picker Tab */}
        {activeTab === 'picker' && (
          <div className="space-y-4">
            {/* Hex Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hex Color
              </label>
              <input
                type="text"
                value={value.hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className={cn(
                  'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  hexError 
                    ? 'border-red-300 text-red-900 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                )}
                placeholder="#000000"
                disabled={disabled}
              />
              {hexError && (
                <p className="mt-1 text-sm text-red-600">{hexError}</p>
              )}
            </div>

            {/* RGB Inputs */}
            <div className="grid grid-cols-3 gap-3">
              {(['r', 'g', 'b'] as const).map((channel) => (
                <div key={channel}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {channel.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={value.rgb[channel]}
                    onChange={(e) => handleRgbChange(channel, parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                  />
                </div>
              ))}
            </div>

            {/* HSL Sliders */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hue: {Math.round(value.hsl.h)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={value.hsl.h}
                  onChange={(e) => handleHslChange('h', parseFloat(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                  }}
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saturation: {Math.round(value.hsl.s)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value.hsl.s}
                  onChange={(e) => handleHslChange('s', parseFloat(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${value.hsl.h}, 0%, ${value.hsl.l}%), hsl(${value.hsl.h}, 100%, ${value.hsl.l}%))`
                  }}
                  disabled={disabled}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lightness: {Math.round(value.hsl.l)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value.hsl.l}
                  onChange={(e) => handleHslChange('l', parseFloat(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${value.hsl.h}, ${value.hsl.s}%, 0%), hsl(${value.hsl.h}, ${value.hsl.s}%, 50%), hsl(${value.hsl.h}, ${value.hsl.s}%, 100%))`
                  }}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Contrast Checker */}
            {showContrastChecker && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contrast Checker
                </h4>
                <div className="flex items-center gap-4 mb-2">
                  <input
                    type="text"
                    value={contrastBackground}
                    onChange={(e) => setContrastBackground(e.target.value)}
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Background color"
                  />
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: contrastBackground }}
                  />
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Contrast Ratio:</span>
                    <span className="font-medium">{contrastRatio.toFixed(2)}:1</span>
                  </div>
                  <div className="mt-1">
                    <span className={cn(
                      'inline-block px-2 py-1 rounded text-xs',
                      contrastRatio >= 7 ? 'bg-green-100 text-green-800' :
                      contrastRatio >= 4.5 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'Fail'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Harmony Tab */}
        {activeTab === 'harmony' && showHarmony && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harmony Type
              </label>
              <select
                value={harmonyType}
                onChange={(e) => setHarmonyType(e.target.value as ColorHarmony['type'])}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={disabled}
              >
                <option value="complementary">Complementary</option>
                <option value="triadic">Triadic</option>
                <option value="analogous">Analogous</option>
                <option value="split-complementary">Split Complementary</option>
                <option value="monochromatic">Monochromatic</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {harmony.description}
                </span>
                {onHarmonyGenerate && (
                  <button
                    type="button"
                    onClick={handleHarmonyGenerate}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                  >
                    Apply Harmony
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {harmony.colors.map((color, index) => (
                  <ColorSwatch
                    key={index}
                    color={color}
                    onClick={() => handleHexChange(color)}
                    size="lg"
                    selected={color.toLowerCase() === value.hex.toLowerCase()}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Presets Tab */}
        {activeTab === 'presets' && showPresets && (
          <div className="space-y-4">
            {/* Recent Colors */}
            {showRecentColors && recentColors.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recent Colors
                </span>
                <div className="flex gap-2 flex-wrap">
                  {recentColors.map((color, index) => (
                    <ColorSwatch
                      key={index}
                      color={color}
                      onClick={() => handleHexChange(color)}
                      selected={color.toLowerCase() === value.hex.toLowerCase()}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Preset Palettes */}
            {presetPalettes.map((palette) => (
              <div key={palette.name} className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {palette.name}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {palette.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {palette.colors.map((color, index) => (
                    <ColorSwatch
                      key={index}
                      color={color}
                      onClick={() => handleHexChange(color)}
                      selected={color.toLowerCase() === value.hex.toLowerCase()}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedColorPicker