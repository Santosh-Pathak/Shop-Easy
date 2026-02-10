/**
 * Color Utilities
 *
 * Shared color conversion and manipulation utilities used across the theme system.
 * Provides consistent color handling for theme management and color picker components.
 */

export interface RgbColor {
   r: number
   g: number
   b: number
}

export interface HslColor {
   h: number
   s: number
   l: number
}

// Color validation
export const isValidHex = (hex: string): boolean => {
   return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

export const normalizeHex = (hex: string): string => {
   hex = hex.replace('#', '')
   if (hex.length === 3) {
      hex = hex
         .split('')
         .map((char) => char + char)
         .join('')
   }
   return '#' + hex.toLowerCase()
}

// Color conversions
export const hexToRgb = (hex: string): RgbColor | null => {
   if (!isValidHex(hex)) return null
   const normalized = normalizeHex(hex)
   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
   return result
      ? {
           r: parseInt(result[1], 16),
           g: parseInt(result[2], 16),
           b: parseInt(result[3], 16),
        }
      : null
}

export const rgbToHex = (r: number, g: number, b: number): string => {
   return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export const rgbToHsl = (r: number, g: number, b: number): HslColor => {
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
         case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
         case g:
            h = (b - r) / d + 2
            break
         case b:
            h = (r - g) / d + 4
            break
         default:
            h = 0
            break
      }

      h /= 6
   }

   return { h: h * 360, s: s * 100, l: l * 100 }
}

export const hslToRgb = (h: number, s: number, l: number): RgbColor => {
   h /= 360
   s /= 100
   l /= 100

   const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
   }

   let r: number, g: number, b: number

   if (s === 0) {
      r = g = b = l // achromatic
   } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
   }

   return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
   }
}

// Color contrast calculation
export const getLuminance = (r: number, g: number, b: number): number => {
   const sRGB = [r, g, b].map((c) => {
      c /= 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
   })
   return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

export const getContrastRatio = (color1: string, color2: string): number => {
   const rgb1 = hexToRgb(color1)
   const rgb2 = hexToRgb(color2)
   if (!rgb1 || !rgb2) return 1

   const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
   const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

   return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)
}

// Color accessibility checks
export const isColorAccessible = (
   foreground: string,
   background: string,
   level: 'AA' | 'AAA' = 'AA'
): boolean => {
   const ratio = getContrastRatio(foreground, background)
   return level === 'AAA' ? ratio >= 7 : ratio >= 4.5
}

// Color brightness
export const getBrightness = (hex: string): number => {
   const rgb = hexToRgb(hex)
   if (!rgb) return 0
   return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
}

export const isColorDark = (hex: string): boolean => {
   return getBrightness(hex) < 128
}

export const isColorLight = (hex: string): boolean => {
   return getBrightness(hex) >= 128
}

// Color manipulation
export const lightenColor = (hex: string, amount: number): string => {
   const rgb = hexToRgb(hex)
   if (!rgb) return hex

   const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
   hsl.l = Math.min(100, hsl.l + amount)

   const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
   return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

export const darkenColor = (hex: string, amount: number): string => {
   const rgb = hexToRgb(hex)
   if (!rgb) return hex

   const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
   hsl.l = Math.max(0, hsl.l - amount)

   const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
   return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

export const saturateColor = (hex: string, amount: number): string => {
   const rgb = hexToRgb(hex)
   if (!rgb) return hex

   const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
   hsl.s = Math.min(100, hsl.s + amount)

   const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
   return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

export const desaturateColor = (hex: string, amount: number): string => {
   const rgb = hexToRgb(hex)
   if (!rgb) return hex

   const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
   hsl.s = Math.max(0, hsl.s - amount)

   const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
   return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

// Color palette generation
export const generateColorShades = (
   baseColor: string,
   count: number = 9
): Record<string, string> => {
   const rgb = hexToRgb(baseColor)
   if (!rgb) return { '500': baseColor }

   const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
   const shades: Record<string, string> = {}

   const lightness = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]
   const weights = [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
   ]

   for (let i = 0; i < Math.min(count, lightness.length); i++) {
      const newHsl = { ...hsl, l: lightness[i] }
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
      shades[weights[i]] = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
   }

   return shades
}
