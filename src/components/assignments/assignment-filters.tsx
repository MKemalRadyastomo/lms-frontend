import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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

  const { control, handleSubmit } = form;

  const handleFilter = (values: FiltersFormValues) => {
    const filters: Partial<AssignmentFiltersType> = {};
    if (values.search) filters.search = values.search;
    if (values.type && values.type !== 'all') filters.type = values.type;
    if (values.status && values.status !== 'all') filters.status = values.status;
    onFilterChange(filters);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFilter)} className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
        <FormField
          control={control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder={t('search_assignments')} {...field} data-testid="assignment-search-input" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} data-testid="assignment-type-select">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('type')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t('all_types')}</SelectItem>
                      <SelectItem value="essay">{t('essay')}</SelectItem>
                      <SelectItem value="file_upload">{t('file_upload')}</SelectItem>
                      <SelectItem value="quiz">{t('quiz')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} data-testid="assignment-status-select">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('status')} />
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
                )}
              />
            </FormItem>
          )}
        />
        <Button type="submit" data-testid="assignment-filter-button">{t('filter')}</Button>
      </form>
    </Form>
  );
};