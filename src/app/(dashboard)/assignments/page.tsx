'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { AssignmentFilters } from '@/components/assignments/assignment-filters';
import { useAuth } from '@/hooks/useAuth';
import { Assignment, Course } from '@/types';
import { AssignmentCard } from '@/components/assignments/assignment-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlertCircle, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentsPage = () => {
  const { user, isLoading: isUserLoading } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

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
          const response = await apiClient.get(`/courses/${course.id}/assignments`);
          return response.data.data?.map((assignment: Assignment) => ({
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

  const handleFilterChange = (filters: any) => {
    console.log(filters);
  };

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
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tugas</h3>
          <p className="text-gray-600 mb-4">
            {userRole === 'student' 
              ? 'Belum ada tugas yang tersedia dari semua kursus Anda.'
              : 'Belum ada tugas yang dibuat. Pilih kursus untuk membuat tugas pertama.'
            }
          </p>
          {courses?.data && courses.data.length > 0 && (userRole === 'teacher' || userRole === 'admin') && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pilih kursus untuk membuat tugas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {courses.data.map((course: Course) => (
                  <Card key={course.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-base">{course.name}</CardTitle>
                      </div>
                      <CardDescription className="text-sm">{course.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <a href={`/courses/${course.id}/assignments/create`} className="inline-block w-full">
                        <div className="bg-blue-50 hover:bg-blue-100 transition-colors p-3 rounded-lg text-center">
                          <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Buat Tugas</span>
                        </div>
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Semua Tugas</h1>
        <p className="text-gray-600">Tugas dari semua kursus yang Anda ikuti</p>
      </div>
      
      <AssignmentFilters onFilterChange={handleFilterChange} />
      
      <div className="mt-8">
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {allAssignments.map((assignment: Assignment, index: number) => (
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
      </div>
    </div>
  );
};

export default AssignmentsPage;