'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignmentDetails } from '@/lib/assignments-api';
import { getStudentSubmission, submitEssay, submitFile, submitQuiz } from '@/lib/submissions-api';
import { EssaySubmissionForm } from '@/components/submissions/essay-submission-form';
import { FileSubmissionForm } from '@/components/submissions/file-submission-form';
import { QuizSubmissionForm } from '@/components/submissions/quiz-submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { 
  BookOpen, 
  Upload, 
  FileQuestion,
  ArrowLeft,
  Clock,
  Calendar,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Edit,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const typeConfig = {
  essay: {
    icon: BookOpen,
    label: 'Esai',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
    description: 'Tugas menulis esai'
  },
  file_upload: {
    icon: Upload,
    label: 'Upload File',
    color: 'bg-green-500/10 text-green-700 border-green-200',
    description: 'Tugas mengunggah file'
  },
  quiz: {
    icon: FileQuestion,
    label: 'Kuis',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
    description: 'Tugas kuis online'
  }
} as const;

const AssignmentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const assignmentId = Number(params.assignmentId);
  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';
  
  // For now, using a placeholder courseId - in real app this would come from assignment data
  const courseId = 1;

  // Fetch assignment details
  const { 
    data: assignment, 
    isLoading: isAssignmentLoading, 
    error: assignmentError 
  } = useQuery({
    queryKey: ['assignment', courseId, assignmentId],
    queryFn: () => getAssignmentDetails(courseId, assignmentId),
    enabled: !!assignmentId
  });

  // Fetch student submission (only for students)
  const { 
    data: submission, 
    isLoading: isSubmissionLoading 
  } = useQuery({
    queryKey: ['submission', assignmentId],
    queryFn: () => getStudentSubmission(assignmentId),
    enabled: userRole === 'student' && !!assignmentId,
    retry: false // Don't retry if no submission exists
  });

  // Submission mutations
  const essayMutation = useMutation({
    mutationFn: (data: any) => submitEssay(assignmentId, data),
    onSuccess: () => {
      toast({
        title: 'Berhasil!',
        description: 'Esai Anda telah berhasil dikirim.',
      });
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal mengirim esai',
        description: error.message || 'Terjadi kesalahan saat mengirim esai.',
        variant: 'destructive',
      });
    }
  });

  const fileMutation = useMutation({
    mutationFn: (data: FormData) => submitFile(assignmentId, data),
    onSuccess: () => {
      toast({
        title: 'Berhasil!',
        description: 'File Anda telah berhasil diunggah.',
      });
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal mengunggah file',
        description: error.message || 'Terjadi kesalahan saat mengunggah file.',
        variant: 'destructive',
      });
    }
  });

  const quizMutation = useMutation({
    mutationFn: (data: any) => submitQuiz(assignmentId, data),
    onSuccess: () => {
      toast({
        title: 'Berhasil!',
        description: 'Jawaban kuis Anda telah berhasil dikirim.',
      });
      queryClient.invalidateQueries({ queryKey: ['submission', assignmentId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal mengirim kuis',
        description: error.message || 'Terjadi kesalahan saat mengirim jawaban kuis.',
        variant: 'destructive',
      });
    }
  });

  if (isUserLoading || isAssignmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2">Memuat tugas...</span>
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tugas tidak ditemukan atau terjadi kesalahan saat memuat data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const typeInfo = typeConfig[assignment.type as keyof typeof typeConfig];
  const TypeIcon = typeInfo.icon;
  const isOverdue = new Date() > new Date(assignment.due_date);
  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'graded';

  const renderSubmissionInterface = () => {
    if (userRole !== 'student') {
      // Teacher/Admin view - show summary and management options
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Kelola Tugas
              </CardTitle>
              <CardDescription>
                Opsi pengelolaan tugas untuk guru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link href={`/courses/${courseId}/assignments/${assignmentId}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Tugas
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}/assignments/${assignmentId}/submissions`}>
                  <Button className="gap-2">
                    <FileText className="h-4 w-4" />
                    Lihat Pengiriman
                  </Button>
                </Link>
                <Link href={`/courses/${courseId}/assignments/${assignmentId}/analytics`}>
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analitik
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (isOverdue && !isSubmitted) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Batas waktu pengumpulan telah terlewati. Anda tidak dapat lagi mengirim tugas ini.
          </AlertDescription>
        </Alert>
      );
    }

    if (isSubmitted) {
      return (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Tugas Telah Dikirim</CardTitle>
            </div>
            <CardDescription>
              Anda telah mengirim tugas ini pada {format(new Date(submission!.submitted_at), 'PPP "pukul" HH:mm', { locale: id })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submission?.grade !== undefined ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-900">Nilai Anda</div>
                  {submission.feedback && (
                    <div className="text-sm text-blue-700 mt-1">
                      Catatan: {submission.feedback}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {submission.grade}/{assignment.max_score}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Menunggu Penilaian</span>
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  Tugas Anda sedang dalam proses penilaian oleh guru.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Show submission interface based on assignment type
    switch (assignment.type) {
      case 'essay':
        return (
          <EssaySubmissionForm
            assignment={assignment}
            existingSubmission={submission}
            onSubmit={(data) => essayMutation.mutate(data)}
            onSaveDraft={(data) => essayMutation.mutate(data)}
            isSubmitting={essayMutation.isPending}
            isDraft={submission?.status === 'draft'}
          />
        );
      
      case 'file_upload':
        return (
          <FileSubmissionForm
            assignment={assignment}
            existingSubmission={submission}
            onSubmit={(data) => fileMutation.mutate(data)}
            isSubmitting={fileMutation.isPending}
          />
        );
        
      case 'quiz':
        return (
          <QuizSubmissionForm
            assignment={assignment}
            existingSubmission={submission}
            onSubmit={(data) => quizMutation.mutate(data)}
            onSaveDraft={(data) => quizMutation.mutate(data)}
            isSubmitting={quizMutation.isPending}
            isDraft={submission?.status === 'draft'}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="text-sm text-gray-500">
          <Link href="/assignments" className="hover:text-blue-600">
            Tugas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{assignment.title}</span>
        </div>
      </div>

      {/* Assignment Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn(
          "border-l-4",
          isOverdue ? "border-l-red-500" : "border-l-blue-500"
        )}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-2 rounded-lg", typeInfo.color)}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={typeInfo.color}>
                    {typeInfo.label}
                  </Badge>
                  <Badge 
                    variant={isSubmitted ? "default" : isOverdue ? "destructive" : "secondary"}
                  >
                    {isSubmitted ? "Dikirim" : isOverdue ? "Terlambat" : "Aktif"}
                  </Badge>
                </div>
                
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {assignment.description}
                </CardDescription>
              </div>
              
              <div className="text-right">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Batas Waktu</div>
                    <div className={cn(
                      "font-medium",
                      isOverdue ? "text-red-600" : "text-gray-900"
                    )}>
                      {format(new Date(assignment.due_date), 'PPP', { locale: id })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(assignment.due_date), 'HH:mm')} WIB
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Nilai Maksimal</div>
                    <div className="text-xl font-bold text-blue-600">
                      {assignment.max_score} poin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instruksi Tugas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {assignment.description}
                </p>
              </div>
              
              {/* Type-specific information */}
              {assignment.type === 'file_upload' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Ketentuan File:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Jenis file: {assignment.allowed_file_types || 'pdf, doc, docx'}</li>
                    <li>• Ukuran maksimal: {assignment.max_file_size_mb || 10} MB</li>
                    <li>• Pastikan nama file jelas dan deskriptif</li>
                  </ul>
                </div>
              )}
              
              {assignment.type === 'quiz' && assignment.quiz_questions_json && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Informasi Kuis:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Jumlah pertanyaan: {assignment.quiz_questions_json.length}</li>
                    <li>• Waktu pengerjaan: Sesuai batas waktu tugas</li>
                    <li>• Jawaban otomatis tersimpan sebagai draf</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {renderSubmissionInterface()}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Tugas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Dibuat</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(assignment.created_at), 'PPP', { locale: id })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Guru</div>
                  <div className="text-sm text-gray-600">
                    {assignment.teacher_name || 'Guru Mata Pelajaran'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">Kelas</div>
                  <div className="text-sm text-gray-600">
                    {assignment.course_name || 'Mata Pelajaran'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Status for Students */}
          {userRole === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmissionLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Memuat status...</span>
                  </div>
                ) : submission ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        submission.status === 'submitted' ? "bg-green-500" :
                        submission.status === 'graded' ? "bg-blue-500" :
                        "bg-yellow-500"
                      )} />
                      <span className="text-sm font-medium">
                        {submission.status === 'submitted' ? 'Dikirim' :
                         submission.status === 'graded' ? 'Dinilai' :
                         'Draf'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Terakhir diperbarui: {format(new Date(submission.updated_at), 'PPP "pukul" HH:mm', { locale: id })}
                    </div>
                    
                    {submission.grade !== undefined && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {submission.grade}
                          </div>
                          <div className="text-sm text-blue-700">
                            dari {assignment.max_score} poin
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    Belum ada pengiriman
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
