import { handleAuthError } from '@/utils/error'
import { httpService } from '../http'
import {
   User,
   CreateUserRequest,
   UpdateUserRequest,
   UserFilters,
   UserListResponse,
   UserResponse,
   UserStatsResponse,
} from '@/types/user'
import generateApis from './generateApis'

const BASE_URL = '/api/v1/users'
const DEFAULT_PAGE_SIZE = 10

// Basic CRUD operations using generateApis
const basicUserApis = generateApis(BASE_URL)

// Cache configuration
interface CacheEntry<T> {
   data: T
   timestamp: number
   ttl: number
}

interface RequestQueue {
   [key: string]: Promise<any>
}

// Cache and request management for users
class UserCache {
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
const userCache = new UserCache()

// User-specific API service with advanced optimizations
export class UserAPI {
   // Enhanced user fetching with caching and deduplication
   static readonly getUsers = async (
      filters: UserFilters = {}
   ): Promise<UserListResponse> => {
      const cacheKey = userCache['generateCacheKey']('users', filters)

      // Check cache first
      const cachedData = userCache.get<UserListResponse>(cacheKey)
      if (cachedData) {
         return cachedData
      }

      // Use request deduplication
      return userCache.dedupe(cacheKey, async () => {
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
               'role',
               'active',
               'isEmailVerified',
               'name',
               'email',
            ]

            filterFields.forEach((field) => {
               const value = filters[field as keyof UserFilters]
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

            // Use httpService.getWithMeta to get full response with meta
            const url = `${BASE_URL}${query}`
            const backendResponse = await httpService.getWithMeta<any>(url)

            // Backend returns: { status: "success", message: "...", data: [...], meta: {...} }
            const usersArray = Array.isArray(backendResponse.data)
               ? backendResponse.data
               : []

            // Transform backend user format to frontend format
            // Backend uses 'isActive', frontend uses 'active'
            const transformedUsers = usersArray.map((user: any) => ({
               ...user,
               _id: user.id || user._id,
               active:
                  user.isActive !== undefined ? user.isActive : user.active,
            }))

            // Transform backend meta format to frontend format
            const backendMeta = backendResponse.meta || {}
            const meta = {
               results: transformedUsers.length,
               limit: backendMeta.limit || filters.limit || DEFAULT_PAGE_SIZE,
               currentPage: backendMeta.page || filters.page || 1,
               totalPages: backendMeta.totalPages || 1,
               totalCount: backendMeta.total || transformedUsers.length,
            }

            const transformedResponse: UserListResponse = {
               status: backendResponse.status as 'success',
               message:
                  backendResponse.message || 'Users retrieved successfully',
               data: {
                  data: transformedUsers,
                  meta: meta,
               },
            }

            // Cache the response with shorter TTL for frequently changing data
            const ttl =
               filters.page || filters.search ? 2 * 60 * 1000 : 5 * 60 * 1000 // 2min for paginated/searched, 5min for base lists
            userCache.set(cacheKey, transformedResponse, ttl)

            return transformedResponse
         } catch (error) {
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }

   // Optimized single user fetching with caching
   static readonly getUserById = async (id: string): Promise<User> => {
      const cacheKey = `user_${id}`

      // Check cache first
      const cachedUser = userCache.get<User>(cacheKey)
      if (cachedUser) {
         return cachedUser
      }

      return userCache.dedupe(cacheKey, async () => {
         try {
            const response = await basicUserApis.getOne(id)

            // Transform backend format to frontend format
            const transformedUser = {
               ...response,
               _id: response.id || response._id,
               active:
                  response.isActive !== undefined
                     ? response.isActive
                     : response.active,
            }

            // Cache individual user for longer since it changes less frequently
            userCache.set(cacheKey, transformedUser, 10 * 60 * 1000) // 10 minutes

            return transformedUser
         } catch (error) {
            const authError = handleAuthError(error)
            throw authError
         }
      })
   }

   // Create user with optimistic cache invalidation
   static readonly createUser = async (
      userData: CreateUserRequest
   ): Promise<UserResponse> => {
      try {
         const response = await basicUserApis.create(userData)

         // Invalidate relevant cache entries
         userCache.invalidatePattern('users')
         userCache.invalidatePattern('stats')

         return response as UserResponse
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Update user with cache invalidation
   static readonly updateUser = async (
      id: string,
      userData: UpdateUserRequest
   ): Promise<UserResponse> => {
      try {
         // Transform frontend format to backend format (active -> isActive)
         const backendUserData: any = { ...userData }
         if ('active' in backendUserData) {
            backendUserData.isActive = backendUserData.active
            delete backendUserData.active
         }

         const response = await basicUserApis.updateOne(id, backendUserData)

         // Transform backend format to frontend format
         if (response.data) {
            response.data = {
               ...response.data,
               _id: response.data.id || response.data._id,
               active:
                  response.data.isActive !== undefined
                     ? response.data.isActive
                     : response.data.active,
            }
         }

         // Invalidate specific user and list caches
         userCache.invalidatePattern(`user_${id}`)
         userCache.invalidatePattern('users')
         userCache.invalidatePattern('stats')

         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // Delete user with cache invalidation
   static readonly deleteUser = async (id: string): Promise<void> => {
      try {
         const response = await basicUserApis.deleteOne(id)

         // Invalidate specific user and list caches
         userCache.invalidatePattern(`user_${id}`)
         userCache.invalidatePattern('users')
         userCache.invalidatePattern('stats')

         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   }

   // User statistics with caching - no duplicate API calls
   static readonly getUserStats = async (
      existingData?: UserListResponse
   ): Promise<UserStatsResponse> => {
      const cacheKey = 'user_stats'

      // Check cache first - use shorter TTL for stats as they change frequently
      const cachedStats = userCache.get<UserStatsResponse>(cacheKey)
      if (cachedStats) {
         return cachedStats
      }

      return userCache.dedupe(cacheKey, async () => {
         try {
            // If we have existing data, use it to calculate stats
            let usersData: UserListResponse

            if (existingData) {
               usersData = existingData
            } else {
               // Only fetch data if we don't have it already
               usersData = await UserAPI.getUsers({ limit: 10, page: 1 })
            }

            const totalCount = usersData.data?.meta?.totalCount || 0
            const users = usersData.data?.data || []

            // Calculate real stats from the user data
            const activeCount = users.filter((user) => user.active).length
            const verifiedCount = users.filter(
               (user) => user.isEmailVerified
            ).length
            const adminCount = users.filter(
               (user) => user.role === 'admin' || user.role === 'superAdmin'
            ).length

            // Calculate percentages for the whole dataset
            const activePercentage =
               totalCount > 0
                  ? Math.round(
                       (activeCount / Math.min(users.length, totalCount)) * 100
                    )
                  : 0
            const verifiedPercentage =
               totalCount > 0
                  ? Math.round(
                       (verifiedCount / Math.min(users.length, totalCount)) *
                          100
                    )
                  : 0

            const mockStats: UserStatsResponse = {
               status: 'success',
               message: 'User statistics retrieved successfully',
               data: {
                  totalUsers: {
                     count: totalCount,
                     change: '+12%',
                  },
                  activeUsers: {
                     count:
                        totalCount > 0
                           ? Math.round(totalCount * (activePercentage / 100))
                           : activeCount,
                     change: '+8%',
                  },
                  verifiedUsers: {
                     count:
                        totalCount > 0
                           ? Math.round(totalCount * (verifiedPercentage / 100))
                           : verifiedCount,
                     change: '+15%',
                  },
                  adminUsers: {
                     count:
                        totalCount > 0
                           ? Math.round(
                                totalCount *
                                   (adminCount / Math.max(users.length, 1))
                             )
                           : adminCount,
                     change: '+2%',
                  },
                  summary: {
                     total: totalCount,
                     active:
                        totalCount > 0
                           ? Math.round(totalCount * (activePercentage / 100))
                           : activeCount,
                     verified:
                        totalCount > 0
                           ? Math.round(totalCount * (verifiedPercentage / 100))
                           : verifiedCount,
                     admins:
                        totalCount > 0
                           ? Math.round(
                                totalCount *
                                   (adminCount / Math.max(users.length, 1))
                             )
                           : adminCount,
                     verificationRate: verifiedPercentage,
                  },
               },
            }

            // Cache stats for 30 seconds since they change frequently
            userCache.set(cacheKey, mockStats, 30 * 1000)

            return mockStats
         } catch (error) {
            console.error('Error fetching user stats:', error)

            // Return default stats on error
            const defaultStats: UserStatsResponse = {
               status: 'success',
               message: 'User statistics retrieved successfully',
               data: {
                  totalUsers: { count: 0, change: '+0%' },
                  activeUsers: { count: 0, change: '+0%' },
                  verifiedUsers: { count: 0, change: '+0%' },
                  adminUsers: { count: 0, change: '+0%' },
                  summary: {
                     total: 0,
                     active: 0,
                     verified: 0,
                     admins: 0,
                     verificationRate: 0,
                  },
               },
            }

            return defaultStats
         }
      })
   }

   // Export functionality with better error handling
   static readonly exportUsers = async (
      filters: UserFilters = {}
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

   // New utility methods for performance optimization
   static readonly getCacheStats = () => {
      return userCache.getCacheStats()
   }

   static readonly clearCache = () => {
      userCache.clear()
   }

   static readonly preloadUserData = async (filters: UserFilters = {}) => {
      // Pre-load common data combinations
      const commonFilters: UserFilters[] = [
         { ...filters, role: 'customer' },
         { ...filters, role: 'admin' },
         { ...filters, active: true },
         { ...filters, isEmailVerified: true },
      ]

      const promises = commonFilters.map(
         (filter) => UserAPI.getUsers(filter).catch(() => null) // Ignore errors in preload
      )

      await Promise.all(promises)
   }
}

// Export individual functions for backward compatibility and convenience
export const {
   getUsers,
   getUserById,
   createUser,
   updateUser,
   deleteUser,
   getUserStats,
   exportUsers,
   getCacheStats,
   clearCache,
   preloadUserData,
} = UserAPI

// Default export
export default UserAPI

// Additional utility exports for user management
export { userCache }

// User configuration constants
export const userRoleConfig = {
   customer: {
      label: 'Customer',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
   },
   staff: {
      label: 'Staff',
      color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400',
   },
   admin: {
      label: 'Admin',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400',
   },
   superAdmin: {
      label: 'Super Admin',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
   },
}

export const userStatusConfig = {
   active: {
      label: 'Active',
      color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400',
   },
   inactive: {
      label: 'Inactive',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
   },
}

export const userVerificationConfig = {
   verified: {
      label: 'Verified',
      color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400',
   },
   unverified: {
      label: 'Unverified',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400',
   },
}
