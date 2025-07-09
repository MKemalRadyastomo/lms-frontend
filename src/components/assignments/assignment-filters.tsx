'use client';
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      case 'all': return t('all_types');
      case 'essay': return t('essay');
      case 'file_upload': return t('file_upload');
      case 'quiz': return t('quiz');
      default: return t('type');
    }
  };

  const getStatusDisplayText = (value: string) => {
    switch (value) {
      case 'all': return t('all_statuses');
      case 'pending': return t('pending');
      case 'submitted': return t('submitted');
      case 'graded': return t('graded');
      case 'overdue': return t('overdue');
      default: return t('status');
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
                <Input placeholder={t('search_assignments')} {...field} />
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
                    <SelectValue placeholder={t('type')}>
                      {getTypeDisplayText(field.value ?? '')}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">{t('all_types')}</SelectItem>
                  <SelectItem value="essay">{t('essay')}</SelectItem>
                  <SelectItem value="file_upload">{t('file_upload')}</SelectItem>
                  <SelectItem value="quiz">{t('quiz')}</SelectItem>
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
                    <SelectValue placeholder={t('status')}>
                      {getStatusDisplayText(field.value ?? '')}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">{t('all_statuses')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="submitted">{t('submitted')}</SelectItem>
                  <SelectItem value="graded">{t('graded')}</SelectItem>
                  <SelectItem value="overdue">{t('overdue')}</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <Button type="submit">{t('filter')}</Button>
      </form>
    </Form>
  );
};