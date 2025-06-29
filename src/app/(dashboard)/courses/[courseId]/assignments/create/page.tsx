
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createAssignment } from '@/lib/assignments-api';
import { apiClient } from '@/lib/api';
import { AssignmentForm } from '@/components/assignments/assignment-form';
import { AssignmentCreateData } from '@/types';
import { useToast } from '@/components/ui/use-toast';

const CreateAssignmentPage = () => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = Number(params.courseId);

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiClient.getCourseById(courseId),
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: AssignmentCreateData) => {
      try {
        const result = await createAssignment(courseId, data);
        return result;
      } catch (error: any) {
        // Enhanced error handling
        const errorMessage = error?.response?.data?.message || error?.message || 'Gagal membuat tugas';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      toast({
        title: 'Berhasil!',
        description: 'Tugas berhasil dibuat dan sudah tersedia untuk siswa.',
        variant: 'default',
      });
      // Navigate after short delay to show toast
      // router.push(`/courses/${courseId}/assignments`); // Removed automatic redirect
    },
    onError: (error: Error) => {
      console.error('Assignment creation error:', error);
      toast({
        title: 'Gagal Membuat Tugas',
        description: error.message || 'Terjadi kesalahan saat membuat tugas. Silakan coba lagi.',
        variant: 'destructive',
      });
    },
  });

  if (isCourseLoading) {
    return <div>Loading course details...</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        <span className="block">Create New Assignment</span>
        <span className="block text-xl text-muted-foreground">for {course.name}</span>
      </h1>
      <AssignmentForm
        courseId={courseId}
        onSubmit={createAssignmentMutation.mutate}
        isSubmitting={createAssignmentMutation.isPending}
      />
    </div>
  );
};

export default CreateAssignmentPage;
