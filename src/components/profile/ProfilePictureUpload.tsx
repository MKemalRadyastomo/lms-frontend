"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Upload, 
  Camera, 
  X, 
  Check,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ProfilePictureUploadProps {
  userId: string;
  currentImageUrl?: string;
  userInitials: string;
  onUploadSuccess: (url: string) => void;
  onCancel: () => void;
  className?: string;
}

export function ProfilePictureUpload({
  userId,
  currentImageUrl,
  userInitials,
  onUploadSuccess,
  onCancel,
  className
}: ProfilePictureUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const {
    uploadImage,
    isUploading,
    progress,
    previewUrl,
    setPreviewUrl,
    validateFile,
    cleanup
  } = useImageUpload({
    onSuccess: (url) => {
      onUploadSuccess(url);
      cleanup();
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Handle file drop/select
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.isValid) {
        uploadImage(file, userId);
      }
    }
    setDragActive(false);
  }, [uploadImage, userId, validateFile]);

  // Setup dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  // Handle cancel
  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  // Current display image
  const displayImage = previewUrl || currentImageUrl;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ubah Foto Profil
        </h3>
        <p className="text-sm text-gray-600">
          Unggah foto baru untuk profil Anda. Maksimal 5MB.
        </p>
      </div>

      {/* Current/Preview Image */}
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="h-32 w-32 shadow-lg ring-4 ring-white">
            <AvatarImage 
              src={displayImage} 
              alt="Profile picture"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          
          {previewUrl && (
            <div className="absolute -top-2 -right-2">
              <div className="bg-green-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive || dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="flex justify-center">
            <div className={cn(
              "p-4 rounded-full",
              isDragActive || dragActive 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gray-100 text-gray-600"
            )}>
              {isUploading ? (
                <Camera className="h-8 w-8 animate-pulse" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </div>
          </div>

          {/* Upload Text */}
          <div>
            {isUploading ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Mengunggah foto...
                </p>
                <Progress value={progress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{progress}%</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-900">
                  {isDragActive || dragActive
                    ? "Lepaskan file di sini"
                    : "Seret & lepas foto atau klik untuk memilih"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, JPEG hingga 5MB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">
                File tidak dapat diunggah
              </h4>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                {fileRejections.map((rejection, index) => (
                  <li key={index}>
                    {rejection.file.name}: {
                      rejection.errors.map(error => {
                        switch (error.code) {
                          case 'file-too-large':
                            return 'File terlalu besar (maksimal 5MB)';
                          case 'file-invalid-type':
                            return 'Format file tidak didukung';
                          default:
                            return error.message;
                        }
                      }).join(', ')
                    }
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isUploading}
        >
          Batal
        </Button>
        
        {previewUrl && !isUploading && (
          <Button
            onClick={() => {
              cleanup();
              setPreviewUrl(null);
            }}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Hapus Preview
          </Button>
        )}

        <Button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const validation = validateFile(file);
                if (validation.isValid) {
                  uploadImage(file, userId);
                }
              }
            };
            input.click();
          }}
          disabled={isUploading}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Pilih File
        </Button>
      </div>
    </div>
  );
}

export default ProfilePictureUpload;
