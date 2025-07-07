'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAssignmentsByCourse } from '@/lib/assignments-api';
import { getStudentSubmission } from '@/lib/submissions-api';
import { Assignment, PaginatedResponse, Submission, SubmissionDetail } from '@/types';
import { AssignmentCard } from './assignment-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Upload, 
  FileQuestion,
  CalendarDays,
  SortAsc,
  SortDesc,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AssignmentListProps {
  courseId: number;
  userRole: 'student' | 'teacher' | 'admin';
}

type SortOption = 'due_date_asc' | 'due_date_desc' | 'created_asc' | 'created_desc' | 'title_asc' | 'title_desc';
type FilterType = 'all' | 'essay' | 'file_upload' | 'quiz';
type StatusFilter = 'all' | 'pending' | 'submitted' | 'graded' | 'overdue';

export const AssignmentList: React.FC<AssignmentListProps> = ({ courseId, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('due_date_asc');
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: assignments,
    isLoading,
    isError,
    error,
  } = useQuery<PaginatedResponse<Assignment>, Error>({
    queryKey: ['assignments', courseId],
    queryFn: () => getAssignmentsByCourse(courseId),
  });

  // For students, fetch submission status for each assignment
  const { data: submissions } = useQuery({
    queryKey: ['student-submissions', courseId, userRole],
    queryFn: async () => {
      if (userRole !== 'student' || !assignments?.data) return {};
      
      const submissionPromises = assignments.data.map(async (assignment) => {
        try {
          const submission = await getStudentSubmission(assignment.id);
          return { [assignment.id]: submission };
        } catch {
          return { [assignment.id]: null };
        }
      });
      
      const submissionResults = await Promise.all(submissionPromises);
      return submissionResults.reduce((acc, curr) => ({ ...acc, ...curr }), {} as Record<number, SubmissionDetail | null>);
    },
    enabled: userRole === 'student' && !!assignments?.data,
  });

  const getSubmissionStatus = (assignment: Assignment): 'not_started' | 'draft' | 'submitted' | 'graded' | 'overdue' => {
    if (userRole !== 'student') return 'not_started';
    
    const submission = submissions?.[assignment.id] as Submission | null;
    const isOverdue = new Date(assignment.due_date) < new Date();
    
    if (!submission) {
      return isOverdue ? 'overdue' : 'not_started';
    }
    
    if (submission.status === 'graded') return 'graded';
    if (submission.status === 'submitted') return 'submitted';
    if (submission.status === 'draft') {
      return isOverdue ? 'overdue' : 'draft';
    }
    
    return isOverdue ? 'overdue' : 'not_started';
  };

  const filteredAndSortedAssignments = React.useMemo(() => {
    if (!assignments?.data) return [];
    
    let filtered = assignments.data.filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || assignment.type === typeFilter;
      
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        const status = getSubmissionStatus(assignment);
        matchesStatus = status === statusFilter;
      }
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'due_date_asc':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'due_date_desc':
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [assignments?.data, searchTerm, typeFilter, statusFilter, sortOption, submissions]);

  const getFilterCounts = (): Record<string, number> => {
    if (!assignments?.data) return {};
    
    const counts: Record<string, number> = {
      all: assignments.data.length,
      essay: 0,
      file_upload: 0,
      quiz: 0,
      pending: 0,
      submitted: 0,
      graded: 0,
      overdue: 0,
      draft: 0
    };

    assignments.data.forEach(assignment => {
      counts[assignment.type]++;
      
      const status = getSubmissionStatus(assignment);
      if (status === 'not_started') counts.pending++;
      else if (status === 'draft') counts.draft++;
      else counts[status]++;
    });

    return counts;
  };

  const filterCounts = getFilterCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Memuat tugas...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gagal Memuat Tugas</AlertTitle>
        <AlertDescription>
          Terjadi kesalahan saat memuat daftar tugas: {error?.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!assignments?.data || assignments.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Tugas</h3>
        <p className="text-gray-600 mb-4">
          {userRole === 'student' 
            ? 'Belum ada tugas yang tersedia untuk kursus ini.'
            : 'Belum ada tugas yang dibuat untuk kursus ini.'
          }
        </p>
        {(userRole === 'teacher' || userRole === 'admin') && (
          <Link href={`/courses/${courseId}/assignments/create`}>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Buat Tugas Pertama
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "gap-2",
              showFilters && "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            <Filter className="h-4 w-4" />
            Filter
            {(typeFilter !== 'all' || statusFilter !== 'all') && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 flex items-center justify-center">
                {(typeFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger className="w-48">
              <div className="flex items-center gap-2">
                {sortOption.includes('asc') ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date_asc">Batas Waktu (Terlama)</SelectItem>
              <SelectItem value="due_date_desc">Batas Waktu (Terbaru)</SelectItem>
              <SelectItem value="created_desc">Dibuat (Terbaru)</SelectItem>
              <SelectItem value="created_asc">Dibuat (Terlama)</SelectItem>
              <SelectItem value="title_asc">Judul (A-Z)</SelectItem>
              <SelectItem value="title_desc">Judul (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Jenis Tugas</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Semua', icon: Filter, count: filterCounts.all },
                      { value: 'essay', label: 'Esai', icon: BookOpen, count: filterCounts.essay },
                      { value: 'file_upload', label: 'Upload File', icon: Upload, count: filterCounts.file_upload },
                      { value: 'quiz', label: 'Kuis', icon: FileQuestion, count: filterCounts.quiz },
                    ].map(({ value, label, icon: Icon, count }) => (
                      <Button
                        key={value}
                        variant={typeFilter === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTypeFilter(value as FilterType)}
                        className="gap-2"
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                        <Badge variant="secondary" className="ml-1">{count}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status Filter (for students) */}
                {userRole === 'student' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all', label: 'Semua', count: filterCounts.all },
                        { value: 'pending', label: 'Pending', count: filterCounts.pending },
                        { value: 'submitted', label: 'Dikirim', count: filterCounts.submitted },
                        { value: 'graded', label: 'Dinilai', count: filterCounts.graded },
                        { value: 'overdue', label: 'Terlambat', count: filterCounts.overdue },
                      ].map(({ value, label, count }) => (
                        <Button
                          key={value}
                          variant={statusFilter === value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setStatusFilter(value as StatusFilter)}
                        >
                          {label}
                          <Badge variant="secondary" className="ml-1">{count}</Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Menampilkan <span className="font-medium">{filteredAndSortedAssignments.length}</span> dari{' '}
          <span className="font-medium">{assignments.data.length}</span> tugas
        </div>
        
        {(typeFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter('all');
              setStatusFilter('all');
              setSearchTerm('');
            }}
          >
            Hapus Filter
          </Button>
        )}
      </div>

      {/* Assignment Grid */}
      {filteredAndSortedAssignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Hasil</h3>
          <p className="text-gray-600">
            Tidak ada tugas yang sesuai dengan filter yang dipilih.
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredAndSortedAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1, duration: 0.3 }
                }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AssignmentCard
                  assignment={assignment}
                  userRole={userRole}
                  submissionStatus={getSubmissionStatus(assignment)}
                  grade={userRole === 'student' ? submissions?.[assignment.id]?.grade : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
