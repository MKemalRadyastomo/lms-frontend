'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, 
  BookOpen, 
  ClipboardList, 
  Users,
  Award,
  Clock,
  Target,
  Brain,
  AlertTriangle
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RefreshButton } from './RefreshButton'
import { analyticsApi } from '@/lib/api/analytics'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { 
  StudentAnalytics, 
  InstructorAnalytics, 
  AdminAnalytics,
  UserRole 
} from '@/types/analytics'
import { formatDistanceToNow } from 'date-fns'

interface AnalyticsDashboardProps {
  className?: string
  timeRange?: 'week' | 'month' | 'semester' | 'year'
  compact?: boolean
}

export function AnalyticsDashboard({ 
  className = '', 
  timeRange = 'month',
  compact = false 
}: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<StudentAnalytics | InstructorAnalytics | AdminAnalytics | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fromCache, setFromCache] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = AuthManager.getUserData()
  const userRole: UserRole = useMemo(() => {
    if (!user) return 'student'
    switch (user.role_id) {
      case 3: return 'admin'
      case 2: return 'instructor'
      case 1: default: return 'student'
    }
  }, [user?.role_id])

  // Load analytics data
  const loadAnalytics = async (useCache = true) => {
    if (!user || !user.id) {
      console.log('User not available, skipping analytics load')
      return
    }

    try {
      setError(null)
      if (!useCache) setIsRefreshing(true)

      // For development, use mock data
      setAnalyticsData(getMockData(userRole))
      setLastUpdated(new Date())
      setFromCache(useCache)
      
      // Simulate API delay
      if (!useCache) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(error instanceof Error ? error.message : 'Failed to load analytics')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Refresh analytics data
  const refreshAnalytics = async () => {
    await loadAnalytics(false)
  }

  // Load initial data
  useEffect(() => {
    if (user && user.id) {
      loadAnalytics(true)
    }
  }, [user?.id, userRole, timeRange]) // Only depend on user.id, not the entire user object

  if (!user) {
    return <div>Loading user data...</div>
  }

  if (error && !analyticsData) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gagal Memuat Analytics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <RefreshButton
            onRefresh={refreshAnalytics}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            fromCache={fromCache}
            variant="default"
          />
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">
            {userRole === 'student' && 'Track your learning progress and performance'}
            {userRole === 'instructor' && 'Monitor your classes and student performance'}
            {userRole === 'admin' && 'System-wide insights and performance metrics'}
          </p>
        </div>
        
        <RefreshButton
          onRefresh={refreshAnalytics}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          fromCache={fromCache}
        />
      </div>

      {/* Analytics Content */}
      {analyticsData && (
        <>
          {userRole === 'student' && <StudentAnalyticsView data={analyticsData as StudentAnalytics} compact={compact} />}
          {userRole === 'instructor' && <InstructorAnalyticsView data={analyticsData as InstructorAnalytics} compact={compact} />}
          {userRole === 'admin' && <AdminAnalyticsView data={analyticsData as AdminAnalytics} compact={compact} />}
        </>
      )}
    </div>
  )
}

// Student Analytics View
function StudentAnalyticsView({ data, compact }: { data: StudentAnalytics; compact: boolean }) {
  const avgProgress = data.courseProgress.reduce((acc, course) => acc + course.progressPercentage, 0) / data.courseProgress.length || 0
  
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Course Progress"
          value={`${Math.round(avgProgress)}%`}
          icon={<BookOpen className="h-5 w-5" />}
          trend={avgProgress > 70 ? 'up' : avgProgress > 40 ? 'neutral' : 'down'}
        />
        <StatCard
          title="Assignments"
          value={`${data.assignmentStats.completed}/${data.assignmentStats.total}`}
          icon={<ClipboardList className="h-5 w-5" />}
          trend={data.assignmentStats.completionRate > 80 ? 'up' : 'neutral'}
          subtitle="Completed"
        />
        <StatCard
          title="Average Grade"
          value={data.gradeAnalytics.averageGrade ? `${data.gradeAnalytics.averageGrade.toFixed(1)}` : 'N/A'}
          icon={<Award className="h-5 w-5" />}
          trend={data.gradeAnalytics.averageGrade && data.gradeAnalytics.averageGrade > 80 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Study Streak"
          value={`${data.studyTimeAnalytics.studyStreak} days`}
          icon={<Target className="h-5 w-5" />}
          trend={data.studyTimeAnalytics.studyStreak > 7 ? 'up' : 'neutral'}
        />
      </div>

      {!compact && (
        <>
          {/* Course Progress Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Progress
              </CardTitle>
              <CardDescription>Your progress across all enrolled courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.courseProgress.map((course) => (
                <div key={course.courseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{course.courseName}</h4>
                      <p className="text-sm text-gray-600">
                        {course.completedModules}/{course.totalModules} modules completed
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold">{course.progressPercentage}%</span>
                      <Badge variant={course.difficulty === 'hard' ? 'destructive' : course.difficulty === 'medium' ? 'default' : 'secondary'} className="ml-2">
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={course.progressPercentage} className="h-2" />
                  <p className="text-xs text-gray-500">
                    Last activity: {formatDistanceToNow(new Date(course.lastActivity), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          {data.upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Don't miss these important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.upcomingDeadlines.slice(0, 5).map((deadline) => (
                    <div key={deadline.assignmentId} className={`p-3 rounded-lg border ${
                      deadline.priority === 'high' ? 'bg-red-50 border-red-200' :
                      deadline.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{deadline.assignmentTitle}</h4>
                          <p className="text-sm text-gray-600">{deadline.courseName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                          </p>
                          <Badge variant={deadline.status === 'submitted' ? 'default' : deadline.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {deadline.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function InstructorAnalyticsView({ data, compact }: { data: InstructorAnalytics; compact: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Classes"
          value={data.classPerformance.length.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle="Active Courses"
        />
        <StatCard
          title="Students"
          value="43"
          icon={<Users className="h-5 w-5" />}
          subtitle="Total Enrolled"
        />
        <StatCard
          title="Avg Performance"
          value="81.4"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title="Pending Grading"
          value={data.gradingWorkload.pendingSubmissions.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          trend={data.gradingWorkload.pendingSubmissions < 10 ? 'up' : 'down'}
        />
      </div>
    </div>
  )
}

function AdminAnalyticsView({ data, compact }: { data: AdminAnalytics; compact: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.systemStats.totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          subtitle={`${data.systemStats.activeUsers} active`}
        />
        <StatCard
          title="Courses"
          value={data.systemStats.totalCourses.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle="Platform-wide"
        />
        <StatCard
          title="Assignments"
          value={data.systemStats.totalAssignments.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          subtitle="Total Created"
        />
        <StatCard
          title="System Health"
          value={`${data.performanceBenchmarks.systemResponseTime.toFixed(0)}ms`}
          icon={<Brain className="h-5 w-5" />}
          trend={data.performanceBenchmarks.systemResponseTime < 500 ? 'up' : 'down'}
          subtitle="Response Time"
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend, subtitle }: { 
  title: string; value: string; icon: React.ReactNode; trend?: 'up' | 'down' | 'neutral'; subtitle?: string 
}) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            trend === 'up' ? 'bg-green-100 text-green-600' :
            trend === 'down' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getMockData(role: UserRole): StudentAnalytics | InstructorAnalytics | AdminAnalytics {
  if (role === 'student') {
    return {
      courseProgress: [
        {
          courseId: 1,
          courseName: 'Introduction to Programming',
          progressPercentage: 78,
          completedModules: 7,
          totalModules: 9,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          difficulty: 'medium'
        },
        {
          courseId: 2,
          courseName: 'Web Development Basics',
          progressPercentage: 45,
          completedModules: 3,
          totalModules: 8,
          lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          difficulty: 'easy'
        }
      ],
      assignmentStats: {
        total: 12,
        completed: 8,
        pending: 3,
        overdue: 1,
        averageGrade: 85.5,
        completionRate: 66.7
      },
      upcomingDeadlines: [
        {
          assignmentId: 1,
          assignmentTitle: 'JavaScript Final Project',
          courseName: 'Introduction to Programming',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          status: 'in_progress',
          estimatedTime: 8
        },
        {
          assignmentId: 2,
          assignmentTitle: 'HTML/CSS Assignment',
          courseName: 'Web Development Basics',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'not_started',
          estimatedTime: 4
        }
      ],
      gradeAnalytics: {
        averageGrade: 85.5,
        gradeDistribution: [
          { range: '90-100', count: 3, percentage: 37.5 },
          { range: '80-89', count: 4, percentage: 50 },
          { range: '70-79', count: 1, percentage: 12.5 }
        ],
        trendData: [
          { period: 'Week 1', averageGrade: 82, assignmentCount: 2 },
          { period: 'Week 2', averageGrade: 88, assignmentCount: 3 },
          { period: 'Week 3', averageGrade: 86, assignmentCount: 3 }
        ],
        bestSubject: 'Programming',
        improvementNeeded: 'Web Design'
      },
      studyTimeAnalytics: {
        dailyAverage: 125,
        weeklyTotal: 875,
        mostActiveDay: 'Tuesday',
        studyStreak: 12,
        timeBySubject: [
          { subject: 'Programming', timeSpent: 450, percentage: 51.4 },
          { subject: 'Web Development', timeSpent: 325, percentage: 37.1 },
          { subject: 'Theory', timeSpent: 100, percentage: 11.4 }
        ]
      },
      achievements: [
        {
          id: '1',
          title: 'First Program',
          description: 'Successfully completed your first programming assignment',
          icon: '🎯',
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'academic'
        },
        {
          id: '2',
          title: 'Study Streak',
          description: 'Maintained a 10-day study streak',
          icon: '🔥',
          unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'engagement'
        }
      ]
    } as StudentAnalytics
  } else if (role === 'instructor') {
    return {
      classPerformance: [
        {
          courseId: 1,
          courseName: 'Introduction to Programming',
          studentCount: 25,
          averageGrade: 83.5,
          completionRate: 88,
          engagementScore: 75,
          strugglingStudents: 3,
          topPerformers: 7
        },
        {
          courseId: 2,
          courseName: 'Advanced JavaScript',
          studentCount: 18,
          averageGrade: 79.2,
          completionRate: 72,
          engagementScore: 68,
          strugglingStudents: 5,
          topPerformers: 4
        }
      ],
      assignmentAnalytics: {
        totalAssignments: 15,
        averageDifficulty: 7.2,
        completionRates: [],
        gradingTime: {
          averageTimePerSubmission: 12,
          totalPendingSubmissions: 28,
          estimatedGradingTime: 5.6
        }
      },
      studentEngagement: [
        {
          studentId: 1,
          studentName: 'John Doe',
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          engagementScore: 85,
          riskLevel: 'low',
          coursesEnrolled: 2,
          assignmentsCompleted: 12
        },
        {
          studentId: 2,
          studentName: 'Jane Smith',
          lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          engagementScore: 45,
          riskLevel: 'high',
          coursesEnrolled: 1,
          assignmentsCompleted: 3
        }
      ],
      gradingWorkload: {
        pendingSubmissions: 28,
        avgGradingTime: 12,
        dailyWorkload: [],
        priorityQueue: []
      },
      coursePopularity: [
        {
          courseId: 1,
          courseName: 'Introduction to Programming',
          enrollmentCount: 25,
          completionRate: 88,
          rating: 4.7,
          growthRate: 15
        }
      ]
    } as InstructorAnalytics
  } else {
    return {
      systemStats: {
        totalUsers: 1250,
        activeUsers: 892,
        totalCourses: 45,
        totalAssignments: 234,
        totalSubmissions: 1850,
        systemUptime: 99.8,
        storageUsed: 2.3,
        bandwidthUsage: 1.2
      },
      userActivityTrends: [],
      courseMetrics: {
        totalCourses: 45,
        activeCourses: 38,
        averageEnrollment: 28,
        topCategories: [
          { category: 'Programming', courseCount: 15, enrollment: 420 },
          { category: 'Web Development', courseCount: 12, enrollment: 336 },
          { category: 'Data Science', courseCount: 8, enrollment: 224 }
        ],
        completionRates: []
      },
      performanceBenchmarks: {
        averageGradeAcrossSystem: 82.3,
        courseCompletionRate: 78.5,
        userEngagementRate: 71.2,
        systemResponseTime: 320,
        errorRate: 0.02
      },
      platformGrowth: {
        monthlyGrowthRate: 12.5,
        userRetentionRate: 85.3,
        courseCompletionTrend: [
          { period: 'Jan', value: 75, change: 5 },
          { period: 'Feb', value: 78, change: 3 }
        ],
        revenueGrowth: []
      }
    } as AdminAnalytics
  }
}
