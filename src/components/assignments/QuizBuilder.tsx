'use client'

import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Minus, 
  GripVertical, 
  Edit, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  List,
  ToggleLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { QuizQuestion } from '@/types'

const questionTypeSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  question: z.string().min(10, 'Question must be at least 10 characters'),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(1, 'Points must be at least 1').max(100, 'Points cannot exceed 100'),
  explanation: z.string().optional()
})

const quizSchema = z.object({
  questions: z.array(questionTypeSchema).min(1, 'Quiz must have at least one question')
})

type QuizFormData = z.infer<typeof quizSchema>
type QuestionFormData = z.infer<typeof questionTypeSchema>

interface QuizBuilderProps {
  initialQuestions?: QuizQuestion[]
  onQuestionsChange?: (questions: QuizQuestion[]) => void
  onSave?: (questions: QuizQuestion[]) => Promise<void>
  maxQuestions?: number
  className?: string
  isSubmitting?: boolean
}

export default function QuizBuilder({
  initialQuestions = [],
  onQuestionsChange,
  onSave,
  maxQuestions = 50,
  className,
  isSubmitting = false
}: QuizBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { control, handleSubmit, watch, formState: { errors } } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      questions: initialQuestions.length > 0 
        ? initialQuestions.map(q => ({
            type: q.type,
            question: q.question,
            options: q.options || [],
            correct_answer: q.correct_answer || '',
            points: q.points,
            explanation: q.explanation || ''
          }))
        : []
    }
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions'
  })

  const watchedQuestions = watch('questions')

  // Add new question
  const addQuestion = (type: QuestionFormData['type']) => {
    if (fields.length >= maxQuestions) {
      toast.error(`Maximum ${maxQuestions} questions allowed`)
      return
    }

    const newQuestion: QuestionFormData = {
      type,
      question: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correct_answer: '',
      points: 1,
      explanation: ''
    }

    append(newQuestion)
    setEditingIndex(fields.length)
  }

  // Remove question
  const removeQuestion = (index: number) => {
    remove(index)
    if (editingIndex === index) {
      setEditingIndex(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
    toast.info('Question removed')
  }

  // Move question up/down
  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return
    move(from, to)
    
    if (editingIndex === from) {
      setEditingIndex(to)
    } else if (editingIndex === to) {
      setEditingIndex(from)
    }
  }

  // Calculate total points
  const totalPoints = watchedQuestions.reduce((sum, q) => sum + (q.points || 0), 0)

  // Handle form submission
  const onSubmit = async (data: QuizFormData) => {
    try {
      const questions: QuizQuestion[] = data.questions.map((q, index) => ({
        id: index + 1,
        type: q.type,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        points: q.points,
        explanation: q.explanation
      }))

      if (onQuestionsChange) {
        onQuestionsChange(questions)
      }

      if (onSave) {
        await onSave(questions)
        toast.success('Quiz saved successfully!')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast.error('Failed to save quiz. Please try again.')
    }
  }

  // Render question type icon
  const getQuestionTypeIcon = (type: QuestionFormData['type']) => {
    switch (type) {
      case 'multiple_choice':
        return <List className="h-4 w-4" />
      case 'true_false':
        return <ToggleLeft className="h-4 w-4" />
      case 'short_answer':
        return <Edit className="h-4 w-4" />
    }
  }

  // Render question type label
  const getQuestionTypeLabel = (type: QuestionFormData['type']) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'true_false':
        return 'True/False'
      case 'short_answer':
        return 'Short Answer'
    }
  }

  // Render question editor
  const renderQuestionEditor = (index: number) => {
    const question = watchedQuestions[index]
    const isEditing = editingIndex === index

    return (
      <Card key={index} className={cn('relative', isEditing && 'ring-2 ring-blue-500')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                <Badge variant="outline" className="flex items-center gap-1">
                  {getQuestionTypeIcon(question.type)}
                  {getQuestionTypeLabel(question.type)}
                </Badge>
              </div>
              <span className="text-sm text-gray-500">
                Question {index + 1} • {question.points || 0} pts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveQuestion(index, index - 1)}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => moveQuestion(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                ↓
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingIndex(isEditing ? null : index)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <QuestionForm
              index={index}
              control={control}
              errors={errors}
              onSave={() => setEditingIndex(null)}
            />
          ) : (
            <QuestionPreview question={question} />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quiz Builder</h3>
          <p className="text-sm text-gray-600">
            {fields.length} question{fields.length !== 1 ? 's' : ''} • {totalPoints} total points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Add Question Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion('multiple_choice')}
          disabled={fields.length >= maxQuestions}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <List className="h-4 w-4" />
          Multiple Choice
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion('true_false')}
          disabled={fields.length >= maxQuestions}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <ToggleLeft className="h-4 w-4" />
          True/False
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addQuestion('short_answer')}
          disabled={fields.length >= maxQuestions}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <Edit className="h-4 w-4" />
          Short Answer
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your quiz by adding questions using the buttons above.
              </p>
            </CardContent>
          </Card>
        ) : (
          fields.map((field, index) => renderQuestionEditor(index))
        )}
      </div>

      {/* Quiz Summary */}
      {fields.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{fields.length}</div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(totalPoints / fields.length)}
                </div>
                <div className="text-sm text-gray-600">Avg Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(fields.length * 2)}
                </div>
                <div className="text-sm text-gray-600">Est. Minutes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {fields.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || fields.length === 0}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>
      )}
    </div>
  )
}

// Question Form Component (for editing)
function QuestionForm({ 
  index, 
  control, 
  errors,
  onSave 
}: { 
  index: number
  control: any
  errors: any
  onSave: () => void
}) {
  const { register, watch, setValue } = useForm()
  const questionType = watch(`questions.${index}.type`)
  const questionOptions = watch(`questions.${index}.options`)

  const addOption = () => {
    const currentOptions = questionOptions || []
    setValue(`questions.${index}.options`, [...currentOptions, ''])
  }

  const removeOption = (optionIndex: number) => {
    const currentOptions = questionOptions || []
    const newOptions = currentOptions.filter((_: any, i: number) => i !== optionIndex)
    setValue(`questions.${index}.options`, newOptions)
  }

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor={`question-${index}`}>Question Text *</Label>
        <Textarea
          id={`question-${index}`}
          {...register(`questions.${index}.question`)}
          placeholder="Enter your question here..."
          rows={3}
          className="w-full"
        />
        {errors?.questions?.[index]?.question && (
          <p className="text-sm text-red-500">
            {errors.questions[index].question.message}
          </p>
        )}
      </div>

      {/* Question Type Selection */}
      <div className="space-y-2">
        <Label>Question Type</Label>
        <Select
          value={questionType}
          onValueChange={(value) => setValue(`questions.${index}.type`, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Multiple Choice Options */}
      {questionType === 'multiple_choice' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Option
            </Button>
          </div>
          {questionOptions?.map((option: string, optionIndex: number) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-8">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              <Input
                {...register(`questions.${index}.options.${optionIndex}`)}
                placeholder={`Option ${optionIndex + 1}`}
                className="flex-1"
              />
              {questionOptions.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(optionIndex)}
                  className="text-red-500"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Correct Answer */}
      <div className="space-y-2">
        <Label htmlFor={`correct-answer-${index}`}>Correct Answer *</Label>
        {questionType === 'multiple_choice' ? (
          <RadioGroup
            value={watch(`questions.${index}.correct_answer`)}
            onValueChange={(value) => setValue(`questions.${index}.correct_answer`, value)}
          >
            {questionOptions?.map((option: string, optionIndex: number) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`} />
                <Label htmlFor={`option-${index}-${optionIndex}`} className="text-sm">
                  {String.fromCharCode(65 + optionIndex)}. {option || `Option ${optionIndex + 1}`}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : questionType === 'true_false' ? (
          <RadioGroup
            value={watch(`questions.${index}.correct_answer`)}
            onValueChange={(value) => setValue(`questions.${index}.correct_answer`, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`true-${index}`} />
              <Label htmlFor={`true-${index}`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`false-${index}`} />
              <Label htmlFor={`false-${index}`}>False</Label>
            </div>
          </RadioGroup>
        ) : (
          <Input
            {...register(`questions.${index}.correct_answer`)}
            placeholder="Enter the expected answer or keywords..."
            className="w-full"
          />
        )}
        {errors?.questions?.[index]?.correct_answer && (
          <p className="text-sm text-red-500">
            {errors.questions[index].correct_answer.message}
          </p>
        )}
      </div>

      {/* Points */}
      <div className="space-y-2">
        <Label htmlFor={`points-${index}`}>Points *</Label>
        <Input
          id={`points-${index}`}
          type="number"
          min="1"
          max="100"
          {...register(`questions.${index}.points`, { valueAsNumber: true })}
          placeholder="Points for this question"
          className="w-full"
        />
        {errors?.questions?.[index]?.points && (
          <p className="text-sm text-red-500">
            {errors.questions[index].points.message}
          </p>
        )}
      </div>

      {/* Explanation (Optional) */}
      <div className="space-y-2">
        <Label htmlFor={`explanation-${index}`}>Explanation (Optional)</Label>
        <Textarea
          id={`explanation-${index}`}
          {...register(`questions.${index}.explanation`)}
          placeholder="Provide an explanation for the correct answer..."
          rows={2}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onSave}
          size="sm"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSave}
          size="sm"
          className="flex items-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Save Question
        </Button>
      </div>
    </div>
  )
}

// Question Preview Component
function QuestionPreview({ question }: { question: QuestionFormData }) {
  return (
    <div className="space-y-3">
      <div className="font-medium">{question.question || 'Question text...'}</div>
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <div 
              key={i} 
              className={cn(
                "flex items-center gap-2 p-2 rounded border",
                option === question.correct_answer && "bg-green-50 border-green-200"
              )}
            >
              <div className="w-4 h-4 border rounded-full" />
              <span>{option || `Option ${i + 1}...`}</span>
              {option === question.correct_answer && (
                <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}
      {question.type === 'true_false' && (
        <div className="space-y-2">
          <div className={cn(
            "flex items-center gap-2 p-2 rounded border",
            question.correct_answer === 'true' && "bg-green-50 border-green-200"
          )}>
            <div className="w-4 h-4 border rounded-full" />
            <span>True</span>
            {question.correct_answer === 'true' && (
              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
            )}
          </div>
          <div className={cn(
            "flex items-center gap-2 p-2 rounded border",
            question.correct_answer === 'false' && "bg-green-50 border-green-200"
          )}>
            <div className="w-4 h-4 border rounded-full" />
            <span>False</span>
            {question.correct_answer === 'false' && (
              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
            )}
          </div>
        </div>
      )}
      {question.type === 'short_answer' && (
        <div className="p-3 bg-gray-50 rounded border-2 border-dashed">
          <p className="text-sm text-gray-500">Short answer response area</p>
          {question.correct_answer && (
            <p className="text-xs text-green-600 mt-1">
              Expected: {question.correct_answer}
            </p>
          )}
        </div>
      )}
      {question.explanation && (
        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  )
}