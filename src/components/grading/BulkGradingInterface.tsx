'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StandaloneSelect } from '@/components/ui/form-select'
import {
  Users,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Upload,
  Calculator,
  Filter,
  RefreshCw,
  Save,
  Send,
  AlertCircle,
  Target
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface BulkGradeData {
  assignmentId: number
  submissionIds: string[]
  gradeType: 'uniform' | 'rubric' | 'percentage'
  uniformGrade?: {
    score: number
    feedback: string
  }
  rubricGrades?: {
    criteriaId: number
    levelId: number
    comments?: string
  }[]
  percentageAdjustment?: {
    percentage: number
    reason: string
  }
}

interface Submission {
  id: string
  studentId: number
  studentName: string
  submittedAt: string
  status: 'submitted' | 'graded' | 'late' | 'missing'
  currentGrade?: number
  submissionType: 'text' | 'file' | 'quiz'
  submissionContent?: string
  fileName?: string
}

interface GradingCriteria {
  id: number
  name: string
  description: string
  weight: number
  levels: {
    id: number
    name: string
    points: number
    description: string
  }[]
}

const bulkGradeSchema = z.object({
  gradeType: z.enum(['uniform', 'rubric', 'percentage']),
  selectedSubmissions: z.array(z.string()).min(1, 'Select at least one submission'),
  uniformGrade: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string().optional()
  }).optional(),
  percentageAdjustment: z.object({
    percentage: z.number().min(-100).max(100),
    reason: z.string().min(1, 'Reason is required for percentage adjustments')
  }).optional()
})

type BulkGradeFormData = z.infer<typeof bulkGradeSchema>

interface BulkGradingProps {
  assignmentId: number
  rubric?: GradingCriteria[]
  onBulkGrade?: (data: BulkGradeData) => Promise<void>
  isSubmitting?: boolean
}

export default function BulkGradingInterface({
  assignmentId,
  rubric = [],
  onBulkGrade,
  isSubmitting = false
}: BulkGradingProps) {
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  
  const queryClient = useQueryClient()

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<BulkGradeFormData>({
    resolver: zodResolver(bulkGradeSchema),
    defaultValues: {
      gradeType: 'uniform',
      selectedSubmissions: [],
      uniformGrade: {
        score: 0,
        feedback: ''
      }
    }
  })

  const gradeType = watch('gradeType')
  const uniformGrade = watch('uniformGrade')

  // Mock data - in real implementation, this would come from an API
  const submissions: Submission[] = [
    {
      id: '1',
      studentId: 1,
      studentName: 'John Doe',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'submitted',
      submissionType: 'text',
      submissionContent: 'This is a sample submission...'
    },
    {
      id: '2',
      studentId: 2,
      studentName: 'Jane Smith',
      submittedAt: '2024-01-15T14:20:00Z',
      status: 'submitted',
      submissionType: 'file',
      fileName: 'assignment.pdf'
    },
    {
      id: '3',
      studentId: 3,
      studentName: 'Bob Wilson',
      submittedAt: '2024-01-16T09:15:00Z',
      status: 'late',
      submissionType: 'text',
      submissionContent: 'Late submission content...'
    },
    {
      id: '4',
      studentId: 4,
      studentName: 'Alice Brown',
      submittedAt: '2024-01-14T16:45:00Z',
      status: 'graded',
      currentGrade: 85,
      submissionType: 'quiz'
    }
  ]

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions.filter(submission => {
      const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || submission.status === filterStatus
      return matchesSearch && matchesFilter
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.studentName.localeCompare(b.studentName)
        case 'date':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return filtered
  }, [submissions, searchTerm, filterStatus, sortBy])

  // Handle submission selection
  const handleSubmissionToggle = (submissionId: string) => {
    const newSelection = selectedSubmissions.includes(submissionId)
      ? selectedSubmissions.filter(id => id !== submissionId)
      : [...selectedSubmissions, submissionId]
    
    setSelectedSubmissions(newSelection)
    setValue('selectedSubmissions', newSelection)
  }

  const handleSelectAll = () => {
    const allIds = filteredSubmissions.map(s => s.id)
    setSelectedSubmissions(allIds)
    setValue('selectedSubmissions', allIds)
  }

  const handleDeselectAll = () => {
    setSelectedSubmissions([])
    setValue('selectedSubmissions', [])
  }

  // Handle bulk grading submission
  const onSubmit = async (data: BulkGradeFormData) => {
    try {
      const bulkGradeData: BulkGradeData = {
        assignmentId,
        submissionIds: data.selectedSubmissions,
        gradeType: data.gradeType,
        uniformGrade: data.uniformGrade ? {
          score: data.uniformGrade.score,
          feedback: data.uniformGrade.feedback || ''
        } : undefined,
        percentageAdjustment: data.percentageAdjustment
      }

      if (onBulkGrade) {
        await onBulkGrade(bulkGradeData)
        toast.success(`Successfully graded ${data.selectedSubmissions.length} submissions`)
        setSelectedSubmissions([])
        queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] })
      } else {
        // Simulate success for demo
        toast.success(`Bulk grading completed for ${data.selectedSubmissions.length} submissions`)
      }
    } catch (error) {
      console.error('Bulk grading failed:', error)
      toast.error('Failed to apply bulk grades. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'late':
        return 'bg-orange-100 text-orange-800'
      case 'missing':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Grading Interface</h2>
          <p className="text-gray-600">
            Grade multiple submissions at once with consistent criteria
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Selection Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Submissions ({selectedSubmissions.length} selected)
              </CardTitle>
              
              {/* Filters and Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="search" className="text-sm">Search:</Label>
                  <Input
                    id="search"
                    placeholder="Student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="filter" className="text-sm">Filter:</Label>
                  <StandaloneSelect
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as string)}
                    options={[
                      { value: 'all', label: 'All' },
                      { value: 'submitted', label: 'Submitted' },
                      { value: 'graded', label: 'Graded' },
                      { value: 'late', label: 'Late' },
                      { value: 'missing', label: 'Missing' }
                    ]}
                    triggerClassName="w-32"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="sort" className="text-sm">Sort:</Label>
                  <StandaloneSelect
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as 'name' | 'date' | 'status')}
                    options={[
                      { value: 'name', label: 'Name' },
                      { value: 'date', label: 'Date' },
                      { value: 'status', label: 'Status' }
                    ]}
                    triggerClassName="w-32"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={cn(
                      "flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer",
                      selectedSubmissions.includes(submission.id) && "bg-blue-50 border-blue-200"
                    )}
                    onClick={() => handleSubmissionToggle(submission.id)}
                  >
                    <Checkbox
                      checked={selectedSubmissions.includes(submission.id)}
                      onCheckedChange={() => handleSubmissionToggle(submission.id)}
                      className="mr-3"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{submission.studentName}</h4>
                          <p className="text-sm text-gray-600">
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                          {submission.currentGrade && (
                            <Badge variant="outline">
                              {submission.currentGrade}/100
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {submission.submissionContent && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {submission.submissionContent}
                        </p>
                      )}
                      
                      {submission.fileName && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <FileText className="h-3 w-3" />
                          {submission.fileName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No submissions found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grading Configuration Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Grading Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Grade Type Selection */}
                <div className="space-y-2">
                  <Label>Grading Method</Label>
                  <StandaloneSelect
                    value={gradeType}
                    onValueChange={(value) => setValue('gradeType', value as 'uniform' | 'rubric' | 'percentage')}
                    options={[
                      { value: 'uniform', label: 'Uniform Grade' },
                      { value: 'percentage', label: 'Percentage Adjustment' },
                      ...(rubric.length > 0 ? [{ value: 'rubric', label: 'Rubric-based' }] : [])
                    ]}
                    placeholder="Select grading method"
                  />
                </div>

                {/* Uniform Grade Configuration */}
                {gradeType === 'uniform' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="uniform-score">Score (0-100)</Label>
                      <Input
                        id="uniform-score"
                        type="number"
                        min="0"
                        max="100"
                        value={uniformGrade?.score || 0}
                        onChange={(e) => setValue('uniformGrade.score', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="uniform-feedback">Feedback (Optional)</Label>
                      <Textarea
                        id="uniform-feedback"
                        placeholder="Provide feedback for all selected submissions..."
                        value={uniformGrade?.feedback || ''}
                        onChange={(e) => setValue('uniformGrade.feedback', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Percentage Adjustment Configuration */}
                {gradeType === 'percentage' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Percentage Adjustment</Label>
                      <Input
                        id="percentage"
                        type="number"
                        min="-100"
                        max="100"
                        placeholder="e.g., +5 or -10"
                        onChange={(e) => setValue('percentageAdjustment.percentage', parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-gray-500">
                        Positive values increase grades, negative values decrease them
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adjustment-reason">Reason for Adjustment</Label>
                      <Textarea
                        id="adjustment-reason"
                        placeholder="Explain the reason for this adjustment..."
                        onChange={(e) => setValue('percentageAdjustment.reason', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Rubric Configuration */}
                {gradeType === 'rubric' && rubric.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Apply the same rubric grades to all selected submissions
                    </p>
                    {/* Rubric interface would go here */}
                    <div className="p-3 bg-blue-50 rounded border">
                      <p className="text-sm text-blue-700">
                        Rubric-based bulk grading interface would be implemented here
                      </p>
                    </div>
                  </div>
                )}

                {/* Selected Submissions Summary */}
                {selectedSubmissions.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Will Apply to {selectedSubmissions.length} Submissions</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Selected students: {
                        filteredSubmissions
                          .filter(s => selectedSubmissions.includes(s.id))
                          .map(s => s.studentName)
                          .join(', ')
                      }
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={selectedSubmissions.length === 0 || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Apply Grades
                      </>
                    )}
                  </Button>
                </div>

                {/* Export Options */}
                <Separator />
                <div className="space-y-2">
                  <Label>Export Grades</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{filteredSubmissions.length}</div>
                  <div className="text-sm text-gray-600">Total Submissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{selectedSubmissions.length}</div>
                  <div className="text-sm text-gray-600">Selected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}