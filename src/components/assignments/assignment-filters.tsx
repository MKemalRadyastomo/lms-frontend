import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AssignmentFilters as AssignmentFiltersType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const filtersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['all', 'essay', 'file_upload', 'quiz']).optional(),
  status: z.enum(['all', 'pending', 'submitted', 'graded', 'overdue']).optional(),
});

type FiltersFormValues = z.infer<typeof filtersSchema>;

interface AssignmentFiltersProps {
  onFilterChange: (filters: Partial<AssignmentFiltersType>) => void;
}

export const AssignmentFilters: React.FC<AssignmentFiltersProps> = ({ onFilterChange }) => {
  const form = useForm<FiltersFormValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      search: '',
      type: 'all',
      status: 'all',
    },
  });

  // Helper functions to get display text
  const getTypeDisplayText = (value: string) => {
    switch (value) {
      case 'all': return 'All Types';
      case 'essay': return 'Essay';
      case 'file_upload': return 'File Upload';
      case 'quiz': return 'Quiz';
      default: return 'Type';
    }
  };

  const getStatusDisplayText = (value: string) => {
    switch (value) {
      case 'all': return 'All Statuses';
      case 'pending': return 'Pending';
      case 'submitted': return 'Submitted';
      case 'graded': return 'Graded';
      case 'overdue': return 'Overdue';
      default: return 'Status';
    }
  };

  const handleFilter = (values: FiltersFormValues) => {
    const filters: Partial<AssignmentFiltersType> = {};
    if (values.search) filters.search = values.search;
    if (values.type && values.type !== 'all') filters.type = values.type;
    if (values.status && values.status !== 'all') filters.status = values.status;
    onFilterChange(filters);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFilter)} className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Search assignments..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Type">
                      {getTypeDisplayText(field.value)}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Status">
                      {getStatusDisplayText(field.value)}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="graded">Graded</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit">Filter</Button>
      </form>
    </Form>
  );
};