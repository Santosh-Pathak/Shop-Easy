import debounce from 'lodash.debounce'
import { useCallback, useMemo, useRef, useState } from 'react'

interface AddressData {
   addressLine1: string
}

interface UseAddressAutocompleteResult {
   isLoading: boolean
   error: string | null
   fetchAddressData: (postalCode: string) => void
}

const useAddressAutocomplete = (
   onAddressFound: (data: AddressData[]) => void
): UseAddressAutocompleteResult => {
   const [isLoading, setIsLoading] = useState(false)
   const [error, setError] = useState<string | null>(null)
   const abortControllerRef = useRef<AbortController | null>(null)

   const fetchAddress = useCallback(
      async (postalCode: string) => {
         if (abortControllerRef.current) {
            abortControllerRef.current.abort()
         }
         abortControllerRef.current = new AbortController()

         if (!postalCode || postalCode.trim().length < 3) {
            setIsLoading(false)
            setError(null)
            return
         }

         setIsLoading(true)
         setError(null)

         try {
            // First try autocomplete API
            let response = await fetch(
               `https://api.getaddress.io/autocomplete/${encodeURIComponent(
                  postalCode.trim()
               )}?api-key=pdSw7G1TEk6kghR1DNzddQ41182&all=true`,
               {
                  signal: abortControllerRef.current.signal,
                  headers: { Accept: 'application/json' },
               }
            )

            // If autocomplete fails and looks like full postcode, fallback to "find"
            if (!response.ok && postalCode.trim().length >= 5) {
               response = await fetch(
                  `https://api.getaddress.io/find/${encodeURIComponent(
                     postalCode.trim()
                  )}?api-key=pdSw7G1TEk6kghR1DNzddQ41182`,
                  {
                     signal: abortControllerRef.current.signal,
                     headers: { Accept: 'application/json' },
                  }
               )
            }

            if (!response.ok) {
               throw new Error(
                  `API Error: ${response.status} ${response.statusText}`
               )
            }

            const data = await response.json()
            console.log('API Response:', data)

            let addresses: AddressData[] = []

            // Autocomplete response
            if (data?.suggestions?.length > 0) {
               addresses = data.suggestions.map((s: any) => ({
                  addressLine1:
                     s.address || s.text || s.description || s.label || '',
               }))
            }
            // Find API response
            else if (data?.addresses?.length > 0) {
               addresses = data.addresses.map((a: any) => {
                  if (a.formatted_address) {
                     return { addressLine1: a.formatted_address.join(', ') }
                  }
                  const parts = [a.line_1, a.line_2, a.town_or_city].filter(
                     Boolean
                  )
                  return { addressLine1: parts.join(', ') }
               })
            }
            // Direct object fallback
            else if (data && typeof data === 'object') {
               if (data.formatted_address) {
                  addresses = [
                     {
                        addressLine1: Array.isArray(data.formatted_address)
                           ? data.formatted_address.join(', ')
                           : data.formatted_address,
                     },
                  ]
               } else if (data.line_1) {
                  const parts = [
                     data.line_1,
                     data.line_2,
                     data.town_or_city,
                  ].filter(Boolean)
                  addresses = [{ addressLine1: parts.join(', ') }]
               }
            }

            if (addresses.length > 0) {
               console.log('Setting addresses:', addresses)
               onAddressFound(addresses)
            } else {
               console.log('No addresses found in response')
               setError('No address information found for this postal code')
            }
         } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
               return // request was cancelled
            }
            console.error('Address lookup error:', err)
            setError(
               err instanceof Error
                  ? err.message
                  : 'Failed to fetch address information'
            )
         } finally {
            setIsLoading(false)
         }
      },
      [onAddressFound]
   )

   // Debounce wrapper
   const debouncedFetchAddress = useMemo(
      () =>
         debounce((postalCode: string) => {
            fetchAddress(postalCode)
         }, 800),
      [fetchAddress]
   )

   const fetchAddressData = useCallback(
      (postalCode: string) => {
         setError(null)
         debouncedFetchAddress(postalCode)
      },
      [debouncedFetchAddress]
   )

   return {
      isLoading,
      error,
      fetchAddressData,
   }
}

export default useAddressAutocomplete
