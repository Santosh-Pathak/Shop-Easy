/**
 * @ecommerce/types
 * Shared TypeScript types for API and Web. Keep in sync with Prisma schema and API DTOs.
 */

// Re-export enums (mirror Prisma)
export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type AddressType = 'SHIPPING' | 'BILLING';

// API response shapes (minimal for Day 1)
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
