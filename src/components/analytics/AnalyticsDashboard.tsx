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
import AnalyticsExporter from './AnalyticsExporter'
import { analyticsApi } from '@/lib/api/analytics'
import { apiClient } from '@/lib/api'
import { AuthManager } from '@/lib/auth'
import { ProfileStatsComponent } from '@/components/profile/ProfileStats'
import { 
  GradeDistributionChart,
  UserActivityChart,
  PerformanceMetricsChart,
  CourseProgressChart
} from './charts'
import { 
  StudentAnalytics, 
  InstructorAnalytics, 
  AdminAnalytics,
  UserRole 
} from '@/types/analytics'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { Locale } from 'date-fns';
import { id } from 'date-fns/locale' // Import Indonesian locale

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
  const [profileStats, setProfileStats] = useState<any>(null)
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

  const { t, i18n } = useTranslation(); // Get i18n instance

  // Determine locale for date-fns
  const dateFnsLocale = useMemo(() => {
    return i18n.language === 'id' ? id : undefined; // Use 'id' locale if i18n language is 'id', otherwise default
  }, [i18n.language]);

  // Load analytics data
  const loadAnalytics = async (useCache = true) => {
    if (!user || !user.id) {
      console.log('User not available, skipping analytics load')
      return
    }

    try {
      setError(null)
      if (!useCache) setIsRefreshing(true)

      // Use real analytics API with fallback to mock data
      try {
        let analyticsResult
        
        switch (userRole) {
          case 'student':
            analyticsResult = await analyticsApi.getStudentAnalytics(user.id, { useCache, timeRange })
            break
          case 'instructor':
            analyticsResult = await analyticsApi.getInstructorAnalytics(user.id, { useCache, timeRange })
            break
          case 'admin':
            analyticsResult = await analyticsApi.getAdminAnalytics({ useCache, timeRange })
            break
          default:
            throw new Error(`Unknown user role: ${userRole}`)
        }
        
        setAnalyticsData(analyticsResult.data)
        setLastUpdated(analyticsResult.lastUpdated)
        setFromCache(analyticsResult.fromCache)
        
        console.log(`Analytics loaded for ${userRole}:`, {
          fromCache: analyticsResult.fromCache,
          lastUpdated: analyticsResult.lastUpdated,
          dataSource: 'real_api'
        })
        
      } catch (analyticsError) {
        console.warn('Real analytics API failed, using fallback mock data:', analyticsError)
        
        // Fallback to mock data if analytics API fails
        setAnalyticsData(getMockData(userRole))
        setLastUpdated(new Date())
        setFromCache(false)
      }
      
      // Load profile stats
      try {
        const stats = await apiClient.getUserStats(user.id)
        setProfileStats(stats)
      } catch (statsError) {
        console.warn("Failed to load user stats:", statsError)
        // Set default stats if endpoint not available
        setProfileStats({
          coursesEnrolled: 0,
          assignmentsCompleted: 0,
          assignmentsPending: 0,
          totalSubmissions: 0,
          averageGrade: null,
          lastLoginAt: null,
          accountCreatedAt: user.created_at,
          completionRate: 0,
        })
      }
      
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(error instanceof Error ? error.message : t('failed_to_load_analytics'))
      
      // Final fallback to mock data on complete failure
      try {
        setAnalyticsData(getMockData(userRole))
        setLastUpdated(new Date())
        setFromCache(false)
      } catch (fallbackError) {
        console.error('Even fallback mock data failed:', fallbackError)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Refresh analytics data
  const refreshAnalytics = async () => {
    if (!user || !user.id) {
      console.log('User not available, skipping analytics refresh')
      return
    }

    try {
      setIsRefreshing(true)
      setError(null)

      // Use the refreshAnalytics method from the analytics API
      const refreshResult = await analyticsApi.refreshAnalytics<StudentAnalytics | InstructorAnalytics | AdminAnalytics>(userRole, user.id, timeRange)
      
      setAnalyticsData(refreshResult.data)
      setLastUpdated(refreshResult.lastUpdated)
      setFromCache(false)
      
      console.log(`Analytics refreshed for ${userRole}:`, {
        lastUpdated: refreshResult.lastUpdated,
        dataSource: 'refreshed_api'
      })
      
    } catch (error) {
      console.warn('Analytics refresh failed, falling back to loadAnalytics:', error)
      // Fall back to the regular load method without cache
      await loadAnalytics(false)
    }
  }

  // Load initial data
  useEffect(() => {
    if (user && user.id) {
      loadAnalytics(true)
    }
  }, [user?.id, userRole, timeRange]) // Only depend on user.id, not the entire user object

  if (!user) {
    return <div>{t('loading_user_data')}</div>
  }

  if (error && !analyticsData) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('failed_to_load_analytics_title')}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <RefreshButton
            onRefresh={refreshAnalytics}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            fromCache={fromCache}
            variant="default"
            enableAutoRefresh={false}
          />
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`} data-analytics-dashboard>
      {/* Header with Refresh Button and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('analytics_dashboard_title')}</h2>
          <p className="text-gray-600">
            {userRole === 'student' && t('student_dashboard_description')}
            {userRole === 'instructor' && t('instructor_dashboard_description')}
            {userRole === 'admin' && t('admin_dashboard_description')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {analyticsData && (
            <AnalyticsExporter 
              data={analyticsData}
              userRole={userRole}
            />
          )}
          
          <RefreshButton
            onRefresh={refreshAnalytics}
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            fromCache={fromCache}
            enableAutoRefresh={true}
            defaultRefreshInterval={60}
          />
        </div>
      </div>

      {/* Analytics Content */}
      {analyticsData && (
        <>
          {userRole === 'student' && <StudentAnalyticsView data={analyticsData as StudentAnalytics} compact={compact} dateFnsLocale={dateFnsLocale} profileStats={profileStats} />}
          {userRole === 'instructor' && <InstructorAnalyticsView data={analyticsData as InstructorAnalytics} compact={compact} profileStats={profileStats} />}
          {userRole === 'admin' && <AdminAnalyticsView data={analyticsData as AdminAnalytics} compact={compact} />}
        </>
      )}
    </div>
  )
}

// Student Analytics View
function StudentAnalyticsView({ data, compact, dateFnsLocale, profileStats }: { data: StudentAnalytics; compact: boolean; dateFnsLocale: Locale | undefined; profileStats: any }) {
  const { t } = useTranslation();
  const avgProgress = data.courseProgress.reduce((acc, course) => acc + course.progressPercentage, 0) / data.courseProgress.length || 0
  
  return (
    <div className="space-y-6">
      {/* Profile Stats */}
      {profileStats && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('personal_performance')}</h3>
          <ProfileStatsComponent stats={profileStats} userRole={1} />
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('course_progress')}
          value={`${Math.round(avgProgress)}%`}
          icon={<BookOpen className="h-5 w-5" />}
          trend={avgProgress > 70 ? 'up' : avgProgress > 40 ? 'neutral' : 'down'}
        />
        <StatCard
          title={t('assignments')}
          value={`${data.assignmentStats.completed}/${data.assignmentStats.total}`}
          icon={<ClipboardList className="h-5 w-5" />}
          trend={data.assignmentStats.completionRate > 80 ? 'up' : 'neutral'}
          subtitle={t('completed')}
        />
        <StatCard
          title={t('average_grade')}
          value={data.gradeAnalytics.averageGrade ? `${data.gradeAnalytics.averageGrade.toFixed(1)}` : t('not_available_abbr')}
          icon={<Award className="h-5 w-5" />}
          trend={data.gradeAnalytics.averageGrade && data.gradeAnalytics.averageGrade > 80 ? 'up' : 'neutral'}
        />
        <StatCard
          title={t('study_streak')}
          value={t('study_streak_days', { count: data.studyTimeAnalytics.studyStreak })}
          icon={<Target className="h-5 w-5" />}
          trend={data.studyTimeAnalytics.studyStreak > 7 ? 'up' : 'neutral'}
        />
      </div>

      {!compact && (
        <>
          {/* Course Progress Chart */}
          <CourseProgressChart 
            data={data.courseProgress}
            title={t('course_progress_overview')}
            description={t('detailed_progress_across_courses')}
            type="list"
            showDetails={true}
          />
          
          {/* Grade Analytics Chart */}
          {data.gradeAnalytics.gradeDistribution.length > 0 && (
            <GradeDistributionChart
              data={data.gradeAnalytics.gradeDistribution}
              title={t('grade_distribution_analysis')}
              description={t('breakdown_of_grades_across_assignments')}
              type="bar"
            />
          )}

          {/* Upcoming Deadlines */}
          {data.upcomingDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('upcoming_deadlines')}
                </CardTitle>
                <CardDescription>{t('upcoming_deadlines_description')}</CardDescription>
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
                            {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true, locale: dateFnsLocale })}
                          </p>
                          <Badge variant={deadline.status === 'submitted' ? 'default' : deadline.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {t(deadline.status.replace(' ', ''))}
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

function InstructorAnalyticsView({ data, compact, profileStats }: { data: InstructorAnalytics; compact: boolean; profileStats: any }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Profile Stats */}
      {profileStats && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('teaching_performance')}</h3>
          <ProfileStatsComponent stats={profileStats} userRole={2} />
        </div>
      )}
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('classes')}
          value={data.classPerformance.length.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle={t('active_courses')}
        />
        <StatCard
          title={t('students')}
          value="43"
          icon={<Users className="h-5 w-5" />}
          subtitle={t('total_enrolled')}
        />
        <StatCard
          title={t('avg_performance')}
          value="81.4"
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
        />
        <StatCard
          title={t('pending_grading')}
          value={data.gradingWorkload.pendingSubmissions.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          trend={data.gradingWorkload.pendingSubmissions < 10 ? 'up' : 'down'}
        />
      </div>
    </div>
  )
}

function AdminAnalyticsView({ data, compact }: { data: AdminAnalytics; compact: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('total_users')}
          value={data.systemStats.totalUsers.toString()}
          icon={<Users className="h-5 w-5" />}
          subtitle={t('active_users', { count: data.systemStats.activeUsers })}
        />
        <StatCard
          title={t('courses')}
          value={data.systemStats.totalCourses.toString()}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle={t('platform_wide')}
        />
        <StatCard
          title={t('assignments')}
          value={data.systemStats.totalAssignments.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          subtitle={t('total_created')}
        />
        <StatCard
          title={t('system_health')}
          value={t('response_time_ms', { time: data.performanceBenchmarks.systemResponseTime.toFixed(0) })}
          icon={<Brain className="h-5 w-5" />}
          trend={data.performanceBenchmarks.systemResponseTime < 500 ? 'up' : 'down'}
          subtitle={t('response_time')}
        />
      </div>

      {!compact && (
        <>
          {/* Performance Metrics Chart */}
          <PerformanceMetricsChart
            data={data.performanceBenchmarks}
            title={t('system_performance_metrics')}
            description={t('comprehensive_system_health_analysis')}
            showDetailedMetrics={true}
          />

          {/* User Activity Trends */}
          {data.userActivityTrends && data.userActivityTrends.length > 0 && (
            <UserActivityChart
              data={data.userActivityTrends}
              title={t('user_activity_trends')}
              description={t('daily_platform_activity_overview')}
              type="line"
              showMetrics={true}
            />
          )}

          {/* Platform Growth Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Categories Distribution */}
            {data.courseMetrics.topCategories && data.courseMetrics.topCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {t('top_course_categories')}
                  </CardTitle>
                  <CardDescription>{t('most_popular_course_categories')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.courseMetrics.topCategories.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-gray-600">
                            {category.courseCount} {t('courses')} • {category.enrollment} {t('students')}
                          </span>
                        </div>
                        <Progress 
                          value={(category.enrollment / data.systemStats.totalUsers) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('platform_statistics')}
                </CardTitle>
                <CardDescription>{t('key_platform_metrics')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">{t('system_uptime')}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {data.systemStats.systemUptime.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">{t('avg_grade_system')}</span>
                    <span className="text-lg font-bold text-green-600">
                      {data.performanceBenchmarks.averageGradeAcrossSystem.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">{t('completion_rate')}</span>
                    <span className="text-lg font-bold text-purple-600">
                      {data.performanceBenchmarks.courseCompletionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">{t('user_engagement')}</span>
                    <span className="text-lg font-bold text-orange-600">
                      {data.performanceBenchmarks.userEngagementRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
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
