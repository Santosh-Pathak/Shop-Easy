import { UserManagement } from '@/components/user-management'

export default function UserManagementPage() {
   return (
      <div className="min-h-screen theme-bg-secondary/30">
         <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <UserManagement />
         </div>
      </div>
   )
}