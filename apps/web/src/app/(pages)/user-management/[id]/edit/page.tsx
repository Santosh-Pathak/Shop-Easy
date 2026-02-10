'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserCreateEditModal } from '@/components/user-management'
import { User } from '@/types/user'
import { UserAPI } from '@/services/apis/user.api'
import { extractApiErrorMessage, showErrorToast } from '@/utils/error'

export default function EditUserPage() {
   const params = useParams()
   const router = useRouter()
   const userId = params.id as string
   const [user, setUser] = useState<User | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)

   // Load user data
   useEffect(() => {
      const loadUserData = async () => {
         try {
            setLoading(true)
            setError(null)
            const userData = await UserAPI.getUserById(userId)
            setUser(userData)
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

   const handleSuccess = () => {
      // Navigate back to the user management list after successful edit
      router.push('/user-management')
   }

   const handleClose = () => {
      // Navigate back to the user management list if user cancels
      router.push('/user-management')
   }

   if (loading) {
      return (
         <div className="container mx-auto px-4 py-6">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleClose} className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary">
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
         </div>
      )
   }

   if (error || !user) {
      return (
         <div className="container mx-auto px-4 py-6">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handleClose} className="theme-border theme-bg-secondary hover:bg-[var(--bg-tertiary)] theme-text-primary">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back
                  </Button>
                  <div>
                     <h1 className="text-2xl font-bold theme-text-primary">Failed to Load User</h1>
                     <p className="text-sm theme-text-secondary">{error || 'User not found'}</p>
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="container mx-auto px-4 py-6">
         <UserCreateEditModal
            isOpen={true}
            onClose={handleClose}
            onSuccess={handleSuccess}
            asPage={true}
            user={user}
            mode="edit"
         />
      </div>
   )
}