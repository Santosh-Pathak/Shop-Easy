'use client'

import React from 'react'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { AppLayout } from '@/components/layout/AppLayout'

interface LayoutWrapperProps {
   children: React.ReactNode
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
   return (
      <AuthGuard>
         <AppLayout>{children}</AppLayout>
      </AuthGuard>
   )
}

export default LayoutWrapper
