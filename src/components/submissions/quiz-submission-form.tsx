
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QuizQuestion, QuizSubmissionData, QuizAnswer } from '@/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const answerSchema = z.object({
  question_id: z.number(),
  answer: z.string().min(1, 'Answer cannot be empty'),
});

const quizSchema = z.object({
  answers: z.array(answerSchema),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface QuizSubmissionFormProps {
  questions: QuizQuestion[];
  onSubmit: (data: QuizSubmissionData) => void;
  isSubmitting: boolean;
}

export const QuizSubmissionForm: React.FC<QuizSubmissionFormProps> = ({ questions, onSubmit, isSubmitting }) => {
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      answers: questions.map(q => ({ question_id: q.id, answer: '' })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "answers",
  });

  const handleSubmit = (values: QuizFormValues) => {
    onSubmit({ ...values, draft: false });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle>{`Question ${index + 1}: ${question.question}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name={`answers.${index}.answer`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {question.type === 'multiple_choice' && question.options && (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                          {question.options.map((option, i) => (
                            <FormItem key={i} className="flex items-center space-x-3">
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      )}
                      {question.type === 'true_false' && (
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                          <FormItem className="flex items-center space-x-3">
                            <FormControl><RadioGroupItem value="true" /></FormControl>
                            <FormLabel className="font-normal">True</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3">
                            <FormControl><RadioGroupItem value="false" /></FormControl>
                            <FormLabel className="font-normal">False</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      )}
                      {question.type === 'short_answer' && (
                        <Input {...field} placeholder="Your answer..." />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </form>
    </Form>
  );
};
