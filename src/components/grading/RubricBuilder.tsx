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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Minus, 
  GripVertical, 
  Target, 
  Award,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Save,
  Eye,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GradingRubric, RubricCriteria, RubricLevel } from '@/types'

const rubricLevelSchema = z.object({
  name: z.string().min(1, 'Level name is required'),
  description: z.string().min(1, 'Level description is required'),
  points: z.number().min(0, 'Points must be non-negative'),
  quality: z.enum(['excellent', 'good', 'satisfactory', 'needs_improvement', 'poor'])
})

const rubricCriteriaSchema = z.object({
  name: z.string().min(1, 'Criteria name is required'),
  description: z.string().min(1, 'Criteria description is required'),
  weight: z.number().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100'),
  levels: z.array(rubricLevelSchema).min(3, 'At least 3 levels required').max(5, 'Maximum 5 levels allowed')
})

const rubricSchema = z.object({
  title: z.string().min(1, 'Rubric title is required'),
  description: z.string().optional(),
  criteria: z.array(rubricCriteriaSchema).min(1, 'At least one criteria is required').max(10, 'Maximum 10 criteria allowed')
})

type RubricFormData = z.infer<typeof rubricSchema>

interface RubricBuilderProps {
  assignmentId: number
  initialRubric?: GradingRubric
  onSave?: (rubric: Omit<GradingRubric, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  maxScore?: number
}

const qualityConfig = {
  excellent: { color: 'bg-green-100 text-green-800', icon: Award },
  good: { color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
  satisfactory: { color: 'bg-yellow-100 text-yellow-800', icon: Target },
  needs_improvement: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  poor: { color: 'bg-red-100 text-red-800', icon: XCircle }
}

export default function RubricBuilder({
  assignmentId,
  initialRubric,
  onSave,
  onCancel,
  isSubmitting = false,
  maxScore = 100
}: RubricBuilderProps) {
  const [previewMode, setPreviewMode] = useState(false)

  const { control, handleSubmit, watch, formState: { errors } } = useForm<RubricFormData>({
    resolver: zodResolver(rubricSchema),
    defaultValues: {
      title: initialRubric?.title || '',
      description: initialRubric?.description || '',
      criteria: initialRubric?.criteria.map(c => ({
        name: c.name,
        description: c.description,
        weight: c.weight,
        levels: c.levels.map(l => ({
          name: l.name,
          description: l.description,
          points: l.points,
          quality: l.quality
        }))
      })) || []
    }
  })

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'criteria'
  })

  const watchedData = watch()

  // Calculate total possible points
  const calculateTotalPoints = () => {
    return watchedData.criteria.reduce((total, criteria) => {
      const maxPoints = Math.max(...(criteria.levels?.map(l => l.points) || [0]))
      return total + maxPoints
    }, 0)
  }

  // Calculate weight distribution
  const getTotalWeight = () => {
    return watchedData.criteria.reduce((total, criteria) => total + (criteria.weight || 0), 0)
  }

  // Add new criteria with default levels
  const addCriteria = () => {
    const defaultLevels: z.infer<typeof rubricLevelSchema>[] = [
      {
        name: 'Excellent',
        description: 'Exceeds expectations',
        points: 4,
        quality: 'excellent'
      },
      {
        name: 'Good',
        description: 'Meets expectations',
        points: 3,
        quality: 'good'
      },
      {
        name: 'Satisfactory',
        description: 'Approaches expectations',
        points: 2,
        quality: 'satisfactory'
      },
      {
        name: 'Needs Improvement',
        description: 'Below expectations',
        points: 1,
        quality: 'needs_improvement'
      }
    ]

    appendCriteria({
      name: '',
      description: '',
      weight: Math.round(100 / (criteriaFields.length + 1)),
      levels: defaultLevels
    })
  }

  // Handle form submission
  const onSubmit = async (data: RubricFormData) => {
    const totalWeight = getTotalWeight()
    if (Math.abs(totalWeight - 100) > 1) {
      toast.error('Criteria weights must total 100%')
      return
    }

    try {
      const rubricData: Omit<GradingRubric, 'id' | 'created_at' | 'updated_at'> = {
        assignment_id: assignmentId,
        title: data.title,
        description: data.description,
        criteria: data.criteria.map((c, index) => ({
          id: index + 1,
          name: c.name,
          description: c.description,
          weight: c.weight,
          levels: c.levels.map((l, levelIndex) => ({
            id: levelIndex + 1,
            name: l.name,
            description: l.description,
            points: l.points,
            quality: l.quality
          }))
        })),
        total_points: calculateTotalPoints()
      }

      if (onSave) {
        await onSave(rubricData)
        toast.success('Rubric saved successfully!')
      }
    } catch (error) {
      console.error('Error saving rubric:', error)
      toast.error('Failed to save rubric. Please try again.')
    }
  }

  const totalWeight = getTotalWeight()
  const isWeightValid = Math.abs(totalWeight - 100) <= 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grading Rubric Builder</h3>
          <p className="text-sm text-gray-600">
            Create detailed grading criteria for consistent evaluation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Rubric Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Rubric Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Rubric Title *</Label>
              <Input
                id="title"
                {...control.register('title')}
                placeholder="e.g., Essay Grading Rubric"
                disabled={previewMode}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Rubric Statistics</Label>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-medium">{criteriaFields.length}</span>
                  <span className="text-gray-500 ml-1">Criteria</span>
                </div>
                <div>
                  <span className="font-medium">{calculateTotalPoints()}</span>
                  <span className="text-gray-500 ml-1">Total Points</span>
                </div>
                <div>
                  <span className={cn(
                    "font-medium",
                    isWeightValid ? "text-green-600" : "text-red-600"
                  )}>
                    {totalWeight.toFixed(1)}%
                  </span>
                  <span className="text-gray-500 ml-1">Weight</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...control.register('description')}
              placeholder="Provide context and instructions for using this rubric..."
              rows={3}
              disabled={previewMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Weight Distribution Warning */}
      {!isWeightValid && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">Weight Distribution Issue</h4>
              <p className="text-sm text-orange-700">
                Criteria weights currently total {totalWeight.toFixed(1)}%. They should total exactly 100%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Grading Criteria</h4>
          {!previewMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCriteria}
              disabled={criteriaFields.length >= 10}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Criteria
            </Button>
          )}
        </div>

        {criteriaFields.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No criteria yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your rubric by adding grading criteria.
              </p>
              <Button onClick={addCriteria}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Criteria
              </Button>
            </CardContent>
          </Card>
        ) : (
          criteriaFields.map((field, index) => (
            <CriteriaEditor
              key={field.id}
              index={index}
              control={control}
              errors={errors}
              onRemove={() => removeCriteria(index)}
              previewMode={previewMode}
              canRemove={criteriaFields.length > 1}
            />
          ))
        )}
      </div>

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
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || !isWeightValid || criteriaFields.length === 0}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Rubric'}
        </Button>
      </div>
    </div>
  )
}

// Criteria Editor Component
function CriteriaEditor({
  index,
  control,
  errors,
  onRemove,
  previewMode,
  canRemove
}: {
  index: number
  control: any
  errors: any
  onRemove: () => void
  previewMode: boolean
  canRemove: boolean
}) {
  const { fields: levelFields, append: appendLevel, remove: removeLevel } = useFieldArray({
    control,
    name: `criteria.${index}.levels`
  })

  const addLevel = () => {
    appendLevel({
      name: '',
      description: '',
      points: 0,
      quality: 'satisfactory'
    })
  }

  const criteriaErrors = errors.criteria?.[index]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="font-medium">Criteria {index + 1}</span>
          </div>
          {!previewMode && canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Criteria Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Criteria Name *</Label>
            <Input
              {...control.register(`criteria.${index}.name`)}
              placeholder="e.g., Content Quality"
              disabled={previewMode}
            />
            {criteriaErrors?.name && (
              <p className="text-sm text-red-600">{criteriaErrors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Weight (%) *</Label>
            <Input
              type="number"
              min="1"
              max="100"
              {...control.register(`criteria.${index}.weight`, { valueAsNumber: true })}
              disabled={previewMode}
            />
            {criteriaErrors?.weight && (
              <p className="text-sm text-red-600">{criteriaErrors.weight.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Performance Levels</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{levelFields.length} levels</span>
              {!previewMode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLevel}
                  disabled={levelFields.length >= 5}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea
            {...control.register(`criteria.${index}.description`)}
            placeholder="Describe what this criteria evaluates..."
            rows={2}
            disabled={previewMode}
          />
          {criteriaErrors?.description && (
            <p className="text-sm text-red-600">{criteriaErrors.description.message}</p>
          )}
        </div>

        {/* Performance Levels */}
        <div className="space-y-3">
          <Label>Performance Levels</Label>
          <div className="grid grid-cols-1 gap-3">
            {levelFields.map((levelField, levelIndex) => (
              <div key={levelField.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level {levelIndex + 1}</Badge>
                  </div>
                  {!previewMode && levelFields.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(levelIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Level Name</Label>
                    <Input
                      {...control.register(`criteria.${index}.levels.${levelIndex}.name`)}
                      placeholder="e.g., Excellent"
                      disabled={previewMode}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Points</Label>
                    <Input
                      type="number"
                      min="0"
                      {...control.register(`criteria.${index}.levels.${levelIndex}.points`, { valueAsNumber: true })}
                      disabled={previewMode}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quality Level</Label>
                    <select
                      {...control.register(`criteria.${index}.levels.${levelIndex}.quality`)}
                      disabled={previewMode}
                      className="w-full px-3 py-1 text-sm border rounded-md"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="satisfactory">Satisfactory</option>
                      <option value="needs_improvement">Needs Improvement</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      {...control.register(`criteria.${index}.levels.${levelIndex}.description`)}
                      placeholder="Describe this level..."
                      disabled={previewMode}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}