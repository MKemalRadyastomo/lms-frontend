'use client'

import { useState } from 'react'
import { 
  FileText, 
  Upload, 
  HelpCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  Send,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Assignment } from '@/types'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import { id } from 'date-fns/locale'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { toast } from 'sonner'

interface AssignmentCardProps {
  assignment: Assignment & { course_name?: string; teacher_name?: string }
  userRole?: number
  userId?: number
  showCourse?: boolean
  isOverdue?: boolean
}

export function AssignmentCard({
  assignment,
  userRole,
  userId,
  showCourse = true,
  isOverdue = false
}: AssignmentCardProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteCourseAssignment(assignment.course_id, assignment.id),
    onSuccess: () => {
      toast.success('Tugas berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['allAssignments'] })
      queryClient.invalidateQueries({ queryKey: ['courseAssignments', assignment.course_id] })
    },
    onError: (error) => {
      console.error('Error deleting assignment:', error)
      toast.error('Gagal menghapus tugas. Silakan coba lagi.')
    },
  })

  const handleDeleteAssignment = async () => {
    setIsDeleting(true)
    await deleteMutation.mutateAsync()
    setIsDeleting(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay':
        return <FileText className="h-3 w-3" />
      case 'file_upload':
        return <Upload className="h-3 w-3" />
      case 'quiz':
        return <HelpCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'essay':
        return 'Esai'
      case 'file_upload':
        return 'Unggah Berkas'
      case 'quiz':
        return 'Kuis'
      default:
        return 'Tidak Diketahui'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'essay':
        return 'bg-blue-100 text-blue-800'
      case 'file_upload':
        return 'bg-green-100 text-green-800'
      case 'quiz':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const overdue = assignment.due_date ? isPast(new Date(assignment.due_date)) : false;

  return (
    <Link href={`/assignments/${assignment.id}`} className="h-full flex flex-col">
      <Card className={`transition-all hover:shadow-md ${
        isOverdue || overdue ? 'border-red-200 bg-red-50/30' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getTypeColor(assignment.type)}>
                  {getTypeIcon(assignment.type)}
                  <span className="ml-1">{getTypeName(assignment.type)}</span>
                </Badge>
                
                {overdue && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Terlambat
                  </Badge>
                )}
                
                <Badge variant="outline">
                  {assignment.max_score} poin
                </Badge>
              </div>
              
              <CardTitle className="text-lg">
                {assignment.title}
              </CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                {showCourse && assignment.course_name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {assignment.course_name}
                  </span>
                )}
                
                {assignment.teacher_name && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {assignment.teacher_name}
                  </span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/assignments/${assignment.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                {(userRole === 1 || userRole === 2) && (
                  <DropdownMenuItem asChild>
                    <Link href={`/assignments/${assignment.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Tugas
                    </Link>
                  </DropdownMenuItem>
                )}
                {(userRole === 1 || userRole === 2) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Tugas
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tugas secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAssignment}
                          disabled={isDeleting}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
            {assignment.description}
          </p>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Calendar className="mr-1 h-4 w-4" />
            Batas Waktu: {format(new Date(assignment.due_date), 'dd MMMM yyyy, HH:mm', { locale: id })}
          </div>
        </CardContent>
        <div className="p-4 pt-0 flex justify-end">
          {userRole === 3 && (
            <Button asChild size="sm">
              <Link href={`/assignments/${assignment.id}/submit`}>
                <Send className="mr-2 h-4 w-4" />
                Kirim Tugas
              </Link>
            </Button>
          )}
          {(userRole === 1 || userRole === 2) && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/assignments/${assignment.id}/submissions`}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Pengumpulan
              </Link>
            </Button>
          )}
        </div>
      </Card>
    </Link>
  )
}