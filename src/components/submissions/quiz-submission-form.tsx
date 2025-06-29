'use client'

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QuizSubmissionData, Assignment, Submission, QuizQuestion, QuizAnswer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileQuestion, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Save,
  Send,
  Timer,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const quizSchema = z.object({
  answers: z.array(z.object({
    question_id: z.number(),
    answer: z.string().min(1, 'Jawaban harus diisi')
  }))
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizSubmissionFormProps {
  assignment: Assignment;
  existingSubmission?: Submission;
  onSubmit: (data: QuizSubmissionData) => void;
  onSaveDraft: (data: QuizSubmissionData) => void;
  isSubmitting: boolean;
  isDraft?: boolean;
  questions: QuizQuestion[];
}

export const QuizSubmissionForm: React.FC<QuizSubmissionFormProps> = ({
  assignment,
  existingSubmission,
  onSubmit,
  onSaveDraft,
  isSubmitting,
  isDraft = false
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const questions = assignment.quiz_questions_json || [];
  const totalQuestions = questions.length;

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      answers: questions.map(q => ({
        question_id: q.id,
        answer: existingSubmission?.quiz_answers_json 
          ? existingSubmission.quiz_answers_json.find((a: QuizAnswer) => a.question_id === q.id)?.answer || ''
          : ''
      }))
    }
  });

  const watchedAnswers = form.watch('answers');

  // Calculate progress
  const answeredQuestions = watchedAnswers.filter(a => a.answer.trim() !== '').length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // Time remaining calculation
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
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, [assignment.due_date]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (answeredQuestions > 0 && !isSubmitting) {
        setIsAutoSaving(true);
        try {
          await onSaveDraft({
            answers: watchedAnswers.filter(a => a.answer.trim() !== ''),
            draft: true
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [watchedAnswers, answeredQuestions, isSubmitting, onSaveDraft]);

  const handleSubmit = (values: QuizFormValues) => {
    onSubmit({
      answers: values.answers,
      draft: false
    });
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    await onSaveDraft({
      answers: values.answers.filter(a => a.answer.trim() !== ''),
      draft: true
    });
    setLastSaved(new Date());
  };

  const isOverdue = new Date() > new Date(assignment.due_date);
  const canSubmit = answeredQuestions === totalQuestions && !isOverdue && !isSubmitting;
  const isSubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'graded';

  if (questions.length === 0) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Kuis ini belum memiliki pertanyaan. Hubungi guru untuk informasi lebih lanjut.
        </AlertDescription>
      </Alert>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Kuis Telah Dikirim</CardTitle>
          </div>
          <CardDescription>
            Anda telah mengirim kuis ini pada {format(new Date(existingSubmission!.submitted_at), 'PPP "pukul" HH:mm', { locale: id })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Total Pertanyaan</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Terjawab</div>
            </div>
            {existingSubmission?.grade !== undefined && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {existingSubmission.grade}/{assignment.max_score}
                </div>
                <div className="text-sm text-blue-700">Nilai Anda</div>
              </div>
            )}
          </div>
          
          {existingSubmission?.feedback && (
            <Alert className="mt-4">
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                <strong>Umpan Balik:</strong> {existingSubmission.feedback}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileQuestion className="h-5 w-5 text-purple-600" />
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Kuis
                </Badge>
                <Badge variant={isDraft ? "outline" : "secondary"}>
                  {isDraft ? 'Draf' : 'Aktif'}
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
                isOverdue ? "text-red-500" : "text-gray-500"
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

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium">Progress Pengerjaan</div>
              <div className="text-xs text-gray-600">
                {answeredQuestions} dari {totalQuestions} pertanyaan terjawab
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Auto-save status */}
          {(isAutoSaving || lastSaved) && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              {isAutoSaving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                  <span>Menyimpan otomatis...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Tersimpan pada {format(lastSaved, 'HH:mm:ss')}</span>
                </>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Navigasi Pertanyaan</h3>
            <div className="text-sm text-gray-600">
              Pertanyaan {currentQuestion + 1} dari {totalQuestions}
            </div>
          </div>
          
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = watchedAnswers[index]?.answer.trim() !== '';
              const isCurrent = index === currentQuestion;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                    isCurrent 
                      ? "bg-purple-600 text-white ring-2 ring-purple-200" 
                      : isAnswered 
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Pertanyaan {currentQuestion + 1}
              </CardTitle>
              <Badge variant="outline">
                {currentQ.points} poin
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div className="text-lg font-medium leading-relaxed">
                {currentQ.question}
              </div>
              
              {/* Answer Input */}
              <div className="space-y-4">
                {currentQ.type === 'multiple_choice' && currentQ.options && (
                  <RadioGroup
                    value={watchedAnswers[currentQuestion]?.answer || ''}
                    onValueChange={(value) => {
                      const newAnswers = [...watchedAnswers];
                      newAnswers[currentQuestion] = {
                        question_id: currentQ.id,
                        answer: value
                      };
                      form.setValue('answers', newAnswers);
                    }}
                    className="space-y-3"
                  >
                    {currentQ.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`}
                          className="text-purple-600"
                        />
                        <Label 
                          htmlFor={`option-${index}`}
                          className="flex-1 text-base cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQ.type === 'true_false' && (
                  <RadioGroup
                    value={watchedAnswers[currentQuestion]?.answer || ''}
                    onValueChange={(value) => {
                      const newAnswers = [...watchedAnswers];
                      newAnswers[currentQuestion] = {
                        question_id: currentQ.id,
                        answer: value
                      };
                      form.setValue('answers', newAnswers);
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="true" id="true" className="text-purple-600" />
                      <Label htmlFor="true" className="flex-1 text-base cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                        Benar
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="false" id="false" className="text-purple-600" />
                      <Label htmlFor="false" className="flex-1 text-base cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                        Salah
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQ.type === 'short_answer' && (
                  <Input
                    placeholder="Ketik jawaban Anda di sini..."
                    value={watchedAnswers[currentQuestion]?.answer || ''}
                    onChange={(e) => {
                      const newAnswers = [...watchedAnswers];
                      newAnswers[currentQuestion] = {
                        question_id: currentQ.id,
                        answer: e.target.value
                      };
                      form.setValue('answers', newAnswers);
                    }}
                    className="text-base p-4"
                  />
                )}
              </div>
            </div>
          </CardContent>
          
          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || answeredQuestions === 0}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Simpan Draf
              </Button>
              
              {currentQuestion < totalQuestions - 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentQuestion(Math.min(totalQuestions - 1, currentQuestion + 1))}
                  className="gap-2"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className={cn(
                    "gap-2",
                    canSubmit ? "bg-green-600 hover:bg-green-700" : ""
                  )}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Kuis'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>

      {/* Warnings */}
      {isOverdue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Batas waktu pengumpulan telah terlewati. Anda tidak dapat mengirim kuis ini.
          </AlertDescription>
        </Alert>
      )}

      {!canSubmit && !isOverdue && answeredQuestions > 0 && answeredQuestions < totalQuestions && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Masih ada {totalQuestions - answeredQuestions} pertanyaan yang belum dijawab. 
            Jawab semua pertanyaan untuk dapat mengirim kuis.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
