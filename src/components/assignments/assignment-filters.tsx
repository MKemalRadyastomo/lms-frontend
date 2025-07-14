import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AssignmentFilters as AssignmentFiltersType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/components/ui/form-select';
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
        <FormSelect
          name="type"
          control={control}
          options={[
            { value: 'all', label: t('all_types') },
            { value: 'essay', label: t('essay') },
            { value: 'file_upload', label: t('file_upload') },
            { value: 'quiz', label: t('quiz') }
          ]}
          placeholder={t('type')}
          className="data-[testid='assignment-type-select']"
        />
        <FormSelect
          name="status"
          control={control}
          options={[
            { value: 'all', label: t('all_statuses') },
            { value: 'pending', label: t('pending') },
            { value: 'submitted', label: t('submitted') },
            { value: 'graded', label: t('graded') },
            { value: 'overdue', label: t('overdue') }
          ]}
          placeholder={t('status')}
          className="data-[testid='assignment-status-select']"
        />
        <Button type="submit" data-testid="assignment-filter-button">{t('filter')}</Button>
      </form>
    </Form>
  );
};