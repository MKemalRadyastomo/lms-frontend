
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubmissionsByAssignment } from '@/lib/submissions-api';
import { Submission } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { SubmissionStatus } from './submission-status';

interface SubmissionHistoryProps {
  assignmentId: number;
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ assignmentId }) => {
  const {
    data: submissions,
    isLoading,
    isError,
    error,
  } = useQuery<Submission[], Error>({
    queryKey: ['submissions', assignmentId],
    queryFn: () => getSubmissionsByAssignment(assignmentId).then(res => res.data),
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

  if (!submissions || submissions.length === 0) {
    return <p className="text-muted-foreground">No submissions yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Grade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell>{/* Student name would be here */}</TableCell>
            <TableCell>{format(new Date(submission.submitted_at), 'Pp', { locale: id })}</TableCell>
            <TableCell><SubmissionStatus status={submission.status} /></TableCell>
            <TableCell>{submission.grade ?? 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
