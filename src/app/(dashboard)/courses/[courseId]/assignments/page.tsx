'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssignmentList } from '@/components/assignments/assignment-list';
import { AssignmentFilters } from '@/components/assignments/assignment-filters';
import { useAuth } from '@/hooks/useAuth';
import { AuthManager } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Filter, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const CourseAssignmentsPage = () => {
  const params = useParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const courseId = Number(params.courseId);

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiClient.getCourseById(courseId),
  });

  const handleFilterChange = (filters: any) => {
    console.log(filters);
  };

  const handleCreateAssignment = () => {
    setIsNavigating(true);
    router.push(`/courses/${courseId}/assignments/create`);
  };

  if (isUserLoading || isCourseLoading || !user || !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('loading')}</span>
      </div>
    );
  }

  return (
    <PageWrapper
      title={`${course.name} Assignments`}
      description={`Manage assignments for ${course.name} course`}
      icon={BookOpen}
      iconColor="blue"
      badge={course.code}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {(AuthManager.hasRole('teacher') || AuthManager.hasRole('admin') || AuthManager.hasRole('guru')) && (
            <Button 
              onClick={handleCreateAssignment}
              disabled={isNavigating}
              className="flex items-center gap-2"
            >
              {isNavigating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </>
              )}
            </Button>
          )}
        </div>
      }
    >
      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg border p-6 shadow-sm">
              <AssignmentFilters onFilterChange={handleFilterChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignments List */}
      <AssignmentList courseId={courseId} userRole={userRole} />
    </PageWrapper>
  );
};

export default CourseAssignmentsPage;