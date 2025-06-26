import { notFound } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Submission, User } from '@/types';
import { toast } from 'sonner';
import { GradeSubmissionForm } from '@/components/assignments/grade-submission-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AssignmentDetailPageProps {
  params: {
    assignmentId: string;
  };
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const assignmentId = parseInt(params.assignmentId);
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userId = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_id='))
        ?.split('=')[1];
      if (userId) {
        return apiClient.getUserById(parseInt(userId));
      }
      return Promise.reject('User not logged in');
    },
    staleTime: Infinity,
  });

  const { data: assignment, isLoading: isLoadingAssignment, error: assignmentError } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => apiClient.getAssignmentById(assignmentId),
  });

  const { data: submissions, isLoading: isLoadingSubmissions, error: submissionsError } = useQuery<Submission[]>({
    queryKey: ['submissions', assignmentId],
    queryFn: () => apiClient.getSubmissionsByAssignmentId(assignmentId),
    enabled: !!assignment, // Only fetch submissions if assignment data is available
  });

  if (isLoadingUser || isLoadingAssignment || isLoadingSubmissions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (assignmentError || !assignment) {
    notFound();
  }

  const isInstructor = currentUser?.role_id === 1 || currentUser?.role_id === 2; // Admin or Guru

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
          <p className="text-sm text-muted-foreground">Due: {new Date(assignment.due_date).toLocaleString()}</p>
        </CardHeader>
        <CardContent>
          <p>{assignment.description}</p>
        </CardContent>
      </Card>

      {isInstructor && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions && submissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.student_name || `Student ${submission.student_id}`}</TableCell>
                      <TableCell>
                        <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.submitted_at ? format(new Date(submission.submitted_at), 'dd MMM yyyy HH:mm', { locale: id }) : 'N/A'}</TableCell>
                      <TableCell>{submission.grade !== null ? submission.grade : 'N/A'}</TableCell>
                      <TableCell>
                        <GradeSubmissionForm
                          submission={submission}
                          onGradeSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] });
                            toast.success('Submission graded successfully!');
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No submissions yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}