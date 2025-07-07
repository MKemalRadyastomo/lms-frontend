'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { Course, CourseCreateData } from '@/types'

const courseFormSchema = z.object({
  name: z.string().min(3, 'Nama kursus harus minimal 3 karakter'),
  description: z.string().optional(),
  privacy: z.enum(['private', 'public']),
})

type CourseFormData = z.infer<typeof courseFormSchema>

interface CourseFormProps {
  course?: Course
  onSuccess?: () => void
  onCancel?: () => void
}

const privacyOptions = [
  { value: 'private', label: 'Privat - Hanya siswa yang diundang' },
  { value: 'public', label: 'Publik - Semua siswa dapat bergabung' },
]

export function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!course
  const currentUser = AuthManager.getUserData()

  // Check if user has permission to create/edit courses
  if (!AuthManager.hasRole('admin') && !AuthManager.hasRole('guru')) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Akses Ditolak
          </h3>
          <p className="text-gray-600 mb-4">
            Hanya administrator dan guru yang dapat membuat atau mengedit kursus.
          </p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Kembali
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
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course ? {
      name: course.name,
      description: course.description || '',
      privacy: course.privacy,
    } : {
      privacy: 'private', // Default to private
    },
  })

  const createCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      const courseData: CourseCreateData = {
        name: data.name,
        description: data.description,
        privacy: data.privacy,
        teacher_id: currentUser!.id
      }
      return apiClient.createCourse(courseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal membuat kursus'
      setError('root', { message })
    },
  })

  const updateCourseMutation = useMutation({
    mutationFn: (data: CourseFormData) => {
      if (!course) throw new Error('Course not found')
      
      const courseData: Partial<CourseCreateData> = {
        name: data.name,
        description: data.description,
        privacy: data.privacy,
      }
      
      return apiClient.updateCourse(course.id, courseData)
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course', updatedCourse.id] })
      onSuccess?.()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal memperbarui kursus'
      setError('root', { message })
    },
  })

  const onSubmit = (data: CourseFormData) => {
    if (isEditing) {
      updateCourseMutation.mutate(data)
    } else {
      createCourseMutation.mutate(data)
    }
  }

  const isLoading = createCourseMutation.isPending || updateCourseMutation.isPending

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Kursus' : 'Buat Kursus Baru'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Perbarui informasi kursus' 
            : 'Buat kursus baru untuk siswa Anda'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kursus *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="Masukkan nama kursus"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
              id="description"
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Jelaskan tentang kursus ini..."
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label htmlFor="privacy">Privasi Kursus *</Label>
            <select
              id="privacy"
              {...register('privacy')}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.privacy ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              {privacyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.privacy && (
              <p className="text-sm text-red-500">{errors.privacy.message}</p>
            )}
          </div>

          {/* Generated Course Code Info */}
          {!isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-700">
                📝 <strong>Kode kursus</strong> akan dibuat secara otomatis setelah kursus dibuat.
              </p>
            </div>
          )}

          {/* Course Code Display (if editing) */}
          {isEditing && course && (
            <div className="space-y-2">
              <Label>Kode Kursus</Label>
              <div className="px-3 py-2 bg-gray-50 rounded-md border">
                <span className="font-mono text-lg font-semibold text-blue-600">
                  {course.code}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Bagikan kode ini kepada siswa untuk bergabung dengan kursus
                </p>
              </div>
            </div>
          )}

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
                isEditing ? 'Perbarui Kursus' : 'Buat Kursus'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
