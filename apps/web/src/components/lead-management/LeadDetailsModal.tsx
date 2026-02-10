'use client'

import React from 'react'
import {
   Edit,
   Phone,
   Mail,
   MapPin,
   User,
   Calendar,
   AlertCircle,
   Building,
   Briefcase,
   Clock,
   Activity,
   Star,
   CheckCircle2,
   XCircle,
   AlertTriangle,
   Heart,
   Zap,
   Target,
   TrendingUp,
   Globe,
   ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
   Lead,
   LEAD_STATUSES,
   LEAD_TYPES,
   LEAD_PRIORITIES,
   LEAD_SOURCES,
} from '@/types/lead'

interface LeadDetailsModalProps {
   isOpen: boolean
   onClose: () => void
   lead: Lead | null
   onEdit: (lead: Lead) => void
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
   isOpen,
   onClose,
   lead,
   onEdit,
}) => {
   if (!lead) return null

   // Get status badge with portal colors
   const getStatusBadge = (status: string) => {
      const statusConfig = LEAD_STATUSES.find((s) => s.value === status)
      const statusColors = {
         new: 'bg-blue-100 text-blue-800 border-blue-200',
         contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
         qualified: 'bg-purple-100 text-purple-800 border-purple-200',
         proposal: 'bg-orange-100 text-orange-800 border-orange-200',
         negotiation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
         closed_won: 'bg-green-100 text-green-800 border-green-200',
         closed_lost: 'bg-red-100 text-red-800 border-red-200',
         on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
      }

      const statusIcons = {
         new: Star,
         contacted: Phone,
         qualified: CheckCircle2,
         proposal: TrendingUp,
         negotiation: Target,
         closed_won: CheckCircle2,
         closed_lost: XCircle,
         on_hold: Clock,
      }

      const IconComponent = statusIcons[status as keyof typeof statusIcons] || Activity
      const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'

      return (
         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${colorClass}`}>
            <IconComponent className="h-4 w-4" />
            {statusConfig?.label || status}
         </div>
      )
   }

   // Get priority badge with portal colors
   const getPriorityBadge = (priority?: string) => {
      if (!priority) return <span className="text-gray-500 text-sm">Not set</span>
      
      const priorityColors = {
         low: 'bg-green-100 text-green-800 border-green-200',
         medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
         high: 'bg-orange-100 text-orange-800 border-orange-200',
         urgent: 'bg-red-100 text-red-800 border-red-200',
      }

      const priorityIcons = {
         low: Heart,
         medium: Zap,
         high: AlertTriangle,
         urgent: AlertCircle,
      }

      const priorityConfig = LEAD_PRIORITIES.find((p) => p.value === priority)
      const IconComponent = priorityIcons[priority as keyof typeof priorityIcons] || Activity
      const colorClass = priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800 border-gray-200'

      return (
         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${colorClass}`}>
            <IconComponent className="h-4 w-4" />
            {priorityConfig?.label || priority}
         </div>
      )
   }

   // Get type badge with portal colors
   const getTypeBadge = (type: string) => {
      const typeConfig = LEAD_TYPES.find((t) => t.value === type)
      const typeColors = {
         individual: 'bg-primary-100 text-primary-800 border-primary-200',
         business: 'bg-secondary-100 text-secondary-800 border-secondary-200',
      }
      
      const IconComponent = type === 'business' ? Building : User
      const colorClass = typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 border-gray-200'

      return (
         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${colorClass}`}>
            <IconComponent className="h-4 w-4" />
            {typeConfig?.label || type}
         </div>
      )
   }

   // Get source label with enhanced display
   const getSourceLabel = (source?: string) => {
      if (!source) return 'Not specified'
      const sourceConfig = LEAD_SOURCES.find((s) => s.value === source)
      return sourceConfig?.label || source
   }

   // Format date with enhanced display
   const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffInHours < 24) {
         return `${diffInHours} hours ago`
      } else if (diffInHours < 168) {
         return `${Math.floor(diffInHours / 24)} days ago`
      } else {
         return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
         })
      }
   }

   // Calculate lead score based on various factors
   const calculateLeadScore = () => {
      let score = 0
      
      // Status scoring
      const statusScores = {
         new: 20,
         contacted: 30,
         qualified: 60,
         proposal: 80,
         negotiation: 90,
         closed_won: 100,
         closed_lost: 0,
         on_hold: 40,
      }
      score += statusScores[lead.status as keyof typeof statusScores] || 0

      // Priority scoring
      const priorityScores = {
         low: 10,
         medium: 30,
         high: 60,
         urgent: 90,
      }
      if (lead.priority) {
         score += priorityScores[lead.priority as keyof typeof priorityScores] || 0
      }

      // Completeness scoring
      let completeness = 0
      const requiredFields = ['name', 'phone', 'email', 'address']
      requiredFields.forEach(field => {
         if (lead[field as keyof Lead]) completeness += 25
      })
      
      return Math.min(Math.floor((score * 0.7) + (completeness * 0.3)), 100)
   }

   // Get lead temperature based on score
   const getLeadTemperature = (score: number) => {
      if (score >= 80) return 'Hot Lead'
      if (score >= 60) return 'Warm Lead'
      if (score >= 40) return 'Potential Lead'
      return 'Cold Lead'
   }

   const leadScore = calculateLeadScore()

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-h-[95vh] max-w-6xl overflow-y-auto bg-gradient-to-br from-white to-gray-50">
            <DialogHeader className="bg-gradient-to-r from-primary-600 to-secondary-600 -m-6 mb-6 p-6 text-white">
               <div className="flex items-center justify-between">
                  <div>
                     <DialogTitle className="text-2xl font-bold">
                        {lead.name || 'Unnamed Lead'}
                     </DialogTitle>
                     <DialogDescription className="text-primary-100 mt-1">
                        Lead ID: {lead._id} • {getSourceLabel(lead.leadSource)}
                     </DialogDescription>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="text-center">
                        <div className="text-2xl font-bold">{leadScore}%</div>
                        <div className="text-xs text-primary-100">Lead Score</div>
                     </div>
                     <Button
                        onClick={() => onEdit(lead)}
                        variant="secondary"
                        className="flex items-center gap-2 bg-white text-primary-600 hover:bg-gray-100"
                     >
                        <Edit className="h-4 w-4" />
                        Edit Lead
                     </Button>
                  </div>
               </div>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
               {/* Left Column - Main Information */}
               <div className="space-y-6 lg:col-span-3">
                  {/* Status Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-white">
                        <CardContent className="p-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium text-gray-600">Current Status</p>
                                 <div className="mt-2">
                                    {getStatusBadge(lead.status)}
                                 </div>
                              </div>
                              <Activity className="h-8 w-8 text-primary-400" />
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="border-secondary-200 bg-gradient-to-br from-secondary-50 to-white">
                        <CardContent className="p-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium text-gray-600">Priority Level</p>
                                 <div className="mt-2">
                                    {getPriorityBadge(lead.priority)}
                                 </div>
                              </div>
                              <Target className="h-8 w-8 text-secondary-400" />
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-4">
                           <div className="flex items-center justify-between">
                              <div>
                                 <p className="text-sm font-medium text-gray-600">Lead Type</p>
                                 <div className="mt-2">
                                    {getTypeBadge(lead.type)}
                                 </div>
                              </div>
                              {lead.type === 'business' ? (
                                 <Building className="h-8 w-8 text-green-400" />
                              ) : (
                                 <User className="h-8 w-8 text-green-400" />
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  </div>

                  {/* Basic Information */}
                  <Card className="border-primary-200 shadow-lg">
                     <CardHeader className="bg-gradient-to-r from-primary-100 to-secondary-100 border-b border-primary-200">
                        <CardTitle className="flex items-center gap-2 text-primary-800">
                           <User className="h-5 w-5" />
                           Personal Information
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                           <div className="space-y-1">
                              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                 Full Name
                              </span>
                              <p className="text-lg font-medium text-gray-900">
                                 {lead.name || 'Not provided'}
                              </p>
                           </div>

                           {lead.type === 'business' && lead.businessName && (
                              <div className="space-y-1">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Business Name
                                 </span>
                                 <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-secondary-500" />
                                    {lead.businessName}
                                 </p>
                              </div>
                           )}

                           {lead.company && (
                              <div className="space-y-1">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Company
                                 </span>
                                 <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-secondary-500" />
                                    {lead.company}
                                 </p>
                              </div>
                           )}

                           {lead.jobTitle && (
                              <div className="space-y-1">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Job Title
                                 </span>
                                 <p className="text-lg font-medium text-gray-900">
                                    {lead.jobTitle}
                                 </p>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card className="border-secondary-200 shadow-lg">
                     <CardHeader className="bg-gradient-to-r from-secondary-100 to-primary-100 border-b border-secondary-200">
                        <CardTitle className="flex items-center gap-2 text-secondary-800">
                           <Phone className="h-5 w-5" />
                           Contact Details
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                           <div className="space-y-1">
                              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                 Phone Number
                              </span>
                              <div className="flex items-center gap-3">
                                 <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                    <Phone className="h-5 w-5 text-green-600" />
                                 </div>
                                 <a
                                    href={`tel:${lead.phone}`}
                                    className="text-lg font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                 >
                                    {lead.phone}
                                 </a>
                              </div>
                           </div>

                           {lead.email && (
                              <div className="space-y-1">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Email Address
                                 </span>
                                 <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                       <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <a
                                       href={`mailto:${lead.email}`}
                                       className="text-lg font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                    >
                                       {lead.email}
                                    </a>
                                 </div>
                              </div>
                           )}
                        </div>

                        {(lead.address || lead.pinCode) && (
                           <div className="mt-6 space-y-1">
                              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                 Address
                              </span>
                              <div className="flex items-start gap-3">
                                 <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                                    <MapPin className="h-5 w-5 text-red-600" />
                                 </div>
                                 <div>
                                    {lead.address && (
                                       <p className="text-lg font-medium text-gray-900">
                                          {lead.address}
                                       </p>
                                    )}
                                    {lead.pinCode && (
                                       <p className="text-sm text-gray-600 mt-1">
                                          PIN Code: {lead.pinCode}
                                       </p>
                                    )}
                                 </div>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>

                  {/* Next Contact Information */}
                  {lead.nextContactInfo && (lead.nextContactInfo.date || lead.nextContactInfo.time || lead.nextContactInfo.phone || lead.nextContactInfo.email || lead.nextContactInfo.source) && (
                     <Card className="border-purple-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b border-purple-200">
                           <CardTitle className="flex items-center gap-2 text-purple-800">
                              <Calendar className="h-5 w-5" />
                              Next Contact Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              {lead.nextContactInfo.date && (
                                 <div className="space-y-1">
                                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                       Contact Date
                                    </span>
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                                          <Calendar className="h-5 w-5 text-purple-600" />
                                       </div>
                                       <p className="text-lg font-medium text-gray-900">
                                          {new Date(lead.nextContactInfo.date).toLocaleDateString('en-US', {
                                             year: 'numeric',
                                             month: 'long',
                                             day: 'numeric',
                                          })}
                                       </p>
                                    </div>
                                 </div>
                              )}

                              {lead.nextContactInfo.time && (
                                 <div className="space-y-1">
                                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                       Contact Time
                                    </span>
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-full">
                                          <Clock className="h-5 w-5 text-pink-600" />
                                       </div>
                                       <p className="text-lg font-medium text-gray-900">
                                          {lead.nextContactInfo.time}
                                       </p>
                                    </div>
                                 </div>
                              )}

                              {lead.nextContactInfo.phone && (
                                 <div className="space-y-1">
                                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                       Contact Phone
                                    </span>
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                          <Phone className="h-5 w-5 text-green-600" />
                                       </div>
                                       <a
                                          href={`tel:${lead.nextContactInfo.phone}`}
                                          className="text-lg font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                       >
                                          {lead.nextContactInfo.phone}
                                       </a>
                                    </div>
                                 </div>
                              )}

                              {lead.nextContactInfo.email && (
                                 <div className="space-y-1">
                                    <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                       Contact Email
                                    </span>
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                          <Mail className="h-5 w-5 text-blue-600" />
                                       </div>
                                       <a
                                          href={`mailto:${lead.nextContactInfo.email}`}
                                          className="text-lg font-medium text-primary-600 hover:text-primary-700 hover:underline"
                                       >
                                          {lead.nextContactInfo.email}
                                       </a>
                                    </div>
                                 </div>
                              )}
                           </div>

                           {lead.nextContactInfo.source && (
                              <div className="mt-6 space-y-2">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Contact Source/Reason
                                 </span>
                                 <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                                       {lead.nextContactInfo.source}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  )}

                  {/* Notes and Description */}
                  {(lead.notes || lead.description) && (
                     <Card className="border-orange-200 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 border-b border-orange-200">
                           <CardTitle className="flex items-center gap-2 text-orange-800">
                              <AlertCircle className="h-5 w-5" />
                              Additional Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                           {lead.description && (
                              <div className="space-y-2">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Description
                                 </span>
                                 <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                                       {lead.description}
                                    </p>
                                 </div>
                              </div>
                           )}

                           {lead.notes && (
                              <div className="space-y-2">
                                 <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Internal Notes
                                 </span>
                                 <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                                       {lead.notes}
                                    </p>
                                 </div>
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  )}
               </div>

               {/* Right Column - Status and Actions */}
               <div className="space-y-6">
                  {/* Lead Score Card */}
                  <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white shadow-lg">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-800">
                           <TrendingUp className="h-5 w-5" />
                           Lead Score
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="text-center">
                        <div className="relative w-24 h-24 mx-auto mb-4">
                           <svg className="w-24 h-24 transform -rotate-90">
                              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                              <circle 
                                 cx="48" 
                                 cy="48" 
                                 r="40" 
                                 stroke="currentColor" 
                                 strokeWidth="8" 
                                 fill="transparent" 
                                 strokeDasharray={`${2 * Math.PI * 40}`}
                                 strokeDashoffset={`${2 * Math.PI * 40 * (1 - leadScore / 100)}`}
                                 className="text-purple-600"
                              />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold text-purple-800">{leadScore}%</span>
                           </div>
                        </div>
                        <p className="text-sm text-purple-600">
                           {getLeadTemperature(leadScore)}
                        </p>
                     </CardContent>
                  </Card>

                  {/* Timeline Information */}
                  <Card className="border-blue-200 shadow-lg">
                     <CardHeader className="bg-gradient-to-r from-blue-100 to-primary-100 border-b border-blue-200">
                        <CardTitle className="flex items-center gap-2 text-blue-800">
                           <Calendar className="h-5 w-5" />
                           Timeline
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                              <Clock className="h-4 w-4 text-green-600" />
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-700">Created</p>
                              <p className="text-sm text-gray-600">{formatDate(lead.createdAt)}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                              <Activity className="h-4 w-4 text-blue-600" />
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-700">Last Updated</p>
                              <p className="text-sm text-gray-600">{formatDate(lead.updatedAt)}</p>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-green-200 shadow-lg">
                     <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
                        <CardTitle className="text-green-800">Quick Actions</CardTitle>
                     </CardHeader>
                     <CardContent className="p-4 space-y-3">
                        <Button
                           variant="outline"
                           className="w-full justify-start bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                           asChild
                        >
                           <a href={`tel:${lead.phone}`}>
                              <Phone className="mr-2 h-4 w-4" />
                              Call Lead
                           </a>
                        </Button>

                        {lead.email && (
                           <Button
                              variant="outline"
                              className="w-full justify-start bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              asChild
                           >
                              <a href={`mailto:${lead.email}`}>
                                 <Mail className="mr-2 h-4 w-4" />
                                 Send Email
                              </a>
                           </Button>
                        )}

                        <Button
                           variant="outline"
                           className="w-full justify-start bg-primary-50 border-primary-200 text-primary-700 hover:bg-primary-100"
                           onClick={() => onEdit(lead)}
                        >
                           <Edit className="mr-2 h-4 w-4" />
                           Edit Details
                        </Button>

                        {lead.address && (
                           <Button
                              variant="outline"
                              className="w-full justify-start bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                              asChild
                           >
                              <a 
                                 href={`https://maps.google.com/?q=${encodeURIComponent(lead.address)}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                              >
                                 <MapPin className="mr-2 h-4 w-4" />
                                 View on Map
                                 <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                           </Button>
                        )}
                     </CardContent>
                  </Card>

                  {/* Lead Source */}
                  <Card className="border-gray-200 shadow-lg">
                     <CardHeader className="bg-gradient-to-r from-gray-100 to-slate-100 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                           <Globe className="h-5 w-5" />
                           Lead Source
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-4">
                        <div className="text-center">
                           <p className="text-lg font-medium text-gray-900">
                              {getSourceLabel(lead.leadSource)}
                           </p>
                           <p className="text-sm text-gray-600 mt-1">
                              Original source of this lead
                           </p>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   )
}

export default LeadDetailsModal