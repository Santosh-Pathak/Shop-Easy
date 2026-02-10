// Service Management Types
// Based on the backend models and Swagger documentation

export interface Category {
   _id: string
   name: string
   description?: string
   createdAt: string
   updatedAt: string
}

export interface ServiceUnit {
   _id: string
   name: string
   description?: string
   createdAt: string
   updatedAt: string
}

export interface Service {
   _id: string
   name: string
   description?: string
   category: string | Category // Can be populated or just ID
   createdAt: string
   updatedAt: string
}

export interface SubService {
   _id: string
   name: string
   description?: string
   service: string | Service // Can be populated or just ID
   category: string | Category // Can be populated or just ID
   price: number
   unit: string | ServiceUnit // Can be populated or just ID
   markUp?: number
   createdAt: string
   updatedAt: string
}

// Form data types (for creation/update)
export interface CategoryFormData {
   name: string
   description?: string
}

export interface ServiceUnitFormData {
   name: string
   description?: string
}

export interface ServiceFormData {
   name: string
   description?: string
   category: string
}

export interface SubServiceFormData {
   name: string
   description?: string
   service: string
   category: string
   price: number
   unit: string
   markUp?: number
}

// Duration picker types
export interface DurationComponents {
   years: number
   months: number
   days: number
}

export interface DurationPickerProps {
   value?: string
   onChange: (duration: string) => void
   label?: string
   placeholder?: string
   className?: string
   disabled?: boolean
   error?: string
}

// API response types (with pagination)
export interface PaginatedResponse<T> {
   data: T[]
   meta: {
      results: number
      limit: number
      currentPage: number
      totalPages: number
      totalCount: number
   }
}

// Query parameters for API calls
export interface QueryParams {
   page?: number
   limit?: number
   sort?: string
   fields?: string
   search?: string
   searchFields?: string
   // Specific filters for each entity
   category?: string // Filter by category ID
   service?: string // Filter by service ID
   'price[gte]'?: number // Minimum price
   'price[lte]'?: number // Maximum price
}

// Table configuration types
export interface TableColumn<T = any> {
   key: keyof T | string
   label: string
   sortable?: boolean
   searchable?: boolean
   filterable?: boolean
   type?:
      | 'text'
      | 'number'
      | 'date'
      | 'currency'
      | 'duration'
      | 'badge'
      | 'actions'
   width?: string
   minWidth?: string
   maxWidth?: string
   align?: 'left' | 'center' | 'right'
   render?: (value: any, item: T) => React.ReactNode
   className?: string
}

export interface TableConfig<T = any> {
   columns: TableColumn<T>[]
   defaultSort?: string
   defaultLimit?: number
   searchFields?: string[]
   enableSearch?: boolean
   enableFilters?: boolean
   enablePagination?: boolean
   enableExport?: boolean
   rowActions?: Array<{
      key: string
      label: string
      icon?: React.ComponentType<{ className?: string }>
      variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
      permission?: string
      condition?: (item: T) => boolean
      onClick: (item: T) => void
   }>
}

// Service management state types
export interface ServiceManagementState {
   // Categories
   categories: Category[]
   categoriesLoading: boolean
   categoriesError: string | null
   categoriesMeta: PaginatedResponse<Category>['meta'] | null

   // Units
   units: ServiceUnit[]
   unitsLoading: boolean
   unitsError: string | null
   unitsMeta: PaginatedResponse<ServiceUnit>['meta'] | null

   // Services
   services: Service[]
   servicesLoading: boolean
   servicesError: string | null
   servicesMeta: PaginatedResponse<Service>['meta'] | null

   // Sub-services
   subServices: SubService[]
   subServicesLoading: boolean
   subServicesError: string | null
   subServicesMeta: PaginatedResponse<SubService>['meta'] | null

   // UI state
   selectedCategory: Category | null
   selectedUnit: ServiceUnit | null
   selectedService: Service | null
   selectedSubService: SubService | null
   isCreateModalOpen: boolean
   isEditModalOpen: boolean
   isDeleteModalOpen: boolean
   activeTab: 'categories' | 'units' | 'services' | 'sub-services'

   // Query parameters for each entity
   categoryQuery: QueryParams
   unitQuery: QueryParams
   serviceQuery: QueryParams
   subServiceQuery: QueryParams
}

// Action types for the store
export interface ServiceManagementActions {
   // Categories
   fetchCategories: (query?: QueryParams) => Promise<void>
   createCategory: (data: CategoryFormData) => Promise<Category>
   updateCategory: (
      id: string,
      data: Partial<CategoryFormData>
   ) => Promise<Category>
   deleteCategory: (id: string) => Promise<void>
   setCategoryQuery: (query: Partial<QueryParams>) => void

   // Units
   fetchUnits: (query?: QueryParams) => Promise<void>
   createUnit: (data: ServiceUnitFormData) => Promise<ServiceUnit>
   updateUnit: (
      id: string,
      data: Partial<ServiceUnitFormData>
   ) => Promise<ServiceUnit>
   deleteUnit: (id: string) => Promise<void>
   setUnitQuery: (query: Partial<QueryParams>) => void

   // Services
   fetchServices: (query?: QueryParams) => Promise<void>
   createService: (data: ServiceFormData) => Promise<Service>
   updateService: (
      id: string,
      data: Partial<ServiceFormData>
   ) => Promise<Service>
   deleteService: (id: string) => Promise<void>
   setServiceQuery: (query: Partial<QueryParams>) => void

   // Sub-services
   fetchSubServices: (query?: QueryParams) => Promise<void>
   createSubService: (data: SubServiceFormData) => Promise<SubService>
   updateSubService: (
      id: string,
      data: Partial<SubServiceFormData>
   ) => Promise<SubService>
   deleteSubService: (id: string) => Promise<void>
   setSubServiceQuery: (query: Partial<QueryParams>) => void

   // UI actions
   setSelectedCategory: (category: Category | null) => void
   setSelectedUnit: (unit: ServiceUnit | null) => void
   setSelectedService: (service: Service | null) => void
   setSelectedSubService: (subService: SubService | null) => void
   setCreateModalOpen: (open: boolean) => void
   setEditModalOpen: (open: boolean) => void
   setDeleteModalOpen: (open: boolean) => void
   setActiveTab: (
      tab: 'categories' | 'units' | 'services' | 'sub-services'
   ) => void

   // Utility actions
   clearErrors: () => void
   resetState: () => void
}

// Complete store type
export type ServiceManagementStore = ServiceManagementState &
   ServiceManagementActions

// Form validation types
export interface ValidationErrors {
   [key: string]: string[]
}

export interface FormValidationResult {
   isValid: boolean
   errors: ValidationErrors
}

// Export utility functions type
export interface ServiceManagementUtils {
   formatPrice: (price: number) => string
   formatDuration: (minutes: number) => string
   buildQueryString: (params: QueryParams) => string
   validateCategoryForm: (data: CategoryFormData) => FormValidationResult
   validateUnitForm: (data: ServiceUnitFormData) => FormValidationResult
   validateServiceForm: (data: ServiceFormData) => FormValidationResult
   validateSubServiceForm: (data: SubServiceFormData) => FormValidationResult
   exportToCSV: <T>(
      data: T[],
      filename: string,
      columns: TableColumn<T>[]
   ) => void
}

// Theme-aware component props
export interface ThemedComponentProps {
   className?: string
   variant?: 'default' | 'outline' | 'ghost' | 'destructive'
   size?: 'sm' | 'default' | 'lg'
}

// Mobile responsive types
export interface ResponsiveConfig {
   mobile: {
      showColumns: string[]
      compactMode: boolean
   }
   tablet: {
      showColumns: string[]
      compactMode: boolean
   }
   desktop: {
      showColumns: string[]
      compactMode: boolean
   }
}

export type ViewportSize = 'mobile' | 'tablet' | 'desktop'
