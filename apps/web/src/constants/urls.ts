/**
 * API endpoint constants - Based on backend documentation
 */
export const API_ENDPOINTS = {
   AUTH: {
      // Public auth endpoints
      SIGNUP: '/api/v1/auth/signup',
      LOGIN: '/api/v1/auth/login',
      LOGOUT: '/api/v1/auth/logout',
      SEND_VERIFICATION_EMAIL: '/api/v1/auth/send-verification-email',
      VERIFY_EMAIL: '/api/v1/auth/verify-email',
      FORGET_PASSWORD: '/api/v1/auth/forget-password',
      VERIFY_OTP: '/api/v1/auth/verify-otp',
      RESET_PASSWORD: '/api/v1/auth/reset-password',

      // Token management - Backend only has /refresh endpoint
      REFRESH: '/api/v1/auth/refresh',

      // Protected profile endpoints
      PROFILE: '/api/v1/auth/profile',
      UPDATE_PROFILE: '/api/v1/auth/profile',
      UPDATE_PASSWORD: '/api/v1/auth/update-password',
      DELETE_ACCOUNT: '/api/v1/auth/delete-account',

      // Admin endpoints
      REGISTER_USER: '/api/v1/auth/register-user',
      GET_USERS: '/api/v1/users',
      UPLOAD_FILE: '/api/v1/file/azure-upload',
   },
   LEAD: {
      // Lead management endpoints
      GET_ALL: '/api/v1/lead',
      CREATE: '/api/v1/lead',
      GET_BY_ID: '/api/v1/lead/:id',
      UPDATE: '/api/v1/lead/:id',
      DELETE: '/api/v1/lead/:id',
      BULK_IMPORT: '/api/v1/lead/bulk-lead-register',
      BULK_VALIDATE: '/api/v1/lead/bulk-lead-validate',
      DOWNLOAD_TEMPLATE: '/api/v1/lead/bulk-lead-template',
   },
   THEME: {
      // Theme management endpoints
      GET_ALL: '/api/v1/theme',
      CREATE: '/api/v1/theme',
      GET_BY_ID: '/api/v1/theme/:id',
      UPDATE: '/api/v1/theme/:id',
      DELETE: '/api/v1/theme/:id',
      DUPLICATE: '/api/v1/theme/:id/duplicate',
      VALIDATE: '/api/v1/theme/validate',
      VALIDATE_THEME: '/api/v1/theme/:id/validate',
      EXPORT: '/api/v1/theme/:id/export',
      IMPORT: '/api/v1/theme/import',
      SET_DEFAULT: '/api/v1/theme/:id/set-default',
      GET_ACTIVE: '/api/v1/theme/active',
      ACTIVATE: '/api/v1/theme/:id/activate',
   },
   USER: {
      // User management endpoints (admin)
      GET_ALL: '/api/v1/users',
      CREATE: '/api/v1/users',
      GET_BY_ID: '/api/v1/users/:id',
      UPDATE: '/api/v1/users/:id',
      DELETE: '/api/v1/users/:id',

      // Auth-related user endpoints
      PROFILE: '/api/v1/auth/profile',
      UPDATE_PROFILE: '/api/v1/auth/profile',
      CHANGE_PASSWORD: '/api/v1/auth/update-password',
   },
} as const

export const ROUTES = {
   HOME: '/',
   LOGIN: '/login',
   REGISTER: '/register',
   SIGNUP: '/register',
   VERIFY_EMAIL: '/verify-email',
   VERIFY_OTP: '/verify-otp',
   DASHBOARD: '/dashboard',
   PROFILE: '/profile',
   FORGOT_PASSWORD: '/forgot-password',
   RESET_PASSWORD: '/reset-password',
   TWO_FACTOR_AUTH: '/two-factor-authentication',
   ACCESS_DENIED: '/access-denied',
   UNAUTHORIZED: '/unauthorized',

   // CRM Routes - Updated for current system
   LEAD_MANAGEMENT: '/lead-management',
   NEW_LEAD: '/lead-management/new',
   LEAD_BULK_IMPORT: '/lead-management/bulk-import',
   QUOTATIONS: '/quotations',
   PURCHASE_ORDERS: '/purchase-orders',
   REPORTS: '/reports',
   ANALYTICS: '/analytics',
   USER_MANAGEMENT: '/user-management',
   THEME_MANAGEMENT: '/themes',
   SETTINGS: '/settings',
} as const

// E-Commerce API base URL (NestJS backend). Set NEXT_PUBLIC_API_URL in .env.local
export const BASE_URL =
   process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'

export const CACHE_TIME = {
   SHORT: 1000 * 60 * 5, // 5 minutes
   MEDIUM: 1000 * 60 * 15, // 15 minutes
   LONG: 1000 * 60 * 60, // 1 hour
} as const

export const STORAGE_KEYS = {
   ACCESS_TOKEN: 'accessToken',
   REFRESH_TOKEN: 'refreshToken',
   USER: 'user',
   THEME: 'theme',
   AUTH_STORAGE: 'auth-storage',
   SESSION_ID: 'sessionId',
} as const

export const ROLES = {
   SUPER_ADMIN: 'superAdmin',
   ADMIN: 'admin',
   CUSTOMER: 'customer',
   USER: 'customer', // default user role
} as const

export const PERMISSIONS = {
   // User permissions
   VIEW_PROFILE: 'view:profile',
   EDIT_PROFILE: 'edit:profile',
   DELETE_ACCOUNT: 'delete:account',

   // Lead management permissions according to FRD
   VIEW_LEADS: 'view:leads',
   CREATE_LEADS: 'create:leads',
   EDIT_LEADS: 'edit:leads',
   DELETE_LEADS: 'delete:leads',
   BULK_IMPORT_LEADS: 'bulk:leads',
   CONVERT_LEADS: 'convert:leads',

   // Quotation management permissions
   VIEW_QUOTATIONS: 'view:quotations',
   CREATE_QUOTATIONS: 'create:quotations',
   EDIT_QUOTATIONS: 'edit:quotations',
   DELETE_QUOTATIONS: 'delete:quotations',
   APPROVE_QUOTATIONS: 'approve:quotations',
   EXPORT_QUOTATIONS: 'export:quotations',

   // Purchase Order management permissions
   VIEW_PURCHASE_ORDERS: 'view:purchase_orders',
   CREATE_PURCHASE_ORDERS: 'create:purchase_orders',
   EDIT_PURCHASE_ORDERS: 'edit:purchase_orders',
   DELETE_PURCHASE_ORDERS: 'delete:purchase_orders',
   APPROVE_PURCHASE_ORDERS: 'approve:purchase_orders',
   EXPORT_PURCHASE_ORDERS: 'export:purchase_orders',

   // Admin permissions
   MANAGE_USERS: 'manage:users',
   VIEW_ANALYTICS: 'view:analytics',
   SYSTEM_CONFIG: 'system:config',
   GENERATE_REPORTS: 'generate:reports',

   // Theme management permissions
   VIEW_THEMES: 'view:themes',
   CREATE_THEMES: 'create:themes',
   EDIT_THEMES: 'edit:themes',
   DELETE_THEMES: 'delete:themes',
   MANAGE_THEMES: 'manage:themes',
   EXPORT_THEMES: 'export:themes',
   IMPORT_THEMES: 'import:themes',
} as const
