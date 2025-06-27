
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

const CourseAssignmentsPage = () => {
  const params = useParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const courseId = Number(params.courseId);

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  const handleFilterChange = (filters: any) => {
    console.log(filters);
  };

  const handleCreateAssignment = () => {
    setIsNavigating(true);
    router.push(`/courses/${courseId}/assignments/create`);
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tugas Kursus</h1>
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
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <AssignmentFilters onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Assignments List */}
      <AssignmentList courseId={courseId} userRole={userRole} />
    </div>
  );
};

export default CourseAssignmentsPage;
