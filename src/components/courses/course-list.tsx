'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen,
  Grid3X3,
  List
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CourseForm } from './course-form'
import { CourseCard } from './course-card'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { Course, CourseFilters } from '@/types'

interface CourseListProps {
  showCreateForm?: boolean
  onCourseSelect?: (course: Course) => void
}

export function CourseList({ showCreateForm = false, onCourseSelect }: CourseListProps) {
  const [showForm, setShowForm] = useState(showCreateForm)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [privacyFilter, setPrivacyFilter] = useState<string>('')
  const [teacherFilter, setTeacherFilter] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const currentUser = AuthManager.getUserData()
  const router = useRouter()

  const filters: CourseFilters & { page: number; limit: number } = {
    page,
    limit: 12,
    ...(searchTerm && { search: searchTerm }),
    ...(privacyFilter && { privacy: privacyFilter as 'private' | 'public' }),
    // If user is a teacher (guru), filter to show only their courses
    ...(AuthManager.hasRole('guru') && !AuthManager.hasRole('admin') && currentUser && { teacherId: currentUser.id }),
  }

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => apiClient.getCourses(filters),
  })

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setShowForm(true)
  }

  const handleViewCourse = (course: Course) => {
    onCourseSelect?.(course)
    router.push(`/courses/${course.id}`)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingCourse(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingCourse(null)
  }

  const canCreateCourse = AuthManager.hasRole('admin') || AuthManager.hasRole('guru')

  if (showForm) {
    return (
      <CourseForm
        course={editingCourse || undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Kursus</h2>
          <p className="text-gray-600">
            {AuthManager.hasRole('admin') 
              ? 'Kelola semua kursus dalam platform' 
              : AuthManager.hasRole('guru')
              ? 'Kelola kursus Anda'
              : 'Jelajahi kursus yang tersedia'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {canCreateCourse && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Buat Kursus
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari kursus berdasarkan nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={privacyFilter}
                onChange={(e) => setPrivacyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua Privasi</option>
                <option value="private">Privat</option>
                <option value="public">Publik</option>
              </select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Gagal memuat kursus. Silakan coba lagi.</p>
            </CardContent>
          </Card>
        ) : !coursesData?.data.length ? (
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada kursus ditemukan</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || privacyFilter ? 'Coba sesuaikan filter Anda.' : canCreateCourse ? 'Mulai dengan membuat kursus pertama Anda.' : 'Belum ada kursus yang tersedia.'}
              </p>
              {canCreateCourse && !searchTerm && !privacyFilter && (
                <div className="mt-6">
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Kursus Pertama
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Course Grid/List */}
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }
            `}>
              {coursesData.data.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEditCourse}
                  onView={handleViewCourse}
                />
              ))}
            </div>

            {/* Pagination */}
            {coursesData && coursesData.pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500">
                  Menampilkan halaman {coursesData.pagination.current_page} dari {coursesData.pagination.total_pages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(coursesData.pagination.total_pages, page + 1))}
                    disabled={page === coursesData.pagination.total_pages}
                  >
                    Berikutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
