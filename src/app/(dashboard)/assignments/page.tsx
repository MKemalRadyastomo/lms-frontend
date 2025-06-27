'use client';

import React from 'react';
import { AssignmentList } from '@/components/assignments/assignment-list';
import { AssignmentFilters } from '@/components/assignments/assignment-filters';
import { useAuth } from '@/hooks/useAuth'; // Assuming a custom hook for auth

const AssignmentsPage = () => {
  const { user, isLoading: isUserLoading } = useAuth();

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  // A placeholder courseId, in a real app this would come from context or URL
  const courseId = 1;

  const handleFilterChange = (filters: any) => {
    // Logic to refetch assignments with new filters
    console.log(filters);
  };

  if (isUserLoading || !user) {
    return <div>Loading...</div>; // Or a proper loader
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Assignments</h1>
      <AssignmentFilters onFilterChange={handleFilterChange} />
      <div className="mt-8">
        <AssignmentList courseId={courseId} userRole={userRole} />
      </div>
    </div>
  );
};

export default AssignmentsPage;