'use client'

import React, { useState } from 'react'
import { Camera, User, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth.store'
import FileUpload from './FileUpload'
import type { User as UserType } from '@/types/auth'

interface ProfilePhotoUploadProps {
  user?: UserType | null
  onPhotoUpdate?: (photoUrl: string, user: UserType) => void
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'square' | 'rounded'
  showUploadButton?: boolean
  allowRemove?: boolean
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  user,
  onPhotoUpdate,
  className,
  size = 'lg',
  variant = 'circle',
  showUploadButton = true,
  allowRemove = true,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const { uploadProfilePhoto, isUploading, uploadProgress, updateProfile } = useAuthStore()

  const currentPhotoUrl = user?.photo
  const userName = user?.name || 'User'
  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handlePhotoUpload = async (file: File, result: any) => {
    try {
      // The upload already updates the user profile
      setShowUploadModal(false)
      onPhotoUpdate?.(result.url, result.user)
    } catch (error) {
      console.error('Failed to upload profile photo:', error)
    }
  }

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl || isRemoving) return

    try {
      setIsRemoving(true)
      
      // Update profile to remove photo
      const updatedUser = await updateProfile({ photo: '' })
      onPhotoUpdate?.('', updatedUser)
    } catch (error) {
      console.error('Failed to remove profile photo:', error)
    } finally {
      setIsRemoving(false)
    }
  }

  const avatarClasses = cn(
    sizeClasses[size],
    {
      'rounded-full': variant === 'circle',
      'rounded-none': variant === 'square',
      'rounded-lg': variant === 'rounded',
    }
  )

  return (
    <div className={cn('relative group', className)}>
      <div className="relative">
        <Avatar className={avatarClasses}>
          <AvatarImage 
            src={currentPhotoUrl} 
            alt={userName}
            className="object-cover"
          />
          <AvatarFallback className="theme-bg theme-text text-lg font-semibold">
            {currentPhotoUrl ? <User className="w-1/2 h-1/2" /> : userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        {showUploadButton && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowUploadModal(true)}
                disabled={isUploading}
                className="text-white hover:text-white hover:bg-white/20 h-auto p-2"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-1">
                    <Upload className="w-5 h-5 animate-pulse" />
                    <span className="text-xs">{uploadProgress}%</span>
                  </div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Remove Button */}
        {allowRemove && currentPhotoUrl && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemovePhoto}
            disabled={isRemoving}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Upload Button (Alternative) */}
      {showUploadButton && (
        <div className="mt-3 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
            className="theme-border hover:theme-bg hover:theme-text"
          >
            <Camera className="w-4 h-4 mr-2" />
            {currentPhotoUrl ? 'Change Photo' : 'Add Photo'}
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg theme-border">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold theme-text">
                  {currentPhotoUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <FileUpload
                onFileUpload={handlePhotoUpload}
                acceptedTypes={['image/*']}
                maxSize={10}
                multiple={false}
                placeholder="Drop your profile photo here or click to browse"
                uploadOptions={{
                  container: 'profile-photos',
                  updateProfile: true,
                }}
                showPreview={true}
                variant="compact"
              />

              <div className="mt-4 text-xs theme-text/70 text-center">
                Supported formats: JPG, PNG, GIF • Max size: 10MB
                <br />
                For best results, use a square image at least 400x400 pixels
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ProfilePhotoUpload