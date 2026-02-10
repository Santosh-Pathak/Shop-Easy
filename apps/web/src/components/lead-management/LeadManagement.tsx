'use client'

import React, { 
   useState, 
   useEffect, 
   useCallback, 
   useMemo, 
   useRef,
   memo,
   startTransition,
   useTransition 
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
   Plus, 
   Search, 
   Filter, 
   Download, 
   Upload, 
   Eye, 
   Edit, 
   Trash2,
   RefreshCw,
   FileText,
   UserCheck,
   Users,
   Target,
   TrendingUp,
   LayoutGrid,
   List,
   Grid,
   Grid3X3,
   X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
   Select, 
   SelectContent, 
   SelectItem, 
   SelectTrigger, 
   SelectValue 
} from '@/components/ui/select'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import {
   Lead,
   LeadFilters,
   LEAD_STATUSES,
   LEAD_TYPES,
   LEAD_PRIORITIES,
   LEAD_SOURCES
} from '@/types/lead'
import { 
   LeadAPI, 
   leadStatusConfig, 
   priorityConfig, 
   leadSourceConfig 
} from '@/services/apis/lead.api'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/theme-utils'
import { useDebounceCallback } from '@/utils/debounce'
import DynamicTable from '@/components/common/DynamicTable'
import DynamicCardList from '@/components/common/DynamicCardList'
import LeadFiltersComponent from './LeadFilters'

// Types for better performance tracking
interface LeadStats {
   totalLeads: {
      count: number
      change: string
   }
   activeLeads: {
      count: number
      change: string
   }
   qualifiedLeads: {
      count: number
      change: string
   }
   closedWonLeads: {
      count: number
      change: string
   }
}

interface PerformanceMetrics {
   renderTime: number
   apiResponseTime: number
   cacheHitRate: number
}

// Constants for performance optimization
const ITEMS_PER_PAGE = 10
const DEBOUNCE_DELAY = 300
const STATS_REFRESH_INTERVAL = 30000 // 30 seconds
const PRELOAD_DELAY = 1000 // 1 second after initial load

// Memoized components for better performance
const MemoizedLeadStats = memo(({ stats }: { stats: LeadStats | null }) => {
   
   console.log('MemoizedLeadStats rendering with stats:', stats) // Debug log
   
   // Show loading state if stats are not available
   if (!stats) {
      console.log('Stats is null, showing loading state') // Debug log
      return (
         <div className="px-3 pb-6 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
               {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="theme-border overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm dark:from-gray-900/80 dark:to-gray-900/40 shadow-lg">
                     <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3 flex-1">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                                 <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                                 <div className="flex items-baseline gap-2">
                                    <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-4 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </div>
      )
   }
   
   const statItems = useMemo(() => [
      {
         title: 'Total Leads',
         value: String(stats?.totalLeads?.count ?? 0),
         icon: Users,
         gradient: 'from-blue-500 to-blue-600',
         bgColor: 'bg-blue-50 dark:bg-blue-950/50',
         iconColor: 'text-blue-600 dark:text-blue-400',
         change: stats?.totalLeads?.change ?? '+0%',
         isPositive: (stats?.totalLeads?.change ?? '+0%').startsWith('+')
      },
      {
         title: 'Active Leads', 
         value: String(stats?.activeLeads?.count ?? 0),
         icon: UserCheck,
         gradient: 'from-emerald-500 to-emerald-600',
         bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
         iconColor: 'text-emerald-600 dark:text-emerald-400',
         change: stats?.activeLeads?.change ?? '+0%',
         isPositive: (stats?.activeLeads?.change ?? '+0%').startsWith('+')
      },
      {
         title: 'Qualified Leads',
         value: String(stats?.qualifiedLeads?.count ?? 0),
         icon: Target,
         gradient: 'from-orange-500 to-orange-600',
         bgColor: 'bg-orange-50 dark:bg-orange-950/50',
         iconColor: 'text-orange-600 dark:text-orange-400',
         change: stats?.qualifiedLeads?.change ?? '+0%',
         isPositive: (stats?.qualifiedLeads?.change ?? '+0%').startsWith('+')
      },
      {
         title: 'Closed Won',
         value: String(stats?.closedWonLeads?.count ?? 0),
         icon: TrendingUp,
         gradient: 'from-purple-500 to-purple-600',
         bgColor: 'bg-purple-50 dark:bg-purple-950/50',
         iconColor: 'text-purple-600 dark:text-purple-400',
         change: stats?.closedWonLeads?.change ?? '+0%',
         isPositive: (stats?.closedWonLeads?.change ?? '+0%').startsWith('+')
      },
   ], [stats])

   return (
      <div className="px-3 pb-6 sm:px-4 lg:px-6">
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statItems.map((stat, index) => (
               <Card key={index} className="theme-border overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm dark:from-gray-900/80 dark:to-gray-900/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-3">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                           <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bgColor)}>
                              <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="theme-text-secondary text-xs font-medium mb-0.5 truncate">
                                 {stat.title}
                              </p>
                              <div className="flex items-baseline gap-2">
                                 <p className="theme-text-primary text-xl font-bold">
                                    {stat.value}
                                 </p>
                                 <div className={cn(
                                    "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
                                    stat.isPositive 
                                       ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                       : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                 )}>
                                    <TrendingUp className={cn(
                                       "h-2.5 w-2.5",
                                       stat.isPositive 
                                          ? "rotate-0" 
                                          : "rotate-180"
                                    )} />
                                    <span className="text-xs">{stat.change}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className={cn(
                           "absolute top-0 right-0 h-8 w-8 rounded-bl-lg bg-gradient-to-br opacity-10",
                           stat.gradient
                        )} />
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
   )
})

MemoizedLeadStats.displayName = 'MemoizedLeadStats'

// Optimized search input component
const SearchInput = memo(({ 
   value, 
   onChange, 
   placeholder = "Search leads..." 
}: { 
   value: string
   onChange: (value: string) => void
   placeholder?: string 
}) => {
   return (
      <div className="relative w-full sm:w-80 md:w-96 lg:w-[420px]">
         <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="theme-text-muted h-5 w-5" />
         </div>
         <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="theme-border theme-bg-secondary theme-text-primary h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm font-medium placeholder:theme-text-muted focus:ring-2 focus:ring-[var(--interactive-primary)]/20 transition-all"
         />
      </div>
   )
})

SearchInput.displayName = 'SearchInput'

// Main optimized component
const LeadManagementOptimized: React.FC = () => {
   const router = useRouter()
   const searchParams = useSearchParams()
   const [isPending, startTransition] = useTransition()
   const { mode } = useTheme()
   const isDark = mode === 'dark'
   
   // Refs for performance optimization
   const isLoadingRef = useRef(false)
   const performanceMetricsRef = useRef<PerformanceMetrics>({
      renderTime: 0,
      apiResponseTime: 0,
      cacheHitRate: 0
   })
   
   // Core state
   const [leads, setLeads] = useState<Lead[]>([])
   const [loading, setLoading] = useState(true)
   const [totalCount, setTotalCount] = useState(0)
   const [currentPage, setCurrentPage] = useState(1)
   
   // UI state
   const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
   const [cardViewType, setCardViewType] = useState<'default' | 'compact' | 'detailed' | 'grid' | 'list' | 'minimal'>('default')
   const [showFilters, setShowFilters] = useState(false)
   
   // Delete confirmation state
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
   const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
   
   // Filters and search
   const [filters, setFilters] = useState<Omit<LeadFilters, 'page' | 'limit' | 'search'>>({})
   const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'asc' | 'desc' } | null>({
      key: 'createdAt',
      direction: 'desc'
   })
   const [leadStats, setLeadStats] = useState<LeadStats | null>(null)
   
   // URL-synchronized search term
   const searchParamsTerm = searchParams.get("search") || ""
   const [localSearchTerm, setLocalSearchTerm] = useState(searchParamsTerm)

   // Fetch lead statistics
   const fetchLeadStats = useCallback(async () => {
      try {
         console.log('Fetching lead stats...') // Debug log
         const response = await LeadAPI.getLeadStats()
         console.log('Lead stats response:', response) // Debug log
         setLeadStats(response.data)
      } catch (error) {
         console.error('Failed to fetch lead stats:', error)
         // Set default stats on error to prevent UI issues
         setLeadStats({
            totalLeads: { count: 0, change: '+0%' },
            activeLeads: { count: 0, change: '+0%' },
            qualifiedLeads: { count: 0, change: '+0%' },
            closedWonLeads: { count: 0, change: '+0%' }
         })
      }
   }, [])

   // Optimized fetch function with caching and error handling
   const fetchLeads = useCallback(async (page = 1, search = "", useCache = true) => {
      if (isLoadingRef.current) return
      
      const startTime = Date.now()
      
      try {
         isLoadingRef.current = true
         setLoading(true)
         
         const params: LeadFilters = {
            page,
            limit: ITEMS_PER_PAGE,
            search,
            searchFields: search ? ['name', 'email', 'phone', 'businessName', 'company'] : undefined,
            sort: sortConfig ? [`${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`] : ['-createdAt', '-name'],
            ...filters
         }
         
         // Add cache control for development
         if (process.env.NODE_ENV === 'development' && !useCache) {
            LeadAPI.clearCache()
         }
         
         const response = await LeadAPI.getLeads(params)
         
         performanceMetricsRef.current.apiResponseTime = Date.now() - startTime
         
         setLeads(response.data)
         setTotalCount(response.meta.totalCount)
         setCurrentPage(page)
         
         // Fetch updated stats after lead operations
         if (page === 1) {
            fetchLeadStats()
         }
         
      } catch (error) {
         console.error('Failed to fetch leads:', error)
         toast.error("Failed to fetch leads")
      } finally {
         setLoading(false)
         isLoadingRef.current = false
      }
   }, [filters, sortConfig])

   // Debounced search using the utility
   const debouncedSearch = useDebounceCallback(
      (searchTerm: string) => {
         startTransition(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (searchTerm) {
               params.set("search", searchTerm)
            } else {
               params.delete("search")
            }
            params.set("page", "1")
            router.push(`?${params.toString()}`)
         })
      },
      DEBOUNCE_DELAY
   )

   // Search input change handler
   const handleSearchInputChange = useCallback((value: string) => {
      setLocalSearchTerm(value)
      debouncedSearch(value)
   }, [debouncedSearch])

   // Optimized search handler for table/card components
   const handleSearch = useCallback((search: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
         params.set("search", search)
      } else {
         params.delete("search")
      }
      params.set("page", "1")
      router.push(`?${params.toString()}`)
   }, [router, searchParams])

   // Page change handler
   const handlePageChange = useCallback((page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", (page + 1).toString())
      router.push(`?${params.toString()}`)
   }, [router, searchParams])

   // Optimized sorting
   const handleSort = useCallback((key: keyof Lead) => {
      let direction: 'asc' | 'desc' = 'asc'
      
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
         direction = 'desc'
      }
      
      setSortConfig({ key, direction })
      setFilters(prev => ({
         ...prev,
         sortBy: key as string,
         sortOrder: direction
      }))
   }, [sortConfig])

   // Lead action handlers
   const handleCreateLead = useCallback(() => {
      router.push('/lead-management/new')
   }, [router])

   const handleEditLead = useCallback((lead: Lead) => {
      router.push(`/lead-management/${lead._id}/edit`)
   }, [router])

   const handleViewLead = useCallback((lead: Lead) => {
      router.push(`/lead-management/${lead._id}`)
   }, [router])

   const handleQuoteLead = useCallback((lead: Lead) => {
      router.push(`/quotes/new?leadId=${lead._id}`)
   }, [router])

   const handleDeleteLead = useCallback((lead: Lead) => {
      setLeadToDelete(lead)
      setDeleteDialogOpen(true)
   }, [])

   const confirmDeleteLead = useCallback(async () => {
      if (!leadToDelete) return

      try {
         await LeadAPI.deleteLead(leadToDelete._id)
         toast.success("Lead deleted successfully")
         fetchLeads(currentPage, searchParamsTerm)
         fetchLeadStats() // Refresh stats after deletion
      } catch (error) {
         toast.error("Failed to delete lead")
      } finally {
         setDeleteDialogOpen(false)
         setLeadToDelete(null)
      }
   }, [leadToDelete, currentPage, searchParamsTerm, fetchLeads, fetchLeadStats])

   const cancelDeleteLead = useCallback(() => {
      setDeleteDialogOpen(false)
      setLeadToDelete(null)
   }, [])

   // Export handler
   const handleExportLeads = useCallback(async () => {
      try {
         const params: LeadFilters = {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchParamsTerm,
            ...filters
         }
         
         const blob = await LeadAPI.exportLeads(params)
         const url = window.URL.createObjectURL(blob)
         const a = document.createElement('a')
         a.style.display = 'none'
         a.href = url
         a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
         document.body.appendChild(a)
         a.click()
         window.URL.revokeObjectURL(url)
         document.body.removeChild(a)
         
         toast.success("Leads exported successfully")
      } catch (error) {
         toast.error("Failed to export leads")
      }
   }, [currentPage, searchParamsTerm, filters])

   // Modal close handler
   const handleModalClose = useCallback(() => {
      // Since we're using page-based navigation, just refresh the current data
      fetchLeads(currentPage, searchParamsTerm)
   }, [currentPage, searchParamsTerm, fetchLeads])

   // Memoized table columns
   const columns = useMemo(() => [
      {
         Header: "Lead Name",
         accessor: "name" as keyof Lead,
         sortable: true,
         Cell: (row: Lead) => (
            <div>
               <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {row.name || 'Unknown'}
               </p>
               {row.businessName && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                     {row.businessName}
                  </p>
               )}
               {row.jobTitle && (
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                     {row.jobTitle}
                  </p>
               )}
            </div>
         ),
      },
      {
         Header: "Contact",
         accessor: "email" as keyof Lead,
         sortable: false,
         Cell: (row: Lead) => (
            <div>
               {row.email && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                     {row.email}
                  </p>
               )}
               <p className="text-sm text-slate-600 dark:text-slate-400">
                  {row.phone}
               </p>
            </div>
         ),
      },
      {
         Header: "Type",
         accessor: "type" as keyof Lead,
         sortable: false,
         Cell: (row: Lead) => (
            <Badge variant="outline" className="capitalize">
               {row.type}
            </Badge>
         ),
      },
      {
         Header: "Status",
         accessor: "status" as keyof Lead,
         sortable: false,
         Cell: (row: Lead) => (
            <Badge className={leadStatusConfig[row.status as keyof typeof leadStatusConfig]?.color || 'bg-gray-100 text-gray-800'}>
               {leadStatusConfig[row.status as keyof typeof leadStatusConfig]?.label || row.status}
            </Badge>
         ),
      },
      {
         Header: "Priority",
         accessor: "priority" as keyof Lead,
         sortable: true,
         Cell: (row: Lead) => (
            row.priority ? (
               <Badge className={priorityConfig[row.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-800'}>
                  {priorityConfig[row.priority as keyof typeof priorityConfig]?.label || row.priority}
               </Badge>
            ) : (
               <span className="text-sm text-slate-400">-</span>
            )
         ),
      },
      {
         Header: "Source",
         accessor: "leadSource" as keyof Lead,
         sortable: false,
         Cell: (row: Lead) => (
            <div className="flex items-center gap-2">
               {row.leadSource && leadSourceConfig[row.leadSource as keyof typeof leadSourceConfig] ? (
                  <>
                     <span className="text-sm">
                        {leadSourceConfig[row.leadSource as keyof typeof leadSourceConfig].icon}
                     </span>
                     <span className="text-sm text-slate-600 dark:text-slate-400">
                        {leadSourceConfig[row.leadSource as keyof typeof leadSourceConfig].label}
                     </span>
                  </>
               ) : (
                  <span className="text-sm text-slate-400">-</span>
               )}
            </div>
         ),
      },
      {
         Header: "Created",
         accessor: "createdAt" as keyof Lead,
         sortable: true,
         Cell: (row: Lead) => (
            <p className="text-sm text-slate-600 dark:text-slate-400">
               {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
            </p>
         ),
      },
      {
         Header: "Actions",
         accessor: "actions" as keyof Lead,
         sortable: false,
         Cell: (row: Lead) => (
            <div className="flex gap-1 sm:gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewLead(row)}
                  className="p-2"
                  title="View Lead"
               >
                  <Eye className="size-4" />
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditLead(row)}
                  className="p-2"
                  title="Edit Lead"
               >
                  <Edit className="size-4" />
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuoteLead(row)}
                  className="p-2 text-blue-600 hover:text-blue-800"
                  title="Create Quote"
               >
                  <FileText className="size-4" />
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteLead(row)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Delete Lead"
               >
                  <Trash2 className="size-4" />
               </Button>
            </div>
         ),
      },
   ], [handleViewLead, handleEditLead, handleQuoteLead, handleDeleteLead])

   // Effects
   useEffect(() => {
      const page = Number.parseInt(searchParams.get("page") || "1", 10)
      const search = searchParams.get("search") || ""
      
      setCurrentPage(page)
      setLocalSearchTerm(search)
      fetchLeads(page, search)
   }, [searchParams, filters, fetchLeads])

   // Fetch initial stats and set up refresh interval
   useEffect(() => {
      fetchLeadStats()
      
      // Set up stats refresh interval
      const statsInterval = setInterval(fetchLeadStats, STATS_REFRESH_INTERVAL)
      
      return () => clearInterval(statsInterval)
   }, [fetchLeadStats])

   // Sync sortConfig with filters
   useEffect(() => {
      if (filters.sortBy && filters.sortOrder) {
         setSortConfig({
            key: filters.sortBy as keyof Lead,
            direction: filters.sortOrder
         })
      } else if (!sortConfig) {
         setSortConfig({
            key: 'createdAt',
            direction: 'desc'
         })
         setFilters(prev => ({
            ...prev,
            sortBy: 'createdAt',
            sortOrder: 'desc'
         }))
      }
   }, [filters.sortBy, filters.sortOrder, sortConfig])

   // Preload common filter combinations after initial load
   useEffect(() => {
      if (!loading) {
         const timer = setTimeout(() => {
            LeadAPI.preloadLeadData(filters)
         }, PRELOAD_DELAY)
         
         return () => clearTimeout(timer)
      }
   }, [loading, filters])

   return (
      <div className="min-h-screen theme-bg-primary">
         {/* Modern Header Section */}
         <div className="px-3 py-6 sm:px-4 lg:px-6">
            <div className="w-full">
               {/* Header Top */}
               <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--interactive-primary)] to-[var(--interactive-primary)] opacity-90 shadow-lg lg:h-14 lg:w-14">
                           <Users className="h-6 w-6 text-white lg:h-7 lg:w-7" />
                        </div>
                        <div>
                           <p className="theme-text-primary text-3xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                              Lead Management
                           </p>
                           <p className="theme-text-secondary mt-2 text-base leading-6 lg:text-lg">
                              Manage your sales pipeline and track customer prospects with ease
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:gap-5">
                     {/* View Toggle - Modern Design */}
                     <div className="flex items-center gap-4">
                        <div className="theme-border theme-bg-secondary flex items-center rounded-xl border p-1 shadow-sm">
                           <Button
                              onClick={() => setViewMode('table')}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                 'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                                 viewMode === 'table' 
                                    ? 'bg-[var(--interactive-primary)] text-white shadow-md' 
                                    : 'hover:bg-[var(--bg-tertiary)] theme-text-secondary'
                              )}
                           >
                              <List className="h-4 w-4" />
                              Table
                           </Button>
                           <Button
                              onClick={() => setViewMode('cards')}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                 'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                                 viewMode === 'cards' 
                                    ? 'bg-[var(--interactive-primary)] text-white shadow-md' 
                                    : 'hover:bg-[var(--bg-tertiary)] theme-text-secondary'
                              )}
                           >
                              <LayoutGrid className="h-4 w-4" />
                              Cards
                           </Button>
                        </div>

                        {/* Card View Type Selector - Modern */}
                        {viewMode === 'cards' && (
                           <Select
                              value={cardViewType}
                              onValueChange={(value) => setCardViewType(value as any)}
                           >
                              <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary w-36 border-0 bg-transparent text-sm font-medium shadow-sm">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                                 <SelectItem value="default">
                                    <div className="flex items-center gap-2">
                                       <LayoutGrid className="h-4 w-4" />
                                       <span>Default</span>
                                    </div>
                                 </SelectItem>
                                 <SelectItem value="compact">
                                    <div className="flex items-center gap-2">
                                       <List className="h-4 w-4" />
                                       <span>Compact</span>
                                    </div>
                                 </SelectItem>
                                 <SelectItem value="detailed">
                                    <div className="flex items-center gap-2">
                                       <Grid className="h-4 w-4" />
                                       <span>Detailed</span>
                                    </div>
                                 </SelectItem>
                                 <SelectItem value="grid">
                                    <div className="flex items-center gap-2">
                                       <Grid3X3 className="h-4 w-4" />
                                       <span>Grid</span>
                                    </div>
                                 </SelectItem>
                                 <SelectItem value="list">
                                    <div className="flex items-center gap-2">
                                       <List className="h-4 w-4" />
                                       <span>List</span>
                                    </div>
                                 </SelectItem>
                                 <SelectItem value="minimal">
                                    <div className="flex items-center gap-2">
                                       <Filter className="h-4 w-4" />
                                       <span>Minimal</span>
                                    </div>
                                 </SelectItem>
                              </SelectContent>
                           </Select>
                        )}
                     </div>

                     {/* Action Buttons - Modern Design */}
                     <div className="flex items-center gap-3">
                        <Button
                           onClick={() => setShowFilters(!showFilters)}
                           variant="outline"
                           size="sm"
                           className={cn(
                              'theme-border flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200',
                              showFilters 
                                 ? 'bg-[var(--interactive-primary)] text-white border-[var(--interactive-primary)]' 
                                 : 'theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary border-transparent'
                           )}
                        >
                           <Filter className="h-4 w-4" />
                           <span className="hidden sm:inline">Filters</span>
                        </Button>
                        <Button
                           onClick={handleExportLeads}
                           variant="outline"
                           size="sm"
                           className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary flex items-center gap-2 rounded-xl border-transparent px-4 py-2.5 text-sm font-medium transition-all duration-200"
                        >
                           <Download className="h-4 w-4" />
                           <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button
                           onClick={() => router.push('/lead-management/bulk-import')}
                           variant="outline"
                           size="sm"
                           className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary flex items-center gap-2 rounded-xl border-transparent px-4 py-2.5 text-sm font-medium transition-all duration-200"
                        >
                           <Upload className="h-4 w-4" />
                           <span className="hidden lg:inline">Bulk Import</span>
                           <span className="sm:inline lg:hidden">Import</span>
                        </Button>
                        <Button
                           onClick={handleCreateLead}
                           className="bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--interactive-primary)] hover:opacity-90 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                           size="sm"
                        >
                           <Plus className="h-4 w-4" />
                           <span className="hidden sm:inline">New Lead</span>
                           <span className="sm:hidden">New</span>
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Modern Statistics Cards Section */}
         <MemoizedLeadStats stats={leadStats} />

         {/* Debug info - remove in production */}
         {process.env.NODE_ENV === 'development' && (
            <div style={{ display: 'none' }}>
               Debug leadStats: {JSON.stringify(leadStats)}
            </div>
         )}

         {/* Modern Filters Section */}
         {showFilters && (
            <div className="px-3 pb-6 sm:px-4 lg:px-6">
               <Card className="theme-border overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm dark:from-gray-900/80 dark:to-gray-900/40 shadow-lg">
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--interactive-primary)] to-[var(--interactive-primary)] opacity-90">
                              <Filter className="h-5 w-5 text-white" />
                           </div>
                           <div>
                              <h3 className="theme-text-primary text-lg font-semibold">Advanced Filters</h3>
                              <p className="theme-text-secondary text-sm">Refine your lead search with multiple criteria</p>
                           </div>
                        </div>
                        <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setShowFilters(false)}
                           className="theme-text-muted hover:theme-bg-secondary h-8 w-8 rounded-lg p-0"
                        >
                           <X className="h-4 w-4" />
                        </Button>
                     </div>
                     <LeadFiltersComponent 
                        filters={filters as LeadFilters}
                        onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                     />
                  </CardContent>
               </Card>
            </div>
         )}

         {/* Modern Search and Quick Filters */}
         <div className="px-3 pb-6 sm:px-4 lg:px-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
               <SearchInput 
                  value={localSearchTerm}
                  onChange={handleSearchInputChange}
                  placeholder="Search leads by name, email, phone, or company..."
               />
               
               <div className="flex flex-wrap items-center gap-3">
                  <Select
                     value={filters.status || 'all'}
                     onValueChange={(value) => 
                        setFilters(prev => ({ 
                           ...prev, 
                           status: value === 'all' ? undefined : value as any 
                        }))
                     }
                  >
                     <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary h-11 w-auto min-w-[130px] border-0 bg-transparent rounded-xl text-sm font-medium shadow-sm">
                        <SelectValue placeholder="All Status" />
                     </SelectTrigger>
                     <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                        <SelectItem value="all">All Status</SelectItem>
                        {LEAD_STATUSES.map((status) => (
                           <SelectItem key={status.value} value={status.value}>
                              {status.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>

                  <Select
                     value={filters.priority || 'all'}
                     onValueChange={(value) => 
                        setFilters(prev => ({ 
                           ...prev, 
                           priority: value === 'all' ? undefined : value as any 
                        }))
                     }
                  >
                     <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary h-11 w-auto min-w-[130px] border-0 bg-transparent rounded-xl text-sm font-medium shadow-sm">
                        <SelectValue placeholder="All Priority" />
                     </SelectTrigger>
                     <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                        <SelectItem value="all">All Priority</SelectItem>
                        {LEAD_PRIORITIES.map((priority) => (
                           <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>

                  <Select
                     value={filters.leadSource || 'all'}
                     onValueChange={(value) => 
                        setFilters(prev => ({ 
                           ...prev, 
                           leadSource: value === 'all' ? undefined : value as any 
                        }))
                     }
                  >
                     <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary h-11 w-auto min-w-[130px] border-0 bg-transparent rounded-xl text-sm font-medium shadow-sm">
                        <SelectValue placeholder="All Sources" />
                     </SelectTrigger>
                     <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                        <SelectItem value="all">All Sources</SelectItem>
                        {LEAD_SOURCES.map((source) => (
                           <SelectItem key={source.value} value={source.value}>
                              {source.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>

                  {/* Refresh Button */}
                  <Button
                     onClick={() => fetchLeads(currentPage, searchParamsTerm, false)}
                     variant="outline"
                     size="sm"
                     className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary h-11 w-11 rounded-xl border-0 bg-transparent p-0 transition-all duration-200"
                     title="Refresh"
                  >
                     <RefreshCw className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         </div>

         {/* Modern Main Content Area */}
         <div className="px-3 pb-6 sm:px-4 lg:px-6">
            <Card className="theme-border overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm dark:from-gray-900/80 dark:to-gray-900/40 shadow-lg">
               {viewMode === 'table' ? (
                  <DynamicTable
                     data={leads || []}
                     columns={columns}
                     pageSize={ITEMS_PER_PAGE}
                     onSearch={handleSearch}
                     onPageChange={handlePageChange}
                     isLoading={loading || isPending}
                     totalCount={totalCount}
                     currentPage={currentPage}
                     isServerSide={true}
                     searchPlaceholder="Search leads by name, email, phone, company..."
                     moveEntriesToFooter={true}
                     showSearchInHeader={false}
                     sortConfig={sortConfig}
                     onSort={handleSort}
                     isSort={true}
                  />
               ) : (
                  <DynamicCardList
                     data={leads || []}
                     columns={columns}
                     pageSize={ITEMS_PER_PAGE}
                     onSearch={handleSearch}
                     onPageChange={handlePageChange}
                     isLoading={loading || isPending}
                     totalCount={totalCount}
                     currentPage={currentPage}
                     isServerSide={true}
                     searchPlaceholder="Search leads by name, email, phone, company..."
                     showSearchInHeader={false}
                     viewType={cardViewType}
                     onViewTypeChange={setCardViewType}
                     nameField="name"
                     emailField="email"
                     phoneField="phone"
                     statusField="status"
                     dateField="createdAt"
                     companyField="businessName"
                     priorityField="priority"
                     cardTitle={(lead) => lead.name || 'Unknown'}
                     cardSubtitle={(lead) => lead.businessName || lead.email || ""}
                     cardBadges={(lead) => [
                        {
                           label: leadStatusConfig[lead.status as keyof typeof leadStatusConfig]?.label || lead.status,
                           color: leadStatusConfig[lead.status as keyof typeof leadStatusConfig]?.color || 'bg-gray-100 text-gray-800'
                        },
                        ...(lead.priority ? [{
                           label: priorityConfig[lead.priority as keyof typeof priorityConfig]?.label || lead.priority,
                           color: priorityConfig[lead.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-800'
                        }] : []),
                        ...(lead.leadSource ? [{
                           label: leadSourceConfig[lead.leadSource as keyof typeof leadSourceConfig]?.label || lead.leadSource
                        }] : [])
                     ]}
                     cardActions={(lead) => (
                        <div className="flex gap-1 sm:gap-2">
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLead(lead)}
                              className="theme-border hover:bg-[var(--bg-tertiary)] h-8 w-8 rounded-lg border-0 bg-transparent p-0 transition-all"
                              title="View Lead"
                           >
                              <Eye className="h-4 w-4" />
                           </Button>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLead(lead)}
                              className="theme-border hover:bg-[var(--bg-tertiary)] h-8 w-8 rounded-lg border-0 bg-transparent p-0 transition-all"
                              title="Edit Lead"
                           >
                              <Edit className="h-4 w-4" />
                           </Button>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuoteLead(lead)}
                              className="theme-border hover:bg-blue-50 dark:hover:bg-blue-950/50 h-8 w-8 rounded-lg border-0 bg-transparent p-0 text-blue-600 transition-all dark:text-blue-400"
                              title="Create Quote"
                           >
                              <FileText className="h-4 w-4" />
                           </Button>
                           <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLead(lead)}
                              className="theme-border hover:bg-red-50 dark:hover:bg-red-950/50 h-8 w-8 rounded-lg border-0 bg-transparent p-0 text-red-600 transition-all dark:text-red-400"
                              title="Delete Lead"
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                     )}
                     cardContent={(lead) => (
                        <div className="space-y-2 text-sm">
                           {lead.jobTitle && (
                              <p className="theme-text-secondary">
                                 <span className="font-medium">Position:</span> {lead.jobTitle}
                              </p>
                           )}
                           {lead.leadSource && leadSourceConfig[lead.leadSource as keyof typeof leadSourceConfig] && (
                              <div className="flex items-center gap-2">
                                 <span className="theme-text-secondary font-medium">Source:</span>
                                 <span>{leadSourceConfig[lead.leadSource as keyof typeof leadSourceConfig].icon}</span>
                                 <span className="theme-text-secondary">
                                    {leadSourceConfig[lead.leadSource as keyof typeof leadSourceConfig].label}
                                 </span>
                              </div>
                           )}
                        </div>
                     )}
                  />
               )}
            </Card>
         </div>

         {/* Modern Mobile Floating Action Buttons */}
         <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 sm:hidden">
            <Button
               onClick={() => setShowFilters(!showFilters)}
               className={cn(
                  "h-12 w-12 rounded-full p-0 shadow-lg backdrop-blur-sm transition-all duration-200",
                  showFilters 
                     ? "bg-[var(--interactive-primary)] text-white" 
                     : "bg-white/80 dark:bg-gray-900/80 theme-text-primary border border-gray-200/50 dark:border-gray-700/50"
               )}
               title="Filters"
            >
               <Filter className="h-5 w-5" />
            </Button>
            <Button
               onClick={() => router.push('/lead-management/bulk-import')}
               className="bg-white/80 dark:bg-gray-900/80 theme-text-primary border border-gray-200/50 dark:border-gray-700/50 h-12 w-12 rounded-full p-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white dark:hover:bg-gray-900"
               title="Bulk Import"
            >
               <Upload className="h-5 w-5" />
            </Button>
            <Button
               onClick={handleCreateLead}
               className="bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--interactive-primary)] hover:opacity-90 h-16 w-16 rounded-full p-0 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
               <Plus className="h-6 w-6" />
            </Button>
         </div>

         {/* Modern Delete Confirmation Dialog */}
         <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="theme-bg-primary theme-border mx-4 max-w-md overflow-hidden rounded-2xl border shadow-2xl sm:mx-auto">
               <DialogDescription />
               <DialogHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
                     <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <DialogTitle className="theme-text-primary text-2xl font-bold">
                     Delete Lead
                  </DialogTitle>
                  <p className="theme-text-secondary text-base leading-relaxed">
                     Are you sure you want to delete <span className="theme-text-primary font-semibold">"{leadToDelete?.name}"</span>? 
                     This action cannot be undone and will permanently remove all associated data.
                  </p>
               </DialogHeader>
               <DialogFooter className="flex gap-3 pt-6 sm:flex-row">
                  <Button
                     variant="outline"
                     onClick={cancelDeleteLead}
                     className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary flex-1 rounded-xl border-0 bg-transparent"
                  >
                     Keep Lead
                  </Button>
                  <Button
                     onClick={confirmDeleteLead}
                     className="bg-red-600 hover:bg-red-700 flex-1 rounded-xl text-white transition-colors"
                  >
                     Delete Lead
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Performance indicator for development */}
         {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 text-xs text-gray-500">
               API: {performanceMetricsRef.current.apiResponseTime}ms
            </div>
         )}
      </div>
   )
}

export default LeadManagementOptimized