'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  BookOpen,
  Award,
  Activity,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// Types
interface ProgressData {
  userId: number
  courseId?: number
  overallProgress: number
  completedModules: number
  totalModules: number
  assignmentsCompleted: number
  totalAssignments: number
  currentStreak: number
  timeSpentToday: number // minutes
  timeSpentWeek: number // minutes
  lastActivity: string
  upcomingDeadlines: Deadline[]
  recentActivities: Activity[]
  progressTimeline: TimelinePoint[]
  performanceMetrics: PerformanceMetric[]
}

interface Deadline {
  id: number
  title: string
  dueDate: string
  type: 'assignment' | 'quiz' | 'exam'
  priority: 'high' | 'medium' | 'low'
  courseName: string
  completed: boolean
}

interface Activity {
  id: number
  type: 'module_completed' | 'assignment_submitted' | 'quiz_taken' | 'material_viewed'
  title: string
  description: string
  timestamp: string
  courseId: number
  courseName: string
  points?: number
}

interface TimelinePoint {
  date: string
  progress: number
  modulesCompleted: number
  assignmentsCompleted: number
  timeSpent: number
}

interface PerformanceMetric {
  category: string
  current: number
  target: number
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface ProgressTrackerProps {
  userId: number
  courseId?: number
  className?: string
  compact?: boolean
  realTimeUpdates?: boolean
  refreshInterval?: number
}

export default function ProgressTracker({
  userId,
  courseId,
  className,
  compact = false,
  realTimeUpdates = true,
  refreshInterval = 30000 // 30 seconds
}: ProgressTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'activities'>('overview')
  const [isLive, setIsLive] = useState(realTimeUpdates)

  // Mock progress service - in real implementation, this would call actual API
  const progressService = {
    getProgress: async (userId: number, courseId?: number): Promise<ProgressData> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        userId,
        courseId,
        overallProgress: 78,
        completedModules: 12,
        totalModules: 16,
        assignmentsCompleted: 8,
        totalAssignments: 12,
        currentStreak: 5,
        timeSpentToday: 145,
        timeSpentWeek: 780,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        upcomingDeadlines: [
          {
            id: 1,
            title: 'JavaScript Final Project',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'assignment',
            priority: 'high',
            courseName: 'Web Development',
            completed: false
          },
          {
            id: 2,
            title: 'React Quiz',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'quiz',
            priority: 'medium',
            courseName: 'Advanced JavaScript',
            completed: false
          }
        ],
        recentActivities: [
          {
            id: 1,
            type: 'module_completed',
            title: 'Completed React Hooks Module',
            description: 'Finished learning about useState and useEffect',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            courseId: 1,
            courseName: 'React Development',
            points: 50
          },
          {
            id: 2,
            type: 'assignment_submitted',
            title: 'Submitted Portfolio Project',
            description: 'Built and deployed a personal portfolio website',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            courseId: 2,
            courseName: 'Web Development',
            points: 100
          }
        ],
        progressTimeline: generateTimelineData(),
        performanceMetrics: [
          {
            category: 'Module Completion',
            current: 75,
            target: 80,
            trend: 'up',
            change: 5
          },
          {
            category: 'Assignment Score',
            current: 85,
            target: 90,
            trend: 'up',
            change: 3
          },
          {
            category: 'Time Management',
            current: 70,
            target: 75,
            trend: 'stable',
            change: 0
          }
        ]
      }
    }
  }

  const {
    data: progressData,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['progress', userId, courseId],
    queryFn: () => progressService.getProgress(userId, courseId),
    refetchInterval: isLive ? refreshInterval : false,
    refetchIntervalInBackground: true
  })

  // Generate mock timeline data
  function generateTimelineData(): TimelinePoint[] {
    const data = []
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: format(date, 'MM/dd'),
        progress: Math.max(0, 50 + Math.random() * 30 + (30 - i) * 0.8),
        modulesCompleted: Math.floor(Math.random() * 3),
        assignmentsCompleted: Math.floor(Math.random() * 2),
        timeSpent: Math.floor(Math.random() * 200 + 60)
      })
    }
    return data
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'module_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'assignment_submitted':
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'quiz_taken':
        return <Target className="h-4 w-4 text-purple-600" />
      case 'material_viewed':
        return <Eye className="h-4 w-4 text-gray-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: Deadline['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
    }
  }

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
      case 'stable':
        return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (!progressData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12 text-center">
          <div>
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No progress data available</p>
            <Button variant="outline" onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Progress Overview</h3>
            <Badge variant="outline" className="text-xs">
              {progressData.overallProgress}%
            </Badge>
          </div>
          
          <Progress value={progressData.overallProgress} className="mb-3" />
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600">Modules</div>
              <div className="font-medium">
                {progressData.completedModules}/{progressData.totalModules}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Assignments</div>
              <div className="font-medium">
                {progressData.assignmentsCompleted}/{progressData.totalAssignments}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Tracker</h2>
          <p className="text-gray-600">
            Track your learning progress and stay on target
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLive ? 'default' : 'outline'} className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {isLive ? 'Live' : 'Paused'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Resume'} Updates
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-blue-600">{progressData.overallProgress}%</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Progress value={progressData.overallProgress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{progressData.currentStreak} days</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Keep up the great work!</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Today</p>
                <p className="text-2xl font-bold text-green-600">{Math.floor(progressData.timeSpentToday / 60)}h {progressData.timeSpentToday % 60}m</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Weekly: {Math.floor(progressData.timeSpentWeek / 60)}h {progressData.timeSpentWeek % 60}m
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Activity</p>
                <p className="text-sm font-bold text-purple-600">
                  {formatDistanceToNow(new Date(progressData.lastActivity), { addSuffix: true })}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Stay active!</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Module & Assignment Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Modules Completed</span>
                    <span>{progressData.completedModules}/{progressData.totalModules}</span>
                  </div>
                  <Progress value={(progressData.completedModules / progressData.totalModules) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Assignments Completed</span>
                    <span>{progressData.assignmentsCompleted}/{progressData.totalAssignments}</span>
                  </div>
                  <Progress value={(progressData.assignmentsCompleted / progressData.totalAssignments) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.category}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(metric.trend)}
                          <span className="text-sm text-gray-600">
                            {metric.current}% / {metric.target}%
                          </span>
                        </div>
                      </div>
                      <Progress value={metric.current} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressData.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{deadline.title}</h4>
                      <p className="text-sm text-gray-600">{deadline.courseName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getPriorityColor(deadline.priority)}>
                        {deadline.priority}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatDistanceToNow(new Date(deadline.dueDate), { addSuffix: true })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(deadline.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={progressData.progressTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                  />
                  <Line
                    type="monotone"
                    dataKey="timeSpent"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.courseName}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                        {activity.points && (
                          <Badge variant="secondary" className="text-xs">
                            +{activity.points} pts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}