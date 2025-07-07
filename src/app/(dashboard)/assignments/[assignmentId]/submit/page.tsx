
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAssignmentDetails } from '@/lib/assignments-api';
import { submitEssay, submitFile, submitQuiz } from '@/lib/submissions-api';
import { EssaySubmissionForm } from '@/components/submissions/essay-submission-form';
import { FileSubmissionForm } from '@/components/submissions/file-submission-form';
import { QuizSubmissionForm } from '@/components/submissions/quiz-submission-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

const SubmitAssignmentPage = () => {
  const params = useParams();
  const { user, isLoading: isUserLoading } = useAuth();
  const assignmentId = Number(params.assignmentId);
  const courseId = 1; // Placeholder

  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: () => getAssignmentDetails(courseId, assignmentId),
  });

  const mutation = useMutation({
    mutationFn: (submissionData: any) => {
      if (assignment?.type === 'essay') {
        return submitEssay(assignmentId, { answer_text: submissionData, draft: false });
      } else if (assignment?.type === 'file_upload') {
        return submitFile(assignmentId, submissionData);
        return submitQuiz(assignmentId, submissionData);
      }
      throw new Error('Invalid assignment type');
    },
  });

  const handleSaveDraft = async (data: any) => {
    if (assignment?.type === 'essay') {
      await submitEssay(assignmentId, { answer_text: data.answer_text, draft: true });
    } else if (assignment?.type === 'file_upload') {
      const formData = new FormData();
      formData.append('submitted_file', data.submitted_file);
      formData.append('draft', 'true');
      await submitFile(assignmentId, formData);
    } else if (assignment?.type === 'quiz') {
      await submitQuiz(assignmentId, { answers: data.answers, draft: true });
    }
  };

  if (isLoading || isUserLoading || !user) {
    return <LoadingSpinner />;
  }

  if (!assignment) {
    return <Alert variant="destructive"><AlertTitle>Assignment not found</AlertTitle></Alert>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
      <p className="text-muted-foreground mb-6">Submit your work</p>

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>{mutation.error.message}</AlertDescription>
        </Alert>
      )}

      {assignment.type === 'essay' && (
        <EssaySubmissionForm 
          assignment={assignment}
          onSubmit={(data) => mutation.mutate(data.answer_text)}
          onSaveDraft={(data) => handleSaveDraft(data)}
          isSubmitting={mutation.isPending} 
        />
      )}

      {assignment.type === 'file_upload' && (
        <FileSubmissionForm
          assignment={assignment}
          onSubmit={(data) => mutation.mutate(data)}
          onSaveDraft={(data) => handleSaveDraft(data)}
          isSubmitting={mutation.isPending}
        />
      )}

      {assignment.type === 'quiz' && assignment.quiz_questions_json && (
        <QuizSubmissionForm
          assignment={assignment}
          questions={assignment.quiz_questions_json}
          onSubmit={(data) => mutation.mutate(data)}
          onSaveDraft={(data) => handleSaveDraft(data)}
          isSubmitting={mutation.isPending}
        />
      )}
    </div>
  );
};

export default SubmitAssignmentPage;
