'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserActivityTrend } from '@/types/analytics'
import { useTranslation } from 'react-i18next'
import { format, parseISO } from 'date-fns'
import { TrendingUp, Users, UserPlus, BookOpen, ClipboardList } from 'lucide-react'

interface UserActivityChartProps {
  data: UserActivityTrend[]
  title?: string
  description?: string
  type?: 'line' | 'area'
  className?: string
  showMetrics?: boolean
}

export function UserActivityChart({ 
  data, 
  title, 
  description, 
  type = 'line',
  className = '',
  showMetrics = true
}: UserActivityChartProps) {
  const { t } = useTranslation()

  // Transform data for better visualization
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    formattedDate: format(parseISO(item.date), 'yyyy-MM-dd')
  }))

  // Calculate metrics
  const totalActiveUsers = data.reduce((sum, item) => sum + item.activeUsers, 0)
  const totalNewRegistrations = data.reduce((sum, item) => sum + item.newRegistrations, 0)
  const totalEnrollments = data.reduce((sum, item) => sum + item.courseEnrollments, 0)
  const totalSubmissions = data.reduce((sum, item) => sum + item.assignmentSubmissions, 0)
  const avgDailyActiveUsers = Math.round(totalActiveUsers / data.length)

  const renderTooltip = (active?: boolean, payload?: any[], label?: string) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={({ active, payload, label }) => renderTooltip(active, payload, label)} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="activeUsers" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name={t('active_users')}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="newRegistrations" 
          stroke="#10b981" 
          strokeWidth={2}
          name={t('new_registrations')}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="courseEnrollments" 
          stroke="#f59e0b" 
          strokeWidth={2}
          name={t('enrollments')}
          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="assignmentSubmissions" 
          stroke="#ef4444" 
          strokeWidth={2}
          name={t('submissions')}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={({ active, payload, label }) => renderTooltip(active, payload, label)} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="activeUsers" 
          stackId="1"
          stroke="#3b82f6" 
          fill="#3b82f6"
          fillOpacity={0.6}
          name={t('active_users')}
        />
        <Area 
          type="monotone" 
          dataKey="newRegistrations" 
          stackId="1"
          stroke="#10b981" 
          fill="#10b981"
          fillOpacity={0.6}
          name={t('new_registrations')}
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {title || t('user_activity_trends')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Metrics Summary */}
          {showMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">{t('avg_daily_active')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {avgDailyActiveUsers.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{t('total_registrations')}</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {totalNewRegistrations.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600 font-medium">{t('total_enrollments')}</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">
                  {totalEnrollments.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">{t('total_submissions')}</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {totalSubmissions.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div>
            {type === 'line' ? renderLineChart() : renderAreaChart()}
          </div>

          {/* Time Period Info */}
          <div className="text-sm text-gray-500 text-center">
            {t('data_range')}: {chartData[0]?.formattedDate} - {chartData[chartData.length - 1]?.formattedDate}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserActivityChart