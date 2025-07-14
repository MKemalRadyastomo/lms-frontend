'use client'

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileImage, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { 
  StudentAnalytics, 
  InstructorAnalytics, 
  AdminAnalytics,
  UserRole
} from '@/types/analytics'

interface AnalyticsExporterProps {
  data: StudentAnalytics | InstructorAnalytics | AdminAnalytics
  userRole: UserRole
  className?: string
}

type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'png'

export function AnalyticsExporter({ data, userRole, className = '' }: AnalyticsExporterProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null)
  const { t } = useTranslation()

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setExportFormat(format)

    try {
      const filename = `analytics-${userRole}-${new Date().toISOString().split('T')[0]}`
      
      switch (format) {
        case 'pdf':
          await exportToPDF(data, filename, userRole)
          break
        case 'csv':
          await exportToCSV(data, filename, userRole)
          break
        case 'xlsx':
          await exportToExcel(data, filename, userRole)
          break
        case 'png':
          await exportToPNG(filename)
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }

      toast.success(t('analytics_exported_successfully', { format: format.toUpperCase() }))
    } catch (error) {
      console.error('Export failed:', error)
      toast.error(t('export_failed', { error: error instanceof Error ? error.message : 'Unknown error' }))
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  const exportToPDF = async (analytics: any, filename: string, role: UserRole) => {
    // Generate PDF report
    const reportContent = generateReportContent(analytics, role)
    
    // Create a simple PDF using browser print functionality
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Could not open print window')
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report - ${role}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 30px; }
            .metric { display: inline-block; margin: 10px 15px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .metric-label { font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${reportContent}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const exportToCSV = async (analytics: any, filename: string, role: UserRole) => {
    let csvContent = ''
    
    if (role === 'student') {
      const studentData = analytics as StudentAnalytics
      
      // Course Progress CSV
      csvContent += 'Course Analytics\\n'
      csvContent += 'Course,Progress %,Completed Modules,Total Modules,Difficulty,Last Activity\\n'
      studentData.courseProgress.forEach(course => {
        csvContent += `"${course.courseName}",${course.progressPercentage},${course.completedModules},${course.totalModules},"${course.difficulty}","${course.lastActivity}"\\n`
      })
      
      csvContent += '\\nAssignment Statistics\\n'
      csvContent += 'Metric,Value\\n'
      csvContent += `Total Assignments,${studentData.assignmentStats.total}\\n`
      csvContent += `Completed,${studentData.assignmentStats.completed}\\n`
      csvContent += `Pending,${studentData.assignmentStats.pending}\\n`
      csvContent += `Overdue,${studentData.assignmentStats.overdue}\\n`
      csvContent += `Average Grade,${studentData.assignmentStats.averageGrade || 'N/A'}\\n`
      csvContent += `Completion Rate,${studentData.assignmentStats.completionRate}%\\n`
      
    } else if (role === 'instructor') {
      const instructorData = analytics as InstructorAnalytics
      
      csvContent += 'Class Performance\\n'
      csvContent += 'Course,Students,Average Grade,Completion Rate,Engagement Score\\n'
      instructorData.classPerformance.forEach(cls => {
        csvContent += `"${cls.courseName}",${cls.studentCount},${cls.averageGrade},${cls.completionRate},${cls.engagementScore}\\n`
      })
      
    } else if (role === 'admin') {
      const adminData = analytics as AdminAnalytics
      
      csvContent += 'System Statistics\\n'
      csvContent += 'Metric,Value\\n'
      csvContent += `Total Users,${adminData.systemStats.totalUsers}\\n`
      csvContent += `Active Users,${adminData.systemStats.activeUsers}\\n`
      csvContent += `Total Courses,${adminData.systemStats.totalCourses}\\n`
      csvContent += `Total Assignments,${adminData.systemStats.totalAssignments}\\n`
      csvContent += `System Uptime,${adminData.systemStats.systemUptime}%\\n`
    }

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportToExcel = async (analytics: any, filename: string, role: UserRole) => {
    // For now, export as CSV with .xlsx extension
    // In a real implementation, you'd use a library like SheetJS
    await exportToCSV(analytics, filename, role)
    toast.info(t('excel_export_note'))
  }

  const exportToPNG = async (filename: string) => {
    // Capture the analytics dashboard as PNG
    try {
      // Use html2canvas library if available, otherwise provide instructions
      const dashboardElement = document.querySelector('[data-analytics-dashboard]')
      if (!dashboardElement) {
        throw new Error('Analytics dashboard not found')
      }

      // For now, provide instructions since html2canvas isn't installed
      toast.info(t('screenshot_instructions'))
      
    } catch (error) {
      throw new Error('PNG export not available')
    }
  }

  const generateReportContent = (analytics: any, role: UserRole) => {
    const currentDate = new Date().toLocaleDateString()
    let content = `
      <div class="header">
        <h1>Analytics Report</h1>
        <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
        <p><strong>Generated:</strong> ${currentDate}</p>
      </div>
    `

    if (role === 'student') {
      const studentData = analytics as StudentAnalytics
      content += `
        <div class="section">
          <h2>Assignment Statistics</h2>
          <div class="metric">
            <div class="metric-value">${studentData.assignmentStats.total}</div>
            <div class="metric-label">Total Assignments</div>
          </div>
          <div class="metric">
            <div class="metric-value">${studentData.assignmentStats.completed}</div>
            <div class="metric-label">Completed</div>
          </div>
          <div class="metric">
            <div class="metric-value">${studentData.assignmentStats.pending}</div>
            <div class="metric-label">Pending</div>
          </div>
          <div class="metric">
            <div class="metric-value">${studentData.assignmentStats.averageGrade || 'N/A'}</div>
            <div class="metric-label">Average Grade</div>
          </div>
        </div>
        
        <div class="section">
          <h2>Course Progress</h2>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th>Course</th>
                <th>Progress</th>
                <th>Modules</th>
                <th>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              ${studentData.courseProgress.map(course => `
                <tr>
                  <td>${course.courseName}</td>
                  <td>${course.progressPercentage}%</td>
                  <td>${course.completedModules}/${course.totalModules}</td>
                  <td>${course.difficulty}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    } else if (role === 'admin') {
      const adminData = analytics as AdminAnalytics
      content += `
        <div class="section">
          <h2>System Overview</h2>
          <div class="metric">
            <div class="metric-value">${adminData.systemStats.totalUsers}</div>
            <div class="metric-label">Total Users</div>
          </div>
          <div class="metric">
            <div class="metric-value">${adminData.systemStats.activeUsers}</div>
            <div class="metric-label">Active Users</div>
          </div>
          <div class="metric">
            <div class="metric-value">${adminData.systemStats.totalCourses}</div>
            <div class="metric-label">Total Courses</div>
          </div>
          <div class="metric">
            <div class="metric-value">${adminData.systemStats.totalAssignments}</div>
            <div class="metric-label">Total Assignments</div>
          </div>
        </div>
        
        <div class="section">
          <h2>Performance Metrics</h2>
          <div class="metric">
            <div class="metric-value">${adminData.performanceBenchmarks.averageGradeAcrossSystem.toFixed(1)}</div>
            <div class="metric-label">Average Grade</div>
          </div>
          <div class="metric">
            <div class="metric-value">${adminData.performanceBenchmarks.courseCompletionRate.toFixed(1)}%</div>
            <div class="metric-label">Completion Rate</div>
          </div>
          <div class="metric">
            <div class="metric-value">${adminData.performanceBenchmarks.userEngagementRate.toFixed(1)}%</div>
            <div class="metric-label">Engagement Rate</div>
          </div>
          <div class="metric">
            <div class="metric-value">${adminData.performanceBenchmarks.systemResponseTime.toFixed(0)}ms</div>
            <div class="metric-label">Response Time</div>
          </div>
        </div>
      `
    }

    return content
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('exporting')} {exportFormat?.toUpperCase()}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4 mr-2" />
          {t('export_as_pdf')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t('export_as_csv')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t('export_as_excel')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('png')}>
          <FileImage className="h-4 w-4 mr-2" />
          {t('export_as_image')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AnalyticsExporter