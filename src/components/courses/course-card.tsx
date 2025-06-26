'use client'

import { useState } from 'react'
import { MoreHorizontal, Users, BookOpen, Calendar, Edit, Trash2, Eye, Settings } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthManager } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { Course } from '@/types'

interface CourseCardProps {
  course: Course
  onEdit?: (course: Course) => void
  onView?: (course: Course) => void
}

export function CourseCard({ course, onEdit, onView }: CourseCardProps) {
  const [showActions, setShowActions] = useState(false)
  const queryClient = useQueryClient()
  const currentUser = AuthManager.getUserData()

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
    if (confirm(`Apakah Anda yakin ingin menghapus kursus "${course.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteCourseMutation.mutate(course.id)
    }
  }

  const canEdit = AuthManager.hasRole('admin') || 
    (AuthManager.hasRole('guru') && currentUser?.id === course.teacher_id)

  const getPrivacyBadgeColor = (privacy: string) => {
    return privacy === 'public' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800'
  }

  const getPrivacyLabel = (privacy: string) => {
    return privacy === 'public' ? 'Publik' : 'Privat'
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <CardDescription className="mt-1">
              Oleh {course.teacher_name || 'Guru'}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${getPrivacyBadgeColor(course.privacy)}
            `}>
              {getPrivacyLabel(course.privacy)}
            </span>
            
            {canEdit && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(!showActions)}
                  className="h-8 w-8 p-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onEdit?.(course)
                          setShowActions(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="mr-3 h-4 w-4" />
                        Edit Kursus
                      </button>
                      <button
                        onClick={() => {
                          onView?.(course)
                          setShowActions(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Kelola Konten
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleDeleteCourse()
                          setShowActions(false)
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Hapus Kursus
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                <p className="text-xs text-gray-500">Kode Kursus</p>
                <p className="font-mono font-semibold text-blue-600">{course.code}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(course.code)}
              >
                Salin
              </Button>
            </div>
          </div>
          
          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mx-auto mb-1">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500">Siswa</p>
              <p className="text-sm font-semibold">-</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-1">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Materi</p>
              <p className="text-sm font-semibold">-</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full mx-auto mb-1">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500">Dibuat</p>
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
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Kursus
            </Button>
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(course)}
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
