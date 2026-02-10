'use client'

import React, { useState, useEffect } from 'react'
import { 
   Eye, 
   Mail, 
   Phone, 
   MapPin, 
   User as UserIcon,
   Calendar,
   Clock,
   Shield,
   CheckCircle,
   XCircle,
   Edit,
   Trash2,
   Copy,
   ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { 
   User,
   getUserRoleConfig,
   getUserStatusColor,
   getUserVerificationColor
} from '@/types/user'
import { UserAPI } from '@/services/apis/user.api'
import { cn } from '@/lib/theme-utils'

interface UserDetailsModalProps {
   isOpen: boolean
   onClose: () => void
   userId?: string | null
   user?: User | null
   onEdit?: (user: User) => void
   onDelete?: (user: User) => void
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
   isOpen,
   onClose,
   userId,
   user: initialUser,
   onEdit,
   onDelete
}) => {
   const [user, setUser] = useState<User | null>(initialUser || null)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)

   // Fetch user details when modal opens
   useEffect(() => {
      if (isOpen && userId && !initialUser) {
         fetchUserDetails()
      } else if (isOpen && initialUser) {
         setUser(initialUser)
      }
   }, [isOpen, userId, initialUser])

   const fetchUserDetails = async () => {
      if (!userId) return

      setLoading(true)
      setError(null)
      try {
         const userData = await UserAPI.getUserById(userId)
         setUser(userData)
      } catch (err: any) {
         console.error('Error fetching user details:', err)
         setError(err.message || 'Failed to load user details')
         toast.error('Failed to load user details')
      } finally {
         setLoading(false)
      }
   }

   // Copy to clipboard helper
   const copyToClipboard = async (text: string, label: string) => {
      try {
         await navigator.clipboard.writeText(text)
         toast.success(`${label} copied to clipboard`)
      } catch (err) {
         toast.error('Failed to copy to clipboard')
      }
   }

   // Format date helper
   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   if (!isOpen) return null

   const roleConfig = user ? getUserRoleConfig(user.role) : null

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="theme-bg-primary theme-border mx-4 max-h-[90vh] max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl sm:mx-auto">
            <DialogDescription />
            {loading ? (
               <div className="space-y-6 p-6">
                  <div className="flex items-center gap-4">
                     <Skeleton className="h-16 w-16 rounded-xl" />
                     <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                     <Skeleton className="h-48" />
                     <Skeleton className="h-48" />
                  </div>
               </div>
            ) : error ? (
               <div className="flex flex-col items-center justify-center space-y-4 p-12">
                  <XCircle className="h-16 w-16 text-red-500" />
                  <h3 className="text-lg font-semibold theme-text-primary">Failed to Load User</h3>
                  <p className="theme-text-secondary text-center">{error}</p>
                  <Button onClick={fetchUserDetails} variant="outline">
                     Try Again
                  </Button>
               </div>
            ) : user ? (
               <>
                  {/* Header */}
                  <DialogHeader className="space-y-4 pb-6">
                     <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-4">
                           <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50">
                              {user.photo ? (
                                 <img 
                                    src={user.photo} 
                                    alt={user.name}
                                    className="h-16 w-16 rounded-xl object-cover"
                                 />
                              ) : (
                                 <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                              )}
                           </div>
                           <div className="flex-1">
                              <DialogTitle className="theme-text-primary text-2xl font-bold">
                                 {user.name}
                              </DialogTitle>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                 {roleConfig && (
                                    <Badge className={cn("text-xs", roleConfig.color)}>
                                       <Shield className="mr-1 h-3 w-3" />
                                       {roleConfig.label}
                                    </Badge>
                                 )}
                                 <Badge className={cn("text-xs", getUserStatusColor(user.active))}>
                                    {user.active ? (
                                       <CheckCircle className="mr-1 h-3 w-3" />
                                    ) : (
                                       <XCircle className="mr-1 h-3 w-3" />
                                    )}
                                    {user.active ? 'Active' : 'Inactive'}
                                 </Badge>
                                 <Badge className={cn("text-xs", getUserVerificationColor(user.isEmailVerified))}>
                                    {user.isEmailVerified ? (
                                       <CheckCircle className="mr-1 h-3 w-3" />
                                    ) : (
                                       <XCircle className="mr-1 h-3 w-3" />
                                    )}
                                    {user.isEmailVerified ? 'Verified' : 'Unverified'}
                                 </Badge>
                              </div>
                           </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 sm:flex-col lg:flex-row">
                           {onEdit && (
                              <Button
                                 onClick={() => onEdit(user)}
                                 variant="outline"
                                 size="sm"
                                 className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary border-0 bg-transparent"
                              >
                                 <Edit className="mr-2 h-4 w-4" />
                                 Edit
                              </Button>
                           )}
                           {onDelete && (
                              <Button
                                 onClick={() => onDelete(user)}
                                 variant="outline"
                                 size="sm"
                                 className="theme-border hover:bg-red-50 dark:hover:bg-red-950/50 border-0 bg-transparent text-red-600 dark:text-red-400"
                              >
                                 <Trash2 className="mr-2 h-4 w-4" />
                                 Delete
                              </Button>
                           )}
                        </div>
                     </div>
                  </DialogHeader>

                  {/* Content */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                     {/* Contact Information */}
                     <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
                        <CardHeader className="pb-4">
                           <CardTitle className="theme-text-primary flex items-center gap-2 text-lg">
                              <Mail className="h-5 w-5" />
                              Contact Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/* Email */}
                           <div className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                              <div className="flex items-center gap-3">
                                 <Mail className="h-4 w-4 theme-text-muted" />
                                 <div>
                                    <p className="theme-text-secondary text-xs font-medium">Email</p>
                                    <p className="theme-text-primary text-sm">{user.email}</p>
                                 </div>
                              </div>
                              <div className="flex gap-1">
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(user.email, 'Email')}
                                    className="h-8 w-8 p-0"
                                 >
                                    <Copy className="h-3 w-3" />
                                 </Button>
                                 <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`mailto:${user.email}`)}
                                    className="h-8 w-8 p-0"
                                 >
                                    <ExternalLink className="h-3 w-3" />
                                 </Button>
                              </div>
                           </div>

                           {/* Phone */}
                           {user.phone && (
                              <div className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                                 <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 theme-text-muted" />
                                    <div>
                                       <p className="theme-text-secondary text-xs font-medium">Phone</p>
                                       <p className="theme-text-primary text-sm">{user.phone}</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-1">
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => copyToClipboard(user.phone!, 'Phone')}
                                       className="h-8 w-8 p-0"
                                    >
                                       <Copy className="h-3 w-3" />
                                    </Button>
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => window.open(`tel:${user.phone}`)}
                                       className="h-8 w-8 p-0"
                                    >
                                       <ExternalLink className="h-3 w-3" />
                                    </Button>
                                 </div>
                              </div>
                           )}

                           {/* Address */}
                           {user.address && (
                              <div className="rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                                 <div className="flex items-start gap-3">
                                    <MapPin className="h-4 w-4 theme-text-muted mt-0.5" />
                                    <div className="flex-1">
                                       <p className="theme-text-secondary text-xs font-medium">Address</p>
                                       <p className="theme-text-primary text-sm leading-relaxed">{user.address}</p>
                                       {user.postalCode && (
                                          <p className="theme-text-muted text-xs mt-1">Postal Code: {user.postalCode}</p>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           )}
                        </CardContent>
                     </Card>

                     {/* Account Information */}
                     <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
                        <CardHeader className="pb-4">
                           <CardTitle className="theme-text-primary flex items-center gap-2 text-lg">
                              <UserIcon className="h-5 w-5" />
                              Account Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {/* User ID */}
                           <div className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                              <div className="flex items-center gap-3">
                                 <UserIcon className="h-4 w-4 theme-text-muted" />
                                 <div>
                                    <p className="theme-text-secondary text-xs font-medium">User ID</p>
                                    <p className="theme-text-primary font-mono text-sm">{user._id}</p>
                                 </div>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => copyToClipboard(user._id, 'User ID')}
                                 className="h-8 w-8 p-0"
                              >
                                 <Copy className="h-3 w-3" />
                              </Button>
                           </div>

                           {/* Role Details */}
                           <div className="rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                              <div className="flex items-center gap-3">
                                 <Shield className="h-4 w-4 theme-text-muted" />
                                 <div className="flex-1">
                                    <p className="theme-text-secondary text-xs font-medium">Role & Permissions</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className={cn(
                                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                          roleConfig?.color
                                       )}>
                                          {roleConfig?.label}
                                       </span>
                                    </div>
                                    {roleConfig?.description && (
                                       <p className="theme-text-muted text-xs mt-1">{roleConfig.description}</p>
                                    )}
                                 </div>
                              </div>
                           </div>

                           {/* Account Status */}
                           <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                                 <div className="flex items-center gap-2">
                                    {user.active ? (
                                       <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                       <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <div>
                                       <p className="theme-text-secondary text-xs font-medium">Status</p>
                                       <p className={cn(
                                          "text-sm font-medium",
                                          user.active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                       )}>
                                          {user.active ? 'Active' : 'Inactive'}
                                       </p>
                                    </div>
                                 </div>
                              </div>

                              <div className="rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                                 <div className="flex items-center gap-2">
                                    {user.isEmailVerified ? (
                                       <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                       <XCircle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    <div>
                                       <p className="theme-text-secondary text-xs font-medium">Email</p>
                                       <p className={cn(
                                          "text-sm font-medium",
                                          user.isEmailVerified 
                                             ? "text-green-600 dark:text-green-400" 
                                             : "text-yellow-600 dark:text-yellow-400"
                                       )}>
                                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Timestamps */}
                     <Card className="theme-border lg:col-span-2 border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30">
                        <CardHeader className="pb-4">
                           <CardTitle className="theme-text-primary flex items-center gap-2 text-lg">
                              <Clock className="h-5 w-5" />
                              Timeline
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div className="flex items-center gap-3 rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                                 <Calendar className="h-4 w-4 theme-text-muted" />
                                 <div>
                                    <p className="theme-text-secondary text-xs font-medium">Created</p>
                                    <p className="theme-text-primary text-sm">{formatDate(user.createdAt)}</p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-3 rounded-lg bg-white/50 dark:bg-gray-800/50 p-3">
                                 <Clock className="h-4 w-4 theme-text-muted" />
                                 <div>
                                    <p className="theme-text-secondary text-xs font-medium">Last Updated</p>
                                    <p className="theme-text-primary text-sm">{formatDate(user.updatedAt)}</p>
                                 </div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               </>
            ) : null}
         </DialogContent>
      </Dialog>
   )
}

export default UserDetailsModal