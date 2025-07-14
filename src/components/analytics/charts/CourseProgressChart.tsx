'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CourseProgress } from '@/types/analytics'
import { useTranslation } from 'react-i18next'
import { BookOpen, Clock, Calendar, TrendingUp } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface CourseProgressChartProps {
  data: CourseProgress[]
  title?: string
  description?: string
  className?: string
  showDetails?: boolean
  type?: 'bar' | 'pie' | 'list'
}

const DIFFICULTY_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b', 
  hard: '#ef4444'
}

const PROGRESS_COLORS = [
  '#ef4444', // Red for low progress (0-30%)
  '#f59e0b', // Yellow for medium progress (30-70%)
  '#22c55e', // Green for high progress (70-100%)
]

export function CourseProgressChart({ 
  data, 
  title, 
  description, 
  className = '',
  showDetails = true,
  type = 'list'
}: CourseProgressChartProps) {
  const { t } = useTranslation()

  // Transform data for visualization
  const chartData = data.map(course => ({
    ...course,
    progressColor: course.progressPercentage >= 70 ? PROGRESS_COLORS[2] :
                   course.progressPercentage >= 30 ? PROGRESS_COLORS[1] :
                   PROGRESS_COLORS[0],
    difficultyColor: DIFFICULTY_COLORS[course.difficulty],
    completionStatus: course.progressPercentage >= 90 ? 'completed' :
                     course.progressPercentage >= 70 ? 'near_completion' :
                     course.progressPercentage >= 30 ? 'in_progress' :
                     'just_started'
  }))

  // Calculate statistics
  const totalCourses = data.length
  const averageProgress = data.reduce((sum, course) => sum + course.progressPercentage, 0) / totalCourses
  const completedModules = data.reduce((sum, course) => sum + course.completedModules, 0)
  const totalModules = data.reduce((sum, course) => sum + course.totalModules, 0)
  const completedCourses = data.filter(course => course.progressPercentage >= 90).length

  const renderTooltip = (active?: boolean, payload?: any[], label?: string) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{data.courseName}</p>
          <p className="text-sm text-gray-600">{`${t('progress')}: ${data.progressPercentage}%`}</p>
          <p className="text-sm text-gray-600">{`${t('modules')}: ${data.completedModules}/${data.totalModules}`}</p>
          <p className="text-sm text-gray-600">{`${t('difficulty')}: ${t(data.difficulty)}`}</p>
          <p className="text-sm text-gray-600">
            {`${t('last_activity')}: ${formatDistanceToNow(parseISO(data.lastActivity), { addSuffix: true })}`}
          </p>
        </div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="courseName" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
          label={{ value: t('progress_percentage'), angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={({ active, payload, label }) => renderTooltip(active, payload, label)} />
        <Bar dataKey="progressPercentage" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.progressColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const pieData = [
    { name: t('completed'), value: completedCourses, fill: PROGRESS_COLORS[2] },
    { name: t('in_progress'), value: totalCourses - completedCourses, fill: PROGRESS_COLORS[1] }
  ]

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderListView = () => (
    <div className="space-y-4">
      {chartData.map((course) => (
        <div key={course.courseId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{course.courseName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={course.difficulty === 'hard' ? 'destructive' : 
                          course.difficulty === 'medium' ? 'default' : 'secondary'}
                >
                  {t(course.difficulty)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {course.completedModules}/{course.totalModules} {t('modules')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {course.progressPercentage}%
              </div>
              <div className="text-xs text-gray-500">
                {t(course.completionStatus)}
              </div>
            </div>
          </div>

          <Progress value={course.progressPercentage} className="h-3 mb-3" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {t('last_activity')}: {formatDistanceToNow(parseISO(course.lastActivity), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {t('estimated_completion')}: {formatDistanceToNow(parseISO(course.estimatedCompletion), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title || t('course_progress_overview')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Statistics */}
          {showDetails && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{totalCourses}</div>
                <div className="text-sm text-blue-700">{t('total_courses')}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
                <div className="text-sm text-green-700">{t('completed')}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{averageProgress.toFixed(0)}%</div>
                <div className="text-sm text-purple-700">{t('avg_progress')}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{completedModules}/{totalModules}</div>
                <div className="text-sm text-orange-700">{t('modules_ratio')}</div>
              </div>
            </div>
          )}

          {/* Progress Visualization */}
          <div>
            {type === 'bar' && renderBarChart()}
            {type === 'pie' && renderPieChart()}
            {type === 'list' && renderListView()}
          </div>

          {/* Overall Progress Indicator */}
          {showDetails && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{t('overall_progress')}</span>
                <span className="text-lg font-bold text-blue-600">{averageProgress.toFixed(1)}%</span>
              </div>
              <Progress value={averageProgress} className="h-3" />
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {completedCourses > 0 
                    ? t('courses_completed_progress', { count: completedCourses })
                    : t('no_courses_completed_yet')
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseProgressChart