// File validation utilities

export const validateImageFile = (
   file: File
): { isValid: boolean; error?: string } => {
   const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
   ]
   const maxSize = 5 * 1024 * 1024 // 5MB

   if (!allowedTypes.includes(file.type)) {
      return {
         isValid: false,
         error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.',
      }
   }

   if (file.size > maxSize) {
      return {
         isValid: false,
         error: 'File size too large. Please upload images smaller than 5MB.',
      }
   }

   return { isValid: true }
}

export const generatePreviewUrl = (file: File): string => {
   return URL.createObjectURL(file)
}

export const revokePreviewUrl = (url: string): void => {
   URL.revokeObjectURL(url)
}

export const validateDocumentFile = (
   file: File
): { isValid: boolean; error?: string } => {
   const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
   ]
   const maxSize = 10 * 1024 * 1024 // 10MB

   if (!allowedTypes.includes(file.type)) {
      return {
         isValid: false,
         error: 'Invalid file type. Please upload PDF, Word, or Excel documents.',
      }
   }

   if (file.size > maxSize) {
      return {
         isValid: false,
         error: 'File size too large. Please upload documents smaller than 10MB.',
      }
   }

   return { isValid: true }
}

export const formatFileSize = (bytes: number): string => {
   if (bytes === 0) return '0 Bytes'

   const k = 1024
   const sizes = ['Bytes', 'KB', 'MB', 'GB']
   const i = Math.floor(Math.log(bytes) / Math.log(k))

   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
