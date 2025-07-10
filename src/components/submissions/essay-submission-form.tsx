'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { EssaySubmissionData, Assignment, Submission } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Save, 
  Send, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Zap,
  Timer,
  Eye,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const essaySchema = z.object({
  answer_text: z.string()
    .min(50, 'Esai harus minimal 50 karakter')
    .max(10000, 'Esai tidak boleh lebih dari 10.000 karakter'),
});

type EssayFormValues = z.infer<typeof essaySchema>;

interface EssaySubmissionFormProps {
  assignment: Assignment;
  existingSubmission?: Submission;
  onSubmit: (data: EssaySubmissionData) => void;
  onSaveDraft: (data: EssaySubmissionData) => void;
  isSubmitting: boolean;
  isDraft?: boolean;
}

export const EssaySubmissionForm: React.FC<EssaySubmissionFormProps> = ({ 
  assignment,
  existingSubmission,
  onSubmit, 
  onSaveDraft,
  isSubmitting,
  isDraft = false
}) => {
  const { toast } = useToast();
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const form = useForm<EssayFormValues>({
    resolver: zodResolver(essaySchema),
    defaultValues: {
      answer_text: existingSubmission?.submission_text || ''
    }
  });

  const watchedText = form.watch('answer_text');

  // Update word and character count
  useEffect(() => {
    const text = watchedText || '';
    setCharCount(text.length);
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [watchedText]);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const dueDate = new Date(assignment.due_date);
      
      if (now > dueDate) {
        setTimeRemaining('Waktu habis');
      } else {
        setTimeRemaining(formatDistanceToNow(dueDate, { 
          locale: id, 
          addSuffix: false 
        }));
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [assignment.due_date]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    const text = form.getValues('answer_text');
    if (text && text.length > 10 && !isSubmitting) {
      setIsAutoSaving(true);
      try {
        await onSaveDraft({ answer_text: text, draft: true });
        setLastSaved(new Date());
      } catch (error) {
        toast({
          title: 'Auto-save Failed',
          description: 'Failed to automatically save your essay progress.',
          variant: 'destructive'
        });
      } finally {
        setIsAutoSaving(false);
      }
    }
  }, [form, onSaveDraft, isSubmitting]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  const handleSubmit = (values: EssayFormValues) => {
    onSubmit({ ...values, draft: false });
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    if (values.answer_text && values.answer_text.length > 0) {
      await onSaveDraft({ ...values, draft: true });
      setLastSaved(new Date());
    }
  };

  const getProgressColor = () => {
    if (charCount < 50) return 'bg-red-500';
    if (charCount < 200) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = () => {
    return Math.min((charCount / 500) * 100, 100); // Assuming 500 chars is good progress
  };

  const isOverdue = new Date() > new Date(assignment.due_date);
  const canSubmit = charCount >= 50 && !isOverdue && !isSubmitting;
  const isNearDeadline = new Date(assignment.due_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000; // 24 hours

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className={cn(
        "border-l-4",
        isOverdue ? "border-l-red-500" : 
        isNearDeadline ? "border-l-yellow-500" : 
        "border-l-blue-500"
      )}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Esai
                </Badge>
                <Badge 
                  variant={isDraft ? "outline" : existingSubmission?.status === 'submitted' ? "default" : "secondary"}
                  className={cn(
                    isDraft ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                    existingSubmission?.status === 'submitted' ? "bg-green-50 text-green-700 border-green-200" :
                    ""
                  )}
                >
                  {isDraft ? 'Draf' : existingSubmission?.status === 'submitted' ? 'Dikirim' : 'Belum Dimulai'}
                </Badge>
              </div>
              <CardTitle className="text-xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-2">
                {assignment.description}
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Batas Waktu</div>
              <div className={cn(
                "text-sm",
                isOverdue ? "text-red-600 font-medium" : "text-gray-600"
              )}>
                {format(new Date(assignment.due_date), 'PPP "pukul" HH:mm', { locale: id })}
              </div>
              <div className={cn(
                "text-xs mt-1",
                isOverdue ? "text-red-500" : 
                isNearDeadline ? "text-yellow-600" : 
                "text-gray-500"
              )}>
                {isOverdue ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Terlambat
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {timeRemaining} lagi
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Auto-save status */}
      <AnimatePresence>
        {(isAutoSaving || lastSaved) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              {isAutoSaving ? (
                <>
                  <Zap className="h-4 w-4 animate-pulse text-blue-500" />
                  <span>Menyimpan otomatis...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>
                    Tersimpan otomatis pada {format(lastSaved, 'HH:mm:ss')}
                  </span>
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-4">
              <span>{wordCount} kata</span>
              <span>{charCount} karakter</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Writing area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <Label className="text-base font-medium">Tulis Esai Anda</Label>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">
                Min. 50 karakter
              </div>
              <div className="w-24">
                <Progress 
                  value={getProgressPercentage()} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="relative">
              <Textarea
                {...form.register('answer_text')}
                placeholder="Mulai menulis esai Anda di sini...

Tips: 
- Buat outline terlebih dahulu
- Gunakan paragraf yang jelas
- Periksa tata bahasa dan ejaan"
                className={cn(
                  "min-h-96 resize-none text-base leading-relaxed",
                  "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                )}
                style={{ fontSize: '16px', lineHeight: '1.6' }}
              />
              
              {/* Character count overlay */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded px-2 py-1">
                <span className={cn(
                  charCount < 50 ? "text-red-500" :
                  charCount < 200 ? "text-yellow-600" :
                  "text-green-600"
                )}>
                  {charCount}
                </span>
                <span>/</span>
                <span>10.000</span>
              </div>
            </div>

            {/* Validation errors */}
            {form.formState.errors.answer_text && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {form.formState.errors.answer_text.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Writing tips */}
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Tips Menulis:</strong> Pastikan esai Anda memiliki struktur yang jelas dengan pendahuluan, 
                isi, dan kesimpulan. Gunakan contoh konkret untuk mendukung argumen Anda.
              </AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{wordCount} kata</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{charCount} karakter</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Estimasi baca: {Math.ceil(wordCount / 200)} menit</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveDraft}
                  disabled={isSubmitting || charCount === 0}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Simpan Draf
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={!canSubmit}
                  className={cn(
                    "gap-2",
                    canSubmit ? "bg-green-600 hover:bg-green-700" : ""
                  )}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Esai'}
                </Button>
              </div>
            </div>

            {/* Submission warnings */}
            {isOverdue && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Batas waktu pengumpulan telah terlewati. Anda tidak dapat mengirim esai ini.
                </AlertDescription>
              </Alert>
            )}

            {!canSubmit && !isOverdue && charCount > 0 && charCount < 50 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esai Anda terlalu pendek. Minimal {50 - charCount} karakter lagi untuk dapat dikirim.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Submission history */}
      {existingSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Pengiriman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    existingSubmission.status === 'submitted' ? "bg-green-500" :
                    existingSubmission.status === 'graded' ? "bg-blue-500" :
                    "bg-yellow-500"
                  )} />
                  <div>
                    <div className="font-medium text-sm">
                      {existingSubmission.status === 'submitted' ? 'Dikirim' :
                       existingSubmission.status === 'graded' ? 'Dinilai' :
                       'Draf'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {format(new Date(existingSubmission.submitted_at), 'PPP "pukul" HH:mm', { locale: id })}
                    </div>
                  </div>
                </div>
                
                {existingSubmission.grade !== undefined && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {existingSubmission.grade}
                    </div>
                    <div className="text-xs text-gray-500">
                      dari {assignment.max_score}
                    </div>
                  </div>
                )}
              </div>
              
              {existingSubmission.feedback && (
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Umpan Balik Guru:</strong> {existingSubmission.feedback}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
