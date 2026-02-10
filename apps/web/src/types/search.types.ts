// Search-related types

export interface SearchResult {
   id: string
   title: string
   description: string
   category: SearchCategory
   url: string
   relevanceScore?: number
}

export type SearchCategory =
   | 'customers'
   | 'leads'
   | 'quotations'
   | 'purchase_orders'
   | 'reports'
   | 'analytics'
   | 'users'
   | 'settings'
   | 'pages'
   | 'documents'
   | 'general'

export interface SearchFilters {
   category?: SearchCategory
   dateRange?: {
      from: Date
      to: Date
   }
   status?: string
}

export interface SearchRequest {
   query: string
   filters?: SearchFilters
   limit?: number
   offset?: number
}

export interface SearchResponse {
   results: SearchResult[]
   total: number
   hasMore: boolean
   suggestions?: string[]
}

export interface SearchState {
   query: string
   results: SearchResult[]
   isLoading: boolean
   isOpen: boolean
   selectedIndex: number
   recentSearches: string[]
}

export interface SearchConfig {
   enableRecentSearches: boolean
   enableSuggestions: boolean
   maxResults: number
   debounceMs: number
   enableCategories: boolean
   enableKeyboardNavigation: boolean
}

export interface RecentSearch {
   query: string
   timestamp: Date
   category?: SearchCategory
}

export interface CachedSearchResult {
   query: string
   results: SearchResult[]
   timestamp: Date
   expiresAt: Date
}
