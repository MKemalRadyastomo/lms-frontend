"use client";

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { profileApi } from '@/lib/api/profile';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { User } from '@/types';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateSuccess: (pictureUrl: string) => void;
}

export function ProfilePictureModal({
  isOpen,
  onClose,
  user,
  onUpdateSuccess
}: ProfilePictureModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.';
    }

    if (file.size > maxSize) {
      return 'Ukuran file terlalu besar. Maksimal 5MB.';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await profileApi.uploadProfilePicture(
        user.id.toString(),
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      onUpdateSuccess(response.profile_picture_url);
      handleClose();
    } catch (error: any) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Gagal mengunggah foto profil';
      if (error.response?.status === 413) {
        errorMessage = 'Ukuran file terlalu besar';
      } else if (error.response?.status === 415) {
        errorMessage = 'Format file tidak didukung';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset modal state
  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setUploadProgress(0);
      setDragActive(false);
      onClose();
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Get user display name and initials
  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || "User";

  const avatarInitials = user?.first_name?.[0] ||
    user?.username?.[0]?.toUpperCase() ||
    "U";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Ubah Foto Profil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Current Picture */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Foto profil saat ini:</p>
            <Avatar className="h-24 w-24 mx-auto shadow-lg ring-2 ring-gray-100">
              <AvatarImage 
                src={user.profile_picture_url} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-semibold">
                {avatarInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* File Upload Area */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }
              `}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-blue-600" />
                </div>
                
                <div>
                  <p className="text-base font-medium text-gray-900 mb-2">
                    {dragActive ? 'Lepas file di sini' : 'Drag & drop foto atau klik untuk memilih'}
                  </p>
                  <p className="text-sm text-gray-500">
                    JPG, PNG, GIF, WebP hingga 5MB
                  </p>
                </div>
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="profile-picture-input"
                  />
                  <label htmlFor="profile-picture-input">
                    <Button type="button" variant="outline" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih File
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* File Preview */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Preview foto baru:</p>
                <Avatar className="h-32 w-32 mx-auto shadow-lg ring-2 ring-blue-200">
                  <AvatarImage 
                    src={previewUrl || ''} 
                    alt="Preview"
                    className="object-cover"
                  />
                  <AvatarFallback>Preview</AvatarFallback>
                </Avatar>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                  
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mengunggah foto...</span>
                      <span className="font-medium text-blue-600">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-2">Panduan Foto Profil:</p>
                <ul className="text-amber-700 space-y-1 text-xs leading-relaxed">
                  <li>• Gunakan foto yang jelas dan profesional</li>
                  <li>• Foto sebaiknya menampilkan wajah dengan baik</li>
                  <li>• Format yang didukung: JPG, PNG, GIF, WebP</li>
                  <li>• Ukuran maksimal 5MB</li>
                  <li>• Rasio persegi (1:1) akan memberikan hasil terbaik</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Batal
            </Button>
            
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Unggah Foto
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfilePictureModal;
