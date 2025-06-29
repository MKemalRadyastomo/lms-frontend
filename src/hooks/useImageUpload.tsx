"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { profileApi } from '@/lib/api/profile';
import { profilePictureSchema } from '@/lib/validators/profile';

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

interface UseImageUploadReturn {
  uploadImage: (file: File, userId: string) => Promise<void>;
  isUploading: boolean;
  progress: number;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  validateFile: (file: File) => { isValid: boolean; error?: string };
  cleanup: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    onSuccess,
    onError,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Validate file before upload
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    try {
      profilePictureSchema.parse({ file });
      return { isValid: true };
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'File tidak valid';
      return { isValid: false, error: errorMessage };
    }
  }, []);

  // Create preview URL
  const createPreview = useCallback((file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return url;
  }, [previewUrl]);

  // Upload image function
  const uploadImage = useCallback(async (file: File, userId: string) => {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      const errorMsg = validation.error || 'File tidak valid';
      toast.error(errorMsg);
      onError?.(errorMsg);
      return;
    }

    // Create preview
    createPreview(file);

    setIsUploading(true);
    setProgress(0);

    try {
      // Call API with progress tracking
      const response = await profileApi.uploadProfilePicture(
        userId,
        file,
        (progressPercent) => {
          setProgress(progressPercent);
        }
      );

      // Success
      toast.success('Foto profil berhasil diperbarui!');
      onSuccess?.(response.profile_picture_url);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Handle different error types
      let errorMessage = 'Gagal mengunggah foto profil';
      
      if (error.response?.status === 413) {
        errorMessage = 'File terlalu besar. Maksimal 5MB.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Format file tidak didukung';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Koneksi bermasalah. Periksa internet Anda.';
      }

      toast.error(errorMessage);
      onError?.(errorMessage);
      
      // Clear preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [validateFile, createPreview, onSuccess, onError, previewUrl]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  return {
    uploadImage,
    isUploading,
    progress,
    previewUrl,
    setPreviewUrl,
    validateFile,
    cleanup,
  };
}

export default useImageUpload;
