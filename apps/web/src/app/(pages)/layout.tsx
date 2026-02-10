import { ReactNode } from 'react'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

interface PagesLayoutProps {
   children: ReactNode
}

export default function PagesLayout({ children }: PagesLayoutProps) {
   return <LayoutWrapper>{children}</LayoutWrapper>
}
