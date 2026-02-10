import { API_ENDPOINTS } from '@/constants/urls'
import { httpService } from '@/services/http'

export interface FileUploadResponse {
   message: string
   data: {
      url: string
      fileName: string
      size: number
   }
}

export const FileService = {
   /**
    * Upload file to Azure Blob Storage
    * @param file - File to upload
    * @param container - Optional container name (defaults to backend config)
    */
   uploadFile: async (
      file: File,
      container?: string
   ): Promise<FileUploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      if (container) {
         formData.append('container', container)
      }

      const response = await httpService.post<FileUploadResponse>(
         API_ENDPOINTS.AUTH.UPLOAD_FILE,
         formData,
         {
            headers: {
               'Content-Type': 'multipart/form-data',
            },
         }
      )

      return response
   },
}
