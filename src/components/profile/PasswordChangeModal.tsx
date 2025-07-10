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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { profileApi } from '@/lib/api/profile';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Check, 
  X, 
  Loader2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password harus mengandung huruf besar, huruf kecil, dan angka'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi password tidak sesuai",
  path: ["confirm_password"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function PasswordChangeModal({
  isOpen,
  onClose,
  userId
}: PasswordChangeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast: uiToast } = useToast();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const newPassword = watch('new_password') || '';
  const confirmPassword = watch('confirm_password') || '';

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/\d/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;

    return Math.min(score, 100);
  };

  const passwordStrength = getPasswordStrength(newPassword);
  
  const getStrengthLabel = (strength: number) => {
    if (strength < 30) return { label: 'Lemah', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (strength < 60) return { label: 'Sedang', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    if (strength < 80) return { label: 'Kuat', color: 'text-blue-600', bgColor: 'bg-blue-500' };
    return { label: 'Sangat Kuat', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const strengthInfo = getStrengthLabel(passwordStrength);

  // Password requirements checker
  const requirements = [
    { label: 'Minimal 8 karakter', met: newPassword.length >= 8 },
    { label: 'Mengandung huruf kecil', met: /[a-z]/.test(newPassword) },
    { label: 'Mengandung huruf besar', met: /[A-Z]/.test(newPassword) },
    { label: 'Mengandung angka', met: /\d/.test(newPassword) },
    { label: 'Mengandung simbol (opsional)', met: /[^A-Za-z0-9]/.test(newPassword) }
  ];

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);

    try {
      await profileApi.changePassword(userId, {
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });

      toast.success('Password berhasil diubah!', {
        description: 'Silakan gunakan password baru untuk login berikutnya.'
      });
      handleClose();
    } catch (error: any) {
      let errorMessage = 'Gagal mengubah password';
      if (error.response?.status === 400) {
        errorMessage = 'Password saat ini tidak benar';
      } else if (error.response?.status === 422) {
        errorMessage = 'Password baru tidak memenuhi persyaratan';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
      }
      
      // Use both toast systems for consistency
      toast.error(errorMessage);
      uiToast({
        title: 'Password Change Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setShowPasswords({ current: false, new: false, confirm: false });
      onClose();
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Ubah Password
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Keamanan Password</p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  Pastikan password baru Anda kuat dan belum pernah digunakan di tempat lain. 
                  Password yang baik membantu melindungi akun Anda dari akses yang tidak diinginkan.
                </p>
              </div>
            </div>
          </div>

          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="current_password" className="text-sm font-medium">
              Password Saat Ini *
            </Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showPasswords.current ? 'text' : 'password'}
                {...register('current_password')}
                placeholder="Masukkan password saat ini"
                className={`pr-10 ${errors.current_password ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                tabIndex={-1}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.current_password && (
              <p className="text-sm text-red-600 flex items-center">
                <X className="h-3 w-3 mr-1" />
                {errors.current_password.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password" className="text-sm font-medium">
              Password Baru *
            </Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showPasswords.new ? 'text' : 'password'}
                {...register('new_password')}
                placeholder="Masukkan password baru"
                className={`pr-10 ${errors.new_password ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                tabIndex={-1}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.new_password && (
              <p className="text-sm text-red-600 flex items-center">
                <X className="h-3 w-3 mr-1" />
                {errors.new_password.message}
              </p>
            )}

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Kekuatan password:</span>
                  <span className={`font-medium ${strengthInfo.color}`}>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bgColor}`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {newPassword && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Persyaratan Password:</p>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    {req.met ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <X className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-sm font-medium">
              Konfirmasi Password Baru *
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirm_password')}
                placeholder="Konfirmasi password baru"
                className={`pr-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                tabIndex={-1}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-600 flex items-center">
                <X className="h-3 w-3 mr-1" />
                {errors.confirm_password.message}
              </p>
            )}
            
            {/* Password Match Indicator */}
            {confirmPassword && newPassword && (
              <div className="flex items-center space-x-2 text-xs">
                {confirmPassword === newPassword ? (
                  <>
                    <Check className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Password cocok</span>
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-red-500" />
                    <span className="text-red-600">Password tidak cocok</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Security Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Tips Keamanan:</p>
                <ul className="text-amber-700 space-y-1 text-xs">
                  <li>• Jangan gunakan password yang sama dengan situs lain</li>
                  <li>• Hindari informasi pribadi seperti nama atau tanggal lahir</li>
                  <li>• Gunakan kombinasi huruf, angka, dan simbol</li>
                  <li>• Simpan password di tempat yang aman</li>
                </ul>
              </div>
            </div>
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
              disabled={isSubmitting || !isDirty || passwordStrength < 60}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengubah...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Ubah Password
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PasswordChangeModal;
