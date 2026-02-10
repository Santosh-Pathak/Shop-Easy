'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import useAddressAutocomplete from '@/hooks/useAddressAutocomplete'
import { Button } from '@/components/ui/button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog'
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
   Loader2,
   User,
   Building2,
   Phone,
   Tag,
   AlertCircle,
   Save,
   X,
   ArrowLeft,
   Calendar,
} from 'lucide-react'

import {
   Lead,
   CreateLeadRequest,
   UpdateLeadRequest,
   LEAD_STATUSES,
   LEAD_TYPES,
   LEAD_PRIORITIES,
   LEAD_SOURCES,
} from '@/types/lead'
import { LeadAPI } from '@/services/apis/lead.api'
import {
   extractApiErrorMessage,
   showErrorToast,
   showSuccessToast,
} from '@/utils/error'
import { useTheme } from '@/contexts/ThemeContext'

const leadSchema = z
   .object({
      name: z
         .string()
         .min(1, 'Name is required')
         .max(100, 'Name must be less than 100 characters'),
      email: z
         .string()
         .refine(
            (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            'Please enter a valid email address'
         )
         .optional(),
      phone: z
         .string()
         .min(10, 'Phone number must be at least 10 digits')
         .max(15, 'Phone number must be less than 15 digits'),
      pinCode: z
         .string()
         .max(10, 'PIN code must be less than 10 characters')
         .optional(),
      address: z
         .string()
         .max(500, 'Address must be less than 500 characters')
         .optional(),
      type: z.enum(['individual', 'business']),
      businessName: z
         .string()
         .max(100, 'Business name must be less than 100 characters')
         .optional(),
      company: z
         .string()
         .max(100, 'Company name must be less than 100 characters')
         .optional(),
      jobTitle: z
         .string()
         .max(50, 'Job title must be less than 50 characters')
         .optional(),
      leadSource: z
         .enum([
            'Website',
            'Social Media',
            'Email Campaign',
            'Cold Call',
            'Referral',
            'Trade Show',
            'Advertisement',
            'Other',
         ])
         .optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum([
         'open',
         'closed',
         'inProgress',
         'new',
         'qualified',
         'sendQuote',
         'closedWon',
         'closedLost',
      ]),
      notes: z
         .string()
         .max(1000, 'Notes must be less than 1000 characters')
         .optional(),
      description: z
         .string()
         .max(1000, 'Description must be less than 1000 characters')
         .optional(),
      nextContactInfo: z
         .object({
            date: z.string().optional(),
            time: z.string().optional(),
            phone: z
               .string()
               .refine(
                  (val) => !val || /^\+?[\d\s-()]+$/.test(val),
                  'Please enter a valid phone number'
               )
               .optional(),
            email: z
               .string()
               .refine(
                  (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
                  'Please enter a valid email address'
               )
               .optional(),
            source: z.string().max(100, 'Source must be less than 100 characters').optional(),
         })
         .optional(),
   })
   .refine(
      (data) => {
         if (
            data.type === 'business' &&
            (!data.businessName || data.businessName.trim() === '')
         ) {
            return false
         }
         return true
      },
      {
         message: 'Business name is required for business leads',
         path: ['businessName'],
      }
   )

type LeadFormData = z.infer<typeof leadSchema>

interface LeadCreateEditModalProps {
   isOpen: boolean
   onClose: () => void
   lead?: Lead | null
   onSuccess: () => void
   asPage?: boolean
   leadId?: string
}

// Utility functions for date conversion
const formatDateForInput = (isoDate: string | null | undefined): string => {
   if (!isoDate) return ''
   try {
      const date = new Date(isoDate)
      return date.toISOString().split('T')[0] // Convert to yyyy-MM-dd format
   } catch (error) {
      console.error('Error formatting date:', error)
      return ''
   }
}

const formatDateForAPI = (inputDate: string): string => {
   if (!inputDate) return ''
   try {
      const date = new Date(inputDate)
      return date.toISOString() // Convert to ISO format for API
   } catch (error) {
      console.error('Error formatting date for API:', error)
      return ''
   }
}

const LeadCreateEditModal: React.FC<LeadCreateEditModalProps> = ({
   isOpen,
   onClose,
   lead,
   onSuccess,
   asPage = false,
   leadId,
}) => {
   const router = useRouter()
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const [leadData, setLeadData] = useState<Lead | null>(lead || null)

   // Address autocomplete state
   const [addressSuggestions, setAddressSuggestions] = useState<{ addressLine1: string }[]>([])
   const [showSuggestions, setShowSuggestions] = useState(false)

   const isEdit = !!leadData || !!leadId

   // Load lead data if in page mode and leadId is provided
   useEffect(() => {
      const loadLeadForEdit = async () => {
         if (asPage && leadId && !leadData) {
            console.log('Loading lead data for ID:', leadId) // Debug log
            try {
               setLoading(true)
               const response = await LeadAPI.getLeadById(leadId)
               console.log('Lead data fetched:', response) // Debug log
               setLeadData(response)
            } catch (err) {
               console.error('Error loading lead data:', err) // Debug log
               const errorMessage = extractApiErrorMessage(err)
               setError(errorMessage)
               showErrorToast(errorMessage)
            } finally {
               setLoading(false)
            }
         } else {
            console.log(
               'Skipping data load. asPage:',
               asPage,
               'leadId:',
               leadId,
               'leadData:',
               leadData
            ) // Debug log
         }
      }

      loadLeadForEdit()
   }, [asPage, leadId, leadData])

   const form = useForm<LeadFormData>({
      resolver: zodResolver(leadSchema),
      defaultValues: {
         name: '',
         email: '',
         phone: '',
         pinCode: '',
         address: '',
         type: 'individual',
         businessName: '',
         company: '',
         jobTitle: '',
         leadSource: undefined,
         priority: 'medium',
         status: 'new',
         notes: '',
         description: '',
         nextContactInfo: {
            date: '',
            time: '',
            phone: '',
            email: '',
            source: '',
         },
      },
   })

   // Address autocomplete hook
   const { isLoading: addressLoading, error: addressError, fetchAddressData } = useAddressAutocomplete(
      (addresses) => {
         setAddressSuggestions(addresses)
         setShowSuggestions(addresses.length > 0)
      }
   )

   const watchType = form.watch('type')

   // Handle address suggestion selection
   const handleAddressSelect = useCallback((address: { addressLine1: string }) => {
      form.setValue('address', address.addressLine1)
      setShowSuggestions(false)
   }, [form])

   // Reset form when modal opens/closes or lead changes
   useEffect(() => {
      if (isOpen || asPage) {
         if (leadData) {
            console.log('Resetting form with lead data:', leadData) // Debug log
            console.log('leadData.leadSource value:', leadData.leadSource) // Debug log
            form.reset({
               name: leadData.name || '',
               email: leadData.email || '',
               phone: leadData.phone,
               pinCode: leadData.pinCode || '',
               address: leadData.address || '',
               type: leadData.type,
               businessName: leadData.businessName || '',
               company: leadData.company || '',
               jobTitle: leadData.jobTitle || '',
               leadSource: leadData.leadSource,
               priority: leadData.priority || 'medium',
               status: leadData.status,
               notes: leadData.notes || '',
               description: leadData.description || '',
               nextContactInfo: {
                  date: formatDateForInput(leadData.nextContactInfo?.date),
                  time: leadData.nextContactInfo?.time || '',
                  phone: leadData.nextContactInfo?.phone || '',
                  email: leadData.nextContactInfo?.email || '',
                  source: leadData.nextContactInfo?.source || '',
               },
            })
         } else if (!loading) {
            console.log('Resetting form with default values') // Debug log
            form.reset({
               name: '',
               email: '',
               phone: '',
               pinCode: '',
               address: '',
               type: 'individual',
               businessName: '',
               company: '',
               jobTitle: '',
               leadSource: undefined,
               priority: 'medium',
               status: 'new',
               notes: '',
               description: '',
               nextContactInfo: {
                  date: '',
                  time: '',
                  phone: '',
                  email: '',
                  source: '',
               },
            })
         }
      }
   }, [isOpen, asPage, leadData, form, loading])

   const onSubmit = async (data: LeadFormData) => {
      try {
         setLoading(true)
         setError(null)

         // Convert date format for API if date is provided
         const processedData = {
            ...data,
            nextContactInfo: data.nextContactInfo ? {
               ...data.nextContactInfo,
               date: data.nextContactInfo.date ? formatDateForAPI(data.nextContactInfo.date) : '',
            } : undefined,
         }

         if (isEdit && leadData) {
            const updateData: UpdateLeadRequest = { ...processedData }
            await LeadAPI.updateLead(leadData._id, updateData)
            showSuccessToast('Lead updated successfully!')
         } else {
            const createData: CreateLeadRequest = { ...processedData }
            await LeadAPI.createLead(createData)
            showSuccessToast('Lead created successfully!')
         }

         onSuccess()

         // Only handle navigation if not in page mode (let the page handle it)
         if (!asPage) {
            if (onClose) {
               onClose()
            }
         }
      } catch (err) {
         const errorMessage = extractApiErrorMessage(err)
         setError(errorMessage)
         showErrorToast(errorMessage)
      } finally {
         setLoading(false)
      }
   }

   const handleClose = () => {
      if (!loading) {
         if (asPage) {
            // In page mode, let the parent page handle navigation
            onClose()
         } else if (onClose) {
            onClose()
            form.reset()
            setError(null)
         }
      }
   }

   // Render page mode
   if (asPage) {
      // Show loading state while fetching lead data for edit
      if (loading && leadId && !leadData) {
         return (
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleClose}>
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back
                  </Button>
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Loading Lead...
                     </h1>
                  </div>
               </div>
               <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
               </div>
            </div>
         )
      }

      return (
         <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleClose}>
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back
                  </Button>
                  <div>
                     <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {isEdit ? 'Edit Lead' : 'Create New Lead'}
                     </h1>
                     <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isEdit
                           ? 'Update the lead information below'
                           : 'Fill in the details to create a new lead'}
                     </p>
                  </div>
               </div>
            </div>

            {/* Error Alert */}
            {error && (
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}

            {/* Form */}
            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
               >
                  {/* Form content */}
                  <div className="grid gap-6">
                     {/* Personal/Business Information Section */}
                     <Card className="theme-border theme-bg-secondary">
                        <CardHeader className="pb-4">
                           <CardTitle className="theme-text-primary flex items-center gap-2">
                              <User className="h-5 w-5" />
                              {watchType === 'business'
                                 ? 'Business Information'
                                 : 'Personal Information'}
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                 control={form.control}
                                 name="name"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          {watchType === 'business'
                                             ? 'Contact Name'
                                             : 'Full Name'}{' '}
                                          *
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             placeholder={watchType === 'business' ? 'Contact person name' : 'Enter full name'}
                                             className="theme-border focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="type"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Lead Type *
                                       </FormLabel>
                                       <FormControl>
                                          <Select
                                             onValueChange={field.onChange}
                                             value={field.value}
                                          >
                                             <SelectTrigger className="theme-border bg-[var(--bg-primary)]  focus:border-primary-500 focus:ring-primary-500">
                                                <SelectValue placeholder="Select type" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                {LEAD_TYPES.map((type) => (
                                                   <SelectItem
                                                      key={type.value}
                                                      value={type.value}
                                                   >
                                                      <div className="flex items-center gap-2">
                                                         {type.value ===
                                                         'business' ? (
                                                            <Building2 className="h-4 w-4" />
                                                         ) : (
                                                            <User className="h-4 w-4" />
                                                         )}
                                                         {type.label}
                                                      </div>
                                                   </SelectItem>
                                                ))}
                                             </SelectContent>
                                          </Select>
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>

                           {watchType === 'business' && (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                 <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel className="theme-text-primary font-medium">
                                             Business Name *
                                          </FormLabel>
                                          <FormControl>
                                             <Input
                                                placeholder="Enter business name"
                                                className="theme-border focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                                {...field}
                                             />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />

                                 <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel className="theme-text-primary font-medium">
                                             Company
                                          </FormLabel>
                                          <FormControl>
                                             <Input
                                                placeholder="Enter company name"
                                                className="theme-border focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                                {...field}
                                             />
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                              </div>
                           )}

                           {watchType === 'business' && (
                              <FormField
                                 control={form.control}
                                 name="jobTitle"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Job Title
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             placeholder="Enter job title"
                                             className="theme-border focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           )}
                        </CardContent>
                     </Card>

                     {/* Contact Information Section */}
                     <Card className="theme-border theme-bg-secondary">
                        <CardHeader className="pb-4">
                           <CardTitle className="theme-text-primary flex items-center gap-2">
                              <Phone className="h-5 w-5" />
                              Contact Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                 control={form.control}
                                 name="phone"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Phone Number *
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             type="tel"
                                             placeholder="Enter phone number"
                                             className="theme-border focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="email"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Email Address
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             type="email"
                                             placeholder="Enter email address"
                                             className="theme-border focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>

                           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <FormField
                                 control={form.control}
                                 name="pinCode"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          PIN Code
                                       </FormLabel>
                                       <FormControl>
                                          <div className="relative">
                                             <Input
                                                placeholder="Enter PIN code"
                                                className="theme-border focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                                {...field}
                                                onChange={(e) => {
                                                   field.onChange(e)
                                                   if (e.target.value.length >= 3) {
                                                      fetchAddressData(e.target.value)
                                                   } else {
                                                      setShowSuggestions(false)
                                                   }
                                                }}
                                             />
                                             {addressLoading && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                   <div className="w-4 h-4 border-2 border-[var(--interactive-primary)] bg-[var(--bg-primary)] border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                             )}
                                          </div>
                                       </FormControl>
                                       <FormMessage />
                                       {addressError && (
                                          <p className="text-sm text-red-500 dark:text-red-400 mt-1">{addressError}</p>
                                       )}
                                    </FormItem>
                                 )}
                              />

                              <div className="md:col-span-2">
                                 <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                       <FormItem>
                                          <FormLabel className="theme-text-primary font-medium">
                                             Address
                                          </FormLabel>
                                          <FormControl>
                                             <div className="relative">
                                                <Input
                                                   placeholder="Enter full address"
                                                   className="theme-border bg-[var(--bg-primary)] focus:border-secondary-500 focus:ring-secondary-500"
                                                   {...field}
                                                />
                                                {showSuggestions && addressSuggestions.length > 0 && (
                                                   <div className="absolute z-10 w-full mt-1 theme-bg-primary theme-border border rounded-md shadow-lg max-h-60 overflow-auto">
                                                      {addressSuggestions.map((address, index) => (
                                                         <div
                                                            key={index}
                                                            className="px-4 py-2 hover:theme-bg-secondary cursor-pointer text-sm theme-text-primary"
                                                            onClick={() => handleAddressSelect(address)}
                                                         >
                                                            {address.addressLine1}
                                                         </div>
                                                      ))}
                                                   </div>
                                                )}
                                             </div>
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )}
                                 />
                              </div>
                           </div>
                        </CardContent>
                     </Card>

                       {/* Next Contact Information Section */}
                     <Card 
                        className="theme-bg-secondary theme-border transition-colors"
                        style={{
                           backgroundColor: 'var(--bg-secondary)',
                           borderColor: 'var(--border-default)',
                           boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                     >
                        <CardHeader className="pb-4">
                           <CardTitle 
                              className="theme-text-primary flex items-center gap-2"
                              style={{ color: 'var(--fg-secondary)' }}
                           >
                              <Calendar className="h-5 w-5" />
                              Next Contact Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                 control={form.control}
                                 name="nextContactInfo.date"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel 
                                       className="theme-text-primary font-medium"
                                       style={{ color: 'var(--fg-secondary)' }}
                                    >
                                          Contact Date
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             type="date"
                                             className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                             style={{
                                                backgroundColor: 'var(--bg-primary)',
                                                borderColor: 'var(--border-default)',
                                                color: 'var(--fg-primary)'
                                             }}
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="nextContactInfo.time"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel 
                                       className="theme-text-primary font-medium"
                                       style={{ color: 'var(--fg-secondary)' }}
                                    >
                                          Contact Time
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             type="time"
                                             className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                             style={{
                                                backgroundColor: 'var(--bg-primary)',
                                                borderColor: 'var(--border-default)',
                                                color: 'var(--fg-primary)'
                                             }}
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>

                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                 control={form.control}
                                 name="nextContactInfo.phone"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Contact Phone
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             type="tel"
                                             placeholder="Contact phone number"
                                             className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                             style={{
                                                backgroundColor: 'var(--bg-primary)',
                                                borderColor: 'var(--border-default)',
                                                color: 'var(--fg-primary)'
                                             }}
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="nextContactInfo.email"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Contact Email
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             type="email"
                                             placeholder="Contact email address"
                                             className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                             style={{
                                                backgroundColor: 'var(--bg-primary)',
                                                borderColor: 'var(--border-default)',
                                                color: 'var(--fg-primary)'
                                             }}
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>

                           <FormField
                              control={form.control}
                              name="nextContactInfo.source"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Contact Source/Reason
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          placeholder="Reason for next contact or source"
                                          className="theme-border-default bg-[var(--bg-primary)] focus:theme-border-primary"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </CardContent>
                     </Card>

                     {/* Lead Management Section */}
                     <Card className="theme-border theme-bg-secondary">
                        <CardHeader className="pb-4">
                           <CardTitle className="flex items-center gap-2 theme-text-primary">
                              <Tag className="h-5 w-5" />
                              Lead Management
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                              <FormField
                                 control={form.control}
                                 name="status"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="font-medium theme-text-primary">
                                          Status *
                                       </FormLabel>
                                       <FormControl>
                                          <Select
                                             onValueChange={field.onChange}
                                             value={field.value}
                                          >

                                             <SelectTrigger className="theme-border focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]">
                                                <SelectValue placeholder="Select status" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                {LEAD_STATUSES.map((status) => (
                                                   <SelectItem
                                                      key={status.value}
                                                      value={status.value}
                                                   >
                                                      <div className="flex items-center gap-2">
                                                         <div
                                                            className={`h-2 w-2 rounded-full ${status.color || 'bg-gray-500'}`}
                                                         />
                                                         {status.label}
                                                      </div>
                                                   </SelectItem>
                                                ))}
                                             </SelectContent>
                                          </Select>
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="priority"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="font-medium theme-text-primary">
                                          Priority
                                       </FormLabel>
                                       <FormControl>
                                          <Select
                                             onValueChange={field.onChange}
                                             value={field.value}
                                          >
                                             <SelectTrigger className="theme-border focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]">
                                                <SelectValue placeholder="Select priority" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                {LEAD_PRIORITIES.map(
                                                   (priority) => (
                                                      <SelectItem
                                                         key={priority.value}
                                                         value={priority.value}
                                                      >
                                                         <div className="flex items-center gap-2">
                                                            <Badge
                                                               variant="outline"
                                                               className={
                                                                  priority.color ||
                                                                  ''
                                                               }
                                                            >
                                                               {priority.label}
                                                            </Badge>
                                                         </div>
                                                      </SelectItem>
                                                   )
                                                )}
                                             </SelectContent>
                                          </Select>
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="leadSource"
                                 render={({ field }) => {
                                    console.log('LeadSource field value:', field.value, 'leadData.leadSource:', leadData?.leadSource) // Debug log
                                    return (
                                       <FormItem>
                                          <FormLabel className="font-medium theme-text-primary">
                                             Lead Source
                                          </FormLabel>
                                          <FormControl>
                                             <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                             >
                                                <SelectTrigger className="theme-border focus:theme-border focus:ring-neutral-50 bg-[var(--bg-primary)]">
                                                   <SelectValue placeholder="Select source" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                   {LEAD_SOURCES.map((source) => (
                                                      <SelectItem
                                                         key={source.value}
                                                         value={source.value}
                                                      >
                                                         {source.label}
                                                      </SelectItem>
                                                   ))}
                                                </SelectContent>
                                             </Select>
                                          </FormControl>
                                          <FormMessage />
                                       </FormItem>
                                    )
                                 }}
                              />
                           </div>

                           <Separator />

                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                 control={form.control}
                                 name="description"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="font-medium theme-text-primary">
                                          Description
                                       </FormLabel>
                                       <FormControl>
                                          <Textarea
                                             placeholder="Enter lead description..."
                                             className="min-h-[100px] theme-border focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormDescription>
                                          Brief description of the lead
                                          opportunity
                                       </FormDescription>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="notes"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="font-medium theme-text-primary">
                                          Notes
                                       </FormLabel>
                                       <FormControl>
                                          <Textarea
                                             placeholder="Add any additional notes..."
                                             className="min-h-[100px] theme-border focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormDescription>
                                          Internal notes for team reference
                                       </FormDescription>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>
                        </CardContent>
                     </Card>

                   
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-4">
                     <div className="text-muted-foreground flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>* Required fields</span>
                     </div>
                     <div className="flex gap-3">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={handleClose}
                           disabled={loading}
                        >
                           Cancel
                        </Button>
                        <Button
                           type="submit"
                           disabled={loading}
                           className="min-w-[120px]"
                        >
                           {loading ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 {isEdit ? 'Updating...' : 'Creating...'}
                              </>
                           ) : (
                              <>
                                 <Save className="mr-2 h-4 w-4" />
                                 {isEdit ? 'Update Lead' : 'Create Lead'}
                              </>
                           )}
                        </Button>
                     </div>
                  </div>
               </form>
            </Form>
         </div>
      )
   }

   // Render modal mode
   return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
         <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto theme-bg-primary">
            <DialogHeader className="from-primary-50 to-secondary-50 border-primary-200 -m-6 mb-6 border-b bg-gradient-to-r p-6">
               <DialogTitle className="text-primary-800 text-2xl font-bold">
                  {isEdit ? 'Edit Lead' : 'Create New Lead'}
               </DialogTitle>
               <DialogDescription className="text-primary-600">
                  {isEdit
                     ? 'Update the lead information below.'
                     : 'Fill in the details to create a new lead in the system.'}
               </DialogDescription>
            </DialogHeader>

            {error && (
               <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
               </Alert>
            )}

            <Form {...form}>
               <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
               >
                  {/* Personal/Business Information Section */}
                  <Card className="border-primary-200 from-primary-50 to-secondary-50 bg-gradient-to-r">
                     <CardHeader className="pb-4">
                        <CardTitle className="theme-text-primary flex items-center gap-2">
                           <User className="h-5 w-5" />
                           {watchType === 'business'
                              ? 'Business Information'
                              : 'Personal Information'}
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       {watchType === 'business'
                                          ? 'Contact Name'
                                          : 'Full Name'}{' '}
                                       *
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          placeholder={watchType === 'business' ? 'Contact person name' : 'Enter full name'}
                                          className="border-primary-200 focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="type"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Lead Type *
                                    </FormLabel>
                                    <FormControl>
                                       <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                       >
                                          <SelectTrigger className="border-primary-200 focus:border-primary-500 focus:ring-primary-500">
                                             <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {LEAD_TYPES.map((type) => (
                                                <SelectItem
                                                   key={type.value}
                                                   value={type.value}
                                                >
                                                   <div className="flex items-center gap-2">
                                                      {type.value ===
                                                      'business' ? (
                                                         <Building2 className="h-4 w-4" />
                                                      ) : (
                                                         <User className="h-4 w-4" />
                                                      )}
                                                      {type.label}
                                                   </div>
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>

                        {watchType === 'business' && (
                           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <FormField
                                 control={form.control}
                                 name="businessName"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Business Name *
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             placeholder="Enter business name"
                                             className="border-primary-200 focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />

                              <FormField
                                 control={form.control}
                                 name="company"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Company
                                       </FormLabel>
                                       <FormControl>
                                          <Input
                                             placeholder="Enter company name"
                                             className="border-primary-200 focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                          />
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>
                        )}

                        {watchType === 'business' && (
                           <FormField
                              control={form.control}
                              name="jobTitle"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Job Title
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          placeholder="Enter job title"
                                          className="border-primary-200 focus:border-primary-500 focus:ring-primary-500 bg-[var(--bg-primary)]"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        )}
                     </CardContent>
                  </Card>

                  {/* Contact Information Section */}
                  <Card className="border-secondary-200 from-secondary-50 to-primary-50 bg-gradient-to-r">
                     <CardHeader className="pb-4">
                        <CardTitle className="theme-text-primary flex items-center gap-2">
                           <Phone className="h-5 w-5" />
                           Contact Information
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Phone Number *
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          type="tel"
                                          placeholder="Enter phone number"
                                          className="border-secondary-200 focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Email Address
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          type="email"
                                          placeholder="Enter email address"
                                          className="border-secondary-200 focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                           <FormField
                              control={form.control}
                              name="pinCode"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       PIN Code
                                    </FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                          <Input
                                             placeholder="Enter PIN code"
                                             className="border-secondary-200 focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                             {...field}
                                             onChange={(e) => {
                                                field.onChange(e)
                                                if (e.target.value.length >= 3) {
                                                   fetchAddressData(e.target.value)
                                                } else {
                                                   setShowSuggestions(false)
                                                }
                                             }}
                                          />
                                          {addressLoading && (
                                             <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-[var(--interactive-primary)] border-t-transparent rounded-full animate-spin"></div>
                                             </div>
                                          )}
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                    {addressError && (
                                       <p className="text-sm text-red-500 dark:text-red-400 mt-1">{addressError}</p>
                                    )}
                                 </FormItem>
                              )}
                           />

                           <div className="md:col-span-2">
                              <FormField
                                 control={form.control}
                                 name="address"
                                 render={({ field }) => (
                                    <FormItem>
                                       <FormLabel className="theme-text-primary font-medium">
                                          Address
                                       </FormLabel>
                                       <FormControl>
                                          <div className="relative">
                                             <Input
                                                placeholder="Enter full address"
                                                className="border-secondary-200 focus:border-secondary-500 focus:ring-secondary-500 bg-[var(--bg-primary)]"
                                                {...field}
                                             />
                                             {showSuggestions && addressSuggestions.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 theme-bg-primary theme-border border rounded-md shadow-lg max-h-60 overflow-auto">
                                                   {addressSuggestions.map((address, index) => (
                                                      <div
                                                         key={index}
                                                         className="px-4 py-2 hover:theme-bg-secondary cursor-pointer text-sm theme-text-primary"
                                                         onClick={() => handleAddressSelect(address)}
                                                      >
                                                         {address.addressLine1}
                                                      </div>
                                                   ))}
                                                </div>
                                             )}
                                          </div>
                                       </FormControl>
                                       <FormMessage />
                                    </FormItem>
                                 )}
                              />
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Lead Management Section */}
                  <Card className="border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
                     <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 theme-text-primary">
                           <Tag className="h-5 w-5" />
                           Lead Management
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                           <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="font-medium theme-text-primary">
                                       Status *
                                    </FormLabel>
                                    <FormControl>
                                       <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                       >
                                          <SelectTrigger className="border-neutral-200 focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]">
                                             <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {LEAD_STATUSES.map((status) => (
                                                <SelectItem
                                                   key={status.value}
                                                   value={status.value}
                                                >
                                                   <div className="flex items-center gap-2">
                                                      <div
                                                         className={`h-2 w-2 rounded-full ${status.color || 'bg-gray-500'}`}
                                                      />
                                                      {status.label}
                                                   </div>
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="font-medium theme-text-primary">
                                       Priority
                                    </FormLabel>
                                    <FormControl>
                                       <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                       >
                                          <SelectTrigger className="border-neutral-200 focus:theme-border focus:ring-neutral-500">
                                             <SelectValue placeholder="Select priority" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {LEAD_PRIORITIES.map(
                                                (priority) => (
                                                   <SelectItem
                                                      key={priority.value}
                                                      value={priority.value}
                                                   >
                                                      <div className="flex items-center gap-2">
                                                         <Badge
                                                            variant="outline"
                                                            className={
                                                               priority.color ||
                                                               ''
                                                            }
                                                         >
                                                            {priority.label}
                                                         </Badge>
                                                      </div>
                                                   </SelectItem>
                                                )
                                             )}
                                          </SelectContent>
                                       </Select>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="leadSource"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="font-medium theme-text-primary">
                                       Lead Source
                                    </FormLabel>
                                    <FormControl>
                                       <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                       >
                                          <SelectTrigger className="border-neutral-200 focus:theme-border focus:ring-neutral-500">
                                             <SelectValue placeholder="Select source" />
                                          </SelectTrigger>
                                          <SelectContent>
                                             {LEAD_SOURCES.map((source) => (
                                                <SelectItem
                                                   key={source.value}
                                                   value={source.value}
                                                >
                                                   {source.label}
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="font-medium theme-text-primary">
                                       Description
                                    </FormLabel>
                                    <FormControl>
                                       <Textarea
                                          placeholder="Enter lead description..."
                                          className="min-h-[100px] border-neutral-200 focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormDescription>
                                       Brief description of the lead opportunity
                                    </FormDescription>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="font-medium theme-text-primary">
                                       Notes
                                    </FormLabel>
                                    <FormControl>
                                       <Textarea
                                          placeholder="Add any additional notes..."
                                          className="min-h-[100px] border-neutral-200 focus:theme-border focus:ring-neutral-500 bg-[var(--bg-primary)]"
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormDescription>
                                       Internal notes for team reference
                                    </FormDescription>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>
                     </CardContent>
                  </Card>

                  {/* Next Contact Information Section - Modal Mode */}
                  <Card 
                     className="theme-bg-primary theme-border transition-colors"
                     style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border-default)',
                        boxShadow:  '0 1px 3px rgba(0, 0, 0, 0.1)'
                     }}
                  >
                     <CardHeader className="pb-4">
                        <CardTitle 
                           className="theme-text-primary flex items-center gap-2"
                           style={{ color: 'var(--fg-primary)' }}
                        >
                           <Calendar className="h-5 w-5" />
                           Next Contact Information
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField
                              control={form.control}
                              name="nextContactInfo.date"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel 
                                       className="theme-text-primary font-medium"
                                       style={{ color: 'var(--fg-secondary)' }}
                                    >
                                       Contact Date
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          type="date"
                                          className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                          style={{
                                             backgroundColor: 'var(--bg-primary)',
                                             borderColor: 'var(--border-default)',
                                             color: 'var(--fg-primary)'
                                          }}
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="nextContactInfo.time"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Contact Time
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          type="time"
                                          className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                          style={{
                                             backgroundColor: 'var(--bg-primary)',
                                             borderColor: 'var(--border-default)',
                                             color: 'var(--fg-primary)'
                                          }}
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                           <FormField
                              control={form.control}
                              name="nextContactInfo.phone"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Contact Phone
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          type="tel"
                                          placeholder="Contact phone number"
                                          className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                          style={{
                                             backgroundColor: 'var(--bg-primary)',
                                             borderColor: 'var(--border-default)',
                                             color: 'var(--fg-primary)'
                                          }}
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={form.control}
                              name="nextContactInfo.email"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel className="theme-text-primary font-medium">
                                       Contact Email
                                    </FormLabel>
                                    <FormControl>
                                       <Input
                                          type="email"
                                          placeholder="Contact email address"
                                          className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                          style={{
                                             backgroundColor: 'var(--bg-primary)',
                                             borderColor: 'var(--border-default)',
                                             color: 'var(--fg-primary)'
                                          }}
                                          {...field}
                                       />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>

                        <FormField
                           control={form.control}
                           name="nextContactInfo.source"
                           render={({ field }) => (
                              <FormItem>
                                 <FormLabel 
                                    className="theme-text-primary font-medium"
                                    style={{ color: 'var(--fg-secondary)' }}
                                 >
                                    Contact Source/Reason
                                 </FormLabel>
                                 <FormControl>
                                    <Input
                                       placeholder="Reason for next contact or source"
                                       className="theme-bg-primary theme-border bg-[var(--bg-primary)]"
                                       style={{
                                          backgroundColor: 'var(--bg-primary)',
                                          borderColor: 'var(--border-default)',
                                          color: 'var(--fg-primary)'
                                       }}
                                       {...field}
                                    />
                                 </FormControl>
                                 <FormMessage />
                              </FormItem>
                           )}
                        />
                     </CardContent>
                  </Card>
               </form>
            </Form>

            <DialogFooter className="from-primary-50 to-secondary-50 border-secondary-200 -mx-6 mt-8 -mb-6 border-t bg-gradient-to-r px-6 py-4">
               <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                     <AlertCircle className="h-4 w-4" />
                     <span>* Required fields</span>
                  </div>
                  <div className="flex gap-3">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="border-neutral-300 theme-text-primary hover:bg-neutral-50"
                     >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                     </Button>
                     <Button
                        type="submit"
                        disabled={loading}
                        onClick={form.handleSubmit(onSubmit)}
                        className="from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 bg-gradient-to-r text-white"
                     >
                        {loading ? (
                           <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isEdit ? 'Updating...' : 'Creating...'}
                           </>
                        ) : (
                           <>
                              <Save className="mr-2 h-4 w-4" />
                              {isEdit ? 'Update Lead' : 'Create Lead'}
                           </>
                        )}
                     </Button>
                  </div>
               </div>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   )
}

export default LeadCreateEditModal
