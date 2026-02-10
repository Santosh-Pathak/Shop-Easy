export type UserRole = 'admin' | 'staff' | 'superAdmin' | 'customer'

export interface User {
   _id: string
   name: string
   email: string
   phone?: string
   photo?: string
   postalCode?: string
   address?: string
   role: UserRole
   active: boolean
   isEmailVerified: boolean
   createdAt: string
   updatedAt: string
}

export interface CreateUserRequest {
   name: string
   email: string
   phone?: string
   photo?: string
   postalCode?: string
   address?: string
   role?: UserRole
   description?: string
}

export interface UpdateUserRequest {
   name?: string
   email?: string
   phone?: string
   photo?: string
   postalCode?: string
   address?: string
   role?: UserRole
   active?: boolean
   isEmailVerified?: boolean
}

export interface UserFilters {
   page?: number
   limit?: number
   role?: UserRole
   active?: boolean
   isEmailVerified?: boolean
   search?: string
   searchFields?: string[]
   sort?: string[]
   sortBy?: string
   sortOrder?: 'asc' | 'desc'
   createdFrom?: string
   createdTo?: string
   updatedFrom?: string
   updatedTo?: string
   name?: string
   email?: string
}

export interface UserListResponse {
   status: string
   message: string
   data: {
      data: User[]
      meta: {
         results: number
         limit: number
         currentPage: number
         totalPages: number
         totalCount: number
      }
   }
}

export interface UserResponse {
   status: string
   message: string
   data: User
}

export interface UserStatsData {
   totalUsers: {
      count: number
      change: string
   }
   activeUsers: {
      count: number
      change: string
   }
   verifiedUsers: {
      count: number
      change: string
   }
   adminUsers: {
      count: number
      change: string
   }
   summary: {
      total: number
      active: number
      verified: number
      admins: number
      verificationRate: number
   }
}

export interface UserStatsResponse {
   status: string
   message: string
   data: UserStatsData
}

// Constants for dropdown options
export const USER_ROLES: {
   value: UserRole
   label: string
   color: string
   description: string
}[] = [
   {
      value: 'customer',
      label: 'Customer',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
      description: 'Regular customer account',
   },
   {
      value: 'staff',
      label: 'Staff',
      color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400',
      description: 'Staff member with limited access',
   },
   {
      value: 'admin',
      label: 'Admin',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400',
      description: 'System administrator',
   },
   {
      value: 'superAdmin',
      label: 'Super Admin',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
      description: 'Super administrator with full access',
   },
]

export const USER_STATUS_OPTIONS: {
   value: 'all' | 'active' | 'inactive'
   label: string
   color: string
}[] = [
   { value: 'all', label: 'All Status', color: 'bg-gray-100 text-gray-800' },
   { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
   { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800' },
]

export const USER_VERIFICATION_OPTIONS: {
   value: 'all' | 'verified' | 'unverified'
   label: string
   color: string
}[] = [
   {
      value: 'all',
      label: 'All Verification',
      color: 'bg-gray-100 text-gray-800',
   },
   {
      value: 'verified',
      label: 'Verified',
      color: 'bg-green-100 text-green-800',
   },
   {
      value: 'unverified',
      label: 'Unverified',
      color: 'bg-yellow-100 text-yellow-800',
   },
]

// Helper functions for user status and role display
export const getUserRoleConfig = (role: UserRole) => {
   return (
      USER_ROLES.find((r) => r.value === role) || {
         value: role,
         label: role.charAt(0).toUpperCase() + role.slice(1),
         color: 'bg-gray-100 text-gray-800',
         description: 'Unknown role',
      }
   )
}

export const getUserStatusColor = (active: boolean) => {
   return active
      ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400'
}

export const getUserVerificationColor = (isEmailVerified: boolean) => {
   return isEmailVerified
      ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400'
}
