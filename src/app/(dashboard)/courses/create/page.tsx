'use client'

import { CourseForm } from '@/components/courses/course-form'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

export default function CreateCoursePage() {
  const router = useRouter()
  const { t } = useTranslation()

  const handleSuccess = () => {
    router.push('/courses')
  }

  const handleCancel = () => {
    router.push('/courses')
  }

  return (
    <PageWrapper
      title="Create New Course"
      description="Set up a new course for your students"
      icon={BookOpen}
      iconColor="blue"
      variant="simple"
    >
      <div className="container mx-auto max-w-2xl">
        <CourseForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </PageWrapper>
  )
}