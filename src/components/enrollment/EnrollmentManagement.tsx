'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  UserPlus, 
  Upload, 
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Mail,
  Calendar,
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Course, User, EnrollmentDetail } from '@/types'

const bulkEnrollmentSchema = z.object({
  student_emails: z.string().min(1, 'Please enter at least one email address'),
  enrollment_method: z.enum(['manual', 'invite']),
  send_notification: z.boolean(),
  status: z.enum(['active', 'pending'])
})

type BulkEnrollmentData = z.infer<typeof bulkEnrollmentSchema>

interface EnrollmentStats {
  total: number
  active: number
  pending: number
  dropped: number
  waitlisted: number
}

interface EnrollmentManagementProps {
  course: Course
  enrollments: EnrollmentDetail[]
  availableStudents: User[]
  onBulkEnroll?: (data: BulkEnrollmentData & { student_ids: number[] }) => Promise<void>
  onUpdateEnrollment?: (enrollmentId: number, status: string) => Promise<void>
  onRemoveEnrollment?: (enrollmentId: number) => Promise<void>
  onExportEnrollments?: () => Promise<void>
  isLoading?: boolean
}

export default function EnrollmentManagement({
  course,
  enrollments,
  availableStudents,
  onBulkEnroll,
  onUpdateEnrollment,
  onRemoveEnrollment,
  onExportEnrollments,
  isLoading = false
}: EnrollmentManagementProps) {
  const [selectedEnrollments, setSelectedEnrollments] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<BulkEnrollmentData>({
    resolver: zodResolver(bulkEnrollmentSchema),
    defaultValues: {
      student_emails: '',
      enrollment_method: 'manual',
      send_notification: true,
      status: 'active'
    }
  })

  // Calculate enrollment statistics
  const enrollmentStats: EnrollmentStats = useMemo(() => {
    return enrollments.reduce((stats, enrollment) => {
      stats.total++
      switch (enrollment.status) {
        case 'active':
          stats.active++
          break
        case 'pending':
          stats.pending++
          break
        case 'dropped':
          stats.dropped++
          break
        default:
          break
      }
      return stats
    }, { total: 0, active: 0, pending: 0, dropped: 0, waitlisted: 0 })
  }, [enrollments])

  // Filter enrollments based on search and status
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      const matchesSearch = !searchQuery || 
        enrollment.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.student_email?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [enrollments, searchQuery, statusFilter])

  // Parse email addresses from textarea
  const parseEmailAddresses = (emailText: string): string[] => {
    return emailText
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)
  }

  // Validate email addresses
  const validateEmails = (emails: string[]): { valid: string[], invalid: string[] } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const valid: string[] = []
    const invalid: string[] = []
    
    emails.forEach(email => {
      if (emailRegex.test(email)) {
        valid.push(email)
      } else {
        invalid.push(email)
      }
    })
    
    return { valid, invalid }
  }

  // Handle bulk enrollment
  const handleBulkEnrollment = async (data: BulkEnrollmentData) => {
    const emails = parseEmailAddresses(data.student_emails)
    const { valid, invalid } = validateEmails(emails)
    
    if (invalid.length > 0) {
      toast.error(`Invalid email addresses: ${invalid.join(', ')}`)
      return
    }
    
    if (valid.length === 0) {
      toast.error('Please enter at least one valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      // Find student IDs from email addresses
      const studentIds = availableStudents
        .filter(student => valid.includes(student.email))
        .map(student => student.id)
      
      const notFoundEmails = valid.filter(email => 
        !availableStudents.some(student => student.email === email)
      )
      
      if (notFoundEmails.length > 0) {
        toast.warning(`Students not found: ${notFoundEmails.join(', ')}`)
      }
      
      if (studentIds.length === 0) {
        toast.error('No valid students found for enrollment')
        return
      }

      if (onBulkEnroll) {
        await onBulkEnroll({ ...data, student_ids: studentIds })
        toast.success(`Successfully enrolled ${studentIds.length} student(s)`)
        reset()
      }
    } catch (error) {
      console.error('Error in bulk enrollment:', error)
      toast.error('Failed to enroll students. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle individual enrollment status update
  const handleStatusUpdate = async (enrollmentId: number, newStatus: string) => {
    try {
      if (onUpdateEnrollment) {
        await onUpdateEnrollment(enrollmentId, newStatus)
        toast.success('Enrollment status updated')
      }
    } catch (error) {
      console.error('Error updating enrollment:', error)
      toast.error('Failed to update enrollment status')
    }
  }

  // Handle enrollment removal
  const handleRemoval = async (enrollmentId: number) => {
    try {
      if (onRemoveEnrollment) {
        await onRemoveEnrollment(enrollmentId)
        toast.success('Student removed from course')
      }
    } catch (error) {
      console.error('Error removing enrollment:', error)
      toast.error('Failed to remove student')
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: 'approve' | 'reject' | 'remove') => {
    if (selectedEnrollments.length === 0) {
      toast.error('Please select at least one enrollment')
      return
    }

    try {
      const promises = selectedEnrollments.map(id => {
        switch (action) {
          case 'approve':
            return onUpdateEnrollment?.(id, 'active')
          case 'reject':
            return onUpdateEnrollment?.(id, 'dropped')
          case 'remove':
            return onRemoveEnrollment?.(id)
          default:
            return Promise.resolve()
        }
      })
      
      await Promise.all(promises)
      setSelectedEnrollments([])
      toast.success(`Bulk ${action} completed`)
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error)
      toast.error(`Failed to ${action} selected enrollments`)
    }
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'dropped':
        return <Badge className="bg-red-100 text-red-800">Dropped</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enrollment Management</h3>
          <p className="text-sm text-gray-600">
            Manage student enrollments for {course.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onExportEnrollments && (
            <Button variant="outline" size="sm" onClick={onExportEnrollments}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{enrollmentStats.total}</div>
              <div className="text-xs text-gray-600">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{enrollmentStats.active}</div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{enrollmentStats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{enrollmentStats.dropped}</div>
              <div className="text-xs text-gray-600">Dropped</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollments" className="w-full">
        <TabsList>
          <TabsTrigger value="enrollments">Manage Enrollments</TabsTrigger>
          <TabsTrigger value="bulk-enroll">Bulk Enroll</TabsTrigger>
        </TabsList>

        {/* Manage Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedEnrollments.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedEnrollments.length} student(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction('reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBulkAction('remove')}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrollments Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedEnrollments.length === filteredEnrollments.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEnrollments(filteredEnrollments.map(e => e.id))
                          } else {
                            setSelectedEnrollments([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEnrollments.includes(enrollment.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEnrollments([...selectedEnrollments, enrollment.id])
                            } else {
                              setSelectedEnrollments(selectedEnrollments.filter(id => id !== enrollment.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{enrollment.student_name}</div>
                          <div className="text-sm text-gray-500">{enrollment.student_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(enrollment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(enrollment.enrollment_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {enrollment.status === 'pending' ? 'Code' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {enrollment.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(enrollment.id, 'active')}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(enrollment.id, 'dropped')}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoval(enrollment.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredEnrollments.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
                  <p className="text-gray-500">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'No students are enrolled in this course yet'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Enroll Tab */}
        <TabsContent value="bulk-enroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Bulk Student Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleBulkEnrollment)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student_emails">
                    Student Email Addresses *
                  </Label>
                  <textarea
                    id="student_emails"
                    {...control.register('student_emails')}
                    className="w-full p-3 border rounded-md min-h-[120px] text-sm font-mono"
                    placeholder="Enter email addresses separated by commas or new lines:&#10;student1@example.com&#10;student2@example.com&#10;student3@example.com"
                  />
                  {errors.student_emails && (
                    <p className="text-sm text-red-600">{errors.student_emails.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    You can paste email addresses separated by commas, semicolons, or line breaks
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enrollment_method">Enrollment Method</Label>
                    <Select
                      {...control.register('enrollment_method')}
                      onValueChange={(value) => setValue('enrollment_method', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Direct Enrollment</SelectItem>
                        <SelectItem value="invite">Send Invitation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      {...control.register('status')}
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send_notification"
                    {...control.register('send_notification')}
                  />
                  <Label htmlFor="send_notification" className="text-sm">
                    Send enrollment notification emails
                  </Label>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Enrolling Students...' : 'Enroll Students'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3 text-sm">
                <h4 className="font-medium">Enrollment Instructions:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                    <strong>Direct Enrollment:</strong> Students are immediately enrolled and can access the course
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                    <strong>Send Invitation:</strong> Students receive an email invitation to join the course
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                    <strong>Pending Status:</strong> Enrollments require your approval before students can access content
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                    Only existing users in the system can be enrolled via email
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}