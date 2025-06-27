
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AssignmentDetail } from '@/components/assignments/assignment-detail';
import { useAuth } from '@/hooks/useAuth';

const AssignmentDetailPage = () => {
  const params = useParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const assignmentId = Number(params.assignmentId);

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  // A placeholder courseId, in a real app this would come from context or the assignment data itself
  const courseId = 1;

  if (isUserLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <AssignmentDetail courseId={courseId} assignmentId={assignmentId} userRole={userRole} />
      {/* Submission UI will be conditionally rendered here based on assignment type and user role */}
    </div>
  );
};

export default AssignmentDetailPage;
