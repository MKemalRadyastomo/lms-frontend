'use client'

import { MoreHorizontal, Users, BookOpen, Calendar, Edit, Trash2, Eye, Settings } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge' // Added Badge import
import { AuthManager } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { Course } from '@/types'

interface CourseCardProps {
  course: Course
  onEdit?: (course: Course) => void
  onView?: (course: Course) => void
}

export function CourseCard({ course, onEdit, onView }: CourseCardProps) {
  const queryClient = useQueryClient()
  const currentUser = AuthManager.getUserData()
  const { t } = useTranslation()

  const deleteCourseMutation = useMutation({
    mutationFn: (courseId: number) => apiClient.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
    },
    onError: (error: any) => {
      console.error('Failed to delete course:', error)
      // Could show a toast notification here
    },
  })

  const handleDeleteCourse = () => {
    if (confirm(t('are_you_sure_delete_course', { courseName: course.name }))) {
      deleteCourseMutation.mutate(course.id)
    }
  }

  const canEdit = AuthManager.hasRole('admin') || 
    (AuthManager.hasRole('guru') && currentUser?.id === course.teacher_id)

  const getPrivacyLabel = (privacy: string) => {
    return privacy === 'public' ? t('public') : t('private')
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 relative" data-testid={`course-card-${course.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`course-card-name-${course.id}`}>{course.name}</CardTitle>
            <CardDescription className="mt-1" data-testid={`course-card-teacher-${course.id}`}>
              {t('by')} {course.teacher_name || t('teacher')}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={course.privacy === 'public' ? 'success' : 'info'} data-testid={`course-card-privacy-badge-${course.id}`}>
              {getPrivacyLabel(course.privacy)}
            </Badge>
            
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    data-testid={`course-card-actions-trigger-${course.id}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onEdit?.(course)} data-testid={`course-card-edit-action-${course.id}`}>
                    <Edit className="mr-3 h-4 w-4" />
                    {t('edit_course_action')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onView?.(course)} data-testid={`course-card-manage-content-action-${course.id}`}>
                    <Settings className="mr-3 h-4 w-4" />
                    {t('manage_content')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeleteCourse} className="text-red-600 focus:bg-red-50" data-testid={`course-card-delete-action-${course.id}`}>
                    <Trash2 className="mr-3 h-4 w-4" />
                    {t('delete_course_action')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          {course.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {course.description}
            </p>
          )}
          
          {/* Course Code */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{t('course_code')}</p>
                <p className="font-mono font-semibold text-blue-600">{course.code}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(course.code)}
                data-testid={`course-card-copy-code-button-${course.id}`}
              >
                {t('copy')}
              </Button>
            </div>
          </div>
          
          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">{t('students')}</p>
              <p className="text-sm font-semibold">-</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">{t('materials')}</p>
              <p className="text-sm font-semibold">-</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-1">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500">{t('created')}</p>
              <p className="text-sm font-semibold">
                {new Date(course.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView?.(course)}
              data-testid={`course-card-view-button-${course.id}`}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t('view_course')}
            </Button>
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(course)}
                data-testid={`course-card-edit-button-${course.id}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}