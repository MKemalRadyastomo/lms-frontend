'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  UserPlus, 
  Search,
  MoreHorizontal,
  Mail,
  Calendar,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const CourseStudentsPage = () => {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudentEmail, setSelectedStudentEmail] = useState('');
  
  const courseId = React.useMemo(() => {
    const id = parseInt(params.courseId, 10);
    return isNaN(id) ? null : id;
  }, [params.courseId]);
  
  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  // Fetch course details
  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiClient.getCourseById(courseId!),
    enabled: courseId !== null,
  });

  // Fetch enrollments
  const { data: enrollments, isLoading: isEnrollmentsLoading, error } = useQuery({
    queryKey: ['enrollments', courseId, statusFilter, searchTerm],
    queryFn: () => apiClient.getCourseEnrollments(courseId!, {
      status: statusFilter === 'all' ? undefined : statusFilter as any,
      search: searchTerm || undefined,
    }),
    enabled: courseId !== null,
  });

  // Fetch all users for enrollment
  const { data: allUsers } = useQuery({
    queryKey: ['users', 'students'],
    queryFn: () => apiClient.getUsers({ limit: 1000 }),
    enabled: userRole !== 'student',
  });

  // Enroll student mutation
  const enrollStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const student = allUsers?.data.find(u => u.id.toString() === studentId);
      if (!student) {
        throw new Error('Student not found');
      }
      return apiClient.enrollStudent(courseId!, { user_id: student.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', courseId] });
      // Reset state when dialog closes
      setIsEnrollDialogOpen(false);
      setSelectedStudentId('');
      setSelectedStudentEmail('');
      toast({
        title: 'Berhasil',
        description: 'Siswa berhasil didaftarkan ke kursus',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal mendaftarkan siswa',
        variant: 'destructive',
      });
    },
  });

  // Remove enrollment mutation
  const removeEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId: number) => 
      apiClient.removeEnrollment(courseId!, enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments', courseId] });
      toast({
        title: 'Berhasil',
        description: 'Siswa berhasil dihapus dari kursus',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus siswa',
        variant: 'destructive',
      });
    },
  });

  // Check permissions
  const canManageStudents = userRole === 'admin' || (userRole === 'teacher' && course?.teacher_id === user?.id);

  if (courseId === null) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ID Kursus Tidak Valid</AlertTitle>
          <AlertDescription>ID kursus yang diberikan tidak valid.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isCourseLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Memuat data kursus...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kursus Tidak Ditemukan</AlertTitle>
          <AlertDescription>Kursus yang Anda cari tidak ditemukan.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aktif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'dropped':
        return <Badge variant="destructive"><Trash2 className="h-3 w-3 mr-1" />Keluar</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const availableStudents = allUsers?.data.filter(user => 
    user.role_id === 1 && // Only students
    !enrollments?.data.some(enrollment => enrollment.user_id === user.id)
  ) || [];

  // Helper function to get status filter display text
  const getStatusFilterDisplay = (value: string) => {
    switch (value) {
      case 'all': return 'Semua Status';
      case 'active': return 'Aktif';
      case 'pending': return 'Menunggu';
      case 'dropped': return 'Keluar';
      default: return 'Filter status';
    }
  };

  // Handle dialog close with state reset
  const handleDialogClose = (open: boolean) => {
    setIsEnrollDialogOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setSelectedStudentId('');
      setSelectedStudentEmail('');
    }
  };

  // Handle student selection
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentId(studentId);
    const student = allUsers?.data.find(u => u.id.toString() === studentId);
    if (student) {
      setSelectedStudentEmail(student.email);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Siswa Kursus
              </h1>
              <p className="text-gray-600">
                Kelola siswa yang terdaftar di {course.name}
              </p>
            </div>
            
            {canManageStudents && (
              <Dialog open={isEnrollDialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Daftarkan Siswa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Daftarkan Siswa Baru</DialogTitle>
                    <DialogDescription>
                      Pilih siswa yang akan didaftarkan ke kursus ini
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Select value={selectedStudentId} onValueChange={handleStudentSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih siswa..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.length === 0 ? (
                          <div className="py-4 text-center text-gray-500">
                            Tidak ada siswa yang tersedia
                          </div>
                        ) : (
                          availableStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.first_name} {student.last_name} ({student.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {selectedStudentId && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                        <strong>Siswa dipilih:</strong> {(() => {
                          const student = allUsers?.data.find(u => u.id.toString() === selectedStudentId);
                          return student ? `${student.first_name} ${student.last_name} (${student.email})` : 'Tidak ditemukan';
                        })()}
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={() => enrollStudentMutation.mutate(selectedStudentId)}
                      disabled={!selectedStudentId || enrollStudentMutation.isPending}
                    >
                      {enrollStudentMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Mendaftarkan...
                        </>
                      ) : (
                        'Daftarkan'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari siswa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter status">
                      {getStatusFilterDisplay(statusFilter)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="dropped">Keluar</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Daftar Siswa ({enrollments?.pagination.total_items || 0})
              </CardTitle>
              <CardDescription>
                Siswa yang terdaftar dalam kursus ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEnrollmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                  <span className="ml-2 text-gray-600">Memuat daftar siswa...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Gagal Memuat Data</AlertTitle>
                  <AlertDescription>
                    Terjadi kesalahan saat memuat daftar siswa
                  </AlertDescription>
                </Alert>
              ) : enrollments?.data.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Belum ada siswa yang terdaftar</p>
                  {canManageStudents && (
                    <Button onClick={() => setIsEnrollDialogOpen(true)}>
                      Daftarkan Siswa Pertama
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal Daftar</TableHead>
                        {canManageStudents && <TableHead className="w-12"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments?.data.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            <div className="font-medium">
                              {enrollment.student_name || 'Nama tidak tersedia'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              {enrollment.student_email || 'Email tidak tersedia'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(enrollment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(enrollment.enrollment_date).toLocaleDateString('id-ID')}
                            </div>
                          </TableCell>
                          {canManageStudents && (
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => removeEnrollmentMutation.mutate(enrollment.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus dari Kursus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseStudentsPage;