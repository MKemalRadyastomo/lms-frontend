
'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, FileText, Upload, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { AssignmentFilters as IAssignmentFilters, Course } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface AssignmentFiltersProps {
  filters: IAssignmentFilters
  onFiltersChange: (filters: IAssignmentFilters) => void
  courses: Course[]
  userRole?: number
}

export function AssignmentFilters({
  filters,
  onFiltersChange,
  courses,
  userRole
}: AssignmentFiltersProps) {
  const [dueDateFrom, setDueDateFrom] = useState<Date>()
  const [dueDateTo, setDueDateTo] = useState<Date>()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleCourseChange = (value: string) => {
    onFiltersChange({
      ...filters,
      course_id: value === 'all' ? undefined : parseInt(value)
    })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : value as 'essay' | 'file_upload' | 'quiz'
    })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value as 'pending' | 'submitted' | 'graded' | 'overdue'
    })
  }

  const handleDueDateFromChange = (date: Date | undefined) => {
    setDueDateFrom(date)
    onFiltersChange({
      ...filters,
      due_date_from: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleDueDateToChange = (date: Date | undefined) => {
    setDueDateTo(date)
    onFiltersChange({
      ...filters,
      due_date_to: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleClearFilters = () => {
    setDueDateFrom(undefined)
    setDueDateTo(undefined)
    onFiltersChange({})
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari tugas..."
            className="pl-8"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="course-filter" className="text-sm">Mata Kuliah</Label>
            <Select
              value={filters.course_id?.toString() || 'all'}
              onValueChange={handleCourseChange}
            >
              <SelectTrigger id="course-filter">
                <SelectValue placeholder="Pilih Mata Kuliah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type-filter" className="text-sm">Tipe Tugas</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Pilih Tipe Tugas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="essay">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Esai
                  </div>
                </SelectItem>
                <SelectItem value="file_upload">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Unggah Berkas
                  </div>
                </SelectItem>
                <SelectItem value="quiz">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" /> Kuis
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userRole === 3 && (
            <div>
              <Label htmlFor="status-filter" className="text-sm">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Belum Dikerjakan</SelectItem>
                  <SelectItem value="submitted">Sudah Dikumpulkan</SelectItem>
                  <SelectItem value="graded">Sudah Dinilai</SelectItem>
                  <SelectItem value="overdue">Terlambat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="due-date-from" className="text-sm">Batas Waktu Dari</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "w-full justify-start text-left font-normal " +
                    (!dueDateFrom && "text-muted-foreground")
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDateFrom ? format(dueDateFrom, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dueDateFrom}
                  onSelect={handleDueDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="due-date-to" className="text-sm">Batas Waktu Hingga</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "w-full justify-start text-left font-normal " +
                    (!dueDateTo && "text-muted-foreground")
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDateTo ? format(dueDateTo, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dueDateTo}
                  onSelect={handleDueDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={handleClearFilters} className="w-full">
              Bersihkan Filter
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
