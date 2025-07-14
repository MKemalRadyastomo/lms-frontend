'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GradeDistribution } from '@/types/analytics'
import { useTranslation } from 'react-i18next'

interface GradeDistributionChartProps {
  data: GradeDistribution[]
  title?: string
  description?: string
  type?: 'bar' | 'pie'
  className?: string
}

const GRADE_COLORS = [
  '#22c55e', // Green for A (90-100)
  '#3b82f6', // Blue for B (80-89)
  '#f59e0b', // Yellow for C (70-79)
  '#ef4444', // Red for D (60-69)
  '#6b7280', // Gray for F (below 60)
]

export function GradeDistributionChart({ 
  data, 
  title, 
  description, 
  type = 'bar',
  className = ''
}: GradeDistributionChartProps) {
  const { t } = useTranslation()

  // Transform data for better visualization
  const chartData = data.map((item, index) => ({
    ...item,
    fill: GRADE_COLORS[index] || GRADE_COLORS[GRADE_COLORS.length - 1],
    label: item.range
  }))

  const renderTooltip = (active?: boolean, payload?: any[], label?: string) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${t('grade_range')}: ${data.range}`}</p>
          <p className="text-blue-600">{`${t('students')}: ${data.count}`}</p>
          <p className="text-gray-600">{`${t('percentage')}: ${data.percentage.toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="range" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: t('number_of_students'), angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={({ active, payload, label }) => renderTooltip(active, payload, label)} />
        <Bar 
          dataKey="count" 
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ range, percentage }) => `${range} (${percentage.toFixed(1)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={({ active, payload }) => renderTooltip(active, payload, '')} />
      </PieChart>
    </ResponsiveContainer>
  )

  const totalStudents = data.reduce((sum, item) => sum + item.count, 0)
  const averageGrade = data.reduce((sum, item) => {
    // Estimate grade from range (rough calculation)
    const rangeStart = parseInt(item.range.split('-')[0]) || 0
    const rangeEnd = parseInt(item.range.split('-')[1]) || rangeStart + 10
    const midpoint = (rangeStart + rangeEnd) / 2
    return sum + (midpoint * item.count)
  }, 0) / totalStudents

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title || t('grade_distribution')}
          <div className="text-sm font-normal text-gray-500">
            {t('total_students')}: {totalStudents}
          </div>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {averageGrade.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">{t('estimated_average')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalStudents}
              </div>
              <div className="text-sm text-gray-600">{t('total_students')}</div>
            </div>
          </div>

          {/* Chart */}
          {type === 'bar' ? renderBarChart() : renderPieChart()}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            {chartData.map((item, index) => (
              <div key={item.range} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-gray-600">
                  {item.range} ({item.count} {t('students')})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GradeDistributionChart