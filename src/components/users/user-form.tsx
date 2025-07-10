'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2, Upload } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select' // Added import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { User } from '@/types'
import { useTranslation } from 'react-i18next' // Added import

const userFormSchema = z.object({
  username: z.string().min(3, 'Nama pengguna harus minimal 3 karakter'),
  email: z.string().email('Silakan masukkan alamat email yang valid'),
  password: z.string().min(8, 'Kata sandi harus minimal 8 karakter').optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role_id: z.number().min(1).max(3),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: User
  onSuccess?: () => void
  onCancel?: () => void
}

const roleOptions = [
  { value: 1, label: 'student' }, // Use translation key
  { value: 2, label: 'teacher' }, // Use translation key
  { value: 3, label: 'administrator' }, // Use translation key
]

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { t } = useTranslation() // Added useTranslation hook
  const { toast } = useToast()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profile_picture_url || null
  )
  const queryClient = useQueryClient()
  const isEditing = !!user

  // Check if user has permission to create/edit users
  if (!AuthManager.hasRole('admin')) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-4">
            Only administrators can create or edit user accounts.
          </p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              {t('cancel')}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    setValue,
    watch,
    control, // Added control for Controller
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user ? {
      username: user.username,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role_id: user.role_id,
    } : {
      role_id: 1, // Default to student
    },
  })

  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password!,
        first_name: data.first_name,
        last_name: data.last_name,
        role_id: data.role_id,
      }
      return apiClient.createUser(payload)
    },
    onSuccess: async (newUser) => {
      // Upload profile image if selected
      if (profileImage) {
        try {
          await apiClient.uploadProfilePicture(newUser.id, profileImage)
        } catch (error) {
          toast({
            title: 'Upload Error',
            description: 'Failed to upload profile image. User created successfully.',
            variant: 'destructive'
          })
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['users'] })
      reset()
      setProfileImage(null)
      setPreviewUrl(null)
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create user'
      setError('root', { message })
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (!user) throw new Error('User not found')
      
      const payload: Partial<User> = {
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role_id: data.role_id,
      }
      
      // Only include password if it was provided
      if (data.password) {
        // Backend expects password field, API client should handle this
        ;(payload as any).password = data.password
      }
      
      return apiClient.updateUser(user.id, payload)
    },
    onSuccess: async (updatedUser) => {
      // Upload profile image if selected
      if (profileImage) {
        try {
          await apiClient.uploadProfilePicture(updatedUser.id, profileImage)
        } catch (error) {
          toast({
            title: 'Upload Error',
            description: 'Failed to upload profile image. User updated successfully.',
            variant: 'destructive'
          })
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] })
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update user'
      setError('root', { message })
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('root', { message: 'Silakan pilih file gambar yang valid' })
        return
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('root', { message: 'File gambar harus kurang dari 2MB' })
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

  const onSubmit = (data: UserFormData) => {
    if (isEditing) {
      updateUserMutation.mutate(data)
    } else {
      if (!data.password) {
        setError('password', { message: 'Kata sandi diperlukan untuk pengguna baru' })
        return
      }
      createUserMutation.mutate(data)
    }
  }

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Pengguna' : 'Buat Pengguna Baru'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Perbarui informasi dan izin pengguna' 
            : 'Tambahkan pengguna baru ke platform pembelajaran'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="space-y-2">
            <Label>Foto Profil</Label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview profil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-2xl font-bold">
                    {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('profile-image')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Unggah Gambar
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 2MB, hanya JPG/PNG
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nama Pengguna *</Label>
              <Input
                id="username"
                {...register('username')}
                className={errors.username ? 'border-red-500' : ''}
                placeholder="Masukkan nama pengguna"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                placeholder="Masukkan alamat email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">Nama Depan</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Masukkan nama depan"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Nama Belakang</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Masukkan nama belakang"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Kata Sandi {!isEditing && '*'}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
              placeholder={isEditing ? 'Kosongkan untuk tetap menggunakan kata sandi saat ini' : 'Masukkan kata sandi'}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role_id">Peran *</Label>
            <Controller
              name="role_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString() || ''}
                  data-testid="role-select"
                >
                  <SelectTrigger
                    id="role_id"
                    className={errors.role_id ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder={t('select_role_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role_id && (
              <p className="text-sm text-red-500">{errors.role_id.message}</p>
            )}
          </div>

          {/* Error Display */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Memperbarui...' : 'Membuat...'}
                </>
              ) : (
                isEditing ? 'Perbarui Pengguna' : 'Buat Pengguna'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
