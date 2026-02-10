'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { UserAPI } from '@/services/apis/user.api'
import { User, USER_ROLES, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import { User as UserIcon, Mail, Phone, MapPin, Plus, Edit, Loader2, Check, ArrowLeft } from 'lucide-react'
import useAddressAutocomplete from '@/hooks/useAddressAutocomplete'

interface UserCreateEditModalProps {
   isOpen: boolean
   onClose: () => void
   onSuccess?: (user: User) => void
   mode: 'create' | 'edit'
   user?: User
   asPage?: boolean
}

interface FormData {
   name: string
   email: string
   phone: string
   address: string
   postalCode: string
   role: string
   active: boolean
   isEmailVerified: boolean
   description: string
}

export default function UserCreateEditModal({
   isOpen,
   onClose,
   onSuccess,
   mode,
   user,
   asPage = false
}: UserCreateEditModalProps) {
   const [formData, setFormData] = useState<FormData>({
      name: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      role: 'customer',
      active: true,
      isEmailVerified: false,
      description: ''
   })
   const [originalFormData, setOriginalFormData] = useState<FormData | null>(null)
   const [loading, setLoading] = useState(false)
   
   // Address autocomplete state
   const [addressSuggestions, setAddressSuggestions] = useState<Array<{ addressLine1: string }>>([])
   const [showSuggestions, setShowSuggestions] = useState(false)

   // Address autocomplete hook
   const { isLoading: addressLoading, error: addressError, fetchAddressData } = useAddressAutocomplete(
      (addresses) => {
         setAddressSuggestions(addresses)
         setShowSuggestions(addresses.length > 0)
      }
   )

   useEffect(() => {
      if (mode === 'edit' && user) {
         const userData = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            postalCode: user.postalCode || '',
            role: user.role || 'customer',
            active: user.active ?? true,
            isEmailVerified: user.isEmailVerified ?? false,
            description: '' // Users don't have description, only for create requests
         }
         setFormData(userData)
         setOriginalFormData(userData) // Store original data for comparison
      } else {
         const emptyData = {
            name: '',
            email: '',
            phone: '',
            address: '',
            postalCode: '',
            role: 'customer',
            active: true,
            isEmailVerified: false,
            description: ''
         }
         setFormData(emptyData)
         setOriginalFormData(null)
      }
   }, [mode, user, isOpen])

   const handleInputChange = (field: keyof FormData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
   }

   // Helper function to get only the changed fields
   const getChangedFields = (): Partial<UpdateUserRequest> => {
      if (!originalFormData) return {}
      
      const changedFields: Partial<UpdateUserRequest> = {}
      
      // Compare each field and only include if changed and valid
      if (formData.name !== originalFormData.name && formData.name.trim() !== '') {
         changedFields.name = formData.name!
      }
      if (formData.email !== originalFormData.email && formData.email.trim() !== '') {
         changedFields.email = formData.email!
      }
      if (formData.phone !== originalFormData.phone) {
         changedFields.phone = formData.phone || undefined
      }
      if (formData.address !== originalFormData.address) {
         changedFields.address = formData.address || undefined
      }
      if (formData.postalCode !== originalFormData.postalCode) {
         changedFields.postalCode = formData.postalCode || undefined
      }
      if (formData.role !== originalFormData.role) {
         // Only include role if it's not empty and is a valid role
         if (formData.role && formData.role.trim() !== '') {
            changedFields.role = formData.role as UserRole
         }
      }
      if (formData.active !== originalFormData.active) {
         changedFields.active = formData.active
      }
      if (formData.isEmailVerified !== originalFormData.isEmailVerified) {
         changedFields.isEmailVerified = formData.isEmailVerified
      }
      
      return changedFields
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)

      try {
         let result: User

         if (mode === 'create') {
            const createData: CreateUserRequest = {
               name: formData.name,
               email: formData.email,
               phone: formData.phone || undefined,
               address: formData.address || undefined,
               postalCode: formData.postalCode || undefined,
               role: formData.role as UserRole,
               description: formData.description || undefined
            }
            const response = await UserAPI.createUser(createData)
            result = response.data
            toast.success('User created successfully')
         } else {
            // Get only the changed fields for update
            const changedFields = getChangedFields()
            
            // Check if there are any changes
            if (Object.keys(changedFields).length === 0) {
               toast('No changes detected', {
                  icon: 'ℹ️',
                  style: {
                     background: '#3b82f6',
                     color: '#fff',
                  },
               })
               setLoading(false)
               return
            }
            
            console.log('Updating user with changed fields:', changedFields)
            const response = await UserAPI.updateUser(user!._id, changedFields)
            result = response.data
            toast.success('User updated successfully')
         }

         // Delay to ensure toast is visible before closing
         setTimeout(() => {
            onSuccess?.(result)
            onClose()
         }, 500)
      } catch (error: any) {
         console.error('Error saving user:', error)
         const errorMessage = error?.response?.data?.message || 
                             error?.message || 
                             'An unexpected error occurred'
         toast.error(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   // Common form content
   const formContent = (
      <form onSubmit={handleSubmit} className="space-y-6">
         {/* Basic Information */}
         <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
            <CardContent className="p-6">
               <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
                     <UserIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="theme-text-primary text-lg font-semibold">
                     Basic Information
                  </h3>
               </div>

               <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                  {/* Name Field */}
                  <div className="space-y-2">
                     <Label htmlFor="name" className="theme-text-primary text-sm font-medium">
                        Full Name *
                     </Label>
                     <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="theme-border theme-bg-secondary theme-text-primary"
                        placeholder="Enter full name"
                        required
                        autoComplete="name"
                     />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                     <Label htmlFor="email" className="theme-text-primary text-sm font-medium">
                        Email Address *
                     </Label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted h-5 w-5" />
                        <Input
                           id="email"
                           type="email"
                           value={formData.email}
                           onChange={(e) => handleInputChange('email', e.target.value)}
                           className="theme-border theme-bg-secondary theme-text-primary pl-10"
                           placeholder="Enter email address"
                           required
                           autoComplete="email"
                        />
                     </div>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                     <Label htmlFor="phone" className="theme-text-primary text-sm font-medium">
                        Phone Number
                     </Label>
                     <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted h-5 w-5" />
                        <Input
                           id="phone"
                           type="tel"
                           value={formData.phone}
                           onChange={(e) => handleInputChange('phone', e.target.value)}
                           className="theme-border theme-bg-secondary theme-text-primary pl-10"
                           placeholder="Enter phone number"
                           autoComplete="tel"
                        />
                     </div>
                  </div>

                  {/* Postal Code Field */}
                  <div className="space-y-2">
                     <Label htmlFor="postalCode" className="theme-text-primary text-sm font-medium">
                        Postal Code
                     </Label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 theme-text-muted h-5 w-5" />
                        <Input
                           id="postalCode"
                           type="text"
                           value={formData.postalCode}
                           onChange={(e) => {
                              handleInputChange('postalCode', e.target.value)
                              // Trigger address lookup
                              fetchAddressData(e.target.value)
                           }}
                           className="theme-border theme-bg-secondary theme-text-primary pl-10"
                           placeholder="Enter postal code"
                           autoComplete="postal-code"
                        />
                        {addressLoading && (
                           <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                           </div>
                        )}
                     </div>
                     {addressError && (
                        <p className="text-sm text-red-600 mt-1">{addressError}</p>
                     )}
                  </div>
               </div>

               {/* Address Field */}
               <div className="mt-6 space-y-2 relative">
                  <Label htmlFor="address" className="theme-text-primary text-sm font-medium">
                     Address
                  </Label>
                  <Textarea
                     id="address"
                     value={formData.address}
                     onChange={(e) => handleInputChange('address', e.target.value)}
                     className="theme-border theme-bg-secondary theme-text-primary resize-none"
                     placeholder="Enter full address"
                     rows={3}
                     autoComplete="address-line1"
                  />
                  
                  {/* Address Suggestions Dropdown */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                     <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                           <button
                              key={index}
                              type="button"
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-sm"
                              onClick={() => {
                                 handleInputChange('address', suggestion.addressLine1)
                                 setShowSuggestions(false)
                              }}
                           >
                              <div className="flex items-center gap-2">
                                 <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                 <span className="truncate">{suggestion.addressLine1}</span>
                              </div>
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </CardContent>
         </Card>

         {/* Account Settings */}
         <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
            <CardContent className="p-6">
               <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/50">
                     <UserIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="theme-text-primary text-lg font-semibold">
                     Account Settings
                  </h3>
               </div>

               <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                  {/* Role Selection */}
                  <div className="space-y-2">
                     <Label htmlFor="role" className="theme-text-primary text-sm font-medium">
                        User Role *
                     </Label>
                     <Select
                        key={`role-${formData.role}`}
                        value={formData.role}
                        defaultValue={formData.role}
                        onValueChange={(value) => handleInputChange('role', value)}
                        required
                     >
                        <SelectTrigger className="theme-border theme-bg-secondary theme-text-primary">
                           <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent className="theme-bg-primary theme-border border shadow-xl">
                           {USER_ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                 <div className="flex items-center gap-2">
                                    <span>{role.label}</span>
                                    <span className="theme-text-muted text-xs">
                                       - {role.description}
                                    </span>
                                 </div>
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  {/* Account Status */}
                  {mode === 'edit' && (
                     <div className="space-y-4">
                        <Label className="theme-text-primary text-sm font-medium">
                           Account Status
                        </Label>
                        <div className="space-y-3">
                           <div className="flex items-center space-x-3">
                              <Checkbox
                                 id="active"
                                 checked={formData.active}
                                 onCheckedChange={(checked) => handleInputChange('active', checked)}
                                 className="theme-border"
                              />
                              <Label
                                 htmlFor="active"
                                 className="theme-text-primary text-sm font-medium cursor-pointer"
                              >
                                 Active Account
                              </Label>
                           </div>
                           <div className="flex items-center space-x-3">
                              <Checkbox
                                 id="isEmailVerified"
                                 checked={formData.isEmailVerified}
                                 onCheckedChange={(checked) => handleInputChange('isEmailVerified', checked)}
                                 className="theme-border"
                              />
                              <Label
                                 htmlFor="isEmailVerified"
                                 className="theme-text-primary text-sm font-medium cursor-pointer"
                              >
                                 Email Verified
                              </Label>
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Description Field */}
               {mode === 'create' && (
                  <div className="mt-6 space-y-2">
                     <Label htmlFor="description" className="theme-text-primary text-sm font-medium">
                        Description
                     </Label>
                     <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="theme-border theme-bg-secondary theme-text-primary resize-none"
                        placeholder="Add any additional notes about this user..."
                        rows={3}
                     />
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Footer Buttons */}
         <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button
               type="button"
               variant="outline"
               onClick={onClose}
               disabled={loading}
               className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary flex-1 border-0 bg-transparent"
            >
               Cancel
            </Button>
            <Button
               type="submit"
               disabled={loading}
               className="flex-1"
            >
               {loading ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
               ) : (
                  <>
                     {mode === 'create' ? (
                        <Check className="mr-2 h-4 w-4" />
                     ) : (
                        <Check className="mr-2 h-4 w-4" />
                     )}
                     {mode === 'create' ? 'Create User' : 'Update User'}
                  </>
               )}
            </Button>
         </div>
      </form>
   )

   // Page view
   if (asPage) {
      // Show loading state while fetching user data for edit
      if (loading && mode === 'edit' && !user) {
         return (
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={onClose} className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back
                  </Button>
                  <div>
                     <h1 className="text-2xl font-bold theme-text-primary">
                        Loading User...
                     </h1>
                  </div>
               </div>
               <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin theme-text-primary" />
               </div>
            </div>
         )
      }

      return (
         <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={onClose} className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back
                  </Button>
                  <div>
                     <h1 className="text-2xl font-bold theme-text-primary">
                        {mode === 'create' ? 'Create New User' : 'Edit User'}
                     </h1>
                     <p className="text-sm theme-text-secondary">
                        {mode === 'create' 
                           ? 'Fill in the details to create a new user'
                           : 'Update user information and settings'
                        }
                     </p>
                  </div>
               </div>
            </div>

            {/* Form Content */}
            {formContent}
         </div>
      )
   }

   // Modal view
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="theme-bg-primary theme-border mx-4 max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl sm:mx-auto">
            <DialogDescription />
            <DialogHeader className="space-y-4 pb-6">
               <div className="flex items-center gap-4">
                  <div className={cn(
                     "flex h-12 w-12 items-center justify-center rounded-xl",
                     mode === 'create' 
                        ? "bg-green-50 dark:bg-green-950/50" 
                        : "bg-blue-50 dark:bg-blue-950/50"
                  )}>
                     {mode === 'create' ? (
                        <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                     ) : (
                        <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                     )}
                  </div>
                  <div>
                     <DialogTitle className="theme-text-primary text-2xl font-bold">
                        {mode === 'create' ? 'Create New User' : 'Edit User'}
                     </DialogTitle>
                     <p className="theme-text-secondary text-base">
                        {mode === 'create' 
                           ? 'Add a new user to the system with their details and role'
                           : 'Update user information and settings'
                        }
                     </p>
                  </div>
               </div>
            </DialogHeader>

            {formContent}
         </DialogContent>
      </Dialog>
   )
}