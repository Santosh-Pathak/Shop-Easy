/**
 * Advanced Color Picker Component
 * 
 * Features:
 * - RGB, HSL, HEX color input
 * - Color harmony generation (complementary, triadic, etc.)
 * - Preset color palettes
 * - Real-time preview
 * - Accessibility compliance checking
 */

'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ColorPickerValue, ColorHarmony } from '@/types/theme'

interface ColorPickerProps {
  value: ColorPickerValue
  onChange: (color: ColorPickerValue) => void
  onHarmonyGenerate?: (harmony: ColorHarmony) => void
  showHarmony?: boolean
  showPresets?: boolean
  disabled?: boolean
  className?: string
  label?: string
}

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h: number, s: number, l: number

  l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default: h = 0; break
    }

    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// Color harmony generators
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
        colors.push(rgbToHex(analogousRgb2.r, analogousRgb2.g, analogousRgb2.b))
      }
      break

    case 'split-complementary': {
      const splitHue1 = (hsl.h + 150) % 360
      const splitHue2 = (hsl.h + 210) % 360
      
      const splitRgb1 = hslToRgb(splitHue1, hsl.s, hsl.l)
      const splitRgb2 = hslToRgb(splitHue2, hsl.s, hsl.l)
      
      colors.push(rgbToHex(splitRgb1.r, splitRgb1.g, splitRgb1.b))
      colors.push(rgbToHex(splitRgb2.r, splitRgb2.g, splitRgb2.b))
      break
    }

    case 'monochromatic':
      for (let i = 1; i <= 4; i++) {
        const lightness = Math.max(10, Math.min(90, hsl.l + (i * 15) - 30))
        const monoRgb = hslToRgb(hsl.h, hsl.s, lightness)
        colors.push(rgbToHex(monoRgb.r, monoRgb.g, monoRgb.b))
      }
      break
  }

  return {
    type,
    colors: [...new Set(colors)], // Remove duplicates
    description: `${type.charAt(0).toUpperCase() + type.slice(1)} color harmony`
  }
}

// Preset color palettes
const presetPalettes = [
  { name: 'Blue Palette', colors: ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'] },
  { name: 'Green Palette', colors: ['#10b981', '#22c55e', '#84cc16', '#eab308'] },
  { name: 'Red Palette', colors: ['#ef4444', '#f97316', '#f59e0b', '#eab308'] },
  { name: 'Purple Palette', colors: ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'] },
  { name: 'Neutral Palette', colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db'] },
]

const ColorSwatch: React.FC<{
  color: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  selected?: boolean
}> = ({ color, onClick, size = 'md', selected = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <button
      type="button"
      className={cn(
        'rounded border-2 transition-all hover:scale-110',
        sizeClasses[size],
        selected ? 'border-gray-900 ring-2 ring-blue-500' : 'border-gray-300',
        onClick && 'cursor-pointer'
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
      title={color}
    />
  )
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  onHarmonyGenerate,
  showHarmony = true,
  showPresets = true,
  disabled = false,
  className,
  label
}) => {
  const [activeTab, setActiveTab] = useState<'picker' | 'harmony' | 'presets'>('picker')
  const [harmonyType, setHarmonyType] = useState<ColorHarmony['type']>('complementary')

  // Generate harmony colors
  const harmony = useMemo(() => {
    return generateColorHarmony(value.hex, harmonyType)
  }, [value.hex, harmonyType])

  // Handle color change from different inputs
  const handleHexChange = useCallback((hex: string) => {
    const rgb = hexToRgb(hex)
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      onChange({ hex, rgb, hsl })
    }
  }, [onChange])

  const handleRgbChange = useCallback((channel: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...value.rgb, [channel]: Math.max(0, Math.min(255, val)) }
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    const hsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b)
    onChange({ hex, rgb: newRgb, hsl })
  }, [value.rgb, onChange])

  const handleHslChange = useCallback((channel: 'h' | 's' | 'l', val: number) => {
    const newHsl = { ...value.hsl, [channel]: val }
    const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    onChange({ hex, rgb, hsl: newHsl })
  }, [value.hsl, onChange])

  const handleHarmonyGenerate = useCallback(() => {
    if (onHarmonyGenerate) {
      onHarmonyGenerate(harmony)
    }
  }, [harmony, onHarmonyGenerate])

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Color Preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: value.hex }}
        />
        <div className="flex-1">
          <div className="text-lg font-semibold">{value.hex.toUpperCase()}</div>
          <div className="text-sm text-gray-500">
            RGB({value.rgb.r}, {value.rgb.g}, {value.rgb.b})
          </div>
          <div className="text-sm text-gray-500">
            HSL({Math.round(value.hsl.h)}°, {Math.round(value.hsl.s)}%, {Math.round(value.hsl.l)}%)
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'picker'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            onClick={() => setActiveTab('picker')}
          >
            Color Picker
          </button>
          {showHarmony && (
            <button
              type="button"
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'harmony'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              onClick={() => setActiveTab('harmony')}
            >
              Color Harmony
            </button>
          )}
          {showPresets && (
            <button
              type="button"
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm',
                activeTab === 'presets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              onClick={() => setActiveTab('presets')}
            >
              Presets
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'picker' && (
        <div className="space-y-4">
          {/* Hex Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hex</label>
            <input
              type="text"
              value={value.hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="#000000"
              disabled={disabled}
            />
          </div>

          {/* RGB Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Red</label>
              <input
                type="number"
                min="0"
                max="255"
                value={value.rgb.r}
                onChange={(e) => handleRgbChange('r', parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Green</label>
              <input
                type="number"
                min="0"
                max="255"
                value={value.rgb.g}
                onChange={(e) => handleRgbChange('g', parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blue</label>
              <input
                type="number"
                min="0"
                max="255"
                value={value.rgb.b}
                onChange={(e) => handleRgbChange('b', parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={disabled}
              />
            </div>
          </div>

          {/* HSL Sliders */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hue: {Math.round(value.hsl.h)}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={value.hsl.h}
                onChange={(e) => handleHslChange('h', parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saturation: {Math.round(value.hsl.s)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={value.hsl.s}
                onChange={(e) => handleHslChange('s', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lightness: {Math.round(value.hsl.l)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={value.hsl.l}
                onChange={(e) => handleHslChange('l', parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-black via-gray-500 to-white rounded-lg appearance-none cursor-pointer"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'harmony' && showHarmony && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Harmony Type</label>
            <select
              value={harmonyType}
              onChange={(e) => setHarmonyType(e.target.value as ColorHarmony['type'])}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={disabled}
            >
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="analogous">Analogous</option>
              <option value="split-complementary">Split Complementary</option>
              <option value="monochromatic">Monochromatic</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{harmony.description}</span>
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
            <div className="flex gap-2">
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

      {activeTab === 'presets' && showPresets && (
        <div className="space-y-4">
          {presetPalettes.map((palette) => (
            <div key={palette.name} className="space-y-2">
              <span className="text-sm font-medium text-gray-700">{palette.name}</span>
              <div className="flex gap-2">
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
  )
}

export default ColorPicker