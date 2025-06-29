import { z } from 'zod';

// Profile update validation schema
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, 'Nama depan wajib diisi')
    .max(50, 'Nama depan maksimal 50 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama depan hanya boleh berisi huruf dan spasi'),
  
  last_name: z
    .string()
    .min(1, 'Nama belakang wajib diisi')
    .max(50, 'Nama belakang maksimal 50 karakter')
    .regex(/^[a-zA-Z\s]+$/, 'Nama belakang hanya boleh berisi huruf dan spasi'),
  
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(100, 'Email maksimal 100 karakter'),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+62|62|0)[0-9]{8,13}$/.test(val),
      'Format nomor telepon tidak valid (contoh: 08123456789)'
    ),
  
  bio: z
    .string()
    .max(500, 'Bio maksimal 500 karakter')
    .optional(),
  
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 5 && age <= 100;
      },
      'Tanggal lahir harus valid (usia 5-100 tahun)'
    ),
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  current_password: z
    .string()
    .min(1, 'Password saat ini wajib diisi'),
  
  new_password: z
    .string()
    .min(8, 'Password baru minimal 8 karakter')
    .max(128, 'Password baru maksimal 128 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol'
    ),
  
  confirm_password: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirm_password'],
  }
);

// Profile picture upload validation
export const profilePictureSchema = z.object({
  file: z
    .instanceof(File, { message: 'File gambar wajib dipilih' })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      'Ukuran file maksimal 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Format file harus JPG, JPEG, atau PNG'
    ),
});

// Settings validation schemas
export const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  assignment_reminders: z.boolean(),
  course_updates: z.boolean(),
  system_notifications: z.boolean(),
});

export const appearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    errorMap: () => ({ message: 'Tema tidak valid' }),
  }),
  language: z.enum(['id', 'en'], {
    errorMap: () => ({ message: 'Bahasa tidak valid' }),
  }),
  timezone: z.string().optional(),
});

// Type exports
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
export type ProfilePictureData = z.infer<typeof profilePictureSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;
