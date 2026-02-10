export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export interface SubServiceItem {
   subService:
      | string
      | {
           _id: string
           name: string
           description?: string
           service?: string
           category?: string
           price?: number
           unit?: string
           markUp?: number
           code?: string
           createdAt?: string
           updatedAt?: string
        }
   _id?: string
}

export interface ServiceItem {
   service:
      | string
      | {
           _id: string
           name: string
           description?: string
           category?: string
           code?: string
           createdAt?: string
           updatedAt?: string
        }
   quantity: number
   marginPercent: number
   marginAmount: number
   price: number
   subsServices: SubServiceItem[]
   _id?: string
}

export interface CategoryGroup {
   category:
      | string
      | {
           _id: string
           name: string
           description?: string
           code?: string
           createdAt?: string
           updatedAt?: string
        }
   services: ServiceItem[]
   _id?: string
}

export interface LabourItem {
   _id?: string
   description?: string
   type?: string
   unit?: string
   rate?: number
   code?: string
   createdAt?: string
   updatedAt?: string
}

export interface MaterialItem {
   _id?: string
   description?: string
   type?: string
   unit?: string
   cost?: number
   code?: string
   createdAt?: string
   updatedAt?: string
}

export interface QuoteItem {
   subService:
      | string
      | {
           _id: string
           name: string
           description?: string
           category?:
              | string
              | {
                   _id: string
                   name: string
                }
           service?: {
              _id: string
              name: string
           }
           price?: number
        }
   quantity: number
   marginPercent: number
   marginAmount: number
   _id?: string
}

export interface Quote {
   _id: string
   customer?:
      | string
      | {
           _id: string
           name: string
           email: string
           phone?: string
           address?: string
           businessName?: string
           id?: string
        }
   lead?:
      | string
      | {
           _id: string
           name: string
           email?: string
           phone?: string
           pinCode?: string
           address?: string
           type?: string
           businessName?: string
           company?: string
           jobTitle?: string
           leadSource?: string
           priority?: string
           status: string
           notes?: string
           description?: string
           createdAt?: string
           updatedAt?: string
           id?: string
           // Legacy fields for backward compatibility
           title?: string
           fullName?: string
           firstName?: string
           lastName?: string
        }
   code: string
   description?: string
   validUntil: string
   status: QuoteStatus
   items: CategoryGroup[]
   labour?: string[] | LabourItem[]
   materials?: string[] | MaterialItem[]
   price: number
   vat: number
   totalAmount: number
   averageMarginPercent?: number
   notes?: string
   docSignId?: string
   quoteUrl?: string
   createdAt: string
   updatedAt: string
   __v?: number
}

export interface CreateQuoteRequest {
   customer?: string
   lead?: string
   description?: string
   validUntil: string
   status?: QuoteStatus
   items: {
      category: string
      services: {
         service: string
         quantity: number
         marginPercent: number
         marginAmount: number
         price: number
         subsServices: {
            subService: string
            price: number
         }[]
      }[]
   }[]
   labour?: string[]
   materials?: string[]
   price: number
   vat: number
   totalAmount: number
   averageMarginPercent?: number
   notes?: string
   docSignId?: string
   quoteUrl?: string
}

export interface UpdateQuoteRequest {
   customer?: string
   lead?: string
   description?: string
   validUntil?: string
   status?: QuoteStatus
   items?: {
      category: string
      services: {
         service: string
         quantity: number
         marginPercent: number
         marginAmount: number
         price: number
         subsServices: {
            subService: string
            price: number
         }[]
      }[]
   }[]
   labour?: string[]
   materials?: string[]
   price?: number
   vat?: number
   totalAmount?: number
   averageMarginPercent?: number
   notes?: string
   docSignId?: string
   quoteUrl?: string
}

export interface QuoteFilters {
   page?: number
   limit?: number
   status?: QuoteStatus | 'all'
   customer?: string
   lead?: string
   search?: string
   searchFields?: string[]
   sort?: string[]
   sortBy?: string
   sortOrder?: 'asc' | 'desc'
   validFrom?: string
   validTo?: string
   createdFrom?: string
   createdTo?: string
   priceMin?: number
   priceMax?: number
   totalAmountMin?: number
   totalAmountMax?: number
}

export interface QuoteListResponse {
   status: string
   message: string
   data: {
      data: Quote[]
      meta: {
         results: number
         limit: number
         currentPage: number
         totalPages: number
         totalCount: number
      }
   }
}

export interface QuoteResponse {
   status: string
   message: string
   data: Quote
}

export interface QuoteStatsData {
   totalQuotes: {
      count: number
      change: string
   }
   draftQuotes: {
      count: number
      change: string
   }
   acceptedQuotes: {
      count: number
      change: string
   }
   rejectedQuotes: {
      count: number
      change: string
   }
   summary: {
      total: number
      draft: number
      sent: number
      accepted: number
      rejected: number
      acceptanceRate: number
      totalValue: number
   }
}

export interface QuoteStatsResponse {
   status: string
   message: string
   data: QuoteStatsData
}

// Constants for dropdown options
export const QUOTE_STATUS_OPTIONS: {
   value: QuoteStatus
   label: string
   color: string
   description: string
}[] = [
   {
      value: 'draft',
      label: 'Draft',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400',
      description: 'Quote is in draft status',
   },
   {
      value: 'sent',
      label: 'Sent',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
      description: 'Quote has been sent to customer for signing',
   },
   {
      value: 'accepted',
      label: 'Accepted',
      color: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400',
      description: 'Quote has been accepted by customer',
   },
   {
      value: 'rejected',
      label: 'Rejected',
      color: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400',
      description: 'Quote has been rejected by customer',
   },
]

export const QUOTE_SORT_OPTIONS: {
   value: string
   label: string
}[] = [
   { value: 'createdAt', label: 'Date Created' },
   { value: 'updatedAt', label: 'Last Updated' },
   { value: 'validUntil', label: 'Valid Until' },
   { value: 'code', label: 'Quote Code' },
   { value: 'status', label: 'Status' },
   { value: 'totalAmount', label: 'Total Amount' },
   { value: 'price', label: 'Price' },
]

// Helper functions for quote status and display
export const getQuoteStatusConfig = (status: QuoteStatus) => {
   return (
      QUOTE_STATUS_OPTIONS.find((s) => s.value === status) || {
         value: status,
         label: status.charAt(0).toUpperCase() + status.slice(1),
         color: 'bg-gray-100 text-gray-800',
         description: 'Unknown status',
      }
   )
}

export const getQuoteStatusColor = (status: QuoteStatus) => {
   const config = getQuoteStatusConfig(status)
   return config.color
}

export const formatQuoteAmount = (amount: number) => {
   return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
   }).format(amount)
}

export const isQuoteExpired = (validUntil: string) => {
   return new Date(validUntil) < new Date()
}

export const getQuoteExpiryStatus = (validUntil: string) => {
   const expiryDate = new Date(validUntil)
   const now = new Date()
   const diffDays = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
   )

   if (diffDays < 0) {
      return { status: 'expired', message: 'Expired', color: 'text-red-600' }
   } else if (diffDays <= 3) {
      return {
         status: 'expiring',
         message: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
         color: 'text-orange-600',
      }
   } else {
      return {
         status: 'valid',
         message: `Expires in ${diffDays} days`,
         color: 'text-green-600',
      }
   }
}
