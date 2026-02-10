export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  data?: T;
  meta?: {
    results?: number;
    limit?: number;
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
  };
  timestamp: string;
}

export interface ErrorResponse {
  status: string;
  message: string;
  timestamp: string;
  path?: string;
  error?: unknown;
  stack?: string;
}
