
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AssignmentList } from '@/components/assignments/assignment-list';
import { AssignmentFilters } from '@/components/assignments/assignment-filters';
import { useAuth } from '@/hooks/useAuth';
import { AuthManager } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const CourseAssignmentsPage = () => {
  const params = useParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const courseId = Number(params.courseId);

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';
  console.log('Current user object:', user);
  console.log('User role_id:', user?.role_id);
  console.log('Calculated userRole:', userRole);

  const handleFilterChange = (filters: any) => {
    console.log(filters);
  };

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Course Assignments</h1>
      {(AuthManager.hasRole('teacher') || AuthManager.hasRole('admin') || AuthManager.hasRole('guru')) && (
        <div className="mb-4 flex justify-end">
          <Link href={`/courses/${courseId}/assignments/create`} passHref>
            <Button>Create New Assignment</Button>
          </Link>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <AssignmentFilters onFilterChange={handleFilterChange} />
      </div>
      <div className="mt-8">
        <AssignmentList courseId={courseId} userRole={userRole} />
      </div>
    </div>
  );
};

export default CourseAssignmentsPage;
