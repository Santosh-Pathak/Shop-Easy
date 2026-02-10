'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Loader2, ArrowRight, Clock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { searchAPI } from '@/services/apis/search.api'
import { SearchResult, SearchCategory } from '@/types/search.types'

interface NavbarSearchProps {
   placeholder?: string
   className?: string
   isMobile?: boolean
   onResultClick?: () => void
}

const categoryIcons: Record<SearchCategory, string> = {
   customers: '👤',
   leads: '🎯',
   quotations: '📄',
   purchase_orders: '📝',
   reports: '📊',
   analytics: '📈',
   users: '�',
   settings: '⚙️',
   pages: '📖',
   documents: '📁',
   general: '🔍',
}

const categoryLabels: Record<SearchCategory, string> = {
   customers: 'Customers',
   leads: 'Leads',
   quotations: 'Quotations',
   purchase_orders: 'Purchase Orders',
   reports: 'Reports',
   analytics: 'Analytics',
   users: 'Users',
   settings: 'Settings',
   pages: 'Pages',
   documents: 'Documents',
   general: 'General',
}

const NavbarSearch: React.FC<NavbarSearchProps> = ({
   placeholder = 'Search leads, customers, quotations, users, reports...',
   className,
   isMobile = false,
   onResultClick,
}) => {
   const router = useRouter()
   const [query, setQuery] = useState('')
   const [results, setResults] = useState<SearchResult[]>([])
   const [isLoading, setIsLoading] = useState(false)
   const [isOpen, setIsOpen] = useState(false)
   const [selectedIndex, setSelectedIndex] = useState(-1)
   const [recentSearches, setRecentSearches] = useState<string[]>([])

   const searchRef = useRef<HTMLInputElement>(null)
   const dropdownRef = useRef<HTMLDivElement>(null)
   const debounceRef = useRef<NodeJS.Timeout | null>(null)

   // Load recent searches
   useEffect(() => {
      const stored = localStorage.getItem('recentSearches')
      if (stored) {
         try {
            const parsed = JSON.parse(stored)
            setRecentSearches(parsed.slice(0, 5))
         } catch (error) {
            console.error('Failed to load recent searches:', error)
         }
      }
   }, [])

   // Debounced search
   const debouncedSearch = useCallback(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
         setResults([])
         setIsLoading(false)
         return
      }

      setIsLoading(true)

      try {
         const response = await searchAPI.search({
            query: searchQuery,
            filters: {
               category: undefined, // Search across all categories
            },
            limit: 20,
            offset: 0,
         })

         setResults(response.results)
         setSelectedIndex(-1)
      } catch (error) {
         console.error('Search error:', error)
         setResults([])
      } finally {
         setIsLoading(false)
      }
   }, [])

   // Handle input change
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)

      if (debounceRef.current) {
         clearTimeout(debounceRef.current)
      }

      if (value.trim().length === 0) {
         setResults([])
         setIsLoading(false)
         return
      }

      debounceRef.current = setTimeout(() => {
         debouncedSearch(value.trim())
      }, 250)
   }

   // Handle input focus
   const handleFocus = () => {
      setIsOpen(true)
   }

   // Handle result click
   const handleResultClick = (result: SearchResult) => {
      // Save to recent searches
      const newRecentSearches = [
         query,
         ...recentSearches.filter((q) => q !== query),
      ].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))

      // Navigate and close
      router.push(result.url)
      setQuery('')
      setResults([])
      setIsOpen(false)

      // Call parent callback if provided (for mobile overlay)
      onResultClick?.()
   }

   // Handle recent search click
   const handleRecentSearchClick = (recentQuery: string) => {
      setQuery(recentQuery)
      debouncedSearch(recentQuery)
      searchRef.current?.focus()
   }

   // Handle keyboard navigation
   const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
         case 'ArrowDown':
            e.preventDefault()
            setSelectedIndex((prev) =>
               prev < results.length - 1 ? prev + 1 : 0
            )
            break
         case 'ArrowUp':
            e.preventDefault()
            setSelectedIndex((prev) =>
               prev > 0 ? prev - 1 : results.length - 1
            )
            break
         case 'Enter':
            e.preventDefault()
            if (selectedIndex >= 0 && results[selectedIndex]) {
               handleResultClick(results[selectedIndex])
            }
            break
         case 'Escape':
            setIsOpen(false)
            searchRef.current?.blur()
            break
      }
   }

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            !searchRef.current?.contains(event.target as Node)
         ) {
            setIsOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   // Group results by category
   const groupedResults = results.reduce(
      (groups: Record<string, SearchResult[]>, result) => {
         const category = result.category
         if (!groups[category]) {
            groups[category] = []
         }
         groups[category].push(result)
         return groups
      },
      {}
   )

   // Cleanup debounce on unmount
   useEffect(() => {
      return () => {
         if (debounceRef.current) {
            clearTimeout(debounceRef.current)
         }
      }
   }, [])

   return (
      <div className={cn('relative', className)}>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <input
               ref={searchRef}
               type="text"
               placeholder={placeholder}
               value={query}
               onChange={handleInputChange}
               onFocus={handleFocus}
               onKeyDown={handleKeyDown}
               className="w-full rounded-md border border-white/20 bg-white/10 py-2 pl-10 pr-10 text-white transition-all duration-200 placeholder:text-white/60 focus:border-white/40 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/40"
               autoComplete="off"
            />
            {query && (
               <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 text-white/60 hover:text-white"
                  onClick={() => {
                     setQuery('')
                     setResults([])
                     setIsOpen(false)
                  }}
               >
                  <X className="h-3 w-3" />
               </Button>
            )}
         </div>

         {/* Search Dropdown */}
         {isOpen && (
            <div
               ref={dropdownRef}
               className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            >
               <div className="max-h-80 overflow-y-auto">
                  {isLoading && (
                     <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">
                           Searching...
                        </span>
                     </div>
                  )}

                  {!isLoading && query.length >= 2 && results.length === 0 && (
                     <div className="py-8 text-center">
                        <p className="text-sm text-gray-500">
                           No results found for "{query}"
                        </p>
                     </div>
                  )}

                  {!isLoading &&
                     query.length < 2 &&
                     recentSearches.length > 0 && (
                        <div className="p-3">
                           <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                 Recent Searches
                              </h3>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setRecentSearches([])
                                    localStorage.removeItem('recentSearches')
                                 }}
                                 className="h-6 text-xs text-gray-400 hover:text-gray-600"
                              >
                                 Clear
                              </Button>
                           </div>
                           <div className="space-y-1">
                              {recentSearches.map((recent, index) => (
                                 <button
                                    key={index}
                                    onClick={() =>
                                       handleRecentSearchClick(recent)
                                    }
                                    className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm transition-colors hover:bg-gray-50"
                                 >
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="flex-1">{recent}</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                  {!isLoading && results.length > 0 && (
                     <div className="py-2">
                        {Object.entries(groupedResults).map(
                           ([category, categoryResults]) => (
                              <div key={category} className="mb-4 last:mb-0">
                                 <div className="border-b border-gray-100 bg-gray-50 px-3 py-1">
                                    <h3 className="flex items-center gap-1 text-xs font-medium text-gray-600">
                                       <span>
                                          {
                                             categoryIcons[
                                                category as SearchCategory
                                             ]
                                          }
                                       </span>
                                       {
                                          categoryLabels[
                                             category as SearchCategory
                                          ]
                                       }
                                       <Badge
                                          variant="outline"
                                          className="ml-auto text-xs"
                                       >
                                          {categoryResults.length}
                                       </Badge>
                                    </h3>
                                 </div>
                                 <div className="py-1">
                                    {categoryResults.map((result, index) => {
                                       const globalIndex =
                                          results.indexOf(result)
                                       const isSelected =
                                          globalIndex === selectedIndex

                                       return (
                                          <button
                                             key={result.id}
                                             onClick={() =>
                                                handleResultClick(result)
                                             }
                                             className={cn(
                                                'flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-blue-50',
                                                isSelected &&
                                                   'border-r-2 border-blue-500 bg-blue-50'
                                             )}
                                          >
                                             <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900">
                                                   {result.title}
                                                </p>
                                                {result.description && (
                                                   <p className="truncate text-xs text-gray-500">
                                                      {result.description}
                                                   </p>
                                                )}
                                                {result.description && (
                                                   <p className="mt-1 truncate text-xs text-gray-400">
                                                      {result.description}
                                                   </p>
                                                )}
                                             </div>
                                             <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                          </button>
                                       )
                                    })}
                                 </div>
                              </div>
                           )
                        )}
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   )
}

export default NavbarSearch
