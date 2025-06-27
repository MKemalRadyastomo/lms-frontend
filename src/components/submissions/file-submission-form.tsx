'use client'

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Assignment, Submission, FileSubmissionData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Image,
  Archive,
  Download,
  Trash2,
  CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface FileSubmissionFormProps {
  assignment: Assignment;
  existingSubmission?: Submission;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return FileText;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return Image;
    case 'zip':
    case 'rar':
    case '7z':
      return Archive;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileSubmissionForm: React.FC<FileSubmissionFormProps> = ({
  assignment,
  existingSubmission,
  onSubmit,
  isSubmitting
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = assignment.allowed_file_types?.split(',').map(t => t.trim()) || 
                     ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
  const maxSize = (assignment.max_file_size_mb || 10) * 1024 * 1024; // Convert to bytes

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension) {
      return 'File harus memiliki ekstensi yang valid';
    }
    
    if (!allowedTypes.includes(extension)) {
      return `Jenis file tidak diizinkan. Hanya ${allowedTypes.join(', ')} yang diperbolehkan`;
    }
    
    if (file.size > maxSize) {
      return `Ukuran file terlalu besar. Maksimal ${assignment.max_file_size_mb}MB`;
    }
    
    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  }, [allowedTypes, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[`application/${type}`] = [];
      acc[`image/${type}`] = [];
      acc[`.${type}`] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('submitted_file', selectedFile);
    formData.append('draft', 'false');

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    onSubmit(formData);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const isOverdue = new Date() > new Date(assignment.due_date);
  const canSubmit = selectedFile && !isSubmitting && !isOverdue;

  // If already submitted, show submission details
  if (existingSubmission?.status === 'submitted' || existingSubmission?.status === 'graded') {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">File Telah Diunggah</CardTitle>
          </div>
          <CardDescription>
            File Anda telah berhasil diunggah pada {format(new Date(existingSubmission.submitted_at), 'PPP "pukul" HH:mm', { locale: id })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingSubmission.file_path && (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">
                    {existingSubmission.file_path.split('/').pop() || 'Uploaded File'}
                  </div>
                  <div className="text-sm text-gray-600">
                    File yang diunggah
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Unduh
              </Button>
            </div>
          )}
          
          {existingSubmission.grade !== undefined && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">Nilai</div>
                  {existingSubmission.feedback && (
                    <div className="text-sm text-blue-700 mt-1">
                      Catatan: {existingSubmission.feedback}
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {existingSubmission.grade}/{assignment.max_score}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Unggah File Anda
          </CardTitle>
          <CardDescription>
            Pilih file yang sesuai dengan ketentuan tugas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Jenis File yang Diizinkan</h4>
              <div className="flex flex-wrap gap-1">
                {allowedTypes.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    .{type}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Ukuran Maksimal</h4>
              <div className="text-2xl font-bold text-green-700">
                {assignment.max_file_size_mb || 10} MB
              </div>
            </div>
          </div>

          {/* Drag and Drop Area */}
          <div
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
              isDragActive 
                ? "border-blue-400 bg-blue-50" 
                : selectedFile
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
            )}
          >
            <input {...getInputProps()} />
            
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {React.createElement(getFileIcon(selectedFile.name), {
                          className: "h-8 w-8 text-blue-600"
                        })}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {selectedFile.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-green-700">
                    File siap untuk diunggah. Klik "Kirim File" untuk mengirim.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center mb-4">
                    <CloudUpload className={cn(
                      "h-12 w-12 transition-colors",
                      isDragActive ? "text-blue-500" : "text-gray-400"
                    )} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {isDragActive 
                        ? "Lepaskan file di sini..." 
                        : "Seret dan lepas file di sini"
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      atau klik untuk memilih file
                    </p>
                  </div>
                  
                  <Button type="button" variant="outline" className="mt-4">
                    Pilih File
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span>Mengunggah file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cn(
                "gap-2",
                canSubmit ? "bg-green-600 hover:bg-green-700" : ""
              )}
              size="lg"
            >
              <Upload className="h-4 w-4" />
              {isSubmitting ? 'Mengunggah...' : 'Kirim File'}
            </Button>
          </div>

          {/* Warnings */}
          {isOverdue && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Batas waktu pengumpulan telah terlewati. Anda tidak dapat mengunggah file.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Upload Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips Mengunggah File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Persiapan File:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Pastikan nama file jelas dan deskriptif</li>
                <li>• Periksa ukuran file sebelum mengunggah</li>
                <li>• Simpan backup file di komputer Anda</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Keamanan:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Scan file dari virus sebelum mengunggah</li>
                <li>• Pastikan koneksi internet stabil</li>
                <li>• Jangan tutup browser saat mengunggah</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
