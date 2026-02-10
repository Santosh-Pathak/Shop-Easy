'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth.store'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/theme-utils'

export default function DashboardPage() {
   const { user } = useAuthStore()
   // Theme context available for future enhancements
   useTheme()

   // Dynamic stats based on user role - Updated for CRM system
   const getStatsForRole = (userRole: string) => {
      // CRM Lead-to-Purchase Order stats for Admin/SuperAdmin
      if (userRole === 'admin' || userRole === 'superAdmin') {
         return [
            {
               title: 'Total Leads',
               value: '2,456',
               icon: Users,
               change: '+12.5%',
               changeType: 'positive' as const,
            },
            {
               title: 'Qualified Leads',
               value: '892',
               icon: TrendingUp,
               change: '+8.2%',
               changeType: 'positive' as const,
            },
            {
               title: 'Quotes Generated',
               value: '234',
               icon: Activity,
               change: '+15.3%',
               changeType: 'positive' as const,
            },
            {
               title: 'Purchase Orders',
               value: '145',
               icon: DollarSign,
               change: '+5.7%',
               changeType: 'positive' as const,
            },
         ]
      }

      // Customer stats
      if (userRole === 'customer') {
         return [
            {
               title: 'My Inquiries',
               value: '5',
               icon: Activity,
               change: '+2',
               changeType: 'positive' as const,
            },
            {
               title: 'Active Quotes',
               value: '3',
               icon: TrendingUp,
               change: '+1',
               changeType: 'positive' as const,
            },
            {
               title: 'Total Orders',
               value: '8',
               icon: DollarSign,
               change: '+2',
               changeType: 'positive' as const,
            },
            {
               title: 'Order Value',
               value: '₹2.5L',
               icon: Users,
               change: '+₹0.8L',
               changeType: 'positive' as const,
            },
         ]
      }

      // Default stats
      return [
         {
            title: 'Total Users',
            value: '1,234',
            icon: Users,
            change: '+5.2%',
            changeType: 'positive' as const,
         },
         {
            title: 'Active Projects',
            value: '89',
            icon: Activity,
            change: '+12.5%',
            changeType: 'positive' as const,
         },
         {
            title: 'Revenue',
            value: '₹45.2L',
            icon: DollarSign,
            change: '+8.7%',
            changeType: 'positive' as const,
         },
         {
            title: 'Growth Rate',
            value: '15.3%',
            icon: TrendingUp,
            change: '+2.1%',
            changeType: 'positive' as const,
         },
      ]
   }

   const stats = getStatsForRole(user?.role || 'customer')

   // Dynamic welcome message based on role
   const getWelcomeMessage = (userRole: string) => {
      switch (userRole) {
         case 'superAdmin':
            return 'Welcome to your Super Admin Control Center'
         case 'admin':
            return 'Welcome to your CRM Management Dashboard'
         case 'customer':
            return 'Welcome to your Customer Portal'
         default:
            return 'Welcome to your Dashboard'
      }
   }

   // Dynamic quick actions based on role
   const getQuickActionsForRole = (userRole: string) => {
      // CRM quick actions for Admin/SuperAdmin
      if (userRole === 'admin' || userRole === 'superAdmin') {
         return [
            { title: 'Create Lead', color: 'bg-[var(--interactive-primary)]', href: '/lead-management/new' },
            { title: 'Manage Leads', color: 'bg-[var(--success-500)]', href: '/lead-management' },
            { title: 'Generate Quote', color: 'bg-[var(--warning-500)]', href: '/quotations/new' },
            { title: 'View Reports', color: 'bg-[var(--info-500)]', href: '/reports' },
         ]
      }

      // Customer quick actions
      if (userRole === 'customer') {
         return [
            {
               title: 'Submit Inquiry',
               color: 'bg-[var(--interactive-primary)]',
               href: '/inquiries/new'
            },
            { 
               title: 'View Quotes', 
               color: 'bg-[var(--success-500)]',
               href: '/quotations'
            },
            { 
               title: 'Track Orders', 
               color: 'bg-[var(--warning-500)]',
               href: '/orders'
            },
            { 
               title: 'Contact Support', 
               color: 'bg-[var(--info-500)]',
               href: '/support'
            },
         ]
      }

      // Default actions
      return [
         {
            title: 'New Project',
            color: 'bg-[var(--interactive-primary)]',
            href: '/projects/new'
         },
         { 
            title: 'View Reports', 
            color: 'bg-[var(--success-500)]',
            href: '/reports'
         },
         { 
            title: 'Manage Users', 
            color: 'bg-[var(--warning-500)]',
            href: '/user-management'
         },
         { 
            title: 'System Settings', 
            color: 'bg-[var(--info-500)]',
            href: '/settings'
         },
      ]
   }

   const quickActions = getQuickActionsForRole(user?.role || 'customer')

   return (
      <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="space-y-6"
      >
         {/* Welcome Section */}
         <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn(
               'relative overflow-hidden rounded-2xl p-8',
               'bg-gradient-to-r from-[var(--interactive-primary)]/5 via-[var(--interactive-primary)]/10 to-[var(--interactive-primary)]/5',
               'theme-border border'
            )}
         >
            <div className="relative z-10">
               <h1 className="theme-text-primary mb-2 text-3xl font-bold">
                  {getWelcomeMessage(user?.role || 'customer')} 👋
               </h1>
               <p className="theme-text-secondary text-lg">
                  Welcome back, {user?.name || 'User'}! Here&apos;s your
                  personalized overview.
               </p>
            </div>
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
         </motion.div>

         {/* Stats Grid */}
         <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
         >
            {stats.map((stat, index) => {
               const Icon = stat.icon
               return (
                  <motion.div
                     key={stat.title}
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  >
                     <Card className="theme-bg-primary theme-border transition-shadow hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <CardTitle className="theme-text-secondary text-sm font-medium">
                              {stat.title}
                           </CardTitle>
                           <Icon className="theme-text-muted h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                           <div className="theme-text-primary mb-1 text-2xl font-bold">
                              {stat.value}
                           </div>
                           <p
                              className={cn(
                                 'flex items-center text-xs',
                                 stat.changeType === 'positive'
                                    ? 'text-[var(--success-500)]'
                                    : 'text-[var(--error-500)]'
                              )}
                           >
                              <TrendingUp className="mr-1 h-3 w-3" />
                              {stat.change} from last month
                           </p>
                        </CardContent>
                     </Card>
                  </motion.div>
               )
            })}
         </motion.div>

         {/* Quick Actions */}
         <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
         >
            {/* Lead Management Section for Admin/SuperAdmin */}
            {(user?.role === 'admin' || user?.role === 'superAdmin') && (
               <Card className="theme-bg-primary theme-border">
                  <CardHeader>
                     <CardTitle className="theme-text-primary">
                        Recent Leads
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {[
                           { id: '1', name: 'John Doe Company', status: 'new', source: 'Website' },
                           { id: '2', name: 'TechCorp Solutions', status: 'qualified', source: 'Referral' },
                           { id: '3', name: 'Global Industries', status: 'sendQuote', source: 'Social Media' },
                        ].map((lead) => (
                           <div
                              key={lead.id}
                              className="theme-bg-secondary flex items-center justify-between rounded-lg p-3"
                           >
                              <div>
                                 <p className="theme-text-primary font-medium">
                                    {lead.name}
                                 </p>
                                 <p className="theme-text-muted text-sm">
                                    Source: {lead.source}
                                 </p>
                              </div>
                              <div className={cn(
                                 'rounded-full px-2 py-1 text-xs text-white',
                                 lead.status === 'new' && 'bg-blue-500',
                                 lead.status === 'qualified' && 'bg-green-500',
                                 lead.status === 'sendQuote' && 'bg-orange-500'
                              )}>
                                 {lead.status === 'new' && 'New'}
                                 {lead.status === 'qualified' && 'Qualified'}
                                 {lead.status === 'sendQuote' && 'Quote Sent'}
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            )}

            {/* Default Recent Inquiries for customer */}
            {user?.role === 'customer' && (
               <Card className="theme-bg-primary theme-border">
                  <CardHeader>
                     <CardTitle className="theme-text-primary">
                        Recent Inquiries
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {[
                           { id: '1', title: 'Office Equipment Quote', status: 'pending', date: '2 hours ago' },
                           { id: '2', title: 'Software License Request', status: 'quoted', date: '1 day ago' },
                           { id: '3', title: 'Hardware Procurement', status: 'completed', date: '3 days ago' },
                        ].map((inquiry) => (
                           <div
                              key={inquiry.id}
                              className="theme-bg-secondary flex items-center justify-between rounded-lg p-3"
                           >
                              <div>
                                 <p className="theme-text-primary font-medium">
                                    {inquiry.title}
                                 </p>
                                 <p className="theme-text-muted text-sm">
                                    Submitted {inquiry.date}
                                 </p>
                              </div>
                              <div className={cn(
                                 'rounded-full px-2 py-1 text-xs text-white',
                                 inquiry.status === 'pending' && 'bg-orange-500',
                                 inquiry.status === 'quoted' && 'bg-blue-500',
                                 inquiry.status === 'completed' && 'bg-green-500'
                              )}>
                                 {inquiry.status === 'pending' && 'Pending'}
                                 {inquiry.status === 'quoted' && 'Quoted'}
                                 {inquiry.status === 'completed' && 'Completed'}
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            )}

            {/* Default section for other roles */}
            {!(user?.role === 'admin' || user?.role === 'superAdmin' || user?.role === 'customer') && (
               <Card className="theme-bg-primary theme-border">
                  <CardHeader>
                     <CardTitle className="theme-text-primary">
                        Recent Activity
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                           <div
                              key={item}
                              className="theme-bg-secondary flex items-center justify-between rounded-lg p-3"
                           >
                              <div>
                                 <p className="theme-text-primary font-medium">
                                    Activity #{item}234
                                 </p>
                                 <p className="theme-text-muted text-sm">
                                    Updated 2 hours ago
                                 </p>
                              </div>
                              <div className="rounded-full bg-[var(--warning-500)] px-2 py-1 text-xs text-white">
                                 Active
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            )}

            <Card className="theme-bg-primary theme-border">
               <CardHeader>
                  <CardTitle className="theme-text-primary">
                     Quick Actions
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                     {quickActions.map((action: any) => (
                        <button
                           key={action.title}
                           className={cn(
                              'rounded-lg p-4 text-sm font-medium text-white',
                              'transition-transform hover:scale-105',
                              action.color
                           )}
                           onClick={() => {
                              if (action.href) {
                                 // Navigate to the specified route
                                 window.location.href = action.href
                              }
                           }}
                        >
                           {action.title}
                        </button>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </motion.div>

         {/* Lead Management Workflow for Admin/SuperAdmin */}
         {(user?.role === 'admin' || user?.role === 'superAdmin') && (
            <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.5, delay: 0.4 }}
               className="space-y-6"
            >
               <Card className="theme-bg-primary theme-border">
                  <CardHeader>
                     <CardTitle className="theme-text-primary">
                        Lead to Purchase Order Workflow
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Lead Management */}
                        <div className="space-y-4">
                           <h3 className="theme-text-primary text-lg font-semibold">Lead Management</h3>
                           <div className="space-y-2">
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">New Leads</p>
                                 <p className="theme-text-muted text-sm">34 leads this week</p>
                              </div>
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Qualified Leads</p>
                                 <p className="theme-text-muted text-sm">23 ready for quotes</p>
                              </div>
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Converted Leads</p>
                                 <p className="theme-text-muted text-sm">12 won this month</p>
                              </div>
                           </div>
                        </div>

                        {/* Quotation Management */}
                        <div className="space-y-4">
                           <h3 className="theme-text-primary text-lg font-semibold">Quotations</h3>
                           <div className="space-y-2">
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Draft Quotes</p>
                                 <p className="theme-text-muted text-sm">8 pending approval</p>
                              </div>
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Sent Quotes</p>
                                 <p className="theme-text-muted text-sm">15 awaiting response</p>
                              </div>
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Accepted Quotes</p>
                                 <p className="theme-text-muted text-sm">7 ready for PO</p>
                              </div>
                           </div>
                        </div>

                        {/* Purchase Orders */}
                        <div className="space-y-4">
                           <h3 className="theme-text-primary text-lg font-semibold">Purchase Orders</h3>
                           <div className="space-y-2">
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Draft POs</p>
                                 <p className="theme-text-muted text-sm">3 awaiting approval</p>
                              </div>
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Approved POs</p>
                                 <p className="theme-text-muted text-sm">12 in progress</p>
                              </div>
                              <div className="theme-bg-secondary rounded-lg p-3">
                                 <p className="theme-text-primary font-medium">Completed POs</p>
                                 <p className="theme-text-muted text-sm">28 this quarter</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </motion.div>
         )}
      </motion.div>
   )
}
