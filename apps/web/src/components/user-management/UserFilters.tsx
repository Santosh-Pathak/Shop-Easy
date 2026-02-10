'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
   Select, 
   SelectContent, 
   SelectItem, 
   SelectTrigger, 
   SelectValue 
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/theme-utils'

import { 
   UserFilters,
   USER_ROLES,
   USER_STATUS_OPTIONS,
   USER_VERIFICATION_OPTIONS
} from '@/types/user'

interface UserFiltersComponentProps {
   filters: UserFilters
   onFilterChange: (filters: Partial<UserFilters>) => void
   className?: string
}

const UserFiltersComponent: React.FC<UserFiltersComponentProps> = ({
   filters,
   onFilterChange,
   className
}) => {
   const [localFilters, setLocalFilters] = useState<UserFilters>(filters)

   // Handle filter changes
   const handleFilterChange = useCallback((key: keyof UserFilters, value: any) => {
      const newFilters = { ...localFilters, [key]: value }
      setLocalFilters(newFilters)
      onFilterChange({ [key]: value })
   }, [localFilters, onFilterChange])

   // Clear all filters
   const clearAllFilters = useCallback(() => {
      const clearedFilters: UserFilters = {
         role: undefined,
         active: undefined,
         isEmailVerified: undefined,
         createdFrom: undefined,
         createdTo: undefined,
         updatedFrom: undefined,
         updatedTo: undefined,
         name: undefined,
         email: undefined,
      }
      
      setLocalFilters(clearedFilters)
      
      onFilterChange(clearedFilters)
   }, [onFilterChange])

   // Check if any filters are applied
   const hasActiveFilters = !!(
      filters.role ||
      filters.active !== undefined ||
      filters.isEmailVerified !== undefined ||
      filters.createdFrom ||
      filters.createdTo ||
      filters.updatedFrom ||
      filters.updatedTo ||
      filters.name ||
      filters.email
   )

   return (
      <div className={cn("space-y-6", className)}>
         {/* Quick Filters Row */}
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Role Filter */}
            <div className="space-y-2">
               <Label className="theme-text-primary text-sm font-medium">Role</Label>
               <Select
                  value={localFilters.role || 'all'}
                  onValueChange={(value) => 
                     handleFilterChange('role', value === 'all' ? undefined : value)
                  }
               >
                  <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary border-0 bg-transparent">
                     <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                     <SelectItem value="all">All Roles</SelectItem>
                     {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                           <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", role.color.split(' ')[0])} />
                              <span>{role.label}</span>
                           </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Active Status Filter */}
            <div className="space-y-2">
               <Label className="theme-text-primary text-sm font-medium">Status</Label>
               <Select
                  value={
                     localFilters.active === undefined 
                        ? 'all' 
                        : localFilters.active 
                           ? 'active' 
                           : 'inactive'
                  }
                  onValueChange={(value) => {
                     const activeValue = value === 'all' 
                        ? undefined 
                        : value === 'active'
                     handleFilterChange('active', activeValue)
                  }}
               >
                  <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary border-0 bg-transparent">
                     <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                     {USER_STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                           <div className="flex items-center gap-2">
                              <div className={cn(
                                 "h-2 w-2 rounded-full",
                                 option.value === 'active' ? 'bg-green-500' :
                                 option.value === 'inactive' ? 'bg-red-500' : 'bg-gray-400'
                              )} />
                              <span>{option.label}</span>
                           </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Email Verification Filter */}
            <div className="space-y-2">
               <Label className="theme-text-primary text-sm font-medium">Verification</Label>
               <Select
                  value={
                     localFilters.isEmailVerified === undefined 
                        ? 'all' 
                        : localFilters.isEmailVerified 
                           ? 'verified' 
                           : 'unverified'
                  }
                  onValueChange={(value) => {
                     const verifiedValue = value === 'all' 
                        ? undefined 
                        : value === 'verified'
                     handleFilterChange('isEmailVerified', verifiedValue)
                  }}
               >
                  <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary border-0 bg-transparent">
                     <SelectValue placeholder="All Verification" />
                  </SelectTrigger>
                  <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                     {USER_VERIFICATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                           <div className="flex items-center gap-2">
                              <div className={cn(
                                 "h-2 w-2 rounded-full",
                                 option.value === 'verified' ? 'bg-green-500' :
                                 option.value === 'unverified' ? 'bg-yellow-500' : 'bg-gray-400'
                              )} />
                              <span>{option.label}</span>
                           </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
               <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary w-full border-0 bg-transparent"
               >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear All
               </Button>
            </div>
         </div>

         {/* Advanced Filters */}
         <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Search Filters */}
            <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
               <CardContent className="p-4">
                  <h4 className="theme-text-primary mb-4 text-sm font-semibold">Search Filters</h4>
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label className="theme-text-secondary text-xs font-medium">Name Contains</Label>
                        <Input
                           type="text"
                           placeholder="Search by name..."
                           value={localFilters.name || ''}
                           onChange={(e) => handleFilterChange('name', e.target.value || undefined)}
                           className="theme-border theme-bg-primary theme-text-primary border-0 bg-transparent text-sm"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="theme-text-secondary text-xs font-medium">Email Contains</Label>
                        <Input
                           type="email"
                           placeholder="Search by email..."
                           value={localFilters.email || ''}
                           onChange={(e) => handleFilterChange('email', e.target.value || undefined)}
                           className="theme-border theme-bg-primary theme-text-primary border-0 bg-transparent text-sm"
                        />
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Date Range Filters */}
            <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
               <CardContent className="p-4">
                  <h4 className="theme-text-primary mb-4 text-sm font-semibold">Date Ranges</h4>
                  <div className="space-y-4">
                     {/* Created Date Range */}
                     <div className="space-y-3">
                        <Label className="theme-text-secondary text-xs font-medium">Created Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                           <Input
                              type="date"
                              value={localFilters.createdFrom || ''}
                              onChange={(e) => handleFilterChange('createdFrom', e.target.value || undefined)}
                              className="theme-border theme-bg-primary theme-text-primary border-0 bg-transparent text-xs"
                              placeholder="From date"
                           />
                           <Input
                              type="date"
                              value={localFilters.createdTo || ''}
                              onChange={(e) => handleFilterChange('createdTo', e.target.value || undefined)}
                              className="theme-border theme-bg-primary theme-text-primary border-0 bg-transparent text-xs"
                              placeholder="To date"
                           />
                        </div>
                     </div>

                     {/* Updated Date Range */}
                     <div className="space-y-3">
                        <Label className="theme-text-secondary text-xs font-medium">Updated Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                           <Input
                              type="date"
                              value={localFilters.updatedFrom || ''}
                              onChange={(e) => handleFilterChange('updatedFrom', e.target.value || undefined)}
                              className="theme-border theme-bg-primary theme-text-primary border-0 bg-transparent text-xs"
                              placeholder="From date"
                           />
                           <Input
                              type="date"
                              value={localFilters.updatedTo || ''}
                              onChange={(e) => handleFilterChange('updatedTo', e.target.value || undefined)}
                              className="theme-border theme-bg-primary theme-text-primary border-0 bg-transparent text-xs"
                              placeholder="To date"
                           />
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Active Filters Summary */}
         {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
               <span className="theme-text-secondary text-sm font-medium">Active filters:</span>
               {filters.role && (
                  <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
                     <span>Role: {USER_ROLES.find(r => r.value === filters.role)?.label}</span>
                     <button
                        onClick={() => handleFilterChange('role', undefined)}
                        className="ml-1 hover:text-blue-600"
                     >
                        <X className="h-3 w-3" />
                     </button>
                  </div>
               )}
               {filters.active !== undefined && (
                  <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-950/50 dark:text-green-400">
                     <span>Status: {filters.active ? 'Active' : 'Inactive'}</span>
                     <button
                        onClick={() => handleFilterChange('active', undefined)}
                        className="ml-1 hover:text-green-600"
                     >
                        <X className="h-3 w-3" />
                     </button>
                  </div>
               )}
               {filters.isEmailVerified !== undefined && (
                  <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400">
                     <span>Verification: {filters.isEmailVerified ? 'Verified' : 'Unverified'}</span>
                     <button
                        onClick={() => handleFilterChange('isEmailVerified', undefined)}
                        className="ml-1 hover:text-yellow-600"
                     >
                        <X className="h-3 w-3" />
                     </button>
                  </div>
               )}
               {filters.name && (
                  <div className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-950/50 dark:text-purple-400">
                     <span>Name: {filters.name}</span>
                     <button
                        onClick={() => handleFilterChange('name', undefined)}
                        className="ml-1 hover:text-purple-600"
                     >
                        <X className="h-3 w-3" />
                     </button>
                  </div>
               )}
               {filters.email && (
                  <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
                     <span>Email: {filters.email}</span>
                     <button
                        onClick={() => handleFilterChange('email', undefined)}
                        className="ml-1 hover:text-indigo-600"
                     >
                        <X className="h-3 w-3" />
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   )
}

export default UserFiltersComponent