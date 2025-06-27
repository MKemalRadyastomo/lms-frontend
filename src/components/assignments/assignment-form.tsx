
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AssignmentCreateData } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const assignmentFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['essay', 'file_upload', 'quiz']),
  due_date: z.date(),
  max_score: z.number().min(0, 'Max score must be a positive number'),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormProps {
  courseId: number;
  onSubmit: (data: AssignmentCreateData) => void;
  initialData?: Partial<AssignmentCreateData>;
  isSubmitting: boolean;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ courseId, onSubmit, initialData, isSubmitting }) => {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      ...initialData,
      type: initialData?.type || 'essay', // Ensure a default type
      due_date: initialData?.due_date ? new Date(initialData.due_date) : new Date(),
    },
  });

  const handleSubmit = (values: AssignmentFormValues) => {
    onSubmit({ ...values, due_date: values.due_date.toISOString() });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Final Essay" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide instructions for the assignment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an assignment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )
          }
        />
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_score"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Score</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};
