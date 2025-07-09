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
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Plus, 
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Eye,
  Calendar,
  PlayCircle,
  File
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const CourseMaterialsPage = () => {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    file: null as File | null,
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

  // Fetch course content (materials)
  const { data: courseContent, isLoading: isContentLoading, error } = useQuery({
    queryKey: ['courseContent', courseId, searchTerm],
    queryFn: () => apiClient.getCourseContent(courseId!),
    enabled: courseId !== null,
  });

  // Create material mutation
  const createMaterialMutation = useMutation({
    mutationFn: (data: typeof materialForm) => 
      apiClient.createCourseMaterial(courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseContent', courseId] });
      setIsCreateDialogOpen(false);
      setMaterialForm({
        title: '',
        description: '',
        content: '',
        video_url: '',
        file: null,
      });
      toast({
        title: 'Berhasil',
        description: 'Materi berhasil ditambahkan',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menambahkan materi',
        variant: 'destructive',
      });
    },
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: (materialId: number) => 
      apiClient.deleteCourseMaterial(courseId!, materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseContent', courseId] });
      toast({
        title: 'Berhasil',
        description: 'Materi berhasil dihapus',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.message || 'Gagal menghapus materi',
        variant: 'destructive',
      });
    },
  });

  // Check permissions
  const canManageMaterials = userRole === 'admin' || (userRole === 'teacher' && course?.teacher_id === user?.id);

  // Filter materials
  const filteredMaterials = courseContent?.filter(content => 
    content.type === 'material' &&
    (searchTerm === '' || 
     content.details?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     content.details?.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMaterialForm(prev => ({ ...prev, file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title.trim()) {
      toast({
        title: 'Validasi Error',
        description: 'Judul materi wajib diisi',
        variant: 'destructive',
      });
      return;
    }
    createMaterialMutation.mutate(materialForm);
  };

  const getMaterialIcon = (material: Content) => {
    if (material.type === 'material' && material.details?.video_url) {
      return <PlayCircle className="h-5 w-5 text-red-500" />;
    }
    if (material.type === 'material' && material.details?.file_path) {
      return <File className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getMaterialType = (material: Content) => {
    if (material.type === 'material' && material.details?.video_url) return 'Video';
    if (material.type === 'material' && material.details?.file_path) return 'File';
    return 'Teks';
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
                Materi Kursus
              </h1>
              <p className="text-gray-600">
                Kelola materi pembelajaran untuk {course.name}
              </p>
            </div>
            
            {canManageMaterials && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Materi
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Tambah Materi Baru</DialogTitle>
                      <DialogDescription>
                        Tambahkan materi pembelajaran untuk kursus ini
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Judul Materi *</Label>
                        <Input
                          id="title"
                          value={materialForm.title}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Masukkan judul materi..."
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Textarea
                          id="description"
                          value={materialForm.description}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Deskripsi materi..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="content">Konten Teks</Label>
                        <Textarea
                          id="content"
                          value={materialForm.content}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Isi konten materi..."
                          rows={6}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="video_url">URL Video (opsional)</Label>
                        <Input
                          id="video_url"
                          type="url"
                          value={materialForm.video_url}
                          onChange={(e) => setMaterialForm(prev => ({ ...prev, video_url: e.target.value }))}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="file">File Materi (opsional)</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                        />
                        {materialForm.file && (
                          <p className="text-sm text-gray-600">
                            File terpilih: {materialForm.file.name}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMaterialMutation.isPending}
                      >
                        {createMaterialMutation.isPending ? (
                          <>
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan Materi'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Search */}
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
                      placeholder="Cari materi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Semua
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Materials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isContentLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-2 text-gray-600">Memuat materi...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal Memuat Data</AlertTitle>
              <AlertDescription>
                Terjadi kesalahan saat memuat materi kursus
              </AlertDescription>
            </Alert>
          ) : filteredMaterials.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Tidak ada materi yang sesuai dengan pencarian' : 'Belum ada materi yang tersedia'}
                </p>
                {canManageMaterials && !searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Tambah Materi Pertama
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material, index) => (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getMaterialIcon(material)}
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg leading-tight line-clamp-2">
                              {material.details?.title || 'Untitled'}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {getMaterialType(material)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {canManageMaterials && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                              {material.details?.file_path && (
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download File
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteMaterialMutation.mutate(material.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {material.details?.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {material.details.description}
                        </p>
                      )}
                      
                      <div className="space-y-3">
                        {material.type === 'material' && material.details?.content && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-4">
                              {(material.details as CourseMaterial).content}
                            </p>
                          </div>
                        )}
                        
                        {material.type === 'material' && material.details?.video_url && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <PlayCircle className="h-4 w-4" />
                            <a 
                              href={(material.details as CourseMaterial).video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Tonton Video
                            </a>
                          </div>
                        )}
                        
                        {material.type === 'material' && material.details?.file_path && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <File className="h-4 w-4" />
                            <a 
                              href={(material.details as CourseMaterial).file_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Download File
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {material.type === 'material' && material.details?.publish_date ? 
                            new Date((material.details as CourseMaterial).publish_date).toLocaleDateString('id-ID') :
                            'Tidak ada tanggal'
                          }
                        </div>
                        
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Lihat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CourseMaterialsPage;