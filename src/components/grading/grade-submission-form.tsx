import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { Submission } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const formSchema = z.object({
  grade: z.coerce.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});

interface GradeSubmissionFormProps {
  submission: Submission;
  onGradeSuccess: () => void;
}

export function GradeSubmissionForm({ submission, onGradeSuccess }: GradeSubmissionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast: uiToast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grade: submission.grade || undefined,
      feedback: submission.feedback || '',
    },
  });

  const gradeMutation = useMutation({
    mutationFn: (data: { grade?: number; feedback?: string }) =>
      apiClient.gradeSubmission(submission.id, data.grade, data.feedback),
    onSuccess: () => {
      toast.success('Submission graded successfully!');
      onGradeSuccess();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to grade submission.');
      uiToast({
        title: 'Grading Failed',
        description: 'Failed to grade the submission. Please try again.',
        variant: 'destructive'
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    gradeMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {submission.status === 'graded' ? 'Edit Grade' : 'Grade'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{submission.status === 'graded' ? 'Edit Grade' : 'Grade'} Submission</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade (0-100)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={gradeMutation.isPending}>
              {gradeMutation.isPending ? 'Saving...' : 'Save Grade'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
