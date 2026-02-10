// Generic Upload API service for Azure Storage

import { httpService } from '@/services/http'
import { API_ENDPOINTS } from '@/constants/urls'

export interface UploadApiResponse {
   status: string
   message: string
   data: {
      url: string
      fileName: string
      originalName: string
      size: number
      mimeType: string
      container: string
      uploadedAt: string
      user?: any // Optional user data if profile is updated
   }
}

export interface UploadOptions {
   container?: string
   folder?: string
   updateProfile?: boolean
}

export const uploadFile = async (
   file: File,
   options: UploadOptions = {}
): Promise<UploadApiResponse> => {
   try {
      const formData = new FormData()
      formData.append('file', file)

      if (options.container) {
         formData.append('container', options.container)
      }

      if (options.folder) {
         formData.append('folder', options.folder)
      }

      if (options.updateProfile) {
         formData.append('updateProfile', 'true')
      }

      const response = await httpService.post<UploadApiResponse>(
         API_ENDPOINTS.AUTH.UPLOAD_FILE,
         formData,
         {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         }
      )

      return response
   } catch (error: any) {
      throw new Error(error.message || 'Upload failed')
   }
}

// Upload profile photo specifically
export const uploadProfilePhoto = async (
   file: File
): Promise<UploadApiResponse> => {
   return uploadFile(file, {
      container: 'profile-photos',
      updateProfile: true,
   })
}

// Upload document
export const uploadDocument = async (
   file: File,
   folder?: string
): Promise<UploadApiResponse> => {
   return uploadFile(file, {
      container: 'documents',
      folder,
   })
}

// Upload multiple files
export const uploadMultipleFiles = async (
   files: File[],
   options: UploadOptions = {}
): Promise<UploadApiResponse[]> => {
   const uploadPromises = files.map((file) => uploadFile(file, options))
   return Promise.all(uploadPromises)
}

// Legacy interface for backward compatibility
export interface UploadResponse {
   url: string
   fileName: string
   fileSize: number
}

// Legacy function for backward compatibility
export const uploadToAWS = async (
   file: File
): Promise<{
   status: number
   data?: UploadResponse
   error?: string
}> => {
   try {
      const response = await uploadFile(file)
      return {
         status: 200,
         data: {
            url: response.data.url,
            fileName: response.data.fileName,
            fileSize: response.data.size,
         },
      }
   } catch (error: any) {
      return {
         status: 500,
         error: error.message,
      }
   }
}

export const uploadMultipleToAWS = async (
   files: File[]
): Promise<UploadResponse[]> => {
   const responses = await uploadMultipleFiles(files)
   return responses.map((response) => ({
      url: response.data.url,
      fileName: response.data.fileName,
      fileSize: response.data.size,
   }))
}
