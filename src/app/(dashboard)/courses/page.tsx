'use client'

import { CourseList } from '@/components/courses/course-list'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function CoursesPage() {
  return (
    <ErrorBoundary>
      <div className="container mx-auto">
        <CourseList />
      </div>
    </ErrorBoundary>
  )
}
