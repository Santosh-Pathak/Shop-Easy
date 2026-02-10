import { handleAuthError } from '@/utils/error'
import { httpService } from '../http'
import {
   Lead,
   CreateLeadRequest,
   UpdateLeadRequest,
   LeadFilters,
   LeadListResponse,
   LeadResponse,
   BulkValidationResponse,
   BulkImportResponse,
   BulkLeadData,
   LeadStatsResponse,
} from '@/types/lead'
import generateApis from './generateApis'
import Papa from 'papaparse'

const BASE_URL = '/api/v1/lead'

// Basic CRUD operations using generateApis
const basicLeadApis = generateApis(BASE_URL)

// Cache configuration
interface CacheEntry<T> {
   data: T
   timestamp: number
   ttl: number
}

interface RequestQueue {
   [key: string]: Promise<any>
}

// Cache and request management
class LeadCache {
   private cache = new Map<string, CacheEntry<any>>()
   private requestQueue: RequestQueue = {}
   private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
   private readonly STATS_TTL = 30 * 1000 // 30 seconds for stats

   private generateCacheKey(type: string, params?: any): string {
      if (!params) return type
      const sortedParams = Object.keys(params)
         .sort()
         .reduce(
            (result, key) => {
               if (
                  params[key] !== undefined &&
                  params[key] !== null &&
                  params[key] !== ''
               ) {
                  result[key] = params[key]
               }
               return result
            },
            {} as Record<string, any>
         )
      return `${type}_${JSON.stringify(sortedParams)}`
   }

   get<T>(key: string): T | null {
      const entry = this.cache.get(key)
      if (!entry) return null

      if (Date.now() - entry.timestamp > entry.ttl) {
         this.cache.delete(key)
         return null
      }

      return entry.data
   }

   set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
      this.cache.set(key, {
         data,
         timestamp: Date.now(),
         ttl,
      })
   }

   invalidatePattern(pattern: string): void {
      const keys = Array.from(this.cache.keys())
      keys.forEach((key) => {
         if (key.includes(pattern)) {
            this.cache.delete(key)
         }
      })
   }

   clear(): void {
      this.cache.clear()
      this.requestQueue = {}
   }

   // Request deduplication
   async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
      if (key in this.requestQueue) {
         return this.requestQueue[key]
      }

      this.requestQueue[key] = requestFn().finally(() => {
         delete this.requestQueue[key]
      })

      return this.requestQueue[key]
   }

   // Get cache size and stats
   getCacheStats() {
      return {
         size: this.cache.size,
         entries: Array.from(this.cache.keys()),
         activeRequests: Object.keys(this.requestQueue).length,
      }
   }
}

// Singleton cache instance
const leadCache = new LeadCache()

// Lead-specific API service with advanced optimizations
export class LeadAPI {
   // Enhanced lead fetching with caching and deduplication
   static readonly getLeads = async (
      filters: LeadFilters = {}
   ): Promise<LeadListResponse> => {
      const cacheKey = leadCache['generateCacheKey']('leads', filters)

      // Check cache first
      const cachedData = leadCache.get<LeadListResponse>(cacheKey)
      if (cachedData) {
         return cachedData
      }

      // Use request deduplication
      return leadCache.dedupe(cacheKey, async () => {
         try {
            const searchParams = new URLSearchParams()

            // Handle pagination
            if (filters.page !== undefined) {
               searchParams.append('page', filters.page.toString())
            }
            if (filters.limit !== undefined) {
               searchParams.append('limit', filters.limit.toString())
            }

            // Handle search
            if (filters.search && filters.search.trim()) {
               searchParams.append('search', filters.search.trim())
            }
            if (filters.searchFields && filters.searchFields.length > 0) {
               searchParams.append(
                  'searchFields',
                  filters.searchFields.join(',')
               )
            }

            // Handle sorting - support multiple sort fields
            if (filters.sort && filters.sort.length > 0) {
               searchParams.append('sort', filters.sort.join(','))
            } else if (filters.sortBy && filters.sortOrder) {
               // Fallback to single sort field
               const sortDirection = filters.sortOrder === 'desc' ? '-' : ''
               searchParams.append('sort', `${sortDirection}${filters.sortBy}`)
            }

            // Handle filters
            const filterFields = [
               'status',
               'priority',
               'type',
               'leadSource',
               'businessName',
               'company',
               'assignedTo',
            ]

            filterFields.forEach((field) => {
               const value = filters[field as keyof LeadFilters]
               if (value !== undefined && value !== null && value !== '') {
                  searchParams.append(field, value.toString())
               }
            })

            // Handle date range filters
            if (filters.createdFrom) {
               searchParams.append('createdFrom', filters.createdFrom)
            }
            if (filters.createdTo) {
               searchParams.append('createdTo', filters.createdTo)
            }
            if (filters.updatedFrom) {
               searchParams.append('updatedFrom', filters.updatedFrom)
            }
            if (filters.updatedTo) {
               searchParams.append('updatedTo', filters.updatedTo)
            }

            const queryString = searchParams.toString()
            const query = queryString ? `?${queryString}` : ''

            const response = await basicLeadApis.getAll(query)

            // Cache the response with shorter TTL for frequently changing data
            const ttl =
               filters.page || filters.search ? 2 * 60 * 1000 : 5 * 60 * 1000 // 2min for paginated/searched, 5min for base lists
            leadCache.set(cacheKey, response, ttl)

            return response
         } catch (error) {
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }

   // Optimized single lead fetching with caching
   static readonly getLeadById = async (id: string): Promise<Lead> => {
      const cacheKey = `lead_${id}`

      // Check cache first
      const cachedLead = leadCache.get<Lead>(cacheKey)
      if (cachedLead) {
         return cachedLead
      }

      return leadCache.dedupe(cacheKey, async () => {
         try {
            const response = await basicLeadApis.getOne(id)

            // Cache individual lead for longer since it changes less frequently
            leadCache.set(cacheKey, response, 10 * 60 * 1000) // 10 minutes

            return response
         } catch (error) {
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }

   // Create lead with optimistic cache invalidation
   static readonly createLead = async (
      leadData: CreateLeadRequest
   ): Promise<LeadResponse> => {
      try {
         const response = await basicLeadApis.create(leadData)

         // Invalidate relevant cache entries
         leadCache.invalidatePattern('leads')
         leadCache.invalidatePattern('stats')

         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Update lead with cache invalidation
   static readonly updateLead = async (
      id: string,
      leadData: UpdateLeadRequest
   ): Promise<LeadResponse> => {
      try {
         const response = await basicLeadApis.updateOne(id, leadData)

         // Invalidate specific lead and list caches
         leadCache.invalidatePattern(`lead_${id}`)
         leadCache.invalidatePattern('leads')
         leadCache.invalidatePattern('stats')

         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Delete lead with cache invalidation
   static readonly deleteLead = async (id: string): Promise<void> => {
      try {
         const response = await basicLeadApis.deleteOne(id)

         // Invalidate specific lead and list caches
         leadCache.invalidatePattern(`lead_${id}`)
         leadCache.invalidatePattern('leads')
         leadCache.invalidatePattern('stats')

         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Optimized bulk operations with better error handling
   static readonly downloadTemplate = async (): Promise<Blob> => {
      const cacheKey = 'template_blob'

      // Check if we have a cached template (valid for 1 hour)
      const cachedTemplate = leadCache.get<Blob>(cacheKey)
      if (cachedTemplate) {
         return cachedTemplate
      }

      return leadCache.dedupe(cacheKey, async () => {
         try {
            const blob = await httpService.download(
               `${BASE_URL}/bulk-lead-template`
            )

            // Cache template for 1 hour since it rarely changes
            leadCache.set(cacheKey, blob, 60 * 60 * 1000)

            return blob
         } catch (error) {
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }

   // Optimized bulk validation with request deduplication
   static readonly validateBulkData = async (
      leads: BulkLeadData[]
   ): Promise<BulkValidationResponse> => {
      // Create cache key based on leads data hash for deduplication
      const dataHash = btoa(JSON.stringify(leads)).slice(0, 16)
      const cacheKey = `validation_${dataHash}`

      return leadCache.dedupe(cacheKey, async () => {
         try {
            const response = await httpService.post<unknown>(
               `${BASE_URL}/bulk-lead-validate`,
               { leads }
            )

            // Debug: Log the actual API response
            console.log('Raw validation API response:', response)

            // Type guard to check if response is validation data
            const isValidationData = (
               obj: unknown
            ): obj is {
               validRecords?: number
               invalidRecords?: number
               totalRecords?: number
            } => {
               return (
                  typeof obj === 'object' &&
                  obj !== null &&
                  ('validRecords' in obj ||
                     'invalidRecords' in obj ||
                     'totalRecords' in obj)
               )
            }

            // The httpService.post extracts .data automatically, so we need to handle this
            // If response is already the extracted data, wrap it back
            if (
               response &&
               typeof response === 'object' &&
               !('data' in response) &&
               isValidationData(response)
            ) {
               return {
                  status: 'success',
                  message: 'Validation completed',
                  data: response,
               } as BulkValidationResponse
            }

            // If it's the full response structure, return as is
            return response as BulkValidationResponse
         } catch (error) {
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }

   // Bulk import with cache invalidation
   static readonly bulkImportLeads = async (
      leads: BulkLeadData[]
   ): Promise<BulkImportResponse> => {
      try {
         const response = await httpService.post<unknown>(
            `${BASE_URL}/bulk-lead-register`,
            { leads }
         )

         // Debug: Log the actual API response
         console.log('Raw bulk import response:', response)

         // Type guard to check if response is import data
         const isImportData = (
            obj: unknown
         ): obj is {
            totalLeads?: number
            successfullyCreated?: number
            skipped?: number
         } => {
            return (
               typeof obj === 'object' &&
               obj !== null &&
               ('totalLeads' in obj ||
                  'successfullyCreated' in obj ||
                  'skipped' in obj)
            )
         }

         // The httpService.post extracts .data automatically, so we need to handle this
         // If response is already the extracted data, wrap it back
         if (
            response &&
            typeof response === 'object' &&
            !('data' in response) &&
            isImportData(response)
         ) {
            // Invalidate all lead-related caches after bulk import
            leadCache.invalidatePattern('leads')
            leadCache.invalidatePattern('stats')

            return {
               status: 'success',
               message: 'Leads processed successfully',
               data: response,
            } as BulkImportResponse
         }

         // If it's the full response structure, return as is
         const result = response as BulkImportResponse

         // Invalidate all lead-related caches after bulk import
         leadCache.invalidatePattern('leads')
         leadCache.invalidatePattern('stats')

         return result
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Enhanced helper functions
   static readonly downloadTemplateFile = async (): Promise<void> => {
      try {
         const blob = await LeadAPI.downloadTemplate()
         const url = window.URL.createObjectURL(blob)
         const link = document.createElement('a')
         link.href = url
         link.setAttribute('download', 'lead-import-template.csv')
         document.body.appendChild(link)
         link.click()
         link.remove()
         window.URL.revokeObjectURL(url)
      } catch (error) {
         console.error('Error downloading template:', error)
         throw error
      }
   }

   // Improved CSV parsing with better error handling using Papa Parse
   static readonly parseCSV = (csvText: string): BulkLeadData[] => {
      try {
         console.log(
            'Parsing CSV text with Papa Parse:',
            csvText.substring(0, 200) + '...'
         )

         // Use Papa Parse for robust CSV parsing
         const parseResult = Papa.parse<Record<string, string>>(csvText, {
            header: true, // Use first row as header
            skipEmptyLines: true, // Skip empty rows
            transform: (value: string) => value.trim(), // Trim all values
         })

         if (parseResult.errors.length > 0) {
            console.warn('CSV parsing warnings:', parseResult.errors)
         }

         console.log('Papa Parse result:', parseResult)

         const data: BulkLeadData[] = []
         const errors: string[] = []

         // Filter and validate the parsed data
         parseResult.data.forEach(
            (row: Record<string, string>, index: number) => {
               console.log(`Row ${index + 2} parsed data:`, row) // +2 because header is row 1 and array is 0-indexed

               // Basic validation - let the backend handle detailed validation
               if (!row.phone || row.phone.trim() === '') {
                  errors.push(`Row ${index + 2}: Phone number is required`)
                  return
               }

               if (!row.type || row.type.trim() === '') {
                  errors.push(`Row ${index + 2}: Type is required`)
                  return
               }

               // Normalize type value and check if valid
               const normalizedType = row.type.toLowerCase().trim()
               if (!['individual', 'business'].includes(normalizedType)) {
                  errors.push(
                     `Row ${index + 2}: Valid type (individual/business) is required, got '${row.type}'`
                  )
                  return
               }
               row.type = normalizedType // Use normalized value

               if (!row.status || row.status.trim() === '') {
                  errors.push(`Row ${index + 2}: Status is required`)
                  return
               }

               // Only include rows with required fields
               data.push(row as unknown as BulkLeadData)
            }
         )

         if (errors.length > 0) {
            console.warn('CSV parsing warnings:', errors)
            // Don't throw error, just warn - let backend handle validation
         }

         console.log(
            `Parsed ${data.length} valid leads from ${parseResult.data.length} total rows`
         )
         return data
      } catch (error) {
         console.error('Error parsing CSV:', error)
         throw new Error(
            'Failed to parse CSV file. Please check the file format.'
         )
      }
   }

   // New utility methods for performance optimization
   static readonly getCacheStats = () => {
      return leadCache.getCacheStats()
   }

   static readonly clearCache = () => {
      leadCache.clear()
   }

   static readonly preloadLeadData = async (filters: LeadFilters = {}) => {
      // Pre-load common data combinations
      const commonFilters: LeadFilters[] = [
         { ...filters, status: 'open' },
         { ...filters, status: 'inProgress' },
         { ...filters, priority: 'high' },
      ]

      const promises = commonFilters.map(
         (filter) => LeadAPI.getLeads(filter).catch(() => null) // Ignore errors in preload
      )

      await Promise.all(promises)
   }

   // Export functionality with better error handling
   static readonly exportLeads = async (
      filters: LeadFilters = {}
   ): Promise<Blob> => {
      try {
         const searchParams = new URLSearchParams()
         searchParams.append('export', 'true')

         Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
               searchParams.append(key, value.toString())
            }
         })

         const query = searchParams.toString()
         const url = query ? `${BASE_URL}?${query}` : BASE_URL

         return await httpService.download(url)
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Lead statistics with caching
   static readonly getLeadStats = async (): Promise<LeadStatsResponse> => {
      const cacheKey = 'lead_stats'

      // Check cache first - use shorter TTL for stats as they change frequently
      const cachedStats = leadCache.get<LeadStatsResponse>(cacheKey)
      if (cachedStats) {
         return cachedStats
      }

      return leadCache.dedupe(cacheKey, async () => {
         try {
            const response = await httpService.get<unknown>(`${BASE_URL}/stats`)

            console.log('Raw stats API response:', response) // Debug log

            // The httpService.get extracts .data automatically, so we need to handle this
            // If response is already the extracted data, wrap it back
            const result: LeadStatsResponse = {
               status: 'success',
               message: 'Lead statistics retrieved successfully',
               data: response as any,
            }

            console.log('Processed stats response:', result) // Debug log

            // Cache stats for 30 seconds since they change frequently
            leadCache.set(cacheKey, result, 30 * 1000)

            return result
         } catch (error) {
            console.error('Error fetching stats:', error) // Debug log
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }
}

// Export individual functions for backward compatibility and convenience
export const {
   getLeads,
   getLeadById,
   createLead,
   updateLead,
   deleteLead,
   downloadTemplate,
   validateBulkData,
   bulkImportLeads,
   downloadTemplateFile,
   parseCSV,
   getCacheStats,
   clearCache,
   preloadLeadData,
   exportLeads,
   getLeadStats,
} = LeadAPI

// Default export
export default LeadAPI

// Additional utility exports for lead management
export { leadCache }

// Lead configuration constants (moved from the example to maintain consistency)
export const leadStatusConfig = {
   new: { label: 'New', color: 'bg-blue-100 text-blue-800' },
   open: { label: 'Open', color: 'bg-green-100 text-green-800' },
   inProgress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
   qualified: { label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
   sendQuote: { label: 'Quote Sent', color: 'bg-indigo-100 text-indigo-800' },
   closedWon: { label: 'Closed Won', color: 'bg-emerald-100 text-emerald-800' },
   closedLost: { label: 'Closed Lost', color: 'bg-red-100 text-red-800' },
   closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
}

export const priorityConfig = {
   low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
   medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
   high: { label: 'High', color: 'bg-red-100 text-red-800' },
}

export const leadSourceConfig = {
   Website: { label: 'Website', icon: '🌐' },
   'Social Media': { label: 'Social Media', icon: '📱' },
   'Email Campaign': { label: 'Email Campaign', icon: '📧' },
   'Cold Call': { label: 'Cold Call', icon: '📞' },
   Referral: { label: 'Referral', icon: '👥' },
   'Trade Show': { label: 'Trade Show', icon: '🏢' },
   Advertisement: { label: 'Advertisement', icon: '📢' },
   Other: { label: 'Other', icon: '📋' },
}
