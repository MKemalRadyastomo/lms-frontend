'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PerformanceBenchmarks } from '@/types/analytics'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Zap, Target, Clock, AlertTriangle } from 'lucide-react'

interface PerformanceMetricsChartProps {
  data: PerformanceBenchmarks
  title?: string
  description?: string
  className?: string
  showDetailedMetrics?: boolean
}

export function PerformanceMetricsChart({ 
  data, 
  title, 
  description, 
  className = '',
  showDetailedMetrics = true
}: PerformanceMetricsChartProps) {
  const { t } = useTranslation()

  // Transform data for radar chart (normalize to 0-100 scale)
  const radarData = [
    {
      metric: t('avg_grade'),
      value: data.averageGradeAcrossSystem,
      fullMark: 100
    },
    {
      metric: t('completion_rate'),
      value: data.courseCompletionRate,
      fullMark: 100
    },
    {
      metric: t('engagement'),
      value: data.userEngagementRate,
      fullMark: 100
    },
    {
      metric: t('system_performance'),
      value: Math.max(0, 100 - (data.systemResponseTime / 10)), // Lower response time = better
      fullMark: 100
    },
    {
      metric: t('reliability'),
      value: Math.max(0, 100 - (data.errorRate * 1000)), // Lower error rate = better
      fullMark: 100
    }
  ]

  const getStatusColor = (value: number, isInverted = false) => {
    const threshold = isInverted ? 
      { excellent: 30, good: 50, poor: 100 } : 
      { excellent: 80, good: 60, poor: 40 }
    
    if (isInverted) {
      if (value <= threshold.excellent) return 'text-green-600'
      if (value <= threshold.good) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      if (value >= threshold.excellent) return 'text-green-600'
      if (value >= threshold.good) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getStatusIcon = (value: number, isInverted = false) => {
    const isGood = isInverted ? value <= 30 : value >= 80
    const isFair = isInverted ? value <= 50 : value >= 60
    
    if (isGood) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (isFair) return <Target className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const renderTooltip = (active?: boolean, payload?: any[]) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.metric}</p>
          <p className="text-blue-600">{`${t('value')}: ${data.value.toFixed(1)}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          {title || t('performance_metrics')}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Radar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name={t('performance')}
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip content={({ active, payload }) => renderTooltip(active, payload)} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Metrics */}
          {showDetailedMetrics && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">{t('detailed_metrics')}</h4>
              
              {/* Average Grade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.averageGradeAcrossSystem)}
                    <span className="text-sm font-medium">{t('average_system_grade')}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(data.averageGradeAcrossSystem)}`}>
                    {data.averageGradeAcrossSystem.toFixed(1)}%
                  </span>
                </div>
                <Progress value={data.averageGradeAcrossSystem} className="h-2" />
              </div>

              {/* Course Completion Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.courseCompletionRate)}
                    <span className="text-sm font-medium">{t('course_completion_rate')}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(data.courseCompletionRate)}`}>
                    {data.courseCompletionRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={data.courseCompletionRate} className="h-2" />
              </div>

              {/* User Engagement Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.userEngagementRate)}
                    <span className="text-sm font-medium">{t('user_engagement_rate')}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(data.userEngagementRate)}`}>
                    {data.userEngagementRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={data.userEngagementRate} className="h-2" />
              </div>

              {/* System Response Time */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('system_response_time')}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(data.systemResponseTime, true)}`}>
                    {data.systemResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        data.systemResponseTime <= 300 ? 'bg-green-500' :
                        data.systemResponseTime <= 500 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (data.systemResponseTime / 1000) * 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">1s</span>
                </div>
              </div>

              {/* Error Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(data.errorRate * 100, true)}
                    <span className="text-sm font-medium">{t('error_rate')}</span>
                  </div>
                  <span className={`text-sm font-semibold ${getStatusColor(data.errorRate * 100, true)}`}>
                    {(data.errorRate * 100).toFixed(2)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, data.errorRate * 1000)} 
                  className="h-2"
                />
              </div>
            </div>
          )}

          {/* Overall Health Score */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {((data.averageGradeAcrossSystem + data.courseCompletionRate + data.userEngagementRate) / 3).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">{t('overall_health_score')}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PerformanceMetricsChart