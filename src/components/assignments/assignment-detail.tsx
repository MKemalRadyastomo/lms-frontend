
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAssignmentDetails } from '@/lib/assignments-api';
import { AssignmentDetail as AssignmentDetailType } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AssignmentDetailProps {
  courseId: number;
  assignmentId: number;
  userRole: 'student' | 'teacher' | 'admin';
}

export const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ courseId, assignmentId, userRole }) => {
  const {
    data: assignment,
    isLoading,
    isError,
    error,
  } = useQuery<AssignmentDetailType, Error>({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: () => getAssignmentDetails(courseId, assignmentId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{assignment.type.replace('_', ' ')}</Badge>
          <p className="text-sm text-muted-foreground">
            Due: {format(new Date(assignment.due_date), 'PPPP', { locale: id })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base text-muted-foreground">{assignment.description}</p>
        {/* Submission form will go here */}
      </CardContent>
    </Card>
  );
};
