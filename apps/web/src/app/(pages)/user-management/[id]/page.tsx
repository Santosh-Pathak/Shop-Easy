'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
   ArrowLeft,
   Edit,
   User as UserIcon,
   Phone,
   Mail,
   MapPin,
   Shield,
   Calendar,
   AlertCircle,
   Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User } from '@/types/user'
import { UserAPI } from '@/services/apis/user.api'
import { extractApiErrorMessage, showErrorToast } from '@/utils/error'
import { getUserRoleConfig, getUserStatusColor, getUserVerificationColor } from '@/types/user'

const UserDetailsPage: React.FC = () => {
   const router = useRouter()
   const params = useParams()
   const userId = params.id as string
   const [userData, setUserData] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   // Load user data on component mount
   useEffect(() => {
      const loadUserData = async () => {
         try {
            setLoading(true)
            setError(null)
            const response = await UserAPI.getUserById(userId)
            setUserData(response)
         } catch (err) {
            const errorMessage = extractApiErrorMessage(err)
            setError(errorMessage)
            showErrorToast(errorMessage)
         } finally {
            setLoading(false)
         }
      }

      if (userId) {
         loadUserData()
      }
   }, [userId])

   const handleBack = () => {
      router.push('/user-management')
   }

   const handleEdit = () => {
      router.push(`/user-management/${userId}/edit`)
   }

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      })
   }

   return (
      <div className="container mx-auto px-4 py-6">
         <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
               <Button variant="outline" onClick={handleBack} className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Users
               </Button>
               <h1 className="text-xl sm:text-2xl font-bold theme-text-primary">User Details</h1>
            </div>
            {!loading && userData && (
               <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit User
               </Button>
            )}
         </div>

         {error && (
            <Alert variant="destructive" className="mb-6 theme-border">
               <AlertCircle className="h-4 w-4" />
               <AlertDescription className="theme-text-primary">{error}</AlertDescription>
            </Alert>
         )}

         {loading ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
               <Card className="theme-border theme-bg-secondary">
                  <CardHeader>
                     <Skeleton className="h-6 w-40 theme-bg-tertiary" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <Skeleton className="h-4 w-full theme-bg-tertiary" />
                     <Skeleton className="h-4 w-3/4 theme-bg-tertiary" />
                     <Skeleton className="h-4 w-1/2 theme-bg-tertiary" />
                  </CardContent>
               </Card>
               <Card className="theme-border theme-bg-secondary">
                  <CardHeader>
                     <Skeleton className="h-6 w-40 theme-bg-tertiary" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <Skeleton className="h-4 w-full theme-bg-tertiary" />
                     <Skeleton className="h-4 w-3/4 theme-bg-tertiary" />
                     <Skeleton className="h-4 w-1/2 theme-bg-tertiary" />
                  </CardContent>
               </Card>
            </div>
         ) : userData ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                     {/* Personal Information */}
                     <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30 shadow-lg">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2 theme-text-primary">
                              <UserIcon className="h-5 w-5" />
                              Personal Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {userData.photo && (
                              <div className="flex justify-center mb-4">
                                 <img 
                                    src={userData.photo} 
                                    alt={userData.name}
                                    className="h-20 w-20 rounded-full object-cover border-2 theme-border"
                                 />
                              </div>
                           )}
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 Full Name
                              </div>
                              <p className="text-base font-semibold theme-text-primary">
                                 {userData.name || 'Not provided'}
                              </p>
                           </div>
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 Email Address
                              </div>
                              <p className="text-base theme-text-primary break-all">{userData.email}</p>
                           </div>
                           {userData.phone && (
                              <div>
                                 <div className="text-sm font-medium theme-text-secondary">
                                    Phone Number
                                 </div>
                                 <p className="text-base theme-text-primary">{userData.phone}</p>
                              </div>
                           )}
                        </CardContent>
                     </Card>

                     {/* Contact Information */}
                     <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30 shadow-lg">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2 theme-text-primary">
                              <MapPin className="h-5 w-5" />
                              Address Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {userData.postalCode && (
                              <div>
                                 <div className="text-sm font-medium theme-text-secondary">
                                    Postal Code
                                 </div>
                                 <p className="text-base theme-text-primary">{userData.postalCode}</p>
                              </div>
                           )}
                           {userData.address && (
                              <div>
                                 <div className="text-sm font-medium theme-text-secondary">
                                    Address
                                 </div>
                                 <p className="text-base theme-text-primary break-words">{userData.address}</p>
                              </div>
                           )}
                           {!userData.postalCode && !userData.address && (
                              <p className="text-sm theme-text-secondary italic">
                                 No address information provided
                              </p>
                           )}
                        </CardContent>
                     </Card>

                     {/* Account Information */}
                     <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30 shadow-lg">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2 theme-text-primary">
                              <Shield className="h-5 w-5" />
                              Account Information
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 User ID
                              </div>
                              <p className="text-sm font-mono break-all theme-text-primary">
                                 {userData._id}
                              </p>
                           </div>
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 Role & Permissions
                              </div>
                              <div className="mt-1">
                                 <Badge className={getUserRoleConfig(userData.role).color}>
                                    <Shield className="mr-1 h-3 w-3" />
                                    {getUserRoleConfig(userData.role).label}
                                 </Badge>
                              </div>
                              <p className="text-xs theme-text-secondary mt-1">
                                 {getUserRoleConfig(userData.role).description}
                              </p>
                           </div>
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 Account Status
                              </div>
                              <div className="mt-1 flex flex-wrap gap-2">
                                 <Badge className={getUserStatusColor(userData.active)}>
                                    {userData.active ? 'Active' : 'Inactive'}
                                 </Badge>
                                 <Badge className={getUserVerificationColor(userData.isEmailVerified)}>
                                    {userData.isEmailVerified ? 'Verified' : 'Unverified'}
                                 </Badge>
                              </div>
                           </div>
                        </CardContent>
                     </Card>

                     {/* Timeline Information */}
                     <Card className="theme-border border-0 bg-gradient-to-br from-white/50 to-white/30 backdrop-blur-sm dark:from-gray-900/50 dark:to-gray-900/30 shadow-lg">
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2 theme-text-primary">
                              <Calendar className="h-5 w-5" />
                              Timeline
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 Account Created
                              </div>
                              <p className="text-base theme-text-primary">
                                 {formatDate(userData.createdAt)}
                              </p>
                           </div>
                           <div>
                              <div className="text-sm font-medium theme-text-secondary">
                                 Last Updated
                              </div>
                              <p className="text-base theme-text-primary">
                                 {formatDate(userData.updatedAt)}
                              </p>
                           </div>
                        </CardContent>
                  </Card>
               </div>
            ) : (
               <div className="py-12 text-center">
                  <p className="theme-text-secondary">User not found</p>
               </div>
            )}
         </div>
      
   )
}

export default UserDetailsPage