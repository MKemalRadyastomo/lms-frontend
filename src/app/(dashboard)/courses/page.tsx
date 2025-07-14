'use client'

import { CourseList } from '@/components/courses/course-list'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function CoursesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  return (
    <ErrorBoundary>
      <PageWrapper
        title={t('courses')}
        description={
          userRole === 'student' 
            ? "Explore and join courses to start your learning journey"
            : "Create and manage courses for your students"
        }
        icon={BookOpen}
        iconColor="blue"
        variant="simple"
        actions={
          (userRole === 'teacher' || userRole === 'admin') && (
            <Button className="flex items-center gap-2" asChild>
              <Link href="/courses/create">
                <Plus className="h-4 w-4" />
                Create Course
              </Link>
            </Button>
          )
        }
      >
        <CourseList />
      </PageWrapper>
    </ErrorBoundary>
  )
}