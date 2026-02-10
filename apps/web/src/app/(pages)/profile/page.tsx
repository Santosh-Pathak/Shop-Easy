'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PasswordInput } from '@/components/ui/password-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Camera, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { AuthService } from '@/services/apis/auth.service'
import ProfilePhotoUpload from '@/components/ui/ProfilePhotoUpload'
import toast from 'react-hot-toast'

const ProfilePage: React.FC = () => {
  const router = useRouter()
  const { user, isLoading, error } = useAuthStore()
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    postalCode: user?.postalCode || ''
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Update profile data when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        postalCode: user.postalCode || ''
      })
    }
  }, [user])

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setProfileSuccess(false) // Clear success message when editing
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    setPasswordSuccess(false) // Clear success message when editing
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setProfileSuccess(false)

    try {
      await AuthService.updateProfile(profileData)
      setProfileSuccess(true)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } 
    finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsSavingPassword(true)
    setPasswordSuccess(false)

    try {
      await AuthService.updatePassword({
        currentPassword: passwordData.currentPassword,
        password: passwordData.password,
        confirmPassword: passwordData.confirmPassword
      })
      
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: '',
        password: '',
        confirmPassword: ''
      })
      toast.success('Password updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handlePhotoUpdate = (photoUrl: string, updatedUser: any) => {
    // The auth store should already be updated by the uploadFile method,
    // but we'll ensure consistency by explicitly updating it here
    if (updatedUser) {
      const { setUser } = useAuthStore.getState()
      setUser(updatedUser)
    }
    toast.success('Profile photo updated successfully!')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md theme-border">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold theme-text mb-2">Access Denied</h2>
            <p className="theme-text/70 mb-4">Please log in to view your profile.</p>
            <Button onClick={() => router.push('/login')} className="theme-bg theme-text">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen theme-bg py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold theme-text mb-2">Profile Settings</h1>
          <p className="theme-text/70">Manage your account settings and preferences</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 theme-border max-w-md mx-auto">
            <TabsTrigger value="profile" className="theme-text">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="theme-text">
              <Lock className="w-4 h-4 mr-2" />
              Password
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab - Combined Info and Photo */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Photo Section */}
            <Card className="theme-border">
              <CardHeader>
                <CardTitle className="theme-text">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <ProfilePhotoUpload
                      user={user}
                      onPhotoUpdate={handlePhotoUpdate}
                      size="xl"
                      variant="circle"
                      showUploadButton={true}
                      allowRemove={true}
                    />
                  </div>
                  
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="font-semibold theme-text mb-2">Update Your Profile Photo</h3>
                    <p className="text-sm theme-text/70">
                      Upload a professional photo to help others recognize you. 
                      For best results, use a square image at least 400x400 pixels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information Section */}
            <Card className="theme-border">
              <CardHeader>
                <CardTitle className="theme-text">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {profileSuccess && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>Profile updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="theme-text">
                        Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 theme-text/50" />
                        <Input
                          id="name"
                          type="text"
                          value={profileData.name}
                          onChange={(e) => handleProfileInputChange('name', e.target.value)}
                          className="pl-10 theme-border focus:theme-border"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="theme-text">
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 theme-text/50" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileInputChange('email', e.target.value)}
                          className="pl-10 theme-border focus:theme-border"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="theme-text">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 theme-text/50" />
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                          className="pl-10 theme-border focus:theme-border"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="theme-text">
                        Postal Code
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 theme-text/50" />
                        <Input
                          id="postalCode"
                          type="text"
                          value={profileData.postalCode}
                          onChange={(e) => handleProfileInputChange('postalCode', e.target.value)}
                          className="pl-10 theme-border focus:theme-border"
                          placeholder="Enter your postal code"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address - Full Width */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="theme-text">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => handleProfileInputChange('address', e.target.value)}
                      className="theme-border focus:theme-border min-h-[100px] w-full"
                      placeholder="Enter your full address"
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="theme-border hover:theme-bg hover:theme-text w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingProfile || isLoading}
                      className="theme-bg theme-text hover:theme-bg/90 w-full sm:w-auto"
                    >
                      {isSavingProfile ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card className="theme-border">
              <CardHeader>
                <CardTitle className="theme-text">Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {passwordSuccess && (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>Password updated successfully!</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4 max-w-md mx-auto sm:mx-0">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="theme-text">
                        Current Password *
                      </Label>
                      <PasswordInput
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className="theme-border focus:theme-border w-full"
                        placeholder="Enter your current password"
                        required
                        leftIcon={<Lock className="w-4 h-4 theme-text/50" />}
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="theme-text">
                        New Password *
                      </Label>
                      <PasswordInput
                        id="newPassword"
                        value={passwordData.password}
                        onChange={(e) => handlePasswordInputChange('password', e.target.value)}
                        className="theme-border focus:theme-border w-full"
                        placeholder="Enter your new password"
                        required
                        minLength={8}
                        leftIcon={<Lock className="w-4 h-4 theme-text/50" />}
                      />
                      <p className="text-xs theme-text/60">
                        Password must be at least 8 characters long
                      </p>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="theme-text">
                        Confirm New Password *
                      </Label>
                      <PasswordInput
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className="theme-border focus:theme-border w-full"
                        placeholder="Confirm your new password"
                        required
                        minLength={8}
                        leftIcon={<Lock className="w-4 h-4 theme-text/50" />}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPasswordData({
                        currentPassword: '',
                        password: '',
                        confirmPassword: ''
                      })}
                      className="theme-border hover:theme-bg hover:theme-text w-full sm:w-auto"
                    >
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingPassword || isLoading}
                      className="theme-bg theme-text hover:theme-bg/90 w-full sm:w-auto"
                    >
                      {isSavingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProfilePage