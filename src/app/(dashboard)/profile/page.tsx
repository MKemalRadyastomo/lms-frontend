'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { User } from '@/types'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const queryClient = useQueryClient()
  const currentUser = AuthManager.getUserData()
  const userId = AuthManager.getUserId()

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.getUserById(userId!),
    enabled: !!userId,
    initialData: currentUser,
  })

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      })
      setPreviewUrl(user.profile_picture_url || null)
    }
  }, [user])

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('User not found')
      
      // Update user data
      const updatedUser = await apiClient.updateUser(user.id, data)
      
      // Upload profile image if selected
      if (profileImage) {
        await apiClient.uploadProfilePicture(user.id, profileImage)
        // Fetch updated user data to get new profile picture URL
        return apiClient.getUserById(user.id)
      }
      
      return updatedUser
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', userId], updatedUser)
      AuthManager.setUserData(updatedUser)
      setIsEditing(false)
      setProfileImage(null)
    },
    onError: (error: any) => {
      console.error('Failed to update profile:', error)
    },
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image file must be less than 2MB')
        return
      }
      
      setProfileImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    updateUserMutation.mutate(formData)
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      })
      setPreviewUrl(user.profile_picture_url || null)
      setProfileImage(null)
    }
    setIsEditing(false)
  }

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 3:
        return 'Administrator'
      case 2:
        return 'Instructor'
      case 1:
      default:
        return 'Student'
    }
  }

  const getRoleBadgeColor = (roleId: number) => {
    switch (roleId) {
      case 3:
        return 'bg-purple-100 text-purple-800'
      case 2:
        return 'bg-green-100 text-green-800'
      case 1:
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full overflow-hidden flex items-center justify-center mx-auto">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-4xl font-bold">
                    {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-0 right-0">
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full w-10 h-10 p-0"
                    onClick={() => document.getElementById('profile-image-input')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <CardTitle className="mt-4">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username
              }
            </CardTitle>
            <CardDescription>
              <span className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${getRoleBadgeColor(user.role_id)}
              `}>
                <Shield className="mr-1 h-3 w-3" />
                {getRoleName(user.role_id)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                {isEditing ? (
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                    {user.first_name || 'Not provided'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                    {user.last_name || 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your username"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {user.username}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                  {user.email}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateUserMutation.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={updateUserMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Additional settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">
                Update Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">Manage your notification preferences</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium">Privacy Settings</h4>
                <p className="text-sm text-gray-600">Control your profile visibility</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
