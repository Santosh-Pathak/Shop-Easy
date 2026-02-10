export type CustomerType = 'individual' | 'business'

export type CustomerTier = 'T1' | 'T2' | 'T3'

export type CustomerPriority = 'low' | 'medium' | 'high'

export type CustomerLeadSource =
   | 'Website'
   | 'Social Media'
   | 'Email Campaign'
   | 'Cold Call'
   | 'Referral'
   | 'Trade Show'
   | 'Advertisement'
   | 'Other'

export interface Customer {
   _id: string
   name: string
   email: string
   phone: string
   pinCode?: string
   address?: string
   type: CustomerType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: CustomerLeadSource
   priority?: CustomerPriority
   tier?: CustomerTier
   active: boolean
   notes?: string
   description?: string
   businessCustomerId?: string
   createdAt: string
   updatedAt: string
}

export interface CreateCustomerRequest {
   name: string
   email: string
   phone: string
   pinCode?: string
   address?: string
   type: CustomerType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: CustomerLeadSource
   priority?: CustomerPriority
   tier?: CustomerTier
   active?: boolean
   notes?: string
   description?: string
   businessCustomerId?: string
}

export interface UpdateCustomerRequest {
   name?: string
   email?: string
   phone?: string
   pinCode?: string
   address?: string
   type?: CustomerType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: CustomerLeadSource
   priority?: CustomerPriority
   tier?: CustomerTier
   active?: boolean
   notes?: string
   description?: string
   businessCustomerId?: string
}

export interface CustomerFilters {
   page?: number
   limit?: number
   type?: CustomerType
   tier?: CustomerTier
   priority?: CustomerPriority
   leadSource?: CustomerLeadSource
   businessName?: string
   company?: string
   active?: boolean
   search?: string
   searchFields?: string[]
   sort?: string[]
   sortBy?: string
   sortOrder?: 'asc' | 'desc'
   createdFrom?: string
   createdTo?: string
   updatedFrom?: string
   updatedTo?: string
}

export interface CustomerListResponse {
   status: number
   message: string
   data: Customer[]
   meta: {
      results: number
      limit: number
      currentPage: number
      totalPages: number
      totalCount: number
   }
}

export interface CustomerResponse {
   status: number
   message: string
   data: Customer
}

export interface CustomerValidationError {
   row: number
   field: string
   value: any
   message: string
   errors: string[] // For backward compatibility
}

// Type alias for backward compatibility
export type ValidationError = CustomerValidationError

export interface BulkCustomerValidationResponse {
   status: string
   message: string
   data: {
      validRecords: number
      invalidRecords: number
      totalRecords: number
      errors: CustomerValidationError[]
      validCustomers: BulkCustomerData[]
      summary: {
         validationErrors: number
         duplicateErrors: number
         readyForImport: number
         totalProcessed: number
      }
   }
}

export interface BulkCustomerImportResponse {
   status: string
   message: string
   data: {
      totalCustomers: number
      validCustomers: number
      successfullyCreated: number
      skipped: number
      validationErrors: number
      insertErrors: number
      errors: Array<{
         type: 'validation' | 'insert'
         row?: number
         field?: string
         message: string
         value?: any
         email?: string
         phone?: string
      }>
      createdCustomers: Customer[]
      summary: {
         processed: number
         valid: number
         created: number
         failed: number
      }
   }
}

export interface BulkCustomerData {
   name: string
   email: string
   phone: string
   pinCode?: string
   address?: string
   type: CustomerType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: CustomerLeadSource
   priority?: CustomerPriority
   tier?: CustomerTier
   active?: boolean
   notes?: string
   description?: string
}

// Constants for dropdown options
export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
   { value: 'individual', label: 'Individual' },
   { value: 'business', label: 'Business' },
]

export const CUSTOMER_TIERS: {
   value: CustomerTier
   label: string
   color: string
}[] = [
   {
      value: 'T1',
      label: 'Tier 1 (Premium)',
      color: 'bg-purple-100 text-purple-800',
   },
   {
      value: 'T2',
      label: 'Tier 2 (Standard)',
      color: 'bg-blue-100 text-blue-800',
   },
   { value: 'T3', label: 'Tier 3 (Basic)', color: 'bg-gray-100 text-gray-800' },
]

export const CUSTOMER_PRIORITIES: {
   value: CustomerPriority
   label: string
   color: string
}[] = [
   { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
   { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
   { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
]

export const CUSTOMER_LEAD_SOURCES: {
   value: CustomerLeadSource
   label: string
}[] = [
   { value: 'Website', label: 'Website' },
   { value: 'Social Media', label: 'Social Media' },
   { value: 'Email Campaign', label: 'Email Campaign' },
   { value: 'Cold Call', label: 'Cold Call' },
   { value: 'Referral', label: 'Referral' },
   { value: 'Trade Show', label: 'Trade Show' },
   { value: 'Advertisement', label: 'Advertisement' },
   { value: 'Other', label: 'Other' },
]

export const CUSTOMER_STATUS: {
   value: boolean
   label: string
   color: string
}[] = [
   { value: true, label: 'Active', color: 'bg-green-100 text-green-800' },
   { value: false, label: 'Inactive', color: 'bg-red-100 text-red-800' },
]

// Customer statistics response type
export interface CustomerStatsData {
   totalCustomers: {
      count: number
      change: string
   }
   activeCustomers: {
      count: number
      change: string
   }
   businessCustomers: {
      count: number
      change: string
   }
   premiumCustomers: {
      count: number
      change: string
   }
   summary: {
      total: number
      active: number
      business: number
      premium: number
      retentionRate: number
   }
}

export interface CustomerStatsResponse {
   status: string
   message: string
   data: CustomerStatsData
}
