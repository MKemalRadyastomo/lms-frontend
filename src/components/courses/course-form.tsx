'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { Course, CourseCreateData } from '@/types'

interface CourseFormProps {
  course?: Course
  onSuccess?: () => void
  onCancel?: () => void
}

export function CourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const { t } = useTranslation()

  const courseFormSchema = z.object({
    name: z.string().min(3, t('course_name_min_length')),
    description: z.string().optional(),
    privacy: z.enum(['private', 'public']),
  })

  type CourseFormData = z.infer<typeof courseFormSchema>

  const privacyOptions = [
    { value: 'private', label: t('private_course_desc') },
    { value: 'public', label: t('public_course_desc') },
  ]

  const queryClient = useQueryClient()
  const isEditing = !!course
  const currentUser = AuthManager.getUserData()

  // Check if user has permission to create/edit courses
  if (!AuthManager.hasRole('admin') && !AuthManager.hasRole('guru')) {
    return (
      <Card className="w-full max-w-2xl" data-testid="course-form-access-denied">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('access_denied')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('access_denied_message')}
          </p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" data-testid="course-form-go-back-button">
              {t('go_back')}
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
    setValue,
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
      const message = error.response?.data?.message || t('failed_to_create_course')
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
      const message = error.response?.data?.message || t('failed_to_update_course')
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
    <Card className="w-full max-w-2xl" data-testid="course-form">
      <CardHeader>
        <CardTitle>
          {isEditing ? t('edit_course') : t('create_new_course')}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? t('update_course_info') 
            : t('create_new_course_info')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Course Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('course_name')} *</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
              placeholder={t('enter_course_name')}
              data-testid="course-form-name-input"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder={t('enter_course_description')}
              data-testid="course-form-description-textarea"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Privacy */}
          <div className="space-y-2">
            <Label htmlFor="privacy">{t('privacy')} *</Label>
            <Select onValueChange={(value) => setValue('privacy', value as "private" | "public")} defaultValue={course?.privacy || 'private'}>
              <SelectTrigger className={errors.privacy ? 'border-red-500' : ''} data-testid="course-form-privacy-select">
                <SelectValue placeholder={t('select_privacy_option')} />
              </SelectTrigger>
              <SelectContent>
                {privacyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.privacy && (
              <p className="text-sm text-red-500">{errors.privacy.message}</p>
            )}
          </div>

          {/* Generated Course Code Info */}
          {!isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-700">
                📝 <strong>{t('course_code')}</strong> {t('course_code_info')}
              </p>
            </div>
          )}

          {/* Course Code Display (if editing) */}
          {isEditing && course && (
            <div className="space-y-2">
              <Label>{t('course_code')}</Label>
              <div className="px-3 py-2 bg-gray-50 rounded-md border">
                <span className="font-mono text-lg font-semibold text-blue-600">
                  {course.code}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {t('share_code_info')}
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
                data-testid="course-form-cancel-button"
              >
                {t('cancel')}
              </Button>
            )}
            <Button type="submit" disabled={isLoading} data-testid="course-form-submit-button">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? t('updating') : t('creating')}
                </>
              ) : (
                isEditing ? t('update_course') : t('create_course')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}