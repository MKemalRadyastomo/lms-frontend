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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Shield,
  Users,
  Bell,
  Lock,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const CourseSettingsPage = () => {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    privacy: 'private' as 'private' | 'public',
    teacher_id: 0,
  });
  
  const [settingsForm, setSettingsForm] = useState({
    auto_enrollment: false,
    max_students: '',
    allow_late_submission: true,
    require_approval: false,
    email_notifications: true,
    discussion_enabled: true,
  });
  
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

  // Update course form when course data is loaded
  React.useEffect(() => {
    if (course) {
      setCourseForm({
        name: course.name || '',
        description: course.description || '',
        privacy: course.privacy || 'private',
        teacher_id: course.teacher_id || 0,
      });
    }
  }, [course]);

  // Fetch course settings - mock implementation since we don't have real settings API
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['courseSettings', courseId],
    queryFn: async () => {
      // Mock settings - in real implementation this would call the API
      return {
        id: 1,
        course_id: courseId!,
        auto_enrollment: false,
        max_students: undefined,
        allow_late_submission: true,
        require_approval: false,
        email_notifications: true,
        discussion_enabled: true,
        created_at: new Date().toISOString(),
      };
    },
    enabled: courseId !== null,
  });

  // Update settings form when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      setSettingsForm({
        auto_enrollment: settings.auto_enrollment || false,
        max_students: settings.max_students?.toString() || '',
        allow_late_submission: settings.allow_late_submission ?? true,
        require_approval: settings.require_approval || false,
        email_notifications: settings.email_notifications ?? true,
        discussion_enabled: settings.discussion_enabled ?? true,
      });
    }
  }, [settings]);

  // Fetch teachers for reassignment
  const { data: teachers } = useQuery({
    queryKey: ['users', 'teachers'],
    queryFn: () => apiClient.getUsers({ limit: 1000 }),
    enabled: userRole === 'admin',
    select: (data) => data.data.filter(u => u.role_id === 2), // Filter teachers only
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: (data: typeof courseForm) => 
      apiClient.updateCourse(courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast({
        title: 'Berhasil',
        description: 'Informasi kursus berhasil diperbarui',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui informasi kursus',
        variant: 'destructive',
      });
    },
  });

  // Update settings mutation - mock implementation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settingsForm) => {
      // Mock API call - in real implementation this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseSettings', courseId] });
      toast({
        title: 'Berhasil',
        description: 'Pengaturan kursus berhasil diperbarui',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal memperbarui pengaturan kursus',
        variant: 'destructive',
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: () => apiClient.deleteCourse(courseId!),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Kursus berhasil dihapus',
      });
      router.push('/courses');
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus kursus',
        variant: 'destructive',
      });
    },
  });

  // Check permissions
  const canManageSettings = userRole === 'admin' || (userRole === 'teacher' && course?.teacher_id === user?.id);

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

  if (!canManageSettings) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>Anda tidak memiliki izin untuk mengakses pengaturan kursus ini.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isCourseLoading || isSettingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Memuat pengaturan...</span>
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

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCourseMutation.mutate(courseForm);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settingsForm);
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
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pengaturan Kursus
              </h1>
              <p className="text-gray-600">
                Kelola pengaturan dan konfigurasi untuk {course.name}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informasi Kursus
                  </CardTitle>
                  <CardDescription>
                    Ubah informasi dasar kursus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCourseSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-name">Nama Kursus</Label>
                      <Input
                        id="course-name"
                        value={courseForm.name}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Masukkan nama kursus..."
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="course-description">Deskripsi</Label>
                      <Textarea
                        id="course-description"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Deskripsi kursus..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="course-privacy">Privasi Kursus</Label>
                      <Select 
                        value={courseForm.privacy} 
                        onValueChange={(value: 'private' | 'public') => 
                          setCourseForm(prev => ({ ...prev, privacy: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Privat
                            </div>
                          </SelectItem>
                          <SelectItem value="public">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              Publik
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {userRole === 'admin' && teachers && (
                      <div className="space-y-2">
                        <Label htmlFor="course-teacher">Pengajar</Label>
                        <Select 
                          value={courseForm.teacher_id.toString()} 
                          onValueChange={(value) => 
                            setCourseForm(prev => ({ ...prev, teacher_id: parseInt(value) }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                {teacher.first_name} {teacher.last_name} ({teacher.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      disabled={updateCourseMutation.isPending}
                      className="w-full"
                    >
                      {updateCourseMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pengaturan Pendaftaran
                  </CardTitle>
                  <CardDescription>
                    Atur cara siswa dapat mendaftar ke kursus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Pendaftaran Otomatis</Label>
                        <p className="text-sm text-gray-500">
                          Siswa dapat mendaftar sendiri tanpa persetujuan
                        </p>
                      </div>
                      <Switch
                        checked={settingsForm.auto_enrollment}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({ ...prev, auto_enrollment: checked }))
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Butuh Persetujuan</Label>
                        <p className="text-sm text-gray-500">
                          Pendaftaran siswa memerlukan persetujuan pengajar
                        </p>
                      </div>
                      <Switch
                        checked={settingsForm.require_approval}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({ ...prev, require_approval: checked }))
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="max-students">Batas Maksimal Siswa</Label>
                      <Input
                        id="max-students"
                        type="number"
                        value={settingsForm.max_students}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, max_students: e.target.value }))}
                        placeholder="Tidak ada batas (kosongkan)"
                        min="1"
                      />
                      <p className="text-sm text-gray-500">
                        Kosongkan untuk tidak membatasi jumlah siswa
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Assignment Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Pengaturan Tugas & Notifikasi
                  </CardTitle>
                  <CardDescription>
                    Atur pengaturan tugas dan notifikasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Izinkan Pengumpulan Terlambat</Label>
                        <p className="text-sm text-gray-500">
                          Siswa dapat mengumpulkan tugas setelah deadline
                        </p>
                      </div>
                      <Switch
                        checked={settingsForm.allow_late_submission}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({ ...prev, allow_late_submission: checked }))
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notifikasi Email</Label>
                        <p className="text-sm text-gray-500">
                          Kirim notifikasi email untuk aktivitas kursus
                        </p>
                      </div>
                      <Switch
                        checked={settingsForm.email_notifications}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({ ...prev, email_notifications: checked }))
                        }
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Forum Diskusi</Label>
                        <p className="text-sm text-gray-500">
                          Aktifkan forum diskusi untuk kursus ini
                        </p>
                      </div>
                      <Switch
                        checked={settingsForm.discussion_enabled}
                        onCheckedChange={(checked) => 
                          setSettingsForm(prev => ({ ...prev, discussion_enabled: checked }))
                        }
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSettingsSubmit}
                      disabled={updateSettingsMutation.isPending}
                      className="w-full"
                    >
                      {updateSettingsMutation.isPending ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Pengaturan
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informasi Kursus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Kode Kursus</Label>
                    <p className="font-mono text-sm">{course.code}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Dibuat</Label>
                    <p className="text-sm">{new Date(course.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <div className="flex items-center gap-2">
                      {course.privacy === 'public' ? (
                        <>
                          <Eye className="h-3 w-3 text-green-500" />
                          <span className="text-sm text-green-600">Publik</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-orange-500" />
                          <span className="text-sm text-orange-600">Privat</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-sm text-red-600">Zona Berbahaya</CardTitle>
                  <CardDescription>
                    Aksi yang tidak dapat dibatalkan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Kursus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kursus</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus kursus ini? Semua data termasuk materi, tugas, dan pendaftaran siswa akan hilang permanen. Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCourseMutation.mutate()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Ya, Hapus Kursus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSettingsPage;