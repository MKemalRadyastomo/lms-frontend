'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Download,
  Table,
  Filter,
  Calendar,
  Users,
  BarChart3,
  Settings,
  FileSpreadsheet
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Assignment, Submission, Course } from '@/types'

interface ExportOptions {
  format: 'pdf' | 'excel'
  includeComments: boolean
  includeRubricDetails: boolean
  includeStudentInfo: boolean
  includeStatistics: boolean
  groupBy: 'student' | 'assignment' | 'date'
  dateRange: 'all' | 'week' | 'month' | 'semester'
}

interface GradeExportProps {
  courseId?: number
  assignmentId?: number
  submissions?: Submission[]
  assignments?: Assignment[]
  course?: Course
  onExport?: (options: ExportOptions) => Promise<void>
  isExporting?: boolean
}

export default function GradeExport({
  courseId,
  assignmentId,
  submissions = [],
  assignments = [],
  course,
  onExport,
  isExporting = false
}: GradeExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeComments: true,
    includeRubricDetails: true,
    includeStudentInfo: true,
    includeStatistics: true,
    groupBy: 'student',
    dateRange: 'all'
  })

  const handleExport = async () => {
    try {
      if (onExport) {
        await onExport(exportOptions)
        toast.success(`${exportOptions.format.toUpperCase()} export started successfully!`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed. Please try again.')
    }
  }

  const updateOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  // Calculate export statistics
  const exportStats = {
    totalSubmissions: submissions.length,
    gradedSubmissions: submissions.filter(s => s.grade !== undefined).length,
    averageGrade: submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length 
      : 0,
    totalAssignments: assignments.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grade Export</h3>
          <p className="text-sm text-gray-600">
            Export grades and feedback to PDF reports or Excel spreadsheets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{exportStats.totalSubmissions} submissions</Badge>
          {course && <Badge variant="secondary">{course.name}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    exportOptions.format === 'pdf' 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateOption('format', 'pdf')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <h4 className="font-medium">PDF Report</h4>
                      <p className="text-sm text-gray-600">
                        Formatted grade reports with detailed feedback
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all",
                    exportOptions.format === 'excel' 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => updateOption('format', 'excel')}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-medium">Excel Spreadsheet</h4>
                      <p className="text-sm text-gray-600">
                        Gradebook data for analysis and import
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Content Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-comments">Include Comments</Label>
                    <Switch
                      id="include-comments"
                      checked={exportOptions.includeComments}
                      onCheckedChange={(checked) => updateOption('includeComments', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-rubric">Include Rubric Details</Label>
                    <Switch
                      id="include-rubric"
                      checked={exportOptions.includeRubricDetails}
                      onCheckedChange={(checked) => updateOption('includeRubricDetails', checked)}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-student">Include Student Info</Label>
                    <Switch
                      id="include-student"
                      checked={exportOptions.includeStudentInfo}
                      onCheckedChange={(checked) => updateOption('includeStudentInfo', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-stats">Include Statistics</Label>
                    <Switch
                      id="include-stats"
                      checked={exportOptions.includeStatistics}
                      onCheckedChange={(checked) => updateOption('includeStatistics', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Table className="h-4 w-4" />
                Organization & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group-by">Group By</Label>
                  <Select
                    value={exportOptions.groupBy}
                    onValueChange={(value) => updateOption('groupBy', value as ExportOptions['groupBy'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          By Student
                        </div>
                      </SelectItem>
                      <SelectItem value="assignment">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          By Assignment
                        </div>
                      </SelectItem>
                      <SelectItem value="date">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          By Date
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Select
                    value={exportOptions.dateRange}
                    onValueChange={(value) => updateOption('dateRange', value as ExportOptions['dateRange'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="semester">Current Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Preview & Statistics */}
        <div className="space-y-6">
          {/* Export Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Export Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {exportStats.totalSubmissions}
                  </div>
                  <div className="text-xs text-gray-600">Total Submissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {exportStats.gradedSubmissions}
                  </div>
                  <div className="text-xs text-gray-600">Graded</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {exportStats.averageGrade.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">Average Grade</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {exportStats.totalAssignments}
                  </div>
                  <div className="text-xs text-gray-600">Assignments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <Badge variant="outline">
                    {exportOptions.format.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium">
                    {exportOptions.groupBy.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium">
                    {exportOptions.dateRange === 'all' ? 'All time' : `Past ${exportOptions.dateRange}`}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="text-sm">
                <p className="font-medium mb-2">Included Content:</p>
                <div className="space-y-1">
                  {exportOptions.includeStudentInfo && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Student Information
                    </div>
                  )}
                  {exportOptions.includeComments && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Comments & Feedback
                    </div>
                  )}
                  {exportOptions.includeRubricDetails && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Rubric Details
                    </div>
                  )}
                  {exportOptions.includeStatistics && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      Grade Statistics
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || exportStats.totalSubmissions === 0}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting 
              ? 'Generating Export...' 
              : `Export ${exportOptions.format.toUpperCase()}`
            }
          </Button>

          {exportStats.totalSubmissions === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No submissions available for export
            </p>
          )}
        </div>
      </div>

      {/* Export Templates (for future use) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Export Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExportOptions({
                  format: 'pdf',
                  includeComments: true,
                  includeRubricDetails: true,
                  includeStudentInfo: true,
                  includeStatistics: false,
                  groupBy: 'student',
                  dateRange: 'all'
                })
              }}
            >
              Student Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExportOptions({
                  format: 'excel',
                  includeComments: false,
                  includeRubricDetails: false,
                  includeStudentInfo: true,
                  includeStatistics: true,
                  groupBy: 'assignment',
                  dateRange: 'all'
                })
              }}
            >
              Gradebook Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExportOptions({
                  format: 'pdf',
                  includeComments: false,
                  includeRubricDetails: false,
                  includeStudentInfo: false,
                  includeStatistics: true,
                  groupBy: 'assignment',
                  dateRange: 'semester'
                })
              }}
            >
              Analytics Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}