'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, Award, Clock, Calendar, TrendingUp, Plus, ArrowRight, GraduationCap } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthManager } from '@/lib/auth'
import { apiClient } from '@/lib/api'
import { User, Course, Assignment } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = AuthManager.getUserData()
    setUser(userData)
  }, [])

  // Fetch user's courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiClient.getCourses({ limit: 6 }),
    enabled: !!user,
  })

  // Fetch user's assignments
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => apiClient.getAssignments({ limit: 5 }),
    enabled: !!user,
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleDisplayName = (roleId: number) => {
    const roleMap: { [key: number]: string } = {
      1: 'Student',
      2: 'Instructor',
      3: 'Administrator'
    }
    return roleMap[roleId] || 'User'
  }

  // Loading skeleton component
  const StatCardSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 w-4 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </CardContent>
    </Card>
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {getGreeting()}, {user.first_name || user.username}! 👋
            </h1>
            <p className="text-blue-100 text-sm md:text-base mb-4 md:mb-0">
              Welcome back to your learning dashboard. You're signed in as a {getRoleDisplayName(user.role_id)}.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <GraduationCap className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">
              {getRoleDisplayName(user.role_id)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Courses Card */}
        {coursesLoading ? (
          <StatCardSkeleton />
        ) : (
          <Card className="hover:shadow-md transition-shadow duration-200 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Courses</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {coursesData?.pagination.total_items || 0}
              </div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Available courses
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assignments Card */}
        {assignmentsLoading ? (
          <StatCardSkeleton />
        ) : (
          <Card className="hover:shadow-md transition-shadow duration-200 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Assignments</CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {assignmentsData?.pagination.total_items || 0}
              </div>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                Total assignments
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Card */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Progress</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">75%</div>
            <div className="flex items-center mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Completion rate
            </p>
          </CardContent>
        </Card>

        {/* Achievements Card */}
        <Card className="hover:shadow-md transition-shadow duration-200 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Achievements</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
              Certificates earned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Recent Courses</span>
                </CardTitle>
                <CardDescription>
                  Your latest course activities
                </CardDescription>
              </div>
              {coursesData?.data.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {coursesData.pagination.total_items} total
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : coursesData?.data.length ? (
              <div className="space-y-4">
                {coursesData.data.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">{course.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs text-blue-600 font-medium">View Course</span>
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4 group">
                  <span>View All Courses</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-xs text-gray-500 mb-4">Start your learning journey by browsing available courses</p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Upcoming Assignments</span>
                </CardTitle>
                <CardDescription>
                  Don't miss these deadlines
                </CardDescription>
              </div>
              {assignmentsData?.data.length > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {assignmentsData.pagination.total_items} total
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : assignmentsData?.data.length ? (
              <div className="space-y-4">
                {assignmentsData.data.slice(0, 3).map((assignment) => {
                  const dueDate = new Date(assignment.due_date)
                  const isOverdue = dueDate < new Date()
                  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                  
                  return (
                    <div key={assignment.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isOverdue ? 'bg-red-100' : daysUntilDue <= 3 ? 'bg-yellow-100' : 'bg-orange-100'
                      }`}>
                        <Calendar className={`h-5 w-5 ${
                          isOverdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{assignment.title}</h4>
                        <p className={`text-xs mt-1 ${
                          isOverdue ? 'text-red-600' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          {isOverdue ? 'Overdue' : daysUntilDue === 0 ? 'Due today' : daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${daysUntilDue} days`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {dueDate.toLocaleDateString()}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs text-orange-600 font-medium">View Assignment</span>
                          <ArrowRight className="h-3 w-3 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  )
                })}
                <Button variant="outline" size="sm" className="w-full mt-4 group">
                  <span>View All Assignments</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No assignments due</h3>
                <p className="text-xs text-gray-500 mb-4">You're all caught up! Check back later for new assignments</p>
                <Button size="sm" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Common tasks you might want to do
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium">Browse Courses</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium">View Assignments</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2 hover:bg-green-50 hover:border-green-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium">Edit Profile</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2 hover:bg-purple-50 hover:border-purple-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium">Achievements</span>
            </Button>
          </div>
          
          {/* Additional Actions for Admins */}
          {user && AuthManager.hasRole('admin') && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                Administrator Actions
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="justify-start hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4 text-purple-600" />
                  Add Course
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="justify-start hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
                >
                  <Users className="mr-2 h-4 w-4 text-purple-600" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="justify-start hover:bg-purple-50 hover:border-purple-200 transition-all duration-200"
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-purple-600" />
                  View Reports
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
