'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileBarChart,
  Settings,
  Calendar,
  Users,
  Calculator,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface GradeData {
  studentId: number
  studentName: string
  assignmentTitle: string
  grade: number
  maxPoints: number
  percentage: number
  submittedAt: string
  gradedAt?: string
  feedback?: string
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  includeFields: string[]
  groupBy?: 'student' | 'assignment' | 'date'
  includeStats: boolean
  dateRange?: {
    start: string
    end: string
  }
}

interface GradeExporterProps {
  assignmentId?: number
  courseId?: number
  grades: GradeData[]
  onExport?: (options: ExportOptions) => Promise<void>
  isExporting?: boolean
}

export default function GradeExporter({
  assignmentId,
  courseId,
  grades = [],
  onExport,
  isExporting = false
}: GradeExporterProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv')
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'studentName',
    'grade',
    'percentage',
    'submittedAt'
  ])
  const [includeStats, setIncludeStats] = useState(true)
  const [groupBy, setGroupBy] = useState<'student' | 'assignment' | 'date'>('student')

  const availableFields = [
    { id: 'studentName', label: 'Student Name', icon: Users },
    { id: 'assignmentTitle', label: 'Assignment Title', icon: FileText },
    { id: 'grade', label: 'Grade (Points)', icon: Calculator },
    { id: 'maxPoints', label: 'Max Points', icon: Calculator },
    { id: 'percentage', label: 'Percentage', icon: TrendingUp },
    { id: 'submittedAt', label: 'Submitted Date', icon: Calendar },
    { id: 'gradedAt', label: 'Graded Date', icon: Calendar },
    { id: 'feedback', label: 'Feedback', icon: FileText }
  ]

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const handleExport = async () => {
    const exportOptions: ExportOptions = {
      format: exportFormat,
      includeFields: selectedFields,
      groupBy,
      includeStats,
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }

    try {
      if (onExport) {
        await onExport(exportOptions)
        toast.success(`Grades exported as ${exportFormat.toUpperCase()}`)
      } else {
        // Default export implementation
        await handleDefaultExport(exportOptions)
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export grades. Please try again.')
    }
  }

  const handleDefaultExport = async (options: ExportOptions) => {
    // Filter grades based on selected fields
    const exportData = grades.map(grade => {
      const row: any = {}
      options.includeFields.forEach(field => {
        switch (field) {
          case 'studentName':
            row['Student Name'] = grade.studentName
            break
          case 'assignmentTitle':
            row['Assignment'] = grade.assignmentTitle
            break
          case 'grade':
            row['Grade'] = grade.grade
            break
          case 'maxPoints':
            row['Max Points'] = grade.maxPoints
            break
          case 'percentage':
            row['Percentage'] = `${grade.percentage}%`
            break
          case 'submittedAt':
            row['Submitted'] = new Date(grade.submittedAt).toLocaleDateString()
            break
          case 'gradedAt':
            row['Graded'] = grade.gradedAt ? new Date(grade.gradedAt).toLocaleDateString() : 'N/A'
            break
          case 'feedback':
            row['Feedback'] = grade.feedback || 'No feedback'
            break
        }
      })
      return row
    })

    if (options.format === 'csv') {
      exportToCsv(exportData)
    } else if (options.format === 'excel') {
      toast.info('Excel export would be implemented with a library like xlsx')
    } else if (options.format === 'pdf') {
      toast.info('PDF export would be implemented with a library like jsPDF')
    }
  }

  const exportToCsv = (data: any[]) => {
    if (data.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `grades-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculateStats = () => {
    if (grades.length === 0) return null

    const scores = grades.map(g => g.percentage)
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const passed = scores.filter(score => score >= 70).length

    return {
      average: Math.round(average * 10) / 10,
      highest,
      lowest,
      passRate: Math.round((passed / scores.length) * 100 * 10) / 10,
      totalStudents: grades.length
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Grade Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="options" className="space-y-4">
            <TabsList>
              <TabsTrigger value="options">Export Options</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="options" className="space-y-4">
              {/* Export Format Selection */}
              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === 'excel' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('excel')}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                    onClick={() => setExportFormat('pdf')}
                    className="flex items-center gap-2"
                  >
                    <FileBarChart className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>

              {/* Field Selection */}
              <div className="space-y-2">
                <Label>Include Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFields.map(field => {
                    const Icon = field.icon
                    return (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label htmlFor={field.id} className="flex items-center gap-2 text-sm">
                          <Icon className="h-3 w-3" />
                          {field.label}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-stats"
                    checked={includeStats}
                    onCheckedChange={(checked) => setIncludeStats(checked === true)}
                  />
                  <Label htmlFor="include-stats">Include statistics summary</Label>
                </div>
              </div>

              {/* Export Button */}
              <div className="pt-4">
                <Button
                  onClick={handleExport}
                  disabled={selectedFields.length === 0 || isExporting}
                  className="w-full flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Settings className="h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export {grades.length} Records as {exportFormat.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Export Preview</h4>
                {grades.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-600">
                      {selectedFields.slice(0, 4).map(field => (
                        <div key={field}>
                          {availableFields.find(f => f.id === field)?.label}
                        </div>
                      ))}
                    </div>
                    {grades.slice(0, 3).map((grade, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 text-sm">
                        {selectedFields.slice(0, 4).map(field => (
                          <div key={field}>
                            {field === 'studentName' && grade.studentName}
                            {field === 'grade' && grade.grade}
                            {field === 'percentage' && `${grade.percentage}%`}
                            {field === 'submittedAt' && new Date(grade.submittedAt).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    ))}
                    {grades.length > 3 && (
                      <div className="text-sm text-gray-500 text-center pt-2">
                        ... and {grades.length - 3} more records
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No grade data available</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.average}%</div>
                      <div className="text-sm text-gray-600">Average</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.highest}%</div>
                      <div className="text-sm text-gray-600">Highest</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-red-600">{stats.lowest}%</div>
                      <div className="text-sm text-gray-600">Lowest</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.passRate}%</div>
                      <div className="text-sm text-gray-600">Pass Rate</div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-gray-500 text-center">No statistics available</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}