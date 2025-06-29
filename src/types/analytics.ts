export interface StudentAnalytics {
  courseProgress: CourseProgress[]
  assignmentStats: AssignmentStats
  upcomingDeadlines: UpcomingDeadline[]
  gradeAnalytics: GradeAnalytics
  studyTimeAnalytics: StudyTimeAnalytics
  achievements: Achievement[]
}

export interface InstructorAnalytics {
  classPerformance: ClassPerformance[]
  assignmentAnalytics: InstructorAssignmentAnalytics
  studentEngagement: StudentEngagement[]
  gradingWorkload: GradingWorkload
  coursePopularity: CoursePopularity[]
}

export interface AdminAnalytics {
  systemStats: SystemStats
  userActivityTrends: UserActivityTrend[]
  courseMetrics: CourseMetrics
  performanceBenchmarks: PerformanceBenchmarks
  platformGrowth: PlatformGrowth
}

export interface CourseProgress {
  courseId: number
  courseName: string
  progressPercentage: number
  completedModules: number
  totalModules: number
  lastActivity: string
  estimatedCompletion: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface AssignmentStats {
  total: number
  completed: number
  pending: number
  overdue: number
  averageGrade: number | null
  completionRate: number
}

export interface UpcomingDeadline {
  assignmentId: number
  assignmentTitle: string
  courseName: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'not_started' | 'in_progress' | 'submitted'
  estimatedTime: number // in hours
}

export interface GradeAnalytics {
  averageGrade: number | null
  gradeDistribution: GradeDistribution[]
  trendData: GradeTrend[]
  bestSubject: string | null
  improvementNeeded: string | null
}

export interface GradeDistribution {
  range: string // e.g., "90-100", "80-89"
  count: number
  percentage: number
}

export interface GradeTrend {
  period: string
  averageGrade: number
  assignmentCount: number
}

export interface StudyTimeAnalytics {
  dailyAverage: number // minutes
  weeklyTotal: number // minutes
  mostActiveDay: string
  studyStreak: number // days
  timeBySubject: SubjectTime[]
}

export interface SubjectTime {
  subject: string
  timeSpent: number // minutes
  percentage: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  category: 'academic' | 'engagement' | 'milestone'
}

export interface ClassPerformance {
  courseId: number
  courseName: string
  studentCount: number
  averageGrade: number
  completionRate: number
  engagementScore: number
  strugglingStudents: number
  topPerformers: number
}

export interface InstructorAssignmentAnalytics {
  totalAssignments: number
  averageDifficulty: number
  completionRates: AssignmentCompletionRate[]
  gradingTime: GradingTimeAnalytics
}

export interface AssignmentCompletionRate {
  assignmentId: number
  assignmentTitle: string
  completionRate: number
  averageGrade: number
  difficultyRating: number
}

export interface GradingTimeAnalytics {
  averageTimePerSubmission: number // minutes
  totalPendingSubmissions: number
  estimatedGradingTime: number // hours
}

export interface StudentEngagement {
  studentId: number
  studentName: string
  lastActivity: string
  engagementScore: number // 0-100
  riskLevel: 'low' | 'medium' | 'high'
  coursesEnrolled: number
  assignmentsCompleted: number
}

export interface GradingWorkload {
  pendingSubmissions: number
  avgGradingTime: number
  dailyWorkload: DailyWorkload[]
  priorityQueue: PrioritySubmission[]
}

export interface DailyWorkload {
  date: string
  submissions: number
  estimatedHours: number
}

export interface PrioritySubmission {
  submissionId: number
  studentName: string
  assignmentTitle: string
  submittedAt: string
  priority: number
}

export interface CoursePopularity {
  courseId: number
  courseName: string
  enrollmentCount: number
  completionRate: number
  rating: number
  growthRate: number
}

export interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  totalAssignments: number
  totalSubmissions: number
  systemUptime: number
  storageUsed: number
  bandwidthUsage: number
}

export interface UserActivityTrend {
  date: string
  activeUsers: number
  newRegistrations: number
  courseEnrollments: number
  assignmentSubmissions: number
}

export interface CourseMetrics {
  totalCourses: number
  activeCourses: number
  averageEnrollment: number
  topCategories: CategoryMetric[]
  completionRates: CompletionRateMetric[]
}

export interface CategoryMetric {
  category: string
  courseCount: number
  enrollment: number
}

export interface CompletionRateMetric {
  courseId: number
  courseName: string
  completionRate: number
  enrollmentCount: number
}

export interface PerformanceBenchmarks {
  averageGradeAcrossSystem: number
  courseCompletionRate: number
  userEngagementRate: number
  systemResponseTime: number
  errorRate: number
}

export interface PlatformGrowth {
  monthlyGrowthRate: number
  userRetentionRate: number
  courseCompletionTrend: GrowthTrendPoint[]
  revenueGrowth: GrowthTrendPoint[]
}

export interface GrowthTrendPoint {
  period: string
  value: number
  change: number
}

// Hybrid Analytics Interface for the dashboard
export interface AnalyticsDashboard {
  data: StudentAnalytics | InstructorAnalytics | AdminAnalytics
  lastUpdated: Date
  isRefreshing: boolean
  cacheExpiry: Date
}

// API Response Types
export interface AnalyticsApiResponse<T> {
  data: T
  timestamp: string
  cacheKey: string
  ttl: number // time to live in seconds
}

export type UserRole = 'student' | 'instructor' | 'admin'

export interface AnalyticsRequest {
  userId?: number
  role: UserRole
  timeRange?: 'week' | 'month' | 'semester' | 'year'
  includeCache?: boolean
}
