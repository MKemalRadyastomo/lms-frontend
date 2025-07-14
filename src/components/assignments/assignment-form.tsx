'use client'

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AssignmentCreateData, QuizQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  CalendarIcon, 
  BookOpen, 
  Upload, 
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  FileText,
  Settings,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const assignmentFormSchema = z.object({
  title: z.string().min(3, 'Judul harus minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
  description: z.string().min(10, 'Deskripsi harus minimal 10 karakter').max(1000, 'Deskripsi maksimal 1000 karakter'),
  type: z.enum(['essay', 'file_upload', 'quiz'], {
    required_error: 'Jenis tugas wajib dipilih',
    invalid_type_error: 'Pilih salah satu jenis tugas yang tersedia'
  }),
  due_date: z.date({
    required_error: 'Pilih tanggal batas waktu'
  }).refine((date) => date > new Date(), {
    message: 'Tanggal batas waktu harus di masa depan'
  }),
  max_score: z.number()
    .min(1, 'Nilai maksimal harus minimal 1')
    .max(1000, 'Nilai maksimal tidak boleh lebih dari 1000'),
  allowed_file_types: z.string().optional(),
  max_file_size_mb: z.number().min(1).max(100).optional(),
  quiz_questions_json: z.array(z.object({
    id: z.number(),
    type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_in_blank']),
    question: z.string().min(5, 'Pertanyaan harus minimal 5 karakter'),
    options: z.array(z.string()).optional(),
    correct_answer: z.union([z.string(), z.array(z.string())]).optional(),
    points: z.number().min(1, 'Poin harus minimal 1'),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional()
  })).optional().default([]),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormProps {
  courseId: number;
  onSubmit: (data: AssignmentCreateData) => void;
  initialData?: Partial<AssignmentCreateData>;
  isSubmitting: boolean;
  mode?: 'create' | 'edit';
}

const steps = [
  { id: 'basic', title: 'Informasi Dasar', description: 'Judul, deskripsi, dan jenis tugas', icon: FileText },
  { id: 'settings', title: 'Pengaturan', description: 'Batas waktu, nilai, dan konfigurasi', icon: Settings },
  { id: 'content', title: 'Konten Tugas', description: 'Pertanyaan kuis atau pengaturan khusus', icon: BookOpen },
  { id: 'review', title: 'Tinjau & Simpan', description: 'Periksa semua informasi sebelum menyimpan', icon: CheckCircle }
];

const assignmentTypes = [
  { value: 'essay', label: 'Esai', description: 'Siswa menulis jawaban dalam bentuk teks panjang', icon: BookOpen },
  { value: 'file_upload', label: 'Upload File', description: 'Siswa mengunggah file sebagai jawaban', icon: Upload },
  { value: 'quiz', label: 'Kuis', description: 'Pertanyaan pilihan ganda, benar/salah, atau jawaban singkat', icon: FileQuestion }
];

const fileTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'gif', 'zip', 'rar', '7z'];

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  courseId, 
  onSubmit, 
  initialData, 
  isSubmitting,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    initialData?.quiz_questions_json || []
  );

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'essay',
      due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      max_score: initialData?.max_score || 100,
      allowed_file_types: initialData?.allowed_file_types || 'pdf,doc,docx',
      max_file_size_mb: initialData?.max_file_size_mb || 10,
      quiz_questions_json: quizQuestions
    },
  });

  const watchedType = form.watch('type');

  const validateCurrentStep = async () => {
    const fields = getStepFields(currentStep);
    return await form.trigger(fields);
  };

  const getStepFields = (step: number): (keyof AssignmentFormValues)[] => {
    switch (step) {
      case 0: return ['title', 'description', 'type'];
      case 1: return ['due_date', 'max_score'];
      case 2: return watchedType === 'file_upload' ? ['allowed_file_types', 'max_file_size_mb'] : 
                    watchedType === 'quiz' ? ['quiz_questions_json'] : [];
      default: return [];
    }
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit when on the last step
    if (currentStep === steps.length - 1) {
      form.handleSubmit(handleSubmit)(e);
    }
  };

  const handleSubmit = async (values: AssignmentFormValues) => {
    try {
      const submitData: AssignmentCreateData = {
        title: values.title,
        description: values.description,
        type: values.type,
        due_date: values.due_date.toISOString(),
        max_score: values.max_score,
      };

      // Only add type-specific fields when relevant
      if (values.type === 'file_upload') {
        submitData.allowed_file_types = values.allowed_file_types;
        submitData.max_file_size_mb = values.max_file_size_mb;
      } else if (values.type === 'quiz') {
        submitData.quiz_questions_json = values.quiz_questions_json || [];
      }
      // For essay type, we don't send additional fields

      await onSubmit(submitData);
    } catch (error) {
      toast({
        title: 'Submission Error',
        description: 'Failed to submit assignment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index;
            const isCompleted = currentStep > index;
            
            return (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200",
                    isActive ? "border-blue-500 bg-blue-50 text-blue-600" : 
                    isCompleted ? "border-green-500 bg-green-50 text-green-600" :
                    "border-gray-300 bg-white text-gray-400"
                  )}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4 transition-all duration-200",
                      isCompleted ? "bg-green-300" : "bg-gray-200"
                    )} />
                  )}
                </div>
                
                <div className="mt-2">
                  <div className={cn(
                    "text-sm font-medium",
                    isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <Card className="min-h-96">
            <CardHeader>
              <CardTitle>{steps[currentStep].title}</CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Judul Tugas *</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Esai Analisis Karya Sastra" {...field} />
                            </FormControl>
                            <FormDescription>Berikan judul yang jelas dan deskriptif</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deskripsi *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Jelaskan instruksi tugas dengan detail..."
                                className="min-h-32"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Instruksi untuk membantu siswa memahami tugas</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Jenis Tugas *</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {assignmentTypes.map((type) => {
                                  const Icon = type.icon;
                                  const isSelected = field.value === type.value;
                                  return (
                                    <div key={type.value} className="relative">
                                      <input
                                        type="radio"
                                        id={type.value}
                                        value={type.value}
                                        checked={field.value === type.value}
                                        onChange={() => field.onChange(type.value)}
                                        className="sr-only"
                                      />
                                      <label
                                        htmlFor={type.value}
                                        className={cn(
                                          "flex flex-col items-center justify-center p-6 min-h-[140px] border-2 rounded-xl cursor-pointer transition-all duration-200",
                                          "hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md",
                                          isSelected
                                            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                                            : "border-gray-200 bg-white"
                                        )}
                                      >
                                        <div className={cn(
                                          "p-3 rounded-lg mb-3 transition-colors duration-200",
                                          isSelected
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-gray-100 text-gray-600"
                                        )}>
                                          <Icon className="h-8 w-8" />
                                        </div>
                                        <span className={cn(
                                          "font-semibold text-center mb-2 transition-colors duration-200",
                                          isSelected ? "text-blue-700" : "text-gray-900"
                                        )}>
                                          {type.label}
                                        </span>
                                        <span className="text-sm text-gray-500 text-center leading-tight">
                                          {type.description}
                                        </span>
                                        {isSelected && (
                                          <div className="absolute top-3 right-3">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                              <CheckCircle className="h-4 w-4 text-white" />
                                            </div>
                                          </div>
                                        )}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormDescription>Pilih jenis tugas yang sesuai dengan kebutuhan pembelajaran</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="due_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Batas Waktu Pengumpulan *</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value}
                                onDateChange={field.onChange}
                                placeholder="Pilih tanggal dan waktu batas pengumpulan"
                                disablePastDates={true}
                                className="w-full"
                              />
                            </FormControl>
                            <FormDescription>Siswa tidak dapat mengumpulkan setelah batas waktu</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_score"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nilai Maksimal *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="100" 
                                {...field} 
                                onChange={e => field.onChange(parseInt(e.target.value, 10))} 
                              />
                            </FormControl>
                            <FormDescription>Nilai maksimal yang dapat diperoleh siswa</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      {watchedType === 'file_upload' && (
                        <>
                          <FormField
                            control={form.control}
                            name="allowed_file_types"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jenis File yang Diizinkan</FormLabel>
                                <FormControl>
                                  <Input placeholder="pdf,doc,docx,txt" {...field} />
                                </FormControl>
                                <FormDescription>Pisahkan dengan koma</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="max_file_size_mb"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ukuran File Maksimal (MB)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="10"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value, 10))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {watchedType === 'quiz' && (
                        <div className="text-center py-8">
                          <FileQuestion className="h-16 w-16 mx-auto text-purple-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2">Fitur Kuis</h3>
                          <p className="text-gray-600">Pembuat kuis akan tersedia segera.</p>
                        </div>
                      )}

                      {watchedType === 'essay' && (
                        <div className="text-center py-8">
                          <BookOpen className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2">Tugas Esai</h3>
                          <p className="text-gray-600">Siswa akan menulis jawaban dalam bentuk teks panjang.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Tinjau Tugas Anda</h3>
                        <p className="text-blue-700 text-sm">Periksa kembali semua informasi sebelum menyimpan.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Informasi Dasar</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Judul:</span>
                              <p className="font-medium">{form.watch('title')}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Jenis:</span>
                              <p className="font-medium">{assignmentTypes.find(t => t.value === form.watch('type'))?.label}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Pengaturan</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Batas Waktu:</span>
                              <p className="font-medium">
                                {form.watch('due_date') && format(form.watch('due_date'), "PPP", { locale: id })}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Nilai Maksimal:</span>
                              <p className="font-medium">{form.watch('max_score')} poin</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            <div className="flex items-center justify-between p-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>

              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="gap-2"
                    disabled={isSubmitting}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="gap-2 min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {mode === 'edit' ? 'Perbarui Tugas' : 'Buat Tugas'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
};
