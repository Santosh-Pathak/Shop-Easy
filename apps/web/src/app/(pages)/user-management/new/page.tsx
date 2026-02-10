'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserCreateEditModal } from '@/components/user-management'
import { User } from '@/types/user'

export default function NewUserPage() {
   const router = useRouter()

   const handleSuccess = (user: User) => {
      router.push('/user-management')
   }

   const handleClose = () => {
      router.push('/user-management')
   }

   return (
      <div className="container mx-auto px-4 py-6">
         <UserCreateEditModal
            isOpen={true}
            onClose={handleClose}
            onSuccess={handleSuccess}
            mode="create"
            asPage={true}
         />
      </div>
   )
}