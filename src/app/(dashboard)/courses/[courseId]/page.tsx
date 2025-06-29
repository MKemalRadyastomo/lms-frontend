'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  User
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CourseDetailPage = () => {
  const params = useParams<{ courseId: string }>();
  const { user } = useAuth();
  
  // Parse courseId with proper validation
  const courseId = React.useMemo(() => {
    const id = parseInt(params.courseId, 10);
    return isNaN(id) ? null : id;
  }, [params.courseId]);
  
  const userRole = user ? (user.role_id === 1 ? 'student' : user.role_id === 2 ? 'teacher' : 'admin') : 'student';

  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiClient.getCourseById(courseId!),
    enabled: courseId !== null,
  });

  // Fetch course assignments for statistics
  const { data: assignments } = useQuery({
    queryKey: ['assignments', courseId],
    queryFn: () => apiClient.getCourseAssignments(courseId!),
    enabled: !!course && courseId !== null,
  });

  // Fetch course statistics
  const { data: courseStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['courseStats', courseId],
    queryFn: () => apiClient.getCourseStatistics(courseId!),
    enabled: !!course && courseId !== null,
  });

  // Handle invalid courseId
  if (courseId === null) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>ID Kursus Tidak Valid</AlertTitle>
          <AlertDescription>ID kursus yang diberikan tidak valid. Silakan periksa URL dan coba lagi.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Memuat kursus...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal Memuat Kursus</AlertTitle>
          <AlertDescription>{error?.message || 'Terjadi kesalahan saat memuat kursus'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kursus Tidak Ditemukan</AlertTitle>
          <AlertDescription>Kursus yang Anda cari tidak ditemukan atau tidak tersedia.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const assignmentCount = assignments?.data?.length || 0;
  const studentCount = courseStats?.studentCount || 0;
  const completedAssignments = courseStats?.completedAssignments || 0;
  const averageGrade = courseStats?.averageGrade || 0;

  const quickActions = [
    {
      title: 'Tugas',
      description: `${assignmentCount} tugas tersedia`,
      icon: BookOpen,
      href: `/courses/${courseId}/assignments`,
      color: 'blue',
      count: assignmentCount
    },
    {
      title: 'Siswa',
      description: `${studentCount} siswa terdaftar`,
      icon: Users,
      href: `/courses/${courseId}/students`,
      color: 'green',
      count: studentCount,
      hidden: userRole === 'student'
    },
    {
      title: 'Materi',
      description: 'Bahan pembelajaran',
      icon: FileText,
      href: `/courses/${courseId}/materials`,
      color: 'purple',
      count: 0
    },
    {
      title: 'Pengaturan',
      description: 'Kelola kursus',
      icon: Settings,
      href: `/courses/${courseId}/settings`,
      color: 'gray',
      hidden: userRole === 'student'
    }
  ].filter(action => !action.hidden);

  const stats = [
    {
      title: 'Total Tugas',
      value: assignmentCount,
      icon: BookOpen,
      color: 'blue',
      description: 'Tugas yang dibuat'
    },
    {
      title: 'Tugas Selesai',
      value: completedAssignments,
      icon: CheckCircle,
      color: 'green',
      description: 'Tugas yang diselesaikan',
      hidden: userRole !== 'student'
    },
    {
      title: 'Siswa Aktif',
      value: studentCount,
      icon: Users,
      color: 'purple',
      description: 'Siswa terdaftar',
      hidden: userRole === 'student'
    },
    {
      title: 'Rata-rata Nilai',
      value: averageGrade || '-',
      icon: TrendingUp,
      color: 'yellow',
      description: 'Nilai rata-rata kelas',
      hidden: userRole === 'student'
    }
  ].filter(stat => !stat.hidden);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {course.code}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    {course.privacy === 'public' ? 'Publik' : 'Privat'}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-3">{course.name}</h1>
                <p className="text-xl text-blue-100 mb-4 leading-relaxed">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{course.teacher_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Dibuat {new Date(course.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-lg border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl",
                      stat.color === 'blue' && "bg-blue-100 text-blue-600",
                      stat.color === 'green' && "bg-green-100 text-green-600",
                      stat.color === 'purple' && "bg-purple-100 text-purple-600",
                      stat.color === 'yellow' && "bg-yellow-100 text-yellow-600"
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Akses Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl group-hover:scale-110 transition-transform duration-200",
                          action.color === 'blue' && "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
                          action.color === 'green' && "bg-green-100 text-green-600 group-hover:bg-green-200",
                          action.color === 'purple' && "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
                          action.color === 'gray' && "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h3>
                            {action.count !== undefined && (
                              <Badge variant="secondary" className="ml-2">
                                {action.count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription>
                Aktivitas terbaru dalam kursus ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments?.data?.slice(0, 5).map((assignment: any, index: number) => (
                  <div key={assignment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{assignment.title}</p>
                      <p className="text-sm text-gray-500">
                        Batas waktu: {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant={new Date(assignment.due_date) < new Date() ? "destructive" : "secondary"}>
                      {new Date(assignment.due_date) < new Date() ? 'Terlambat' : 'Aktif'}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Belum ada aktivitas terbaru</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
