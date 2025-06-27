
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const gradingSchema = z.object({
  grade: z.number().min(0, 'Grade must be a positive number'),
  feedback: z.string().optional(),
});

type GradingFormValues = z.infer<typeof gradingSchema>;

interface GradingFormProps {
  onSubmit: (data: GradingFormValues) => void;
  isSubmitting: boolean;
}

export const GradingForm: React.FC<GradingFormProps> = ({ onSubmit, isSubmitting }) => {
  const form = useForm<GradingFormValues>({
    resolver: zodResolver(gradingSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter grade" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
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
                <Textarea rows={5} placeholder="Provide feedback to the student" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Grade'}
        </Button>
      </form>
    </Form>
  );
};
