import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import toast from 'react-hot-toast'
import serviceManagementApi from '../services/apis/serviceManagement'
import type {
   Category,
   Service,
   SubService,
   ServiceUnit,
   CategoryFormData,
   ServiceFormData,
   SubServiceFormData,
   ServiceUnitFormData,
   QueryParams,
   PaginatedResponse,
   ServiceManagementStore,
} from '@/types/serviceManagement'

const initialState = {
   // Categories
   categories: [],
   categoriesLoading: false,
   categoriesError: null,
   categoriesMeta: null,

   // Units
   units: [],
   unitsLoading: false,
   unitsError: null,
   unitsMeta: null,

   // Services
   services: [],
   servicesLoading: false,
   servicesError: null,
   servicesMeta: null,

   // Sub-services
   subServices: [],
   subServicesLoading: false,
   subServicesError: null,
   subServicesMeta: null,

   // UI state
   selectedCategory: null,
   selectedUnit: null,
   selectedService: null,
   selectedSubService: null,
   isCreateModalOpen: false,
   isEditModalOpen: false,
   isDeleteModalOpen: false,
   activeTab: 'categories' as const,

   // Query parameters
   categoryQuery: { page: 1, limit: 10 },
   unitQuery: { page: 1, limit: 10 },
   serviceQuery: { page: 1, limit: 10 },
   subServiceQuery: { page: 1, limit: 10 },
}

export const useServiceManagementStore = create<ServiceManagementStore>()(
   devtools(
      immer((set, get) => ({
         ...initialState,

         // Categories Actions
         fetchCategories: async (query?: QueryParams) => {
            set((state) => {
               state.categoriesLoading = true
               state.categoriesError = null
               if (query) {
                  state.categoryQuery = { ...state.categoryQuery, ...query }
               }
            })

            try {
               const queryString = buildQueryString(get().categoryQuery)
               const response =
                  await serviceManagementApi.category.getAll(queryString)

               set((state) => {
                  if (response.data) {
                     state.categories = response.data
                     state.categoriesMeta = response.meta || null
                  } else {
                     // Handle non-paginated response
                     state.categories = Array.isArray(response)
                        ? response
                        : [response]
                     state.categoriesMeta = null
                  }
                  state.categoriesLoading = false
               })
            } catch (error: any) {
               set((state) => {
                  state.categoriesError =
                     error.message || 'Failed to fetch categories'
                  state.categoriesLoading = false
               })
               toast.error('Failed to fetch categories')
            }
         },

         createCategory: async (data: CategoryFormData) => {
            try {
               const newCategory =
                  await serviceManagementApi.category.create(data)

               set((state) => {
                  state.categories.unshift(newCategory)
                  state.isCreateModalOpen = false
               })

               toast.success('Category created successfully')
               return newCategory
            } catch (error: any) {
               toast.error(error.message || 'Failed to create category')
               throw error
            }
         },

         updateCategory: async (
            id: string,
            data: Partial<CategoryFormData>
         ) => {
            try {
               const updatedCategory =
                  await serviceManagementApi.category.updateOne(id, data)

               set((state) => {
                  const index = state.categories.findIndex(
                     (cat) => cat._id === id
                  )
                  if (index !== -1) {
                     state.categories[index] = updatedCategory
                  }
                  state.selectedCategory = updatedCategory
                  state.isEditModalOpen = false
               })

               toast.success('Category updated successfully')
               return updatedCategory
            } catch (error: any) {
               toast.error(error.message || 'Failed to update category')
               throw error
            }
         },

         deleteCategory: async (id: string) => {
            try {
               await serviceManagementApi.category.deleteOne(id)

               set((state) => {
                  state.categories = state.categories.filter(
                     (cat) => cat._id !== id
                  )
                  state.selectedCategory = null
                  state.isDeleteModalOpen = false
               })

               toast.success('Category deleted successfully')
            } catch (error: any) {
               // Don't show error toast here as it's handled in the component
               // for better error message customization
               throw error
            }
         },

         setCategoryQuery: (query: Partial<QueryParams>) => {
            set((state) => {
               state.categoryQuery = { ...state.categoryQuery, ...query }
            })
         },

         // Units Actions
         fetchUnits: async (query?: QueryParams) => {
            set((state) => {
               state.unitsLoading = true
               state.unitsError = null
               if (query) {
                  state.unitQuery = { ...state.unitQuery, ...query }
               }
            })

            try {
               const queryString = buildQueryString(get().unitQuery)
               const response =
                  await serviceManagementApi.unit.getAll(queryString)

               set((state) => {
                  if (response.data) {
                     state.units = response.data
                     state.unitsMeta = response.meta || null
                  } else {
                     // Handle non-paginated response
                     state.units = Array.isArray(response)
                        ? response
                        : [response]
                     state.unitsMeta = null
                  }
                  state.unitsLoading = false
               })
            } catch (error: any) {
               set((state) => {
                  state.unitsError = error.message || 'Failed to fetch units'
                  state.unitsLoading = false
               })
               toast.error('Failed to fetch units')
            }
         },

         createUnit: async (data: ServiceUnitFormData) => {
            try {
               const newUnit = await serviceManagementApi.unit.create(data)

               set((state) => {
                  state.units.unshift(newUnit)
                  // Don't close modal here - let the calling component handle modal state
               })

               toast.success('Unit created successfully')
               return newUnit
            } catch (error: any) {
               toast.error(error.message || 'Failed to create unit')
               throw error
            }
         },

         updateUnit: async (id: string, data: Partial<ServiceUnitFormData>) => {
            try {
               const updatedUnit = await serviceManagementApi.unit.updateOne(
                  id,
                  data
               )

               set((state) => {
                  const index = state.units.findIndex((unit) => unit._id === id)
                  if (index !== -1) {
                     state.units[index] = updatedUnit
                  }
                  state.selectedUnit = updatedUnit
                  state.isEditModalOpen = false
               })

               toast.success('Unit updated successfully')
               return updatedUnit
            } catch (error: any) {
               toast.error(error.message || 'Failed to update unit')
               throw error
            }
         },

         deleteUnit: async (id: string) => {
            try {
               await serviceManagementApi.unit.deleteOne(id)

               set((state) => {
                  state.units = state.units.filter((unit) => unit._id !== id)
                  state.selectedUnit = null
                  state.isDeleteModalOpen = false
               })

               toast.success('Unit deleted successfully')
            } catch (error: any) {
               // Don't show error toast here as it's handled in the component
               // for better error message customization
               throw error
            }
         },

         setUnitQuery: (query: Partial<QueryParams>) => {
            set((state) => {
               state.unitQuery = { ...state.unitQuery, ...query }
            })
         },

         // Services Actions
         fetchServices: async (query?: QueryParams) => {
            set((state) => {
               state.servicesLoading = true
               state.servicesError = null
               if (query) {
                  state.serviceQuery = { ...state.serviceQuery, ...query }
               }
            })

            try {
               const queryString = buildQueryString(get().serviceQuery)
               const response =
                  await serviceManagementApi.service.getAll(queryString)

               set((state) => {
                  if (response.data) {
                     state.services = response.data
                     state.servicesMeta = response.meta || null
                  } else {
                     // Handle non-paginated response
                     state.services = Array.isArray(response)
                        ? response
                        : [response]
                     state.servicesMeta = null
                  }
                  state.servicesLoading = false
               })
            } catch (error: any) {
               set((state) => {
                  state.servicesError =
                     error.message || 'Failed to fetch services'
                  state.servicesLoading = false
               })
               toast.error('Failed to fetch services')
            }
         },

         createService: async (data: ServiceFormData) => {
            try {
               const newService =
                  await serviceManagementApi.service.create(data)

               set((state) => {
                  state.services.unshift(newService)
                  state.isCreateModalOpen = false
               })

               toast.success('Service created successfully')
               return newService
            } catch (error: any) {
               toast.error(error.message || 'Failed to create service')
               throw error
            }
         },

         updateService: async (id: string, data: Partial<ServiceFormData>) => {
            try {
               const updatedService =
                  await serviceManagementApi.service.updateOne(id, data)

               set((state) => {
                  const index = state.services.findIndex(
                     (service) => service._id === id
                  )
                  if (index !== -1) {
                     state.services[index] = updatedService
                  }
                  state.selectedService = updatedService
                  state.isEditModalOpen = false
               })

               toast.success('Service updated successfully')
               return updatedService
            } catch (error: any) {
               toast.error(error.message || 'Failed to update service')
               throw error
            }
         },

         deleteService: async (id: string) => {
            try {
               await serviceManagementApi.service.deleteOne(id)

               set((state) => {
                  state.services = state.services.filter(
                     (service) => service._id !== id
                  )
                  // Also remove any sub-services that belonged to this service
                  state.subServices = state.subServices.filter((subService) =>
                     typeof subService.service === 'string'
                        ? subService.service !== id
                        : subService.service._id !== id
                  )
                  state.selectedService = null
                  state.isDeleteModalOpen = false
               })

               // Success message is handled in the component
            } catch (error: any) {
               // Don't show error toast here as it's handled in the component
               throw error
            }
         },

         setServiceQuery: (query: Partial<QueryParams>) => {
            set((state) => {
               state.serviceQuery = { ...state.serviceQuery, ...query }
            })
         },

         // Sub-services Actions
         fetchSubServices: async (query?: QueryParams) => {
            set((state) => {
               state.subServicesLoading = true
               state.subServicesError = null
               if (query) {
                  state.subServiceQuery = { ...state.subServiceQuery, ...query }
               }
            })

            try {
               const queryString = buildQueryString(get().subServiceQuery)
               const response =
                  await serviceManagementApi.subService.getAll(queryString)

               set((state) => {
                  if (response.data) {
                     state.subServices = response.data
                     state.subServicesMeta = response.meta || null
                  } else {
                     // Handle non-paginated response
                     state.subServices = Array.isArray(response)
                        ? response
                        : [response]
                     state.subServicesMeta = null
                  }
                  state.subServicesLoading = false
               })
            } catch (error: any) {
               set((state) => {
                  state.subServicesError =
                     error.message || 'Failed to fetch sub-services'
                  state.subServicesLoading = false
               })
               toast.error('Failed to fetch sub-services')
            }
         },

         createSubService: async (data: SubServiceFormData) => {
            try {
               const newSubService =
                  await serviceManagementApi.subService.create(data)

               set((state) => {
                  state.subServices.unshift(newSubService)
                  state.isCreateModalOpen = false
               })

               toast.success('Sub-service created successfully')
               return newSubService
            } catch (error: any) {
               toast.error(error.message || 'Failed to create sub-service')
               throw error
            }
         },

         updateSubService: async (
            id: string,
            data: Partial<SubServiceFormData>
         ) => {
            try {
               const updatedSubService =
                  await serviceManagementApi.subService.updateOne(id, data)

               set((state) => {
                  const index = state.subServices.findIndex(
                     (subService) => subService._id === id
                  )
                  if (index !== -1) {
                     state.subServices[index] = updatedSubService
                  }
                  state.selectedSubService = updatedSubService
                  state.isEditModalOpen = false
               })

               toast.success('Sub-service updated successfully')
               return updatedSubService
            } catch (error: any) {
               toast.error(error.message || 'Failed to update sub-service')
               throw error
            }
         },

         deleteSubService: async (id: string) => {
            try {
               await serviceManagementApi.subService.deleteOne(id)

               set((state) => {
                  state.subServices = state.subServices.filter(
                     (subService) => subService._id !== id
                  )
                  state.selectedSubService = null
                  state.isDeleteModalOpen = false
               })

               toast.success('Sub-service deleted successfully')
            } catch (error: any) {
               toast.error(error.message || 'Failed to delete sub-service')
               throw error
            }
         },

         setSubServiceQuery: (query: Partial<QueryParams>) => {
            set((state) => {
               state.subServiceQuery = { ...state.subServiceQuery, ...query }
            })
         },

         // UI Actions
         setSelectedCategory: (category: Category | null) => {
            set((state) => {
               state.selectedCategory = category
            })
         },

         setSelectedUnit: (unit: ServiceUnit | null) => {
            set((state) => {
               state.selectedUnit = unit
            })
         },

         setSelectedService: (service: Service | null) => {
            set((state) => {
               state.selectedService = service
            })
         },

         setSelectedSubService: (subService: SubService | null) => {
            set((state) => {
               state.selectedSubService = subService
            })
         },

         setCreateModalOpen: (open: boolean) => {
            set((state) => {
               state.isCreateModalOpen = open
            })
         },

         setEditModalOpen: (open: boolean) => {
            set((state) => {
               state.isEditModalOpen = open
            })
         },

         setDeleteModalOpen: (open: boolean) => {
            set((state) => {
               state.isDeleteModalOpen = open
            })
         },

         setActiveTab: (
            tab: 'categories' | 'units' | 'services' | 'sub-services'
         ) => {
            set((state) => {
               state.activeTab = tab
            })
         },

         // Utility Actions
         clearErrors: () => {
            set((state) => {
               state.categoriesError = null
               state.unitsError = null
               state.servicesError = null
               state.subServicesError = null
            })
         },

         resetState: () => {
            set((state) => {
               Object.assign(state, initialState)
            })
         },
      })),
      {
         name: 'service-management-store',
      }
   )
)

// Utility function to build query string
function buildQueryString(params: QueryParams): string {
   const searchParams = new URLSearchParams()

   Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
         searchParams.append(key, String(value))
      }
   })

   const queryString = searchParams.toString()
   return queryString ? `?${queryString}` : ''
}

// Utility functions for validation
export const validateCategoryForm = (data: CategoryFormData) => {
   const errors: Record<string, string[]> = {}

   if (!data.name?.trim()) {
      errors.name = ['Category name is required']
   } else if (data.name.length < 2) {
      errors.name = ['Category name must be at least 2 characters']
   } else if (data.name.length > 100) {
      errors.name = ['Category name must not exceed 100 characters']
   }

   if (data.description && data.description.length > 500) {
      errors.description = ['Description must not exceed 500 characters']
   }

   return {
      isValid: Object.keys(errors).length === 0,
      errors,
   }
}

export const validateServiceForm = (data: ServiceFormData) => {
   const errors: Record<string, string[]> = {}

   if (!data.name?.trim()) {
      errors.name = ['Service name is required']
   } else if (data.name.length < 2) {
      errors.name = ['Service name must be at least 2 characters']
   } else if (data.name.length > 100) {
      errors.name = ['Service name must not exceed 100 characters']
   }

   if (!data.category?.trim()) {
      errors.category = ['Category is required']
   }

   if (data.description && data.description.length > 500) {
      errors.description = ['Description must not exceed 500 characters']
   }

   return {
      isValid: Object.keys(errors).length === 0,
      errors,
   }
}

export const validateUnitForm = (data: ServiceUnitFormData) => {
   const errors: Record<string, string[]> = {}

   if (!data.name?.trim()) {
      errors.name = ['Unit name is required']
   } else if (data.name.length < 1) {
      errors.name = ['Unit name must be at least 1 character']
   } else if (data.name.length > 50) {
      errors.name = ['Unit name must not exceed 50 characters']
   }

   if (data.description && data.description.length > 200) {
      errors.description = ['Description must not exceed 200 characters']
   }

   return {
      isValid: Object.keys(errors).length === 0,
      errors,
   }
}

export const validateSubServiceForm = (data: SubServiceFormData) => {
   const errors: Record<string, string[]> = {}

   if (!data.name?.trim()) {
      errors.name = ['Sub-service name is required']
   } else if (data.name.length < 2) {
      errors.name = ['Sub-service name must be at least 2 characters']
   } else if (data.name.length > 100) {
      errors.name = ['Sub-service name must not exceed 100 characters']
   }

   if (!data.service?.trim()) {
      errors.service = ['Service is required']
   }

   if (!data.category?.trim()) {
      errors.category = ['Category is required']
   }

   if (data.price === undefined || data.price === null) {
      errors.price = ['Price is required']
   } else if (data.price < 0) {
      errors.price = ['Price must be a positive number']
   } else if (data.price > 1000000) {
      errors.price = ['Price must not exceed 1,000,000']
   }

   if (!data.unit?.trim()) {
      errors.unit = ['Unit is required']
   }

   if (
      data.markUp !== undefined &&
      data.markUp !== null &&
      (data.markUp < 0 || data.markUp > 100)
   ) {
      errors.markUp = ['Markup must be between 0 and 100 percent']
   }

   if (data.description && data.description.length > 500) {
      errors.description = ['Description must not exceed 500 characters']
   }

   return {
      isValid: Object.keys(errors).length === 0,
      errors,
   }
}

// Utility functions for formatting
export const formatPrice = (price: number): string => {
   return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
   }).format(price)
}

export const formatDuration = (duration?: string): string => {
   if (!duration) return 'Not specified'

   // Parse duration string like "1y2m3d"
   const match = duration.match(/^(?:(\d+)y)?(?:(\d+)m)?(?:(\d+)d)?$/)
   if (!match) return duration

   const [, years, months, days] = match
   const parts = []

   if (years && parseInt(years) > 0) {
      parts.push(`${years} year${parseInt(years) > 1 ? 's' : ''}`)
   }
   if (months && parseInt(months) > 0) {
      parts.push(`${months} month${parseInt(months) > 1 ? 's' : ''}`)
   }
   if (days && parseInt(days) > 0) {
      parts.push(`${days} day${parseInt(days) > 1 ? 's' : ''}`)
   }

   return parts.length > 0 ? parts.join(', ') : 'Not specified'
}

// Duration validation and parsing utilities
export const isValidDurationFormat = (duration: string): boolean => {
   if (!duration || duration.trim() === '') return true // Optional field

   // Check if duration matches pattern like "1y2m3d", "1y", "2m", "3d", "1y3d", etc.
   const pattern = /^(?:(\d+)y)?(?:(\d+)m)?(?:(\d+)d)?$/
   const match = duration.match(pattern)

   if (!match) return false

   const [, years, months, days] = match

   // At least one component should be present
   if (!years && !months && !days) return false

   // Validate ranges
   if (years && (parseInt(years) < 0 || parseInt(years) > 99)) return false
   if (months && (parseInt(months) < 0 || parseInt(months) > 11)) return false
   if (days && (parseInt(days) < 0 || parseInt(days) > 30)) return false

   return true
}

export const parseDurationString = (
   duration: string
): { years: number; months: number; days: number } => {
   const match = duration.match(/^(?:(\d+)y)?(?:(\d+)m)?(?:(\d+)d)?$/)
   if (!match) return { years: 0, months: 0, days: 0 }

   const [, years, months, days] = match
   return {
      years: years ? parseInt(years) : 0,
      months: months ? parseInt(months) : 0,
      days: days ? parseInt(days) : 0,
   }
}

export const formatDurationString = (
   years: number,
   months: number,
   days: number
): string => {
   const parts = []
   if (years > 0) parts.push(`${years}y`)
   if (months > 0) parts.push(`${months}m`)
   if (days > 0) parts.push(`${days}d`)
   return parts.join('')
}

export default useServiceManagementStore
