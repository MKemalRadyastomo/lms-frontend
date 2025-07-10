"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/types';
import { ProfileUpdateData, profileUpdateSchema } from '@/lib/validators/profile';
import { profileApi } from '@/lib/api/profile';
import { Loader2, User as UserIcon, Mail, Phone, Calendar, FileText } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateSuccess: (updatedUser: User) => void;
}

export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateSuccess 
}: ProfileEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast: uiToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      date_of_birth: user?.date_of_birth ? 
        new Date(user.date_of_birth).toISOString().split('T')[0] : '',
    },
  });

  // Watch form values for real-time validation
  const watchedValues = watch();

  const onSubmit = async (data: ProfileUpdateData) => {
    setIsSubmitting(true);

    try {
      const updatedUser = await profileApi.updateProfile(user.id, data);
      toast.success('Profil berhasil diperbarui!');
      onUpdateSuccess(updatedUser);
      onClose();
      reset(data); // Reset form with new values
    } catch (error: any) {
      let errorMessage = 'Gagal memperbarui profil';
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Data yang dimasukkan tidak valid';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Email sudah digunakan oleh pengguna lain';
      }
      
      // Use both toast systems for consistency
      toast.error(errorMessage);
      uiToast({
        title: 'Profile Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset(); // Reset form to original values
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Edit Profil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium">
                Nama Depan *
              </Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Masukkan nama depan"
                className={errors.first_name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium">
                Nama Belakang *
              </Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Masukkan nama belakang"
                className={errors.last_name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contoh@email.com"
              className={errors.email ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              Nomor Telepon
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="08123456789"
              className={errors.phone ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Format: 08xxxxxxxxx atau +62xxxxxxxxx
            </p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Tanggal Lahir
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register('date_of_birth')}
              className={errors.date_of_birth ? 'border-red-500' : ''}
              disabled={isSubmitting}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
            {errors.date_of_birth && (
              <p className="text-sm text-red-600">{errors.date_of_birth.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Bio
            </Label>
            <Textarea
              id="bio"
              {...register('bio')}
              placeholder="Ceritakan sedikit tentang diri Anda..."
              rows={4}
              className={errors.bio ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.bio && (
              <p className="text-sm text-red-600">{errors.bio.message}</p>
            )}
            <p className="text-xs text-gray-500">
              {watchedValues.bio?.length || 0}/500 karakter
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEditModal;
