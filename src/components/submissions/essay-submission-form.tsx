
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EssaySubmissionData } from '@/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const essaySchema = z.object({
  answer_text: z.string().min(10, 'Essay must be at least 10 characters'),
});

type EssayFormValues = z.infer<typeof essaySchema>;

interface EssaySubmissionFormProps {
  onSubmit: (data: EssaySubmissionData) => void;
  isSubmitting: boolean;
}

export const EssaySubmissionForm: React.FC<EssaySubmissionFormProps> = ({ onSubmit, isSubmitting }) => {
  const form = useForm<EssayFormValues>({
    resolver: zodResolver(essaySchema),
  });

  const handleSubmit = (values: EssayFormValues) => {
    onSubmit({ ...values, draft: false });
  };

  const handleSaveDraft = () => {
    const values = form.getValues();
    onSubmit({ ...values, draft: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="answer_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Essay</FormLabel>
              <FormControl>
                <Textarea rows={15} placeholder="Write your essay here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Essay'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
