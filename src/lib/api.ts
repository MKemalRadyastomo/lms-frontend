import {
  Assignment,
  AssignmentCreateData,
  AssignmentDetail,
  AssignmentFilters,
  AuthResponse,
  Category,
  Content,
  Course,
  CourseCreateData,
  CourseDetail,
  CourseFilters, // Import from @/types
  CourseStatistics,
  LoginCredentials, // Import from @/types
  PaginatedResponse,
  RegisterData,
  Role,
  Submission,
  User,
  UserFilters,
} from "@/types";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = api;

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth token and redirect to login
          Cookies.remove("auth_token");
          Cookies.remove("user_id");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async register(userData: RegisterData): Promise<User> {
    const response = await this.client.post<User>("/auth/register", userData);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post("/auth/logout");
  }

  // User Methods
  async getUsers(
    filters: UserFilters & { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<User>> {
    const response = await this.client.get<any>("/users", { params: filters });

    // Map backend response to frontend format
    const backendData = response.data;
    const mappedUsers: User[] = backendData.data.map((backendUser: any) => ({
      id: backendUser.id,
      username: backendUser.email, // Use email as username for now
      email: backendUser.email,
      first_name: backendUser.name?.split(" ")[0] || "",
      last_name: backendUser.name?.split(" ").slice(1).join(" ") || "",
      role_id: this.mapRoleToId(backendUser.role),
      created_at: backendUser.created_at,
      updated_at: backendUser.created_at || new Date().toISOString(),
      profile_picture_url: backendUser.profile_image,
    }));

    return {
      data: mappedUsers,
      pagination: {
        total_items: backendData.pagination.total,
        total_pages: backendData.pagination.last_page,
        current_page: backendData.pagination.current_page,
        page_size: backendData.pagination.per_page,
      },
    };
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.client.get<any>(`/users/${id}`);

    // Map backend response to frontend User type
    const backendUser = response.data;
    return {
      id: backendUser.id,
      username: backendUser.email, // Use email as username for now
      email: backendUser.email,
      first_name: backendUser.name?.split(" ")[0] || "", // Split name into first/last
      last_name: backendUser.name?.split(" ").slice(1).join(" ") || "",
      role_id: this.mapRoleToId(backendUser.role), // Convert role string to ID
      created_at: backendUser.created_at,
      updated_at: backendUser.created_at || new Date().toISOString(), // Backend doesn't have updated_at
      profile_picture_url: backendUser.profile_image,
    };
  }

  // Helper method to map role strings to IDs
  private mapRoleToId(role: string): number {
    const roleMap: { [key: string]: number } = {
      siswa: 1, // Student in Indonesian
      student: 1, // Legacy support
      guru: 2, // Teacher/Instructor in Indonesian
      instructor: 2, // Legacy support
      admin: 3,
    };
    return roleMap[role?.toLowerCase()] || 1;
  }

  // Helper method to map role IDs to Indonesian strings
  private mapIdToRole(roleId: number): string {
    const roleMap: { [key: number]: string } = {
      1: "siswa", // Student in Indonesian
      2: "guru", // Teacher in Indonesian
      3: "admin",
    };
    return roleMap[roleId] || "siswa";
  }

  async createUser(userData: RegisterData): Promise<User> {
    // Map frontend data to backend format
    const backendUserData = {
      email: userData.email,
      password: userData.password,
      name:
        userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`.trim()
          : userData.username,
      role: this.mapIdToRole(userData.role_id),
    };

    const response = await this.client.post<any>("/users", backendUserData);

    // Map response back to frontend format
    const backendUser = response.data;
    return {
      id: backendUser.id,
      username: backendUser.email,
      email: backendUser.email,
      first_name: backendUser.name?.split(" ")[0] || "",
      last_name: backendUser.name?.split(" ").slice(1).join(" ") || "",
      role_id: this.mapRoleToId(backendUser.role),
      created_at: backendUser.created_at,
      updated_at: backendUser.created_at || new Date().toISOString(),
      profile_picture_url: backendUser.profile_image,
    };
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Map frontend data to backend format
    const backendUserData: any = {};

    if (userData.email) backendUserData.email = userData.email;
    if (userData.first_name || userData.last_name) {
      backendUserData.name = `${userData.first_name || ""} ${
        userData.last_name || ""
      }`.trim();
    }
    if (userData.role_id)
      backendUserData.role = this.mapIdToRole(userData.role_id);
    if ((userData as any).password)
      backendUserData.password = (userData as any).password;

    const response = await this.client.put<any>(
      `/users/${id}`,
      backendUserData
    );

    // Map response back to frontend format
    const backendUser = response.data;
    return {
      id: backendUser.id,
      username: backendUser.email,
      email: backendUser.email,
      first_name: backendUser.name?.split(" ")[0] || "",
      last_name: backendUser.name?.split(" ").slice(1).join(" ") || "",
      role_id: this.mapRoleToId(backendUser.role),
      created_at: backendUser.created_at,
      updated_at: backendUser.created_at || new Date().toISOString(),
      profile_picture_url: backendUser.profile_image,
    };
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.delete(`/users/${id}`);
  }

  async uploadProfilePicture(
    userId: number,
    file: File
  ): Promise<{ profile_picture_url: string }> {
    const formData = new FormData();
    formData.append("profile_picture", file);
    const response = await this.client.post<{ profile_picture_url: string }>(
      `/users/${userId}/profile-picture`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Role Methods
  async getRoles(): Promise<Role[]> {
    const response = await this.client.get<Role[]>("/roles");
    return response.data;
  }

  async getRoleById(id: number): Promise<Role> {
    const response = await this.client.get<Role>(`/roles/${id}`);
    return response.data;
  }

  async createRole(
    roleData: Omit<Role, "id" | "created_at" | "updated_at">
  ): Promise<Role> {
    const response = await this.client.post<Role>("/roles", roleData);
    return response.data;
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<Role> {
    const response = await this.client.put<Role>(`/roles/${id}`, roleData);
    return response.data;
  }

  async deleteRole(id: number): Promise<void> {
    await this.client.delete(`/roles/${id}`);
  }

  async assignRole(
    userId: number,
    roleId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>("/roles/assign", {
      user_id: userId,
      role_id: roleId,
    });
    return response.data;
  }

  // Category Methods
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>("/categories");
    return response.data;
  }

  async createCategory(
    categoryData: Omit<Category, "id" | "created_at" | "updated_at">
  ): Promise<Category> {
    const response = await this.client.post<Category>(
      "/categories",
      categoryData
    );
    return response.data;
  }

  // Course Methods
  async getCourses(
    filters: CourseFilters & { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<Course>> {
    const response = await this.client.get<any>("/courses", {
      params: filters,
    });

    // Map backend response to frontend format
    const backendData = response.data;
    const mappedCourses: Course[] = backendData.data.map(
      (backendCourse: any) => ({
        id: backendCourse.id,
        name: backendCourse.name,
        description: backendCourse.description,
        privacy: backendCourse.privacy,
        code: backendCourse.code,
        teacher_id: backendCourse.teacher_id,
        teacher_name: backendCourse.teacher_name,
        created_at: backendCourse.created_at,
      })
    );

    return {
      data: mappedCourses,
      pagination: {
        total_items: backendData.pagination.total,
        total_pages: backendData.pagination.last_page,
        current_page: backendData.pagination.current_page,
        page_size: backendData.pagination.per_page,
      },
    };
  }

  async getCourseById(id: number): Promise<CourseDetail> {
    const response = await this.client.get<any>(`/courses/${id}`);

    const backendCourse = response.data;
    return {
      id: backendCourse.id,
      name: backendCourse.name,
      description: backendCourse.description,
      privacy: backendCourse.privacy,
      code: backendCourse.code,
      teacher_id: backendCourse.teacher_id,
      teacher_name: backendCourse.teacher_name,
      created_at: backendCourse.created_at,
    };
  }

  async createCourse(courseData: CourseCreateData): Promise<Course> {
    // Map frontend data to backend format
    const backendCourseData = {
      name: courseData.name,
      description: courseData.description,
      privacy: courseData.privacy,
      teacher_id: courseData.teacher_id, // Send as teacher_id to match backend expectation
    };

    const response = await this.client.post<any>("/courses", backendCourseData);

    const backendCourse = response.data;
    return {
      id: backendCourse.id,
      name: backendCourse.name,
      description: backendCourse.description,
      privacy: backendCourse.privacy,
      code: backendCourse.code,
      teacher_id: backendCourse.teacher_id,
      teacher_name: backendCourse.teacher_name,
      created_at: backendCourse.created_at,
    };
  }

  async updateCourse(
    id: number,
    courseData: Partial<CourseCreateData>
  ): Promise<Course> {
    // Map frontend data to backend format
    const backendCourseData: any = {};

    if (courseData.name) backendCourseData.name = courseData.name;
    if (courseData.description !== undefined)
      backendCourseData.description = courseData.description;
    if (courseData.privacy) backendCourseData.privacy = courseData.privacy;
    if (courseData.teacher_id)
      backendCourseData.teacher_id = courseData.teacher_id;

    const response = await this.client.put<any>(
      `/courses/${id}`,
      backendCourseData
    );

    const backendCourse = response.data;
    return {
      id: backendCourse.id,
      name: backendCourse.name,
      description: backendCourse.description,
      privacy: backendCourse.privacy,
      code: backendCourse.code,
      teacher_id: backendCourse.teacher_id,
      teacher_name: backendCourse.teacher_name,
      created_at: backendCourse.created_at,
    };
  }

  async deleteCourse(id: number): Promise<void> {
    await this.client.delete(`/courses/${id}`);
  }

  // Course Content Methods
  async getCourseContent(courseId: number): Promise<Content[]> {
    const response = await this.client.get<Content[]>(
      `/courses/${courseId}/content`
    );
    return response.data;
  }

  async addCourseContent(
    courseId: number,
    contentData: Omit<Content, "id" | "course_id" | "created_at" | "updated_at">
  ): Promise<Content> {
    const response = await this.client.post<Content>(
      `/courses/${courseId}/content`,
      contentData
    );
    return response.data;
  }

  async updateContent(
    id: number,
    contentData: Partial<Content>
  ): Promise<Content> {
    const response = await this.client.put<Content>(
      `/content/${id}`,
      contentData
    );
    return response.data;
  }

  async deleteContent(id: number): Promise<void> {
    await this.client.delete(`/content/${id}`);
  }

  // Assignment Methods
  async getCourseAssignments(
    courseId: number,
    filters: Omit<AssignmentFilters, "course_id"> & {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<PaginatedResponse<Assignment>> {
    const response = await this.client.get<any>(
      `/courses/${courseId}/assignments`,
      { params: filters }
    );

    // Handle the backend response format
    const backendData = response.data;

    // If the response is an array (no pagination), wrap it
    if (Array.isArray(backendData)) {
      return {
        data: backendData,
        pagination: {
          total_items: backendData.length,
          total_pages: 1,
          current_page: 1,
          page_size: backendData.length,
        },
      };
    }

    // If the response has pagination info
    return {
      data: backendData.results || backendData.data,
      pagination: {
        total_items: backendData.totalResults || backendData.total,
        total_pages: backendData.totalPages || backendData.last_page,
        current_page: backendData.page || backendData.current_page,
        page_size: backendData.limit || backendData.per_page,
      },
    };
  }

  async getAssignmentById(
    courseId: number,
    assignmentId: number
  ): Promise<AssignmentDetail> {
    const response = await this.client.get<any>(
      `/courses/${courseId}/assignments/${assignmentId}`
    );
    return response.data;
  }

  async createCourseAssignment(
    courseId: number,
    assignmentData: AssignmentCreateData
  ): Promise<Assignment> {
    const response = await this.client.post<any>(
      `/courses/${courseId}/assignments`,
      assignmentData
    );
    return response.data;
  }

  async updateCourseAssignment(
    courseId: number,
    assignmentId: number,
    assignmentData: Partial<AssignmentCreateData>
  ): Promise<Assignment> {
    const response = await this.client.put<any>(
      `/courses/${courseId}/assignments/${assignmentId}`,
      assignmentData
    );
    return response.data;
  }

  async deleteCourseAssignment(
    courseId: number,
    assignmentId: number
  ): Promise<void> {
    await this.client.delete(
      `/courses/${courseId}/assignments/${assignmentId}`
    );
  }

  // Submission Methods
  async submitEssay(
    assignmentId: number,
    answerText: string,
    isDraft: boolean = false
  ): Promise<Submission> {
    const response = await this.client.post<Submission>(
      `/assignments/${assignmentId}/submit/essay`,
      {
        answer_text: answerText,
        draft: isDraft,
      }
    );
    return response.data;
  }

  async submitFile(
    assignmentId: number,
    file: File,
    isDraft: boolean = false
  ): Promise<Submission> {
    const formData = new FormData();
    formData.append("submitted_file", file);
    formData.append("draft", isDraft.toString());
    const response = await this.client.post<Submission>(
      `/assignments/${assignmentId}/submit/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async submitQuiz(
    assignmentId: number,
    answers: { question_id: number; answer: string }[],
    isDraft: boolean = false
  ): Promise<Submission> {
    const response = await this.client.post<Submission>(
      `/assignments/${assignmentId}/submit/quiz`,
      {
        answers,
        draft: isDraft,
      }
    );
    return response.data;
  }

  async getSubmission(id: number): Promise<Submission> {
    const response = await this.client.get<Submission>(`/submissions/${id}`);
    return response.data;
  }

  async updateSubmission(
    id: number,
    submissionData: Partial<Submission>
  ): Promise<Submission> {
    const response = await this.client.put<Submission>(
      `/submissions/${id}`,
      submissionData
    );
    return response.data;
  }

  async getAssignmentSubmissions(
    assignmentId: number
  ): Promise<PaginatedResponse<Submission>> {
    const response = await this.client.get<PaginatedResponse<Submission>>(
      `/assignments/${assignmentId}/submissions`
    );
    return response.data;
  }

  async gradeSubmission(
    submissionId: number,
    grade?: number,
    feedback?: string
  ): Promise<Submission> {
    const response = await this.client.patch<Submission>(
      `/submissions/${submissionId}/grade`,
      {
        grade,
        feedback,
      }
    );
    return response.data;
  }

  // Utility Methods
  async getCourseStatistics(courseId: number): Promise<CourseStatistics> {
    const response = await this.client.get<CourseStatistics>(
      `/courses/${courseId}/statistics`
    );
    return response.data;
  }

  // Utility Methods
  async getApiVersion(): Promise<{
    version: string;
    release_date: string;
    deprecated: boolean;
    sunset_date?: string;
  }> {
    const response = await this.client.get("/api-version");
    return response.data;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
