'use client'

import {
   ArrowLeft,
   ArrowRight,
   ChevronLeft,
   ChevronRight,
   Search,
   RefreshCw,
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Input } from '@/components/ui/input'
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from '@/components/ui/table'

import { Button } from '../ui/button'

// Define the types for your data and column
interface Column<T> {
   Header: string
   accessor: keyof T | 'actions'
   Cell?: (row: T) => React.ReactNode
   sortable?: boolean
}

interface SortConfig<T> {
   key: keyof T
   direction: 'asc' | 'desc'
}

interface DynamicTableProps<T> {
   data: T[]
   columns: Column<T>[]
   pageSize?: number
   onSearch?: (searchTerm: string) => void
   onPageChange?: (page: number) => void
   isLoading?: boolean // Optional loading state
   hideTopSearch?: boolean // Optional prop to hide the search bar
   searchPlaceholder?: string // Optional custom search placeholder
   externalSearchData?: T[] // Optional external search data to override internal filtering
   showSearchInHeader?: boolean // Whether to show search in the top header
   moveEntriesToFooter?: boolean // Whether to move "Showing X of Y entries" to footer

   // Server-side pagination props
   totalCount?: number
   currentPage?: number
   isServerSide?: boolean

   // Expandable row props
   expandableRows?: boolean
   expandableRowExpanded?: (row: T) => boolean
   expandableRowDisabled?: (row: T) => boolean
   onRowExpandToggled?: (row: T, expanded: boolean) => void
   expandableRowComponent?: (row: T) => React.ReactNode

   // Sorting props
   sortConfig?: SortConfig<T> | null
   onSort?: (key: keyof T) => void
   isSort?: boolean // Optional prop to enable/disable sorting features (default: false)

   // Refresh button props
   isRefreshButton?: boolean // Optional prop to show refresh button (default: false)
   onRefresh?: () => void // Callback function for refresh action
}

// Custom styles for expandable rows
export const expandableRowCustomStyle = {
   headCells: {
      style: {
         fontSize: '15px',
         fontWeight: '500',
         backgroundColor: 'transparent',
         color: 'var(--text-primary)',
      },
   },
   headRow: {
      style: {
         backgroundColor: 'transparent',
         border: '1px solid var(--border-color)',
      },
   },
   rows: {
      style: {
         borderBottom: '1px solid var(--border-color)',
         borderLeft: '1px solid var(--border-color)',
         borderRadius: '0px',
         borderRight: '1px solid var(--border-color)',
         '&:not(:last-of-type)': {
            borderBottom: '1px solid var(--border-color)',
            borderLeft: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
         },
         '&:last-child': {
            borderBottom: '1px solid var(--border-color)',
            borderLeft: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
         },
      },
   },
}

const DynamicTable = <T,>({
   data,
   columns,
   pageSize = 5,
   isLoading = false,
   onSearch,
   onPageChange,
   totalCount,
   currentPage: serverCurrentPage,
   isServerSide = false,
   expandableRows = false,
   expandableRowExpanded,
   expandableRowDisabled,
   onRowExpandToggled,
   expandableRowComponent,
   searchPlaceholder,
   externalSearchData,
   showSearchInHeader = true,
   moveEntriesToFooter = false,
   sortConfig,
   onSort,
   isSort = false, // Default to false
   isRefreshButton = false, // Default to false
   onRefresh,
}: DynamicTableProps<T>) => {
   const searchParams = useSearchParams()
   const pathname = usePathname()

   // Auto-determine search placeholder based on current page if not provided
   const getSearchPlaceholder = () => {
      if (searchPlaceholder) {
         return searchPlaceholder
      }

      // Determine placeholder based on current page path
      if (pathname.includes('/manage-customers')) {
         return 'Search customers...'
      } else if (pathname.includes('/manage-consultants')) {
         return 'Search consultants...'
      } else if (pathname.includes('/manage-cases')) {
         return 'Search cases...'
      } else if (pathname.includes('/quote-generation')) {
         return 'Search quotes...'
      } else if (pathname.includes('/manage-admins')) {
         return 'Search admins...'
      } else if (pathname.includes('/categories')) {
         return 'Search categories...'
      } else if (pathname.includes('/appointments')) {
         return 'Search appointments...'
      } else {
         return 'Search...' // Default fallback
      }
   }

   const router = useRouter()

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
      : externalSearchData || // Use external search data if provided
        data.filter((row) =>
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

   return (
      <div className="flex size-full flex-col">
         {(showSearchInHeader || !moveEntriesToFooter) && (
            <div className="shrink-0 border-b border-gray-200/60 bg-white/80 p-4 dark:border-gray-700/60 dark:bg-gray-900/80">
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {!moveEntriesToFooter && (
                     <div className="flex items-center space-x-3">
                        <div className="size-2 animate-pulse rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                           Showing{' '}
                           <span className="font-semibold text-gray-900 dark:text-white">
                              {paginatedData.length}
                           </span>{' '}
                           of{' '}
                           <span className="font-semibold text-gray-900 dark:text-white">
                              {isServerSide
                                 ? totalCount || 0
                                 : filteredData.length}
                           </span>{' '}
                           entries
                        </span>
                     </div>
                  )}
                  <div className="flex items-center space-x-3">
                     {showSearchInHeader && (
                        <div className="group relative">
                           <Input
                              type="text"
                              placeholder={getSearchPlaceholder()}
                              value={localSearch}
                              onChange={(e) =>
                                 handleSearchChange(e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-300/50 bg-white/80 p-2 pr-4 pl-8 text-sm text-gray-600 shadow-lg backdrop-blur-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:shadow-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:w-80 dark:border-gray-600/50 dark:bg-gray-700/80 dark:text-gray-200 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:bg-gray-700 dark:focus:ring-blue-400/20"
                           />
                           <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-500 dark:text-gray-500 dark:group-focus-within:text-blue-400">
                              <Search className="size-4" />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

         <div className="relative min-h-0 flex-1 overflow-hidden">
            {/* Loading Overlay */}
            {isLoading && <LoadingOverlay />}

            <div className="h-full overflow-y-auto py-4 md:hidden">
               <div className="space-y-4">
                  {paginatedData.length > 0 ? (
                     <>
                        {paginatedData.map((row, rowIndex) => (
                           <div
                              key={rowIndex}
                              className="group rounded-2xl border border-gray-200/60 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800/90"
                           >
                              <div className="space-y-3">
                                 {columns.map((column) => {
                                    if (column.accessor === 'actions') {
                                       return (
                                          <div
                                             key={column.accessor as string}
                                             className="mt-4 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700"
                                          >
                                             {column.Cell
                                                ? column.Cell(row)
                                                : null}
                                          </div>
                                       )
                                    }
                                    return (
                                       <div
                                          key={column.accessor as string}
                                          className="flex items-start justify-between"
                                       >
                                          <span className="mr-3 min-w-0 flex-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                             {column.Header}
                                          </span>
                                          <span className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                                             {column.Cell
                                                ? column.Cell(row)
                                                : (row[
                                                     column.accessor as keyof T
                                                  ] as React.ReactNode)}
                                          </span>
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                        ))}
                     </>
                  ) : (
                     <div className="rounded-2xl border border-gray-200/60 bg-white/90 p-12 text-center shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/90">
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

            <div className="hidden h-full md:flex md:flex-col">
               {/* Scrollable Table Container with horizontal scroll */}
               <div className="flex-1 overflow-hidden">
                  <div
                     className="table-scrollbar h-full w-full overflow-auto"
                     style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgb(203 213 225) rgb(248 250 252)',
                     }}
                  >
                     <div className="min-w-max">
                        <Table className="relative w-full">
                           <TableHeader>
                              <TableRow className="border-b border-gray-200/50 bg-gradient-to-r from-slate-50/80 via-blue-50/60 to-indigo-50/40 backdrop-blur-sm dark:border-gray-600/50 dark:from-gray-700/80 dark:via-slate-700/60 dark:to-indigo-800/20">
                                 {columns.map((column) => (
                                    <TableHead
                                       key={column.accessor as string}
                                       className={`bg-transparent px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300 ${
                                          isSort &&
                                          column.sortable !== false &&
                                          column.accessor !== 'actions'
                                             ? 'cursor-pointer transition-colors hover:bg-gray-100/50 dark:hover:bg-gray-600/30'
                                             : ''
                                       }`}
                                       onClick={() => {
                                          if (
                                             isSort &&
                                             column.sortable !== false &&
                                             column.accessor !== 'actions' &&
                                             onSort
                                          ) {
                                             onSort(column.accessor)
                                          }
                                       }}
                                    >
                                       <div className="flex items-center gap-2">
                                          <span>{column.Header}</span>
                                          {isSort &&
                                             column.sortable !== false &&
                                             column.accessor !== 'actions' && (
                                                <span className="text-sm transition-colors">
                                                   {sortConfig?.key ===
                                                   column.accessor ? (
                                                      sortConfig.direction ===
                                                      'asc' ? (
                                                         <span className="text-blue-600 dark:text-blue-400">
                                                            ↑
                                                         </span>
                                                      ) : (
                                                         <span className="text-blue-600 dark:text-blue-400">
                                                            ↓
                                                         </span>
                                                      )
                                                   ) : (
                                                      <span className="text-gray-400 opacity-50 dark:text-gray-500">
                                                         ↑
                                                      </span>
                                                   )}
                                                </span>
                                             )}
                                          {/* Add refresh button to Actions column */}
                                          {column.accessor === 'actions' &&
                                             isRefreshButton &&
                                             onRefresh && (
                                                <Button
                                                   onClick={(e) => {
                                                      e.stopPropagation()
                                                      onRefresh()
                                                   }}
                                                   variant="outline"
                                                   size="sm"
                                                   className="ml-2 h-8 w-8 rounded-lg border border-gray-300/50 bg-white/90 shadow-md backdrop-blur-sm transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg hover:ring-2 hover:ring-blue-500/20 dark:border-gray-600/50 dark:bg-gray-700/90 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:ring-blue-400/20"
                                                   title="Refresh data"
                                                >
                                                   <RefreshCw className="h-4 w-4 text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400" />
                                                </Button>
                                             )}
                                       </div>
                                    </TableHead>
                                 ))}
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {paginatedData.length > 0 ? (
                                 paginatedData.map((row, rowIndex) => {
                                    const isExpanded =
                                       expandableRows && expandableRowExpanded
                                          ? expandableRowExpanded(row)
                                          : false
                                    const isDisabled =
                                       expandableRows && expandableRowDisabled
                                          ? expandableRowDisabled(row)
                                          : false

                                    return (
                                       <React.Fragment key={rowIndex}>
                                          {/* Main Row */}
                                          <TableRow
                                             className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-indigo-50/60 hover:to-purple-50/40 dark:hover:from-gray-700/60 dark:hover:via-slate-700/40 dark:hover:to-indigo-800/20 ${
                                                rowIndex % 2 === 0
                                                   ? 'bg-white/60 dark:bg-gray-800/40'
                                                   : 'bg-gradient-to-r from-slate-50/40 via-blue-50/20 to-indigo-50/10 dark:from-gray-700/20 dark:via-slate-700/10 dark:to-indigo-800/5'
                                             } cursor-pointer border-b border-gray-200/30 backdrop-blur-sm hover:scale-[1.01] hover:shadow-md dark:border-gray-600/30`}
                                             onClick={() => {
                                                if (
                                                   expandableRows &&
                                                   !isDisabled &&
                                                   onRowExpandToggled
                                                ) {
                                                   onRowExpandToggled(
                                                      row,
                                                      !isExpanded
                                                   )
                                                }
                                             }}
                                          >
                                             {columns.map((column) => (
                                                <TableCell
                                                   key={`${rowIndex}-${column.accessor as string}`}
                                                   className="px-4 py-3 text-sm whitespace-nowrap text-gray-800 dark:text-gray-200"
                                                >
                                                   {column.Cell
                                                      ? column.Cell(row)
                                                      : column.accessor !==
                                                          'actions'
                                                        ? (row[
                                                             column.accessor
                                                          ] as React.ReactNode)
                                                        : null}
                                                </TableCell>
                                             ))}
                                          </TableRow>

                                          {/* Expanded Row */}
                                          {expandableRows &&
                                             isExpanded &&
                                             expandableRowComponent && (
                                                <TableRow className="bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-purple-50/20 backdrop-blur-sm dark:from-gray-700/40 dark:via-slate-700/20 dark:to-indigo-800/10">
                                                   <TableCell
                                                      colSpan={columns.length}
                                                      className="border-x-2 border-blue-200/30 px-4 py-0 dark:border-gray-600/30"
                                                   >
                                                      {expandableRowComponent(
                                                         row
                                                      )}
                                                   </TableCell>
                                                </TableRow>
                                             )}
                                       </React.Fragment>
                                    )
                                 })
                              ) : (
                                 <TableRow>
                                    <TableCell
                                       colSpan={columns.length}
                                       className="p-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                       No data found
                                    </TableCell>
                                 </TableRow>
                              )}
                           </TableBody>
                        </Table>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
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

                  {moveEntriesToFooter && (
                     <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                           {adjustedCurrentPage * pageSize + 1}
                        </span>
                        {' - '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                           {Math.min(
                              (adjustedCurrentPage + 1) * pageSize,
                              isServerSide
                                 ? totalCount || 0
                                 : filteredData.length
                           )}
                        </span>
                        {' of '}
                        <span className="font-semibold text-gray-900 dark:text-white">
                           {isServerSide
                              ? totalCount || 0
                              : filteredData.length}
                        </span>
                        {' entries'}
                     </span>
                  )}
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

export default DynamicTable
