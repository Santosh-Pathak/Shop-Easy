'use client'

import React, { useState, useCallback } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormLabel } from '@/components/ui/form'

interface LabourRow {
  id: string
  labourType: string
  unit: string
  cost: number
  quantity: number
}

interface MaterialRow {
  id: string
  materialType: string
  unit: string
  cost: number
  quantity: number
}

interface DynamicTableFormProps {
  labourRows: LabourRow[]
  materialRows: MaterialRow[]
  onLabourChange: (rows: LabourRow[]) => void
  onMaterialChange: (rows: MaterialRow[]) => void
  className?: string
  disabled?: boolean
}

const DynamicTableForm: React.FC<DynamicTableFormProps> = ({
  labourRows,
  materialRows,
  onLabourChange,
  onMaterialChange,
  className = '',
  disabled = false
}) => {
  // Add labour row
  const addLabourRow = useCallback(() => {
    if (disabled) return
    
    const newRow: LabourRow = {
      id: `labour-${Date.now()}-${Math.random()}`,
      labourType: '',
      unit: '',
      cost: 0,
      quantity: 1
    }
    onLabourChange([...labourRows, newRow])
  }, [labourRows, onLabourChange, disabled])

  // Update labour row
  const updateLabourRow = useCallback((id: string, updates: Partial<LabourRow>) => {
    if (disabled) return
    
    const updatedRows = labourRows.map(row => 
      row.id === id ? { ...row, ...updates } : row
    )
    onLabourChange(updatedRows)
  }, [labourRows, onLabourChange, disabled])

  // Remove labour row
  const removeLabourRow = useCallback((id: string) => {
    if (disabled) return
    
    const filteredRows = labourRows.filter(row => row.id !== id)
    onLabourChange(filteredRows)
  }, [labourRows, onLabourChange, disabled])

  // Add material row
  const addMaterialRow = useCallback(() => {
    if (disabled) return
    
    const newRow: MaterialRow = {
      id: `material-${Date.now()}-${Math.random()}`,
      materialType: '',
      unit: '',
      cost: 0,
      quantity: 1
    }
    onMaterialChange([...materialRows, newRow])
  }, [materialRows, onMaterialChange, disabled])

  // Update material row
  const updateMaterialRow = useCallback((id: string, updates: Partial<MaterialRow>) => {
    if (disabled) return
    
    const updatedRows = materialRows.map(row => 
      row.id === id ? { ...row, ...updates } : row
    )
    onMaterialChange(updatedRows)
  }, [materialRows, onMaterialChange, disabled])

  // Remove material row
  const removeMaterialRow = useCallback((id: string) => {
    if (disabled) return
    
    const filteredRows = materialRows.filter(row => row.id !== id)
    onMaterialChange(filteredRows)
  }, [materialRows, onMaterialChange, disabled])

  // Calculate totals
  const labourTotal = labourRows.reduce((sum, row) => sum + (row.cost * row.quantity), 0)
  const materialTotal = materialRows.reduce((sum, row) => sum + (row.cost * row.quantity), 0)
  const grandTotal = labourTotal + materialTotal

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Labour Section */}
      <Card className="border border-[var(--border-default)] bg-[var(--bg-primary)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[var(--fg-primary)]">Labour</CardTitle>
              <p className="text-sm text-[var(--fg-muted)] mt-1">Add labour costs and quantities</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addLabourRow}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Labour
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {labourRows.length === 0 ? (
            <div className="text-center py-8 text-[var(--fg-muted)]">
              <p className="text-sm">No labour items added.</p>
              <p className="text-xs mt-1">Click "Add Labour" to get started.</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-default)]">
                <div className="col-span-3">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Labour Type</FormLabel>
                </div>
                <div className="col-span-2">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Unit</FormLabel>
                </div>
                <div className="col-span-3">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Cost per Unit</FormLabel>
                </div>
                <div className="col-span-2">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Quantity</FormLabel>
                </div>
                <div className="col-span-1">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Total</FormLabel>
                </div>
                <div className="col-span-1">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Action</FormLabel>
                </div>
              </div>

              {/* Table Rows */}
              <div className="space-y-2">
                {labourRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <div className="col-span-3">
                      <Input
                        type="text"
                        value={row.labourType}
                        onChange={(e) => updateLabourRow(row.id, { labourType: e.target.value })}
                        placeholder="e.g., Installation"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="text"
                        value={row.unit}
                        onChange={(e) => updateLabourRow(row.id, { unit: e.target.value })}
                        placeholder="e.g., hour"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.cost || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0)
                          updateLabourRow(row.id, { cost: value })
                        }}
                        placeholder="0.00"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity || ''}
                        onChange={(e) => {
                          const value = Math.max(1, parseInt(e.target.value || '1', 10) || 1)
                          updateLabourRow(row.id, { quantity: value })
                        }}
                        placeholder="1"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm font-medium text-[var(--fg-primary)]">
                        {formatCurrency(row.cost * row.quantity)}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLabourRow(row.id)}
                        disabled={disabled}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                        title="Remove labour item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Labour Subtotal */}
              <div className="flex justify-end pt-2 border-t border-[var(--border-default)]">
                <div className="text-sm">
                  <span className="text-[var(--fg-muted)]">Labour Subtotal: </span>
                  <span className="font-semibold text-[var(--fg-primary)]">{formatCurrency(labourTotal)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Materials Section */}
      <Card className="border border-[var(--border-default)] bg-[var(--bg-primary)]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[var(--fg-primary)]">Materials</CardTitle>
              <p className="text-sm text-[var(--fg-muted)] mt-1">Add material costs and quantities</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addMaterialRow}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {materialRows.length === 0 ? (
            <div className="text-center py-8 text-[var(--fg-muted)]">
              <p className="text-sm">No material items added.</p>
              <p className="text-xs mt-1">Click "Add Material" to get started.</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-default)]">
                <div className="col-span-3">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Material Type</FormLabel>
                </div>
                <div className="col-span-2">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Unit</FormLabel>
                </div>
                <div className="col-span-3">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Cost per Unit</FormLabel>
                </div>
                <div className="col-span-2">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Quantity</FormLabel>
                </div>
                <div className="col-span-1">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Total</FormLabel>
                </div>
                <div className="col-span-1">
                  <FormLabel className="text-xs font-medium text-[var(--fg-muted)]">Action</FormLabel>
                </div>
              </div>

              {/* Table Rows */}
              <div className="space-y-2">
                {materialRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors">
                    <div className="col-span-3">
                      <Input
                        type="text"
                        value={row.materialType}
                        onChange={(e) => updateMaterialRow(row.id, { materialType: e.target.value })}
                        placeholder="e.g., Cable"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="text"
                        value={row.unit}
                        onChange={(e) => updateMaterialRow(row.id, { unit: e.target.value })}
                        placeholder="e.g., pcs"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={row.cost || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0)
                          updateMaterialRow(row.id, { cost: value })
                        }}
                        placeholder="0.00"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity || ''}
                        onChange={(e) => {
                          const value = Math.max(1, parseInt(e.target.value || '1', 10) || 1)
                          updateMaterialRow(row.id, { quantity: value })
                        }}
                        placeholder="1"
                        disabled={disabled}
                        className="h-9 text-sm bg-[var(--bg-primary)] border-[var(--border-default)] text-[var(--fg-primary)]"
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm font-medium text-[var(--fg-primary)]">
                        {formatCurrency(row.cost * row.quantity)}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMaterialRow(row.id)}
                        disabled={disabled}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                        title="Remove material item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Materials Subtotal */}
              <div className="flex justify-end pt-2 border-t border-[var(--border-default)]">
                <div className="text-sm">
                  <span className="text-[var(--fg-muted)]">Materials Subtotal: </span>
                  <span className="font-semibold text-[var(--fg-primary)]">{formatCurrency(materialTotal)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Grand Total */}
      {(labourRows.length > 0 || materialRows.length > 0) && (
        <Card className="border border-[var(--border-default)] bg-gradient-to-r from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[var(--interactive-primary)]" />
                <span className="text-lg font-semibold text-[var(--fg-primary)]">Labour & Materials Total</span>
              </div>
              <span className="text-xl font-bold text-[var(--fg-primary)]">
                {formatCurrency(grandTotal)}
              </span>
            </div>
            <div className="mt-2 flex justify-end space-x-4 text-sm text-[var(--fg-muted)]">
              <span>Labour: {formatCurrency(labourTotal)}</span>
              <span>Materials: {formatCurrency(materialTotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DynamicTableForm