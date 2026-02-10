'use client'

import { ChevronDown, Loader2, Search, User, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SearchableSelectOption {
   id: string
   label: string
   email?: string
   phone?: string
   photo?: string
   [key: string]: unknown
}

interface SearchableSelectProps {
   options: SearchableSelectOption[]
   value?: SearchableSelectOption | null
   onChange: (option: SearchableSelectOption | null) => void
   placeholder?: string
   searchPlaceholder?: string
   isLoading?: boolean
   onSearch?: (query: string) => void
   debounceMs?: number
   className?: string
   disabled?: boolean
   allowClear?: boolean
   emptyMessage?: string
}

// Component for safe image rendering
const SafeImage: React.FC<{
   src: string
   alt: string
   width: number
   height: number
   className: string
}> = ({ src, alt, width, height, className }) => {
   const [imageError, setImageError] = useState(false)

   if (imageError || !src) {
      return (
         <div
            className={`flex items-center justify-center bg-gray-200 ${className}`}
         >
            <User className="size-4 text-gray-400" />
         </div>
      )
   }

   return (
      <Image
         src={src}
         alt={alt}
         width={width}
         height={height}
         className={className}
         onError={() => setImageError(true)}
         unoptimized={src.includes('vecteezy.com')} // Skip optimization for external images that might not be configured
      />
   )
}

interface SearchableSelectProps {
   options: SearchableSelectOption[]
   value?: SearchableSelectOption | null
   onChange: (option: SearchableSelectOption | null) => void
   placeholder?: string
   searchPlaceholder?: string
   isLoading?: boolean
   onSearch?: (query: string) => void
   debounceMs?: number
   className?: string
   disabled?: boolean
   allowClear?: boolean
   emptyMessage?: string
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
   options = [],
   value,
   onChange,
   placeholder = 'Select an option',
   searchPlaceholder = 'Search...',
   isLoading = false,
   onSearch,
   debounceMs = 300,
   className = '',
   disabled = false,
   allowClear = true,
   emptyMessage = 'No results found',
}) => {
   const [isOpen, setIsOpen] = useState(false)
   const [searchQuery, setSearchQuery] = useState('')
   const [filteredOptions, setFilteredOptions] = useState(options)
   const [highlightedIndex, setHighlightedIndex] = useState(-1)

   const searchRef = useRef<HTMLInputElement>(null)
   const dropdownRef = useRef<HTMLDivElement>(null)
   const debounceRef = useRef<NodeJS.Timeout | null>(null)

   // Filter options based on search query
   useEffect(() => {
      if (!searchQuery.trim()) {
         setFilteredOptions(options)
         return
      }

      const filtered = options.filter(
         (option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (option.email &&
               option.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredOptions(filtered)
      setHighlightedIndex(-1)
   }, [options, searchQuery])

   // Debounced search
   useEffect(() => {
      if (debounceRef.current) {
         clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
         if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery)
         }
      }, debounceMs)

      return () => {
         if (debounceRef.current) {
            clearTimeout(debounceRef.current)
         }
      }
   }, [searchQuery, onSearch, debounceMs])

   // Handle click outside to close dropdown
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false)
         }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
   }, [])

   // Handle keyboard navigation
   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
         if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(true)
         }
         return
      }

      switch (e.key) {
         case 'ArrowDown':
            e.preventDefault()
            setHighlightedIndex((prev) =>
               prev < filteredOptions.length - 1 ? prev + 1 : 0
            )
            break
         case 'ArrowUp':
            e.preventDefault()
            setHighlightedIndex((prev) =>
               prev > 0 ? prev - 1 : filteredOptions.length - 1
            )
            break
         case 'Enter':
            e.preventDefault()
            if (
               highlightedIndex >= 0 &&
               highlightedIndex < filteredOptions.length
            ) {
               handleSelectOption(filteredOptions[highlightedIndex])
            }
            break
         case 'Escape':
            setIsOpen(false)
            break
      }
   }

   const handleSelectOption = (option: SearchableSelectOption) => {
      onChange(option)
      setIsOpen(false)
      setSearchQuery('')
      setHighlightedIndex(-1)
   }

   const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
      setSearchQuery('')
   }

   const handleToggle = () => {
      if (disabled) return
      setIsOpen(!isOpen)
      if (!isOpen) {
         setTimeout(() => searchRef.current?.focus(), 100)
      }
   }

   return (
      <div className={`relative ${className}`} ref={dropdownRef}>
         {/* Trigger Button */}
         <Button
            type="button"
            variant="outline"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`h-10 w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
               disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
            }`}
         >
            <span className="block truncate">
               {value ? (
                  <div className="flex items-center gap-2">
                     {value.photo ? (
                        <SafeImage
                           src={value.photo}
                           alt={value.label}
                           width={20}
                           height={20}
                           className="size-5 rounded-full object-cover"
                        />
                     ) : (
                        <User className="size-4 text-gray-400" />
                     )}
                     <span className="font-medium">{value.label}</span>
                     {value.email && (
                        <span className="text-sm text-gray-500">
                           ({value.email})
                        </span>
                     )}
                  </div>
               ) : (
                  <span className="text-gray-500">{placeholder}</span>
               )}
            </span>
            <div className="flex items-center gap-1">
               {value && allowClear && (
                  <X
                     className="size-4 cursor-pointer text-gray-400 hover:text-gray-600"
                     onClick={handleClear}
                  />
               )}
               <ChevronDown
                  className={`size-4 text-gray-400 transition-transform ${
                     isOpen ? 'rotate-180' : ''
                  }`}
               />
            </div>
         </Button>

         {/* Dropdown */}
         {isOpen && (
            <Card className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
               <CardContent className="p-0">
                  {/* Search Input */}
                  <div className="border-b border-gray-200 p-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                        <Input
                           ref={searchRef}
                           type="text"
                           placeholder={searchPlaceholder}
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           onKeyDown={handleKeyDown}
                           className="w-full rounded-md border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        {isLoading && (
                           <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-blue-500" />
                        )}
                     </div>
                  </div>

                  {/* Options List */}
                  <div className="max-h-48 overflow-y-auto">
                     {filteredOptions.length === 0 ? (
                        <div className="p-3 text-center text-gray-500">
                           {isLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                 <Loader2 className="size-4 animate-spin" />
                                 <span>Searching...</span>
                              </div>
                           ) : (
                              emptyMessage
                           )}
                        </div>
                     ) : (
                        filteredOptions.map((option, index) => (
                           <div
                              key={option.id}
                              onClick={() => handleSelectOption(option)}
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleSelectOption(option)
                                 }
                              }}
                              role="button"
                              tabIndex={0}
                              className={`cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50 ${
                                 index === highlightedIndex ? 'bg-blue-50' : ''
                              } ${value?.id === option.id ? 'bg-blue-100' : ''}`}
                           >
                              <div className="flex items-center gap-3">
                                 {option.photo ? (
                                    <SafeImage
                                       src={option.photo}
                                       alt={option.label}
                                       width={32}
                                       height={32}
                                       className="size-8 rounded-full object-cover"
                                    />
                                 ) : (
                                    <div className="flex size-8 items-center justify-center rounded-full bg-gray-200">
                                       <User className="size-4 text-gray-400" />
                                    </div>
                                 )}
                                 <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                       <span className="truncate font-medium text-gray-900">
                                          {option.label}
                                       </span>
                                       {value?.id === option.id && (
                                          <Badge
                                             variant="secondary"
                                             className="text-xs"
                                          >
                                             Selected
                                          </Badge>
                                       )}
                                    </div>
                                    {option.email && (
                                       <p className="truncate text-sm text-gray-500">
                                          {option.email}
                                       </p>
                                    )}
                                    {option.phone && (
                                       <p className="truncate text-xs text-gray-400">
                                          {option.phone}
                                       </p>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   )
}

export default SearchableSelect
