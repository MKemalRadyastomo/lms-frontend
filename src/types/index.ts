// User and Authentication Types
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  role_id: number
  created_at: string
  updated_at: string
  profile_picture_url?: string
}

export interface Role {
  id: number
  name: string
  description?: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role_id: number
}

export interface AuthResponse {
  token: string
  user_id: number
}

// Course and Category Types
export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: number
  title: string
  description?: string
  category_id: number
  instructor_id: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface CourseDetail extends Course {
  category: Category
  instructor: User
  content_count: number
  enrollment_count: number
}

// Content Types
export interface Content {
  id: number
  course_id: number
  title: string
  type: 'lecture' | 'quiz' | 'assignment' | 'material'
  content_url?: string
  text_content?: string
  order: number
  created_at: string
  updated_at: string
}

// Assignment Types
export interface Assignment {
  id: number
  course_id: number
  title: string
  description?: string
  type: 'essay' | 'file_upload' | 'quiz'
  due_date: string
  max_score?: number
  created_at: string
  updated_at: string
}

export interface AssignmentDetail extends Assignment {
  content: AssignmentContent
}

export type AssignmentContent = 
  | { essay_prompt: string }
  | { 
      allowed_file_types: string[]
      max_file_size_mb: number 
    }
  | { questions: QuizQuestion[] }

export interface QuizQuestion {
  id: number
  question_text: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correct_answer?: string
}

// Submission Types
export interface Submission {
  id: number
  assignment_id: number
  student_id: number
  submission_time: string
  status: 'draft' | 'submitted' | 'graded' | 'late'
  grade?: number
  feedback?: string
  submission_content: SubmissionContent
  plagiarism_score?: number
  created_at: string
  updated_at: string
}

export type SubmissionContent = 
  | { answer_text: string }
  | { file_url: string }
  | { quiz_answers: QuizAnswer[] }

export interface QuizAnswer {
  question_id: number
  answer: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total_items: number
    total_pages: number
    current_page: number
    page_size: number
  }
}

export interface ApiError {
  code: string
  message: string
}

// Form Types
export interface CourseFilters {
  category_id?: number
  instructor_id?: number
  search?: string
  sort?: 'title' | 'created_at' | 'popularity'
  order?: 'asc' | 'desc'
}

export interface UserFilters {
  role?: string
  search?: string
  sort?: 'username' | 'email' | 'created_at'
  order?: 'asc' | 'desc'
}

export interface AssignmentFilters {
  course_id?: number
  status?: 'pending' | 'submitted' | 'graded'
  due_date_before?: string
  due_date_after?: string
}

// UI State Types
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface FormState<T> extends LoadingState {
  data?: T
  isDirty: boolean
}

// File Upload Types
export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

// Dashboard Types
export interface DashboardStats {
  totalCourses: number
  totalStudents: number
  totalAssignments: number
  completionRate: number
}

export interface StudentDashboard {
  enrolledCourses: Course[]
  pendingAssignments: Assignment[]
  recentGrades: Submission[]
  progressStats: {
    coursesCompleted: number
    averageGrade: number
    assignmentsSubmitted: number
  }
}

export interface InstructorDashboard {
  createdCourses: Course[]
  pendingGrades: Submission[]
  studentCount: number
  courseStats: {
    totalEnrollments: number
    averageRating: number
    activeStudents: number
  }
}

// Navigation Types
export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType
  badge?: string | number
  children?: NavItem[]
}

export interface BreadcrumbItem {
  title: string
  href?: string
}
