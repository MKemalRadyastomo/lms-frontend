'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Target,
  MessageSquare,
  Award,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Save,
  Send,
  Download,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { 
  GradingSession, 
  GradeEntry, 
  SubmissionGrade, 
  RubricLevel,
  GradingRubric 
} from '@/types'

const gradeEntrySchema = z.object({
  criteria_id: z.number(),
  level_id: z.number(),
  points: z.number(),
  comments: z.string().optional()
})

const gradingSchema = z.object({
  grade_entries: z.array(gradeEntrySchema),
  overall_feedback: z.string().optional()
})

type GradingFormData = z.infer<typeof gradingSchema>

interface GradingInterfaceProps {
  session: GradingSession
  onSave?: (grade: Omit<SubmissionGrade, 'id' | 'graded_at'>) => Promise<void>
  onSubmit?: (grade: Omit<SubmissionGrade, 'id' | 'graded_at'>) => Promise<void>
  isSubmitting?: boolean
  readOnly?: boolean
}

const qualityConfig = {
  excellent: { color: 'bg-green-100 text-green-800 border-green-200', icon: Award },
  good: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp },
  satisfactory: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Target },
  needs_improvement: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
  poor: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
}

export default function GradingInterface({
  session,
  onSave,
  onSubmit,
  isSubmitting = false,
  readOnly = false
}: GradingInterfaceProps) {
  const [selectedLevels, setSelectedLevels] = useState<Record<number, number>>({})
  const [criteriaComments, setCriteriaComments] = useState<Record<number, string>>({})
  const [activeTab, setActiveTab] = useState<'submission' | 'rubric'>('submission')

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<GradingFormData>({
    resolver: zodResolver(gradingSchema),
    defaultValues: {
      grade_entries: session.existing_grade?.grade_entries || [],
      overall_feedback: session.existing_grade?.overall_feedback || ''
    }
  })

  // Initialize existing grades
  useEffect(() => {
    if (session.existing_grade) {
      const levelMap: Record<number, number> = {}
      const commentMap: Record<number, string> = {}
      
      session.existing_grade.grade_entries.forEach(entry => {
        levelMap[entry.criteria_id] = entry.level_id
        if (entry.comments) {
          commentMap[entry.criteria_id] = entry.comments
        }
      })
      
      setSelectedLevels(levelMap)
      setCriteriaComments(commentMap)
    }
  }, [session.existing_grade])

  // Calculate current grade
  const currentGrade = useMemo(() => {
    if (!session.rubric) return { points: 0, percentage: 0 }

    let totalPoints = 0
    let totalPossiblePoints = 0

    session.rubric.criteria.forEach(criteria => {
      const selectedLevelId = selectedLevels[criteria.id]
      const selectedLevel = criteria.levels.find(l => l.id === selectedLevelId)
      const maxPoints = Math.max(...criteria.levels.map(l => l.points))
      
      if (selectedLevel) {
        totalPoints += selectedLevel.points
      }
      totalPossiblePoints += maxPoints
    })

    const percentage = totalPossiblePoints > 0 ? (totalPoints / totalPossiblePoints) * 100 : 0

    return {
      points: totalPoints,
      possiblePoints: totalPossiblePoints,
      percentage: Math.round(percentage * 100) / 100
    }
  }, [selectedLevels, session.rubric])

  // Handle level selection
  const handleLevelSelect = (criteriaId: number, levelId: number) => {
    if (readOnly) return
    
    setSelectedLevels(prev => ({ ...prev, [criteriaId]: levelId }))
  }

  // Handle comment change
  const handleCommentChange = (criteriaId: number, comment: string) => {
    if (readOnly) return
    
    setCriteriaComments(prev => ({ ...prev, [criteriaId]: comment }))
  }

  // Prepare grade data
  const prepareGradeData = (overallFeedback?: string): Omit<SubmissionGrade, 'id' | 'graded_at'> => {
    const gradeEntries: GradeEntry[] = session.rubric?.criteria.map(criteria => {
      const selectedLevelId = selectedLevels[criteria.id]
      const selectedLevel = criteria.levels.find(l => l.id === selectedLevelId)
      
      return {
        criteria_id: criteria.id,
        level_id: selectedLevelId || criteria.levels[0].id,
        points: selectedLevel?.points || 0,
        comments: criteriaComments[criteria.id] || undefined
      }
    }).filter(entry => entry.level_id) || []

    return {
      submission_id: session.submission.id,
      grader_id: 1, // This should come from auth context
      rubric_id: session.rubric?.id,
      grade_entries: gradeEntries,
      total_points: currentGrade.points,
      percentage: currentGrade.percentage,
      overall_feedback: overallFeedback
    }
  }

  // Handle save draft
  const handleSave = async () => {
    const overallFeedback = watch('overall_feedback')
    const gradeData = prepareGradeData(overallFeedback)
    
    try {
      if (onSave) {
        await onSave(gradeData)
        toast.success('Grade saved as draft')
      }
    } catch (error) {
      console.error('Error saving grade:', error)
      toast.error('Failed to save grade')
    }
  }

  // Handle submit final grade
  const handleSubmitGrade = async () => {
    const overallFeedback = watch('overall_feedback')
    
    if (session.rubric && Object.keys(selectedLevels).length < session.rubric.criteria.length) {
      toast.error('Please grade all criteria before submitting')
      return
    }

    const gradeData = prepareGradeData(overallFeedback)
    
    try {
      if (onSubmit) {
        await onSubmit(gradeData)
        toast.success('Grade submitted successfully')
      }
    } catch (error) {
      console.error('Error submitting grade:', error)
      toast.error('Failed to submit grade')
    }
  }

  // Get grade letter
  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen max-h-screen overflow-hidden">
      {/* Left Panel - Submission Content */}
      <div className="space-y-4 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{session.submission.student_name}</p>
                  <p className="text-sm text-gray-500">{session.submission.student_email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="text-sm font-medium">
                  {new Date(session.submission.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator />

            {/* Assignment Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Assignment</p>
                <p className="font-medium">{session.assignment.title}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <Badge variant="outline">{session.assignment.type}</Badge>
              </div>
              <div>
                <p className="text-gray-500">Due Date</p>
                <p className="font-medium">
                  {new Date(session.assignment.due_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Max Score</p>
                <p className="font-medium">{session.assignment.max_score} pts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Content */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base">Submission Content</CardTitle>
          </CardHeader>
          <CardContent>
            {session.assignment.type === 'essay' && session.submission.submission_text && (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: session.submission.submission_text }}
              />
            )}
            
            {session.assignment.type === 'file_upload' && session.submission.file_path && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Submitted File</p>
                    <p className="text-sm text-gray-500">{session.submission.file_path}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {session.assignment.type === 'quiz' && session.submission.quiz_answers_json && (
              <div className="space-y-4">
                {session.submission.quiz_answers_json.map((answer, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium mb-2">Question {index + 1}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Student Answer: <span className="font-medium">{answer.answer}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Grading Interface */}
      <div className="space-y-4 overflow-y-auto">
        {/* Current Grade Display */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {currentGrade.points}/{currentGrade.possiblePoints || session.assignment.max_score}
              </div>
              <div className="text-lg font-medium text-gray-700">
                {currentGrade.percentage.toFixed(1)}% ({getGradeLetter(currentGrade.percentage)})
              </div>
              <Progress 
                value={currentGrade.percentage} 
                className="w-full h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rubric Grading */}
        {session.rubric ? (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                {session.rubric.title}
              </CardTitle>
              {session.rubric.description && (
                <p className="text-sm text-gray-600">{session.rubric.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {session.rubric.criteria.map((criteria) => (
                <div key={criteria.id} className="space-y-3">
                  {/* Criteria Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{criteria.name}</h4>
                      <p className="text-sm text-gray-600">{criteria.description}</p>
                    </div>
                    <Badge variant="outline">{criteria.weight}%</Badge>
                  </div>

                  {/* Performance Levels */}
                  <div className="grid grid-cols-1 gap-2">
                    {criteria.levels.map((level) => {
                      const isSelected = selectedLevels[criteria.id] === level.id
                      const config = qualityConfig[level.quality]
                      const IconComponent = config.icon

                      return (
                        <div
                          key={level.id}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all",
                            isSelected 
                              ? `${config.color} border-2` 
                              : "border-gray-200 hover:border-gray-300",
                            readOnly && "cursor-not-allowed opacity-50"
                          )}
                          onClick={() => handleLevelSelect(criteria.id, level.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{level.name}</p>
                                <p className="text-sm opacity-80">{level.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{level.points}</div>
                              <div className="text-xs opacity-60">pts</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Comments for this criteria */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Comments for {criteria.name}
                    </label>
                    <Textarea
                      value={criteriaComments[criteria.id] || ''}
                      onChange={(e) => handleCommentChange(criteria.id, e.target.value)}
                      placeholder="Add specific feedback for this criteria..."
                      rows={2}
                      disabled={readOnly}
                      className="text-sm"
                    />
                  </div>

                  <Separator />
                </div>
              ))}

              {/* Overall Feedback */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Overall Feedback
                </label>
                <Textarea
                  {...control.register('overall_feedback')}
                  placeholder="Provide overall feedback on the submission..."
                  rows={4}
                  disabled={readOnly}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rubric Available</h3>
              <p className="text-gray-500">
                This assignment doesn&apos;t have a grading rubric. You can assign a grade manually.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSubmitGrade}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Grade'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}