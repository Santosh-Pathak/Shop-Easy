'use client'

import {
   ArrowLeft,
   ArrowRight,
   Building2,
   Calendar,
   ChevronLeft,
   ChevronRight,
   Clock,
   Edit,
   Eye,
   Filter,
   Grid,
   Grid3X3,
   LayoutGrid,
   List,
   Mail,
   MapPin,
   MoreVertical,
   Phone,
   Search,
   Star,
   Trash,
   User,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

// Define the types for your data and column
interface Column<T> {
   Header: string
   accessor: keyof T | 'actions'
   Cell?: (row: T) => React.ReactNode
}

type ViewType = 'default' | 'compact' | 'detailed' | 'grid' | 'list' | 'minimal'

interface DynamicCardListProps<T> {
   data: T[]
   columns: Column<T>[]
   pageSize?: number
   onSearch?: (searchTerm: string) => void
   onPageChange?: (page: number) => void
   isLoading?: boolean
   searchPlaceholder?: string
   viewType?: ViewType
   onViewTypeChange?: (viewType: ViewType) => void
   showSearchInHeader?: boolean // Whether to show search in the header

   // Server-side pagination props
   totalCount?: number
   currentPage?: number
   isServerSide?: boolean

   // Card-specific props
   cardTitle?: (row: T) => string
   cardSubtitle?: (row: T) => string
   cardImage?: (row: T) => string
   cardBadges?: (
      row: T
   ) => { label: string; variant?: string; color?: string }[]
   cardActions?: (row: T) => React.ReactNode
   cardContent?: (row: T) => React.ReactNode

   // Custom field mappings for different data types
   nameField?: keyof T
   emailField?: keyof T
   phoneField?: keyof T
   statusField?: keyof T
   dateField?: keyof T
   imageField?: keyof T
   companyField?: keyof T
   locationField?: keyof T
   priorityField?: keyof T
}

const DynamicCardList = <T,>({
   data,
   columns,
   pageSize = 12,
   isLoading = false,
   onSearch,
   onPageChange,
   totalCount,
   currentPage: serverCurrentPage,
   isServerSide = false,
   searchPlaceholder,
   viewType = 'default',
   onViewTypeChange,
   showSearchInHeader = true,
   cardTitle,
   cardSubtitle,
   cardImage,
   cardBadges,
   cardActions,
   cardContent,
   nameField,
   emailField,
   phoneField,
   statusField,
   dateField,
   imageField,
   companyField,
   locationField,
   priorityField,
}: DynamicCardListProps<T>) => {
   const searchParams = useSearchParams()
   const pathname = usePathname()
   const router = useRouter()

   // Auto-determine search placeholder based on current page if not provided
   const getSearchPlaceholder = () => {
      if (searchPlaceholder) {
         return searchPlaceholder
      }

      if (pathname.includes('/lead-management')) {
         return 'Search leads...'
      } else if (pathname.includes('/manage-customers')) {
         return 'Search customers...'
      } else if (pathname.includes('/manage-consultants')) {
         return 'Search consultants...'
      } else if (pathname.includes('/manage-cases')) {
         return 'Search cases...'
      } else if (pathname.includes('/quote-generation')) {
         return 'Search quotes...'
      } else {
         return 'Search...' // Default fallback
      }
   }

   // Get the current page from the query param, default to 1 if not set
   const initialPage = Math.max(
      0,
      Number.parseInt(searchParams.get('page') || '1', 10) - 1
   )
   const initialSearch = searchParams.get('search') || ''

   const [search, setSearch] = useState(initialSearch)
   const [currentPage, setCurrentPage] = useState(
      isServerSide
         ? serverCurrentPage
            ? serverCurrentPage - 1
            : initialPage
         : initialPage
   )
   const [localSearch, setLocalSearch] = useState(initialSearch)
   const [currentViewType, setCurrentViewType] = useState<ViewType>(viewType)
   const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

   const debouncedSearch = useCallback(
      (value: string) => {
         if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
         }

         debounceTimeout.current = setTimeout(() => {
            setSearch(value)
            setCurrentPage(0) // Reset to first page when searching
            onSearch?.(value) // Call the onSearch callback if provided
         }, 300)
      },
      [onSearch]
   )

   const LoadingOverlay = () => (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
         <div className="flex flex-col items-center">
            <svg
               className="mb-2 size-8 animate-spin text-blue-600 dark:text-blue-400"
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
            >
               <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
               ></circle>
               <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
               ></path>
            </svg>
            <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
               Loading...
            </span>
         </div>
      </div>
   )

   const handleSearchChange = (value: string) => {
      setLocalSearch(value)
      debouncedSearch(value)
   }

   const handleViewTypeChange = (newViewType: ViewType) => {
      setCurrentViewType(newViewType)
      onViewTypeChange?.(newViewType)
   }

   // Clean up timeout on unmount
   useEffect(() => {
      return () => {
         if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
         }
      }
   }, [])

   useEffect(() => {
      // Sync the URL with the current page and search term
      const queryParams = new URLSearchParams(searchParams.toString())
      queryParams.set('page', (currentPage + 1).toString())

      // Add search parameter only if search is not empty
      if (search) {
         queryParams.set('search', search)
      } else {
         queryParams.delete('search')
      }

      // Only update URL if not server-side pagination (to avoid conflicts)
      if (!isServerSide) {
         router.push(`${pathname}?${queryParams.toString()}`)
      }
   }, [currentPage, search, pathname, router, searchParams, isServerSide])

   // Handle page changes for server-side pagination
   const handlePageChange = (page: number) => {
      setCurrentPage(page)
      if (isServerSide && onPageChange) {
         onPageChange(page)
      }
   }

   // Filter and paginate data
   const filteredData = isServerSide
      ? data // For server-side, data is already filtered and paginated
      : data.filter((row) =>
           columns.some(
              (column) =>
                 column.accessor !== 'actions' &&
                 String(row[column.accessor])
                    .toLowerCase()
                    .includes(search.toLowerCase())
           )
        )

   const pageCount = isServerSide
      ? Math.ceil((totalCount || 0) / pageSize)
      : Math.ceil(filteredData.length / pageSize)

   // Ensure current page is within valid range after filtering
   const adjustedCurrentPage = Math.min(currentPage, pageCount - 1)

   const paginatedData = isServerSide
      ? filteredData // For server-side, data is already paginated
      : filteredData.slice(
           adjustedCurrentPage * pageSize,
           (adjustedCurrentPage + 1) * pageSize
        )

   // Update current page if server-side pagination changes
   useEffect(() => {
      if (isServerSide && serverCurrentPage !== undefined) {
         setCurrentPage(serverCurrentPage - 1)
      }
   }, [isServerSide, serverCurrentPage])

   // Helper function to get field value
   const getFieldValue = (row: T, field?: keyof T) => {
      return field ? row[field] : null
   }

   // Helper function to format date
   const formatDate = (date: any) => {
      if (!date) return null
      try {
         return new Date(date).toLocaleDateString()
      } catch {
         return null
      }
   }

   // Helper function to get initials
   const getInitials = (name: string) => {
      return name
         .split(' ')
         .map((word) => word.charAt(0))
         .join('')
         .toUpperCase()
         .slice(0, 2)
   }

   // Default card actions
   const getDefaultActions = (row: T) => {
      return (
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" className="size-8 p-0">
                  <MoreVertical className="size-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
               <DropdownMenuItem>
                  <Eye className="mr-2 size-4" />
                  View Details
               </DropdownMenuItem>
               <DropdownMenuItem>
                  <Edit className="mr-2 size-4" />
                  Edit
               </DropdownMenuItem>
               <DropdownMenuItem className="text-red-600">
                  <Trash className="mr-2 size-4" />
                  Delete
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      )
   }

   // Render card based on view type
   const renderCard = (row: T, index: number) => {
      const title = cardTitle
         ? cardTitle(row)
         : String(getFieldValue(row, nameField) || `Item ${index + 1}`)
      const subtitle = cardSubtitle
         ? cardSubtitle(row)
         : String(
              getFieldValue(row, companyField) ||
                 getFieldValue(row, emailField) ||
                 ''
           )
      const image = cardImage
         ? cardImage(row)
         : String(getFieldValue(row, imageField) || '')
      const badges = cardBadges ? cardBadges(row) : []
      const actions = cardActions ? cardActions(row) : getDefaultActions(row)
      const content = cardContent ? cardContent(row) : null

      const name = String(getFieldValue(row, nameField) || title)
      const email = String(getFieldValue(row, emailField) || '')
      const phone = String(getFieldValue(row, phoneField) || '')
      const status = String(getFieldValue(row, statusField) || '')
      const date = formatDate(getFieldValue(row, dateField))
      const company = String(getFieldValue(row, companyField) || '')
      const location = String(getFieldValue(row, locationField) || '')
      const priority = String(getFieldValue(row, priorityField) || '')

      switch (currentViewType) {
         case 'compact':
            return (
               <Card
                  key={index}
                  className="group border border-gray-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800/90"
               >
                  <CardContent className="p-4">
                     <div className="flex items-center space-x-3">
                        <Avatar className="size-10">
                           <AvatarImage src={image} alt={name} />
                           <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                              {getInitials(name)}
                           </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                           <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                              {title}
                           </p>
                           {subtitle && (
                              <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                                 {subtitle}
                              </p>
                           )}
                        </div>
                        <div className="flex items-center space-x-2">
                           {badges.slice(0, 1).map((badge, i) => (
                              <Badge
                                 key={i}
                                 variant="secondary"
                                 className="text-xs"
                              >
                                 {badge.label}
                              </Badge>
                           ))}
                           {actions}
                        </div>
                     </div>
                  </CardContent>
               </Card>
            )

         case 'detailed':
            return (
               <Card
                  key={index}
                  className="group border border-gray-200/60 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-gray-700/60 dark:bg-gray-800/95"
               >
                  <CardHeader className="pb-3">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                           <Avatar className="size-14">
                              <AvatarImage src={image} alt={name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                                 {getInitials(name)}
                              </AvatarFallback>
                           </Avatar>
                           <div>
                              <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                 {title}
                              </CardTitle>
                              {subtitle && (
                                 <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {subtitle}
                                 </p>
                              )}
                           </div>
                        </div>
                        {actions}
                     </div>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-3">
                        {email && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Mail className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {email}
                              </span>
                           </div>
                        )}
                        {phone && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Phone className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {phone}
                              </span>
                           </div>
                        )}
                        {company && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Building2 className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {company}
                              </span>
                           </div>
                        )}
                        {location && (
                           <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {location}
                              </span>
                           </div>
                        )}
                        {date && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Clock className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {date}
                              </span>
                           </div>
                        )}
                        {content}
                        {badges.length > 0 && (
                           <div className="flex flex-wrap gap-2 pt-2">
                              {badges.map((badge, i) => (
                                 <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                 >
                                    {badge.label}
                                 </Badge>
                              ))}
                           </div>
                        )}
                     </div>
                  </CardContent>
               </Card>
            )

         case 'grid':
            return (
               <Card
                  key={index}
                  className="group border border-gray-200/60 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-gray-700/60 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-600/30"
               >
                  <CardContent className="p-6 text-center">
                     <Avatar className="mx-auto mb-4 size-16">
                        <AvatarImage src={image} alt={name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                           {getInitials(name)}
                        </AvatarFallback>
                     </Avatar>
                     <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                     </h3>
                     {subtitle && (
                        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                           {subtitle}
                        </p>
                     )}
                     {badges.length > 0 && (
                        <div className="mb-3 flex justify-center">
                           <Badge variant="secondary" className="text-xs">
                              {badges[0].label}
                           </Badge>
                        </div>
                     )}
                     <div className="flex justify-center">{actions}</div>
                  </CardContent>
               </Card>
            )

         case 'list':
            return (
               <Card
                  key={index}
                  className="group border border-gray-200/60 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800/90"
               >
                  <CardContent className="p-4">
                     <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center space-x-4">
                           <Avatar className="size-12">
                              <AvatarImage src={image} alt={name} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                                 {getInitials(name)}
                              </AvatarFallback>
                           </Avatar>
                           <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-4">
                              <div>
                                 <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {title}
                                 </p>
                                 {subtitle && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                       {subtitle}
                                    </p>
                                 )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                 {email && <p>{email}</p>}
                                 {phone && <p>{phone}</p>}
                              </div>
                              <div className="flex items-center space-x-2">
                                 {badges.slice(0, 2).map((badge, i) => (
                                    <Badge
                                       key={i}
                                       variant="outline"
                                       className="text-xs"
                                    >
                                       {badge.label}
                                    </Badge>
                                 ))}
                              </div>
                           </div>
                        </div>
                        {actions}
                     </div>
                  </CardContent>
               </Card>
            )

         case 'minimal':
            return (
               <Card
                  key={index}
                  className="group border border-gray-200/40 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md dark:border-gray-700/40 dark:bg-gray-800/80"
               >
                  <CardContent className="p-3">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                           <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                              {getInitials(name)}
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                 {title}
                              </p>
                              {badges.length > 0 && (
                                 <Badge
                                    variant="outline"
                                    className="mt-1 text-xs"
                                 >
                                    {badges[0].label}
                                 </Badge>
                              )}
                           </div>
                        </div>
                        {actions}
                     </div>
                  </CardContent>
               </Card>
            )

         default: // 'default'
            return (
               <Card
                  key={index}
                  className="group overflow-hidden border border-gray-200/60 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700/60 dark:bg-gray-800/95"
               >
                  <CardHeader className="pb-4">
                     <div className="flex items-start space-x-3">
                        <Avatar className="size-12">
                           <AvatarImage src={image} alt={name} />
                           <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                              {getInitials(name)}
                           </AvatarFallback>
                        </Avatar>
                        <div>
                           <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {title}
                           </CardTitle>
                           {subtitle && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                 {subtitle}
                              </p>
                           )}
                        </div>
                     </div>
                  </CardHeader>

                  <CardContent>
                     <div className="mb-4 space-y-2">
                        {email && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Mail className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {email}
                              </span>
                           </div>
                        )}
                        {phone && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Phone className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {phone}
                              </span>
                           </div>
                        )}
                        {company && (
                           <div className="flex items-center space-x-2 text-sm">
                              <Building2 className="size-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                 {company}
                              </span>
                           </div>
                        )}
                     </div>

                     {content}

                     {badges.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                           {badges.map((badge, i) => (
                              <Badge
                                 key={i}
                                 variant="outline"
                                 className="text-xs"
                              >
                                 {badge.label}
                              </Badge>
                           ))}
                        </div>
                     )}

                     {/* 👇 Actions moved to bottom */}
                     <div className="mt-4 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-700">
                        {actions}
                     </div>
                  </CardContent>
               </Card>
            )
      }
   }

   // Get grid columns based on view type and screen size
   const getGridColumns = () => {
      switch (currentViewType) {
         case 'compact':
         case 'list':
         case 'minimal':
            return 'grid-cols-1'
         case 'grid':
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4'
         case 'detailed':
            return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
         default:
            return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }
   }

   return (
      <div className="flex size-full flex-col bg-gray-50/50 dark:bg-gray-900/50">
         {/* Card Grid Container - No top margin, no bottom margin */}
         <div className="relative min-h-0 flex-1 overflow-hidden">
            {/* Loading Overlay */}
            {isLoading && <LoadingOverlay />}

            <div className="h-full overflow-y-auto p-4">
               {paginatedData.length > 0 ? (
                  <div className={`grid gap-4 ${getGridColumns()}`}>
                     {paginatedData.map((row, index) => renderCard(row, index))}
                  </div>
               ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                     <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                        <Search className="size-8 text-gray-400 dark:text-gray-500" />
                     </div>
                     <p className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                        No data found
                     </p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search criteria
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* Bottom Pagination - Normal positioning, not fixed */}
         <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
               {/* Left side - Previous button and entries count */}
               <div className="flex items-center space-x-4">
                  <Button
                     onClick={() =>
                        handlePageChange(Math.max(adjustedCurrentPage - 1, 0))
                     }
                     disabled={currentPage === 0}
                     variant="outline"
                     className="flex items-center rounded-xl border-gray-200 bg-white/90 px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                     <ArrowLeft className="mr-2 size-4" />
                     Previous
                  </Button>

                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                     Showing{' '}
                     <span className="font-semibold text-gray-900 dark:text-white">
                        {paginatedData.length}
                     </span>{' '}
                     of{' '}
                     <span className="font-semibold text-gray-900 dark:text-white">
                        {isServerSide ? totalCount || 0 : filteredData.length}
                     </span>{' '}
                     entries
                  </span>
               </div>

               {/* Center - Page numbers */}
               <div className="flex items-center justify-center space-x-1">
                  {(() => {
                     const maxVisiblePages = 5
                     const halfRange = Math.floor(maxVisiblePages / 2)
                     let startPage = Math.max(
                        0,
                        adjustedCurrentPage - halfRange
                     )
                     const endPage = Math.min(
                        pageCount,
                        startPage + maxVisiblePages
                     )

                     // Adjust start if we're near the end
                     if (endPage - startPage < maxVisiblePages) {
                        startPage = Math.max(0, endPage - maxVisiblePages)
                     }

                     const pages = []

                     // Show first page if not in range
                     if (startPage > 0) {
                        pages.push(
                           <Button
                              key={0}
                              onClick={() => handlePageChange(0)}
                              variant={
                                 adjustedCurrentPage === 0
                                    ? 'default'
                                    : 'outline'
                              }
                              size="sm"
                              className={`size-10 rounded-xl p-0 text-sm transition-all duration-200 ${
                                 adjustedCurrentPage === 0
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700'
                                    : 'border-gray-200 bg-white/90 text-gray-700 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700'
                              }`}
                           >
                              1
                           </Button>
                        )

                        // Show ellipsis if there's a gap
                        if (startPage > 1) {
                           pages.push(
                              <span
                                 key="start-ellipsis"
                                 className="px-2 text-sm text-gray-400 dark:text-gray-500"
                              >
                                 ...
                              </span>
                           )
                        }
                     }

                     // Show page range
                     for (let i = startPage; i < endPage; i++) {
                        pages.push(
                           <Button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              variant={
                                 adjustedCurrentPage === i
                                    ? 'default'
                                    : 'outline'
                              }
                              size="sm"
                              className={`size-10 rounded-xl p-0 text-sm transition-all duration-200 ${
                                 adjustedCurrentPage === i
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700'
                                    : 'border-gray-200 bg-white/90 text-gray-700 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700'
                              }`}
                           >
                              {i + 1}
                           </Button>
                        )
                     }

                     // Show last page if not in range
                     if (endPage < pageCount) {
                        // Show ellipsis if there's a gap
                        if (endPage < pageCount - 1) {
                           pages.push(
                              <span
                                 key="end-ellipsis"
                                 className="px-2 text-sm text-gray-400 dark:text-gray-500"
                              >
                                 ...
                              </span>
                           )
                        }

                        pages.push(
                           <Button
                              key={pageCount - 1}
                              onClick={() => handlePageChange(pageCount - 1)}
                              variant={
                                 adjustedCurrentPage === pageCount - 1
                                    ? 'default'
                                    : 'outline'
                              }
                              size="sm"
                              className={`size-10 rounded-xl p-0 text-sm transition-all duration-200 ${
                                 adjustedCurrentPage === pageCount - 1
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700'
                                    : 'border-gray-200 bg-white/90 text-gray-700 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700'
                              }`}
                           >
                              {pageCount}
                           </Button>
                        )
                     }

                     return pages
                  })()}
               </div>

               {/* Right side - Next button */}
               <Button
                  onClick={() =>
                     handlePageChange(
                        Math.min(adjustedCurrentPage + 1, pageCount - 1)
                     )
                  }
                  disabled={currentPage === pageCount - 1}
                  variant="outline"
                  className="flex items-center rounded-xl border-gray-200 bg-white/90 px-4 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-200 dark:hover:bg-gray-700"
               >
                  Next
                  <ArrowRight className="ml-2 size-4" />
               </Button>
            </div>
         </div>
      </div>
   )
}

export default DynamicCardList
