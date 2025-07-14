'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { AssignmentFilters } from '@/components/assignments/assignment-filters';
import { useAuth } from '@/hooks/useAuth';
import { Assignment, AssignmentDetail, Course, AssignmentFilters as AssignmentFiltersType } from '@/types';
import { AssignmentCard } from '@/components/assignments/assignment-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, AlertCircle, GraduationCap, Plus, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageWrapper } from '@/components/layout/PageWrapper';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const AssignmentsPage = () => {
  const { user, isLoading: isUserLoading } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Partial<AssignmentFiltersType>>({});
  const { t } = useTranslation();

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  // Fetch all courses for the user
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiClient.getCourses(),
    enabled: !!user,
  });

  // Fetch all assignments across courses
  const { data: allAssignments, isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ['all-assignments'],
    queryFn: async () => {
      if (!courses?.data) return [];
      
      const assignmentPromises = courses.data.map(async (course: Course) => {
        try {
          const response = await apiClient.getCourseAssignments(course.id);
          return response.data.map((assignment: Assignment): AssignmentDetail => ({
            ...assignment,
            course_name: course.name,
            course_code: course.code
          })) || [];
        } catch {
          return [];
        }
      });
      
      const results = await Promise.all(assignmentPromises);
      return results.flat();
    },
    enabled: !!courses?.data,
  });

  const handleFilterChange = (filters: Partial<AssignmentFiltersType>) => {
    setActiveFilters(filters);
  };

  // Filter assignments based on active filters
  const filteredAssignments = useMemo(() => {
    if (!allAssignments) return [];
    
    return allAssignments.filter((assignment: AssignmentDetail) => {
      // Search filter
      if (activeFilters.search) {
        const searchTerm = activeFilters.search.toLowerCase();
        const matchesTitle = assignment.title.toLowerCase().includes(searchTerm);
        const matchesDescription = assignment.description?.toLowerCase().includes(searchTerm);
        const matchesCourse = assignment.course_name?.toLowerCase().includes(searchTerm);
        
        if (!matchesTitle && !matchesDescription && !matchesCourse) {
          return false;
        }
      }

      // Type filter
      if (activeFilters.type && assignment.type !== activeFilters.type) {
        return false;
      }

      // Status filter (basic implementation)
      if (activeFilters.status) {
        // For now, we'll implement basic status logic
        // You can enhance this based on submission data
        const currentDate = new Date();
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
        
        if (activeFilters.status === 'overdue' && (!dueDate || dueDate >= currentDate)) {
          return false;
        }
        if (activeFilters.status === 'pending' && dueDate && dueDate < currentDate) {
          return false;
        }
      }

      return true;
    });
  }, [allAssignments, activeFilters]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Memuat...</span>
      </div>
    );
  }

  if (isCoursesLoading || isAssignmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Memuat tugas...</span>
      </div>
    );
  }

  if (!allAssignments || allAssignments.length === 0) {
    return (
      <PageWrapper
        title={t('assignments')}
        description={t('assignment_page_description')}
        icon={BookOpen}
        iconColor="blue"
      >
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_assignments_title')}</h3>
          <p className="text-gray-600 mb-4">
            {userRole === 'student' 
              ? t('no_assignments_student_message')
              : t('no_assignments_teacher_message')
            }
          </p>
          {courses?.data && courses.data.length > 0 && (userRole === 'teacher' || userRole === 'admin') && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('select_course_to_create_assignment')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {courses.data.map((course: Course) => (
                  <Card key={course.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base group-hover:text-blue-600 transition-colors">{course.name}</CardTitle>
                          <CardDescription className="text-sm">{course.code}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/courses/${course.id}/assignments/create`} className="inline-block w-full">
                        <div className="bg-blue-50 hover:bg-blue-100 transition-colors p-3 rounded-lg text-center">
                          <Plus className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">{t('create_assignment')}</span>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={t('assignments')}
      description={t('assignment_page_description')}
      icon={BookOpen}
      iconColor="blue"
      badge={`${filteredAssignments.length} ${t('assignments').toLowerCase()}`}
      actions={
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('filters')}
        </Button>
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
            <AssignmentFilters onFilterChange={handleFilterChange} />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-6">
        {filteredAssignments.length === 0 && allAssignments && allAssignments.length > 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_assignments_match_filter')}</h3>
            <p className="text-gray-600 mb-4">{t('try_adjusting_filters')}</p>
            <Button variant="outline" onClick={() => setActiveFilters({})}>
              {t('clear_filters')}
            </Button>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAssignments.map((assignment: AssignmentDetail, index: number) => (
              <motion.div
                key={assignment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1, duration: 0.3 }
                }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AssignmentCard
                  assignment={assignment}
                  userRole={userRole}
                  submissionStatus={'not_started'}
                  showCourseInfo={true}
                />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AssignmentsPage;