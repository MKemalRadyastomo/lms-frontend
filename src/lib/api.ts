import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Role, 
  Course, 
  CourseDetail, 
  Category, 
  Content, 
  Assignment, 
  AssignmentDetail, 
  Submission,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  CourseFilters,
  UserFilters,
  AssignmentFilters
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth token and redirect to login
          Cookies.remove('auth_token')
          Cookies.remove('user_id')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await this.client.post<User>('/auth/register', userData)
    return response.data
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout')
  }

  // User Methods
  async getUsers(filters: UserFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<PaginatedResponse<User>>('/users', { params: filters })
    return response.data
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.client.get<any>(`/users/${id}`)
    
    // Map backend response to frontend User type
    const backendUser = response.data
    const mappedUser: User = {
      id: backendUser.id,
      username: backendUser.email, // Use email as username
      email: backendUser.email,
      first_name: backendUser.name?.split(' ')[0] || '', // Split name into first/last
      last_name: backendUser.name?.split(' ').slice(1).join(' ') || '',
      role_id: this.mapRoleToId(backendUser.role), // Convert role string to ID
      created_at: backendUser.created_at,
      updated_at: backendUser.created_at, // Backend doesn't have updated_at
      profile_picture_url: backendUser.profile_image
    }
    
    return mappedUser
  }

  // Helper method to map role strings to IDs
  private mapRoleToId(role: string): number {
    const roleMap: { [key: string]: number } = {
      'student': 1,
      'instructor': 2,
      'guru': 2, // guru is same as instructor
      'admin': 3
    }
    return roleMap[role?.toLowerCase()] || 1
  }

  async createUser(userData: RegisterData): Promise<User> {
    const response = await this.client.post<User>('/users', userData)
    return response.data
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/users/${id}`, userData)
    return response.data
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}`)
  }

  async uploadProfilePicture(userId: number, file: File): Promise<{ profile_picture_url: string }> {
    const formData = new FormData()
    formData.append('profile_picture', file)
    const response = await this.client.post<{ profile_picture_url: string }>(
      `/users/${userId}/profile-picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  // Role Methods
  async getRoles(): Promise<Role[]> {
    const response = await this.client.get<Role[]>('/roles')
    return response.data
  }

  async getRoleById(id: number): Promise<Role> {
    const response = await this.client.get<Role>(`/roles/${id}`)
    return response.data
  }

  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    const response = await this.client.post<Role>('/roles', roleData)
    return response.data
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
    const response = await this.client.put<Role>(`/roles/${id}`, roleData)
    return response.data
  }

  async deleteRole(id: number): Promise<void> {
    await this.client.delete(`/roles/${id}`)
  }

  async assignRole(userId: number, roleId: number): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{ success: boolean; message: string }>('/roles/assign', {
      user_id: userId,
      role_id: roleId,
    })
    return response.data
  }

  // Category Methods
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/categories')
    return response.data
  }

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const response = await this.client.post<Category>('/categories', categoryData)
    return response.data
  }

  // Course Methods
  async getCourses(filters: CourseFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Course>> {
    const response = await this.client.get<PaginatedResponse<Course>>('/courses', { params: filters })
    return response.data
  }

  async getCourseById(id: number): Promise<CourseDetail> {
    const response = await this.client.get<CourseDetail>(`/courses/${id}`)
    return response.data
  }

  async createCourse(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    const response = await this.client.post<Course>('/courses', courseData)
    return response.data
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    const response = await this.client.put<Course>(`/courses/${id}`, courseData)
    return response.data
  }

  async deleteCourse(id: number): Promise<void> {
    await this.client.delete(`/courses/${id}`)
  }

  // Course Content Methods
  async getCourseContent(courseId: number): Promise<Content[]> {
    const response = await this.client.get<Content[]>(`/courses/${courseId}/content`)
    return response.data
  }

  async addCourseContent(courseId: number, contentData: Omit<Content, 'id' | 'course_id' | 'created_at' | 'updated_at'>): Promise<Content> {
    const response = await this.client.post<Content>(`/courses/${courseId}/content`, contentData)
    return response.data
  }

  async updateContent(id: number, contentData: Partial<Content>): Promise<Content> {
    const response = await this.client.put<Content>(`/content/${id}`, contentData)
    return response.data
  }

  async deleteContent(id: number): Promise<void> {
    await this.client.delete(`/content/${id}`)
  }

  // Assignment Methods
  async getAssignments(filters: AssignmentFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Assignment>> {
    const response = await this.client.get<PaginatedResponse<Assignment>>('/assignments', { params: filters })
    return response.data
  }

  async getAssignmentById(id: number): Promise<AssignmentDetail> {
    const response = await this.client.get<AssignmentDetail>(`/assignments/${id}`)
    return response.data
  }

  async createAssignment(assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
    const response = await this.client.post<Assignment>('/assignments', assignmentData)
    return response.data
  }

  async updateAssignment(id: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response = await this.client.put<Assignment>(`/assignments/${id}`, assignmentData)
    return response.data
  }

  async deleteAssignment(id: number): Promise<void> {
    await this.client.delete(`/assignments/${id}`)
  }

  // Submission Methods
  async submitEssay(assignmentId: number, answerText: string, isDraft: boolean = false): Promise<Submission> {
    const response = await this.client.post<Submission>(`/assignments/${assignmentId}/submit/essay`, {
      answer_text: answerText,
      draft: isDraft,
    })
    return response.data
  }

  async submitFile(assignmentId: number, file: File, isDraft: boolean = false): Promise<Submission> {
    const formData = new FormData()
    formData.append('submitted_file', file)
    formData.append('draft', isDraft.toString())
    const response = await this.client.post<Submission>(
      `/assignments/${assignmentId}/submit/file`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  async submitQuiz(assignmentId: number, answers: { question_id: number; answer: string }[], isDraft: boolean = false): Promise<Submission> {
    const response = await this.client.post<Submission>(`/assignments/${assignmentId}/submit/quiz`, {
      answers,
      draft: isDraft,
    })
    return response.data
  }

  async getSubmission(id: number): Promise<Submission> {
    const response = await this.client.get<Submission>(`/submissions/${id}`)
    return response.data
  }

  async updateSubmission(id: number, submissionData: Partial<Submission>): Promise<Submission> {
    const response = await this.client.put<Submission>(`/submissions/${id}`, submissionData)
    return response.data
  }

  async getAssignmentSubmissions(assignmentId: number): Promise<PaginatedResponse<Submission>> {
    const response = await this.client.get<PaginatedResponse<Submission>>(`/assignments/${assignmentId}/submissions`)
    return response.data
  }

  // Utility Methods
  async getApiVersion(): Promise<{ version: string; release_date: string; deprecated: boolean; sunset_date?: string }> {
    const response = await this.client.get('/api-version')
    return response.data
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()
export default apiClient
