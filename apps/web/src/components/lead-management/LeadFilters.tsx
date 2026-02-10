'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
   LeadFilters,
   LEAD_STATUSES,
   LEAD_TYPES,
   LEAD_PRIORITIES,
   LeadStatus,
   LeadType,
   LeadPriority,
} from '@/types/lead'

interface LeadFiltersComponentProps {
   filters: LeadFilters
   onFilterChange: (filters: Partial<LeadFilters>) => void
}

const LeadFiltersComponent: React.FC<LeadFiltersComponentProps> = ({
   filters,
   onFilterChange,
}) => {
   const hasActiveFilters = !!(
      filters.status ||
      filters.type ||
      filters.priority
   )

   const clearAllFilters = () => {
      onFilterChange({
         status: undefined,
         type: undefined,
         priority: undefined,
      })
   }

   const clearFilter = (filterKey: keyof LeadFilters) => {
      onFilterChange({ [filterKey]: undefined })
   }

   return (
      <div className="space-y-4 sm:space-y-6">
         {/* Filter Controls - Mobile First Grid */}
         <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Status Filter */}
            <div className="space-y-2">
               <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                  Status
               </label>
               <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                     onFilterChange({
                        status: value === 'all' ? undefined : (value as LeadStatus),
                     })
                  }
               >
                  <SelectTrigger id="status-filter" className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                     <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All statuses</SelectItem>
                     {LEAD_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                           <div className="flex items-center gap-2">
                              <div
                                 className={`h-2 w-2 rounded-full ${status.color.split(' ')[0]}`}
                              />
                              {status.label}
                           </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
               <label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
                  Type
               </label>
               <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) =>
                     onFilterChange({
                        type: value === 'all' ? undefined : (value as LeadType),
                     })
                  }
               >
                  <SelectTrigger id="type-filter" className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                     <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All types</SelectItem>
                     {LEAD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                           {type.label}
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
               <label htmlFor="priority-filter" className="text-sm font-medium text-gray-700">
                  Priority
               </label>
               <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) =>
                     onFilterChange({
                        priority: value === 'all' ? undefined : (value as LeadPriority),
                     })
                  }
               >
                  <SelectTrigger id="priority-filter" className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                     <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">All priorities</SelectItem>
                     {LEAD_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                           <div className="flex items-center gap-2">
                              <div
                                 className={`h-2 w-2 rounded-full ${priority.color.split(' ')[0]}`}
                              />
                              {priority.label}
                           </div>
                        </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
            </div>

            {/* Page Size Filter */}
            <div className="space-y-2">
               <label htmlFor="limit-filter" className="text-sm font-medium">
                  Per Page
               </label>
               <Select
                  value={filters.limit?.toString() || '10'}
                  onValueChange={(value) =>
                     onFilterChange({ limit: parseInt(value), page: 1 })
                  }
               >
                  <SelectTrigger id="limit-filter">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="5">5 per page</SelectItem>
                     <SelectItem value="10">10 per page</SelectItem>
                     <SelectItem value="25">25 per page</SelectItem>
                     <SelectItem value="50">50 per page</SelectItem>
                     <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>

         {/* Active Filters Display */}
         {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-sm font-medium">Active filters:</span>

               {filters.status && (
                  <Badge
                     variant="secondary"
                     className="flex items-center gap-1"
                  >
                     Status:{' '}
                     {
                        LEAD_STATUSES.find((s) => s.value === filters.status)
                           ?.label
                     }
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => clearFilter('status')}
                     >
                        <X className="h-3 w-3" />
                     </Button>
                  </Badge>
               )}

               {filters.type && (
                  <Badge
                     variant="secondary"
                     className="flex items-center gap-1"
                  >
                     Type:{' '}
                     {LEAD_TYPES.find((t) => t.value === filters.type)?.label}
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => clearFilter('type')}
                     >
                        <X className="h-3 w-3" />
                     </Button>
                  </Badge>
               )}

               {filters.priority && (
                  <Badge
                     variant="secondary"
                     className="flex items-center gap-1"
                  >
                     Priority:{' '}
                     {
                        LEAD_PRIORITIES.find(
                           (p) => p.value === filters.priority
                        )?.label
                     }
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => clearFilter('priority')}
                     >
                        <X className="h-3 w-3" />
                     </Button>
                  </Badge>
               )}

               <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="ml-2"
               >
                  Clear all
               </Button>
            </div>
         )}
      </div>
   )
}

export default LeadFiltersComponent
