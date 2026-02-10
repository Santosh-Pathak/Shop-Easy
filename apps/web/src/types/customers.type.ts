export interface Customer {
   _id: string
   name?: string
   fullName?: string
   email?: string
   phone?: string
   type: 'individual' | 'business'
   active: boolean
   createdAt: string
   updatedAt: string
}

export interface CustomerFilters {
   page?: number
   limit?: number
   search?: string
   searchFields?: string[]
   type?: 'individual' | 'business'
   active?: boolean
   sort?: string[]
   sortBy?: string
   sortOrder?: 'asc' | 'desc'
}

export interface CustomerListResponse {
   status: string
   message: string
   data: Customer[]
   meta?: {
      results: number
      limit: number
      currentPage: number
      totalPages: number
      totalCount: number
   }
}

export interface CustomerResponse {
   status: string
   message: string
   data: Customer
}
