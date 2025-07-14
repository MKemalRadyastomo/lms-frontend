// User and Authentication Types
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  date_of_birth?: string
  role_id: number
  created_at: string
  updated_at: string
  last_login_at?: string
  email_verified_at?: string
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
  name: string // Backend uses 'name' not 'title'
  description?: string
  privacy: 'private' | 'public'
  code: string // Auto-generated 6-character code
  teacher_id: number
  teacher_name?: string // From JOIN with users table
  created_at: string
}

export interface CourseDetail extends Course {
  // Additional details for course detail view
  content_count?: number
  enrollment_count?: number
}

export interface CourseCreateData {
  name: string
  description?: string
  privacy?: 'private' | 'public'
  teacher_id: number
}

// Content Types
export interface Content {
  id: number
  course_id: number
  title: string
  type: 'lecture' | 'quiz' | 'assignment' | 'material' // This is content_type
  content_url?: string
  text_content?: string
  order: number
  created_at: string
  updated_at: string
  // Add a union type for details based on the 'type'
  details?: CourseMaterial | Assignment // Or other content types as needed
}

// Assignment Types
export interface Assignment {
  id: number
  course_id: number
  course_content_id?: number
  title: string
  description?: string
  type: 'essay' | 'file_upload' | 'quiz'
  due_date: string
  max_score: number
  quiz_questions_json?: QuizQuestion[]
  allowed_file_types?: string
  max_file_size_mb?: number
  created_at: string
  updated_at: string
}

export interface AssignmentDetail extends Assignment {
  course_name?: string
  course_code?: string
  teacher_name?: string
  submission?: Submission
}

export interface AssignmentCreateData {
  title: string
  description?: string
  type: 'essay' | 'file_upload' | 'quiz'
  due_date: string
  max_score: number
  quiz_questions_json?: QuizQuestion[]
  allowed_file_types?: string
  max_file_size_mb?: number
}

export interface QuizQuestion {
  id: number
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_in_blank'
  question: string
  options?: string[]
  correct_answer?: string | string[]
  points: number
  explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
  tags?: string[]
}

// Submission Types
export interface Submission {
  id: number
  assignment_id: number
  student_id: number
  submission_text?: string
  file_path?: string
  quiz_answers_json?: QuizAnswer[]
  grade?: number
  feedback?: string
  status: 'draft' | 'submitted' | 'graded'
  plagiarism_score?: number
  submitted_at: string
  created_at: string
  updated_at: string
  graded_by?: number
}

export interface SubmissionDetail extends Submission {
  assignment?: Assignment
  student_name?: string
  student_email?: string
}

export interface EssaySubmissionData {
  answer_text: string
  draft?: boolean
}

export interface FileSubmissionData {
  submitted_file: File
  draft?: boolean
}

export interface QuizSubmissionData {
  answers: QuizAnswer[]
  draft?: boolean
}

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
  type?: 'essay' | 'file_upload' | 'quiz'
  status?: 'pending' | 'submitted' | 'graded' | 'overdue'
  due_date_before?: string
  due_date_after?: string
  search?: string
}

export interface SubmissionFilters {
  assignment_id?: number
  student_id?: number
  status?: 'draft' | 'submitted' | 'graded'
  grade_min?: number
  grade_max?: number
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

export interface CourseStatistics {
  courseId: number;
  studentCount: number;
  completedAssignments: number;
  averageGrade: number;
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

// Enrollment Types
export interface Enrollment {
  id: number
  course_id: number
  user_id: number
  enrollment_date: string
  status: 'active' | 'inactive' | 'pending' | 'dropped'
  created_at: string
  updated_at?: string
}

export interface EnrollmentDetail extends Enrollment {
  course?: Course
  student?: User
  student_name?: string
  student_email?: string
}

export interface EnrollmentCreateData {
  course_id: number
  user_id: number
  status?: 'active' | 'inactive' | 'pending'
}

export interface EnrollmentFilters {
  course_id?: number
  user_id?: number
  status?: 'active' | 'inactive' | 'pending' | 'dropped'
  search?: string
  page?: number
  limit?: number
}

// Course Material Types
export interface CourseMaterial {
  id: number
  course_id: number
  title: string
  description?: string
  content?: string
  file_path?: string
  video_url?: string
  publish_date?: string
  created_at: string
  updated_at?: string
}

export interface CourseMaterialCreateData {
  title: string
  description?: string
  content?: string
  video_url?: string
  publish_date?: string
  file?: File | null
}

// Course Settings Types
export interface CourseSettings {
  id: number
  course_id: number
  auto_enrollment: boolean
  max_students?: number
  allow_late_submission: boolean
  require_approval: boolean
  email_notifications: boolean
  discussion_enabled: boolean
  created_at: string
  updated_at?: string
}

// Grading and Rubric Types
export interface GradingRubric {
  id: number
  assignment_id: number
  title: string
  description?: string
  criteria: RubricCriteria[]
  total_points: number
  created_at: string
  updated_at?: string
}

export interface RubricCriteria {
  id: number
  name: string
  description: string
  weight: number // percentage of total grade
  levels: RubricLevel[]
}

export interface RubricLevel {
  id: number
  name: string
  description: string
  points: number
  quality: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor'
}

export interface GradeEntry {
  criteria_id: number
  level_id: number
  points: number
  comments?: string
}

export interface SubmissionGrade {
  id: number
  submission_id: number
  grader_id: number
  rubric_id?: number
  grade_entries: GradeEntry[]
  total_points: number
  percentage: number
  overall_feedback?: string
  graded_at: string
}

export interface GradingSession {
  submission: SubmissionDetail
  rubric?: GradingRubric
  existing_grade?: SubmissionGrade
  assignment: AssignmentDetail
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
