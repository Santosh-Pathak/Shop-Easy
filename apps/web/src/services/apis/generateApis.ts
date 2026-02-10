import { handleAuthError } from '@/utils/error'
import { httpService } from '../http'

// Dynamic API generator for any routes
const generateApis = (baseUrl: string) => ({
   getOne: async (id?: string) => {
      try {
         const route = id ? `${baseUrl}/${id}` : baseUrl
         const response = await httpService.get<any>(route)
         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   },
   getAll: async (query = '') => {
      try {
         const response = await httpService.get<any>(`${baseUrl}${query}`)
         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   },
   create: async (data: object) => {
      try {
         const response = await httpService.post<any>(`${baseUrl}`, data)
         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   },
   updateOne: async (id: string, data: object) => {
      try {
         const response = await httpService.patch<any>(`${baseUrl}/${id}`, data)
         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   },
   deleteOne: async (id: string) => {
      try {
         const response = await httpService.delete<any>(`${baseUrl}/${id}`)
         return response
      } catch (error) {
         const authError = handleAuthError(error)
         throw authError
      }
   },
})

export default generateApis
