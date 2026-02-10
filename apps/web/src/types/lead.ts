export type LeadType = 'individual' | 'business'

export type LeadStatus =
   | 'open'
   | 'closed'
   | 'inProgress'
   | 'new'
   | 'qualified'
   | 'sendQuote'
   | 'closedWon'
   | 'closedLost'

export type LeadPriority = 'low' | 'medium' | 'high'

export type LeadSource =
   | 'Website'
   | 'Social Media'
   | 'Email Campaign'
   | 'Cold Call'
   | 'Referral'
   | 'Trade Show'
   | 'Advertisement'
   | 'Other'

export interface Lead {
   _id: string
   name?: string
   email?: string
   phone: string
   pinCode?: string
   address?: string
   type: LeadType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: LeadSource
   priority?: LeadPriority
   status: LeadStatus
   notes?: string
   description?: string
   createdAt: string
   updatedAt: string
   nextContactInfo?: {
      date?: string
      time?: string
      phone?: string
      email?: string
      source?: string
   }
}

export interface CreateLeadRequest {
   name?: string
   email?: string
   phone: string
   pinCode?: string
   address?: string
   type: LeadType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: LeadSource
   priority?: LeadPriority
   status: LeadStatus
   notes?: string
   description?: string
   nextContactInfo?: {
      date?: string
      time?: string
      phone?: string
      email?: string
      source?: string
   }
}

export interface UpdateLeadRequest {
   name?: string
   email?: string
   phone?: string
   pinCode?: string
   address?: string
   type?: LeadType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: LeadSource
   priority?: LeadPriority
   status?: LeadStatus
   notes?: string
   description?: string
   nextContactInfo?: {
      date?: string
      time?: string
      phone?: string
      email?: string
      source?: string
   }
}

export interface LeadFilters {
   page?: number
   limit?: number
   status?: LeadStatus
   type?: LeadType
   priority?: LeadPriority
   leadSource?: LeadSource
   businessName?: string
   company?: string
   assignedTo?: string
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

export interface LeadListResponse {
   status: number
   message: string
   data: Lead[]
   meta: {
      results: number
      limit: number
      currentPage: number
      totalPages: number
      totalCount: number
   }
}

export interface LeadResponse {
   status: number
   message: string
   data: Lead
}

export interface ValidationError {
   row: number
   field: string
   value: any
   message: string
   errors: string[] // For backward compatibility
}

export interface BulkValidationResponse {
   status: string
   message: string
   data: {
      validRecords: number
      invalidRecords: number
      totalRecords: number
      errors: ValidationError[]
      validLeads: BulkLeadData[]
      summary: {
         validationErrors: number
         duplicateErrors: number
         readyForImport: number
         totalProcessed: number
      }
   }
}

export interface BulkImportResponse {
   status: string
   message: string
   data: {
      totalLeads: number
      validLeads: number
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
      createdLeads: Lead[]
      summary: {
         processed: number
         valid: number
         created: number
         failed: number
      }
   }
}

export interface BulkLeadData {
   name?: string
   email?: string
   phone: string
   pinCode?: string
   address?: string
   type: LeadType
   businessName?: string
   company?: string
   jobTitle?: string
   leadSource?: LeadSource
   priority?: LeadPriority
   status: LeadStatus
   notes?: string
   description?: string
}

// Constants for dropdown options
export const LEAD_STATUSES: {
   value: LeadStatus
   label: string
   color: string
}[] = [
   { value: 'new', label: 'New', color: 'bg-blue-400 text-blue-900' },
   { value: 'open', label: 'Open', color: 'bg-green-400 text-green-900' },
   {
      value: 'inProgress',
      label: 'In Progress',
      color: 'bg-yellow-400 text-yellow-900',
   },
   {
      value: 'qualified',
      label: 'Qualified',
      color: 'bg-purple-400 text-purple-900',
   },
   {
      value: 'sendQuote',
      label: 'Send Quote',
      color: 'bg-orange-400 text-orange-900',
   },
   {
      value: 'closedWon',
      label: 'Closed Won',
      color: 'bg-green-400 text-green-900',
   },
   {
      value: 'closedLost',
      label: 'Closed Lost',
      color: 'bg-red-400 text-red-900',
   },
   { value: 'closed', label: 'Closed', color: 'bg-gray-400 text-gray-900' },
]

export const LEAD_TYPES: { value: LeadType; label: string }[] = [
   { value: 'individual', label: 'Individual' },
   { value: 'business', label: 'Business' },
]

export const LEAD_PRIORITIES: {
   value: LeadPriority
   label: string
   color: string
}[] = [
   { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
   { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
   { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
]

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
   { value: 'Website', label: 'Website' },
   { value: 'Social Media', label: 'Social Media' },
   { value: 'Email Campaign', label: 'Email Campaign' },
   { value: 'Cold Call', label: 'Cold Call' },
   { value: 'Referral', label: 'Referral' },
   { value: 'Trade Show', label: 'Trade Show' },
   { value: 'Advertisement', label: 'Advertisement' },
   { value: 'Other', label: 'Other' },
]

// Lead statistics response type
export interface LeadStatsData {
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
   summary: {
      total: number
      active: number
      qualified: number
      closedWon: number
      conversionRate: number
   }
}

export interface LeadStatsResponse {
   status: string
   message: string
   data: LeadStatsData
}
