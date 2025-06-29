
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssignmentList } from '@/components/assignments/assignment-list';
import { AssignmentFilters } from '@/components/assignments/assignment-filters';
import { useAuth } from '@/hooks/useAuth';
import { AuthManager } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SlashIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const CourseAssignmentsPage = () => {
  const params = useParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
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
        <span className="ml-2 text-gray-600">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Beranda</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/courses/${courseId}`}>{course.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Tugas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tugas Kursus: {course.name}</h1>
          <p className="text-gray-600 mt-1">Kelola dan lihat semua tugas untuk kursus ini</p>
        </div>
        {(AuthManager.hasRole('teacher') || AuthManager.hasRole('admin') || AuthManager.hasRole('guru')) && (
          <Button 
            onClick={handleCreateAssignment}
            disabled={isNavigating}
            className="gap-2 min-w-[140px]"
          >
            {isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Memuat...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                Buat Tugas Baru
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Filters Section */}
      <div className="bg-white rounded-lg border p-6 shadow-sm mb-8">
        <AssignmentFilters onFilterChange={handleFilterChange} />
      </div>

      {/* Assignments List */}
      <AssignmentList courseId={courseId} userRole={userRole} />
    </div>
  );
};

export default CourseAssignmentsPage;
