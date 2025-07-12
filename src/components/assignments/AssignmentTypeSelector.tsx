'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  PenTool, 
  Upload, 
  HelpCircle, 
  FileText, 
  Clock, 
  Target,
  Calendar,
  Settings,
  Info
} from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'
import { AssignmentCreateData, QuizQuestion } from '@/types'
import QuizBuilder from './QuizBuilder'

interface AssignmentTypeConfig {
  type: 'essay' | 'file_upload' | 'quiz'
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  features: string[]
}

const assignmentTypes: AssignmentTypeConfig[] = [
  {
    type: 'essay',
    title: 'Essay Assignment',
    description: 'Students submit written responses with rich text formatting',
    icon: PenTool,
    color: 'blue',
    features: ['Rich text editor', 'Word count', 'Plagiarism detection', 'Inline feedback']
  },
  {
    type: 'file_upload',
    title: 'File Upload',
    description: 'Students upload documents, presentations, or other files',
    icon: Upload,
    color: 'green',
    features: ['Multiple file types', 'Size validation', 'Virus scanning', 'Download protection']
  },
  {
    type: 'quiz',
    title: 'Quiz/Test',
    description: 'Multiple choice, true/false, and short answer questions',
    icon: HelpCircle,
    color: 'purple',
    features: ['Auto-grading', 'Question bank', 'Timer support', 'Instant feedback']
  }
]

interface AssignmentTypeSelectorProps {
  initialData?: Partial<AssignmentCreateData>
  onSave?: (data: AssignmentCreateData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  courseId: number
}

export default function AssignmentTypeSelector({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
  courseId
}: AssignmentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'essay' | 'file_upload' | 'quiz' | null>(
    initialData?.type || null
  )
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    due_date: initialData?.due_date?.split('T')[0] || '',
    due_time: initialData?.due_date?.split('T')[1]?.slice(0, 5) || '23:59',
    max_score: initialData?.max_score || 100,
    allow_late_submission: false,
    randomize_questions: false,
    time_limit: 0, // in minutes, 0 means no limit
    show_correct_answers: true,
    max_attempts: 1
  })
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    initialData?.quiz_questions_json || []
  )
  const [fileSettings, setFileSettings] = useState({
    allowed_file_types: initialData?.allowed_file_types || 'pdf,doc,docx,ppt,pptx',
    max_file_size_mb: initialData?.max_file_size_mb || 10
  })

  // Rich text editor for essay description
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Enter assignment instructions and requirements...',
      }),
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }))
    }
  })

  // Get assignment type config
  const getTypeConfig = (type: string) => {
    return assignmentTypes.find(t => t.type === type)
  }

  // Handle form submission
  const handleSave = async () => {
    if (!selectedType) {
      return
    }

    const dueDateTime = formData.due_date && formData.due_time 
      ? `${formData.due_date}T${formData.due_time}:00`
      : ''

    const assignmentData: AssignmentCreateData = {
      title: formData.title,
      description: formData.description,
      type: selectedType,
      due_date: dueDateTime,
      max_score: formData.max_score,
    }

    // Add type-specific data
    if (selectedType === 'quiz') {
      assignmentData.quiz_questions_json = quizQuestions
    } else if (selectedType === 'file_upload') {
      assignmentData.allowed_file_types = fileSettings.allowed_file_types
      assignmentData.max_file_size_mb = fileSettings.max_file_size_mb
    }

    if (onSave) {
      await onSave(assignmentData)
    }
  }

  // Validation
  const isValid = () => {
    if (!selectedType || !formData.title.trim()) return false
    if (selectedType === 'quiz' && quizQuestions.length === 0) return false
    return true
  }

  return (
    <div className="space-y-6">
      {/* Assignment Type Selection */}
      {!selectedType && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Assignment Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {assignmentTypes.map((type) => (
              <Card
                key={type.type}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedType(type.type)}
              >
                <CardHeader className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2",
                    type.color === 'blue' && "bg-blue-100 text-blue-600",
                    type.color === 'green' && "bg-green-100 text-green-600",
                    type.color === 'purple' && "bg-purple-100 text-purple-600"
                  )}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-base">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="space-y-1">
                    {type.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Configuration */}
      {selectedType && (
        <div className="space-y-6">
          {/* Header with selected type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(() => {
                const config = getTypeConfig(selectedType)
                if (!config) return null
                return (
                  <>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      config.color === 'blue' && "bg-blue-100 text-blue-600",
                      config.color === 'green' && "bg-green-100 text-green-600",
                      config.color === 'purple' && "bg-purple-100 text-purple-600"
                    )}>
                      <config.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{config.title}</h3>
                      <p className="text-sm text-gray-600">{config.description}</p>
                    </div>
                  </>
                )
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedType(null)}
            >
              Change Type
            </Button>
          </div>

          {/* Basic Assignment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_score">Maximum Score *</Label>
                  <Input
                    id="max_score"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.max_score}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_score: parseInt(e.target.value) || 100 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_time">Due Time</Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Instructions & Description</Label>
                <div className="border rounded-md min-h-[150px]">
                  <EditorContent editor={editor} className="p-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Type-specific settings */}
          {selectedType === 'file_upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  File Upload Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allowed_types">Allowed File Types</Label>
                    <Input
                      id="allowed_types"
                      value={fileSettings.allowed_file_types}
                      onChange={(e) => setFileSettings(prev => ({ ...prev, allowed_file_types: e.target.value }))}
                      placeholder="pdf,doc,docx,ppt,pptx"
                    />
                    <p className="text-xs text-gray-500">Comma-separated file extensions</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_size">Maximum File Size (MB)</Label>
                    <Input
                      id="max_size"
                      type="number"
                      min="1"
                      max="100"
                      value={fileSettings.max_file_size_mb}
                      onChange={(e) => setFileSettings(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) || 10 }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedType === 'quiz' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Quiz Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                    <Input
                      id="time_limit"
                      type="number"
                      min="0"
                      value={formData.time_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, time_limit: parseInt(e.target.value) || 0 }))}
                      placeholder="0 = No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_attempts">Maximum Attempts</Label>
                    <Select
                      value={formData.max_attempts.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, max_attempts: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 attempt</SelectItem>
                        <SelectItem value="2">2 attempts</SelectItem>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="0">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Quiz Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="randomize"
                          checked={formData.randomize_questions}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomize_questions: checked }))}
                        />
                        <Label htmlFor="randomize" className="text-sm">Randomize Questions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show_answers"
                          checked={formData.show_correct_answers}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_correct_answers: checked }))}
                        />
                        <Label htmlFor="show_answers" className="text-sm">Show Correct Answers</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Builder */}
          {selectedType === 'quiz' && (
            <QuizBuilder
              initialQuestions={quizQuestions}
              onQuestionsChange={setQuizQuestions}
              maxQuestions={50}
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !isValid()}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}