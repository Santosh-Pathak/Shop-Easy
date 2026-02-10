'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/theme-utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconCalendar, IconX } from '@tabler/icons-react'
import { parseDurationString, formatDurationString, formatDuration } from '@/store/serviceManagement.store'
import type { DurationPickerProps, DurationComponents } from '@/types/serviceManagement'

const DurationPicker: React.FC<DurationPickerProps> = ({
  value = '',
  onChange,
  label,
  placeholder = 'Select duration',
  className,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [components, setComponents] = useState<DurationComponents>({ years: 0, months: 0, days: 0 })

  // Parse the current value when it changes
  useEffect(() => {
    if (value) {
      setComponents(parseDurationString(value))
    } else {
      setComponents({ years: 0, months: 0, days: 0 })
    }
  }, [value])

  const handleComponentChange = (component: keyof DurationComponents, newValue: string) => {
    const numValue = parseInt(newValue) || 0
    
    // Validate ranges
    let validValue = numValue
    if (component === 'years' && numValue > 99) validValue = 99
    if (component === 'months' && numValue > 11) validValue = 11
    if (component === 'days' && numValue > 30) validValue = 30
    if (validValue < 0) validValue = 0
    
    const newComponents = { ...components, [component]: validValue }
    setComponents(newComponents)
    
    // Generate duration string and call onChange
    const durationString = formatDurationString(newComponents.years, newComponents.months, newComponents.days)
    onChange(durationString)
  }

  const handleClear = () => {
    setComponents({ years: 0, months: 0, days: 0 })
    onChange('')
    setIsOpen(false)
  }

  const handleApply = () => {
    const durationString = formatDurationString(components.years, components.months, components.days)
    onChange(durationString)
    setIsOpen(false)
  }

  const displayValue = value ? formatDuration(value) : ''
  const hasValue = components.years > 0 || components.months > 0 || components.days > 0

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="theme-text-primary">
          {label}
        </Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal theme-input',
              !displayValue && 'theme-text-muted',
              error && 'border-destructive focus:ring-destructive',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 theme-dropdown" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium theme-text-primary">Select Duration</h4>
              {hasValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0"
                >
                  <IconX className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Years */}
              <div className="space-y-2">
                <Label className="text-xs theme-text-muted">Years</Label>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={components.years || ''}
                  onChange={(e) => handleComponentChange('years', e.target.value)}
                  placeholder="0"
                  className="theme-input text-center"
                />
              </div>
              
              {/* Months */}
              <div className="space-y-2">
                <Label className="text-xs theme-text-muted">Months</Label>
                <Input
                  type="number"
                  min="0"
                  max="11"
                  value={components.months || ''}
                  onChange={(e) => handleComponentChange('months', e.target.value)}
                  placeholder="0"
                  className="theme-input text-center"
                />
              </div>
              
              {/* Days */}
              <div className="space-y-2">
                <Label className="text-xs theme-text-muted">Days</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={components.days || ''}
                  onChange={(e) => handleComponentChange('days', e.target.value)}
                  placeholder="0"
                  className="theme-input text-center"
                />
              </div>
            </div>
            
            {/* Preview */}
            <div className="rounded-md bg-muted p-3">
              <Label className="text-xs theme-text-muted">Preview:</Label>
              <p className="text-sm theme-text-primary mt-1">
                {hasValue ? formatDuration(formatDurationString(components.years, components.months, components.days)) : 'No duration selected'}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="theme-button-outline"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="theme-button-primary"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

export default DurationPicker