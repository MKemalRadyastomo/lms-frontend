
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubmissionsByAssignment } from '@/lib/submissions-api';
import { Submission } from '@/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { SubmissionStatus } from '@/components/submissions/submission-status';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SubmissionListProps {
  assignmentId: number;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({ assignmentId }) => {
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
    return <p className="text-muted-foreground">No submissions to grade.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.id}>
            <TableCell>{/* Student name would be here */}</TableCell>
            <TableCell>{format(new Date(submission.submitted_at), 'Pp', { locale: id })}</TableCell>
            <TableCell><SubmissionStatus status={submission.status} /></TableCell>
            <TableCell>{submission.grade ?? 'Not Graded'}</TableCell>
            <TableCell>
              <Link href={`/submissions/${submission.id}/grade`}>
                <Button variant="outline" size="sm">Grade</Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
