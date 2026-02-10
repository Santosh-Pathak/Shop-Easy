'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Upload, X, File, Image, FileText, Video, Music, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/store/auth.store'

interface FileUploadProps {
  onFileUpload?: (file: File, result: any) => void
  onError?: (error: string) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
  multiple?: boolean
  className?: string
  disabled?: boolean
  placeholder?: string
  uploadOptions?: {
    container?: string
    folder?: string
    updateProfile?: boolean
  }
  showPreview?: boolean
  variant?: 'default' | 'compact' | 'minimal'
}

interface FileWithPreview extends File {
  preview?: string
  id: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onError,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxSize = 50,
  multiple = false,
  className,
  disabled = false,
  placeholder = 'Drop files here or click to browse',
  uploadOptions = {},
  showPreview = true,
  variant = 'default',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploadResults, setUploadResults] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { uploadFile, isUploading, uploadProgress } = useAuthStore()

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />
    if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type
    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0]
          return file.type.startsWith(baseType)
        }
        return file.type === type
      })

      if (!isValidType) {
        return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
      }
    }

    return null
  }

  const createFilePreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return undefined
  }

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithPreview[] = []
    const newErrors: Record<string, string> = {}

    Array.from(fileList).forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`
      const error = validateFile(file)

      if (error) {
        newErrors[fileId] = error
      } else {
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          id: fileId,
          preview: createFilePreview(file),
        })
        newFiles.push(fileWithPreview)
      }
    })

    if (!multiple) {
      setFiles(newFiles.slice(0, 1))
      setErrors(Object.fromEntries(Object.entries(newErrors).slice(0, 1)))
    } else {
      setFiles(prev => [...prev, ...newFiles])
      setErrors(prev => ({ ...prev, ...newErrors }))
    }
  }, [multiple, maxSize, acceptedTypes])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
    setErrors(prev => {
      const { [fileId]: removed, ...rest } = prev
      return rest
    })
    setUploadResults(prev => {
      const { [fileId]: removed, ...rest } = prev
      return rest
    })
  }

  const uploadSingleFile = async (file: FileWithPreview) => {
    try {
      const result = await uploadFile(file, uploadOptions)
      setUploadResults(prev => ({ ...prev, [file.id]: result }))
      onFileUpload?.(file, result)
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed'
      setErrors(prev => ({ ...prev, [file.id]: errorMessage }))
      onError?.(errorMessage)
      throw error
    }
  }

  const handleUpload = async () => {
    const filesToUpload = files.filter(f => !uploadResults[f.id] && !errors[f.id])
    
    if (filesToUpload.length === 0) return

    try {
      if (multiple) {
        await Promise.all(filesToUpload.map(uploadSingleFile))
      } else {
        await uploadSingleFile(filesToUpload[0])
      }
    } catch (error) {
      // Individual errors are handled in uploadSingleFile
    }
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const hasValidFiles = files.some(f => !errors[f.id])
  const hasUploadedFiles = Object.keys(uploadResults).length > 0
  const hasErrors = Object.keys(errors).length > 0

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-2', className)}>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={disabled || isUploading}
          className="theme-border hover:theme-bg hover:theme-text"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>

        {files.length > 0 && (
          <div className="space-y-1">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between text-sm theme-text">
                <span className="truncate">{file.name}</span>
                {uploadResults[file.id] ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : errors[file.id] ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('theme-border', className)}>
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={disabled || isUploading}
              className="theme-border hover:theme-bg hover:theme-text"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse
            </Button>

            <span className="text-sm theme-text flex-1">
              {files.length > 0 ? `${files.length} file(s) selected` : placeholder}
            </span>

            {hasValidFiles && !hasUploadedFiles && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="sm"
                className="theme-bg theme-text"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs theme-text mt-1">{uploadProgress}% complete</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          'theme-border hover:theme-bg/5 cursor-pointer',
          {
            'theme-bg/10 border-solid': dragActive,
            'opacity-50 cursor-not-allowed': disabled,
          }
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 theme-bg/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 theme-text" />
          </div>
          
          <div>
            <p className="text-lg font-medium theme-text">{placeholder}</p>
            <p className="text-sm theme-text/70 mt-1">
              Supported formats: {acceptedTypes.join(', ')} • Max size: {maxSize}MB
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="theme-border hover:theme-bg hover:theme-text"
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium theme-text">Selected Files</h4>
          
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="theme-border">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    {showPreview && file.preview ? (
                      <div className="relative w-12 h-12 rounded border theme-border overflow-hidden">
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 theme-bg/10 rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium theme-text truncate">{file.name}</p>
                      <p className="text-sm theme-text/70">{formatFileSize(file.size)}</p>
                      
                      {errors[file.id] && (
                        <Badge variant="destructive" className="mt-1">
                          {errors[file.id]}
                        </Badge>
                      )}
                      
                      {uploadResults[file.id] && (
                        <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                          Uploaded successfully
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {uploadResults[file.id] ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : errors[file.id] ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card className="theme-border">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium theme-text">Uploading files...</span>
                <span className="text-sm theme-text">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {hasValidFiles && !hasUploadedFiles && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => setFiles([])}
            disabled={isUploading}
            className="theme-border hover:theme-bg hover:theme-text"
          >
            Clear All
          </Button>
          
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="theme-bg theme-text hover:theme-bg/90"
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </Button>
        </div>
      )}

      {/* Error Summary */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Some files have errors. Please check the files above and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default FileUpload