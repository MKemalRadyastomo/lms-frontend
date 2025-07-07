"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NavigationDebug } from "@/components/debug/NavigationDebug";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";
import { AuthManager } from "@/lib/auth";
import { User } from "@/types";

interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalAssignments: number;
  recentActivity: number;
}

interface RecentActivity {
  id: string;
  type: "course" | "assignment" | "submission";
  title: string;
  description: string;
  time: string;
  status?: "pending" | "completed" | "overdue";
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const userId = AuthManager.getUserId();

  useEffect(() => {
    // Get current user data inside useEffect to avoid dependency issues
    const currentUser = AuthManager.getUserData();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []); // Empty dependency array - only run once on mount

  const userRoleInfo = useMemo(() => {
    if (!user) return { isAdmin: false, isInstructor: false, isStudent: false };

    const roleId = user.role_id;
    return {
      isAdmin: roleId === 3,
      isInstructor: roleId === 2,
      isStudent: roleId === 1,
    };
  }, [user?.role_id]);

  const { isAdmin, isInstructor, isStudent } = userRoleInfo;

  // Real data fetching
  const { data: userData } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.getUserById(userId!),
    enabled: !!userId && !user, // Changed from !currentUser to !user
  });

  const { data: dashboardStats, isLoading: isStatsLoading } = useQuery<{
    totalUsers: number;
    totalCourses: number;
    totalAssignments: number;
    recentActivity: number;
  }>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
  });

  const { data: userStats } = useQuery({
    queryKey: ["user-stats", userId],
    queryFn: () => apiClient.getUserStats(userId!),
    enabled: !!userId && isStudent,
    staleTime: 5 * 60 * 1000,
  });

  // Real stats from API with proper type safety
  const stats: DashboardStats = {
    totalCourses: dashboardStats?.totalCourses ?? 0,
    totalUsers: dashboardStats?.totalUsers ?? 0,
    totalAssignments: dashboardStats?.totalAssignments ?? 0,
    recentActivity: dashboardStats?.recentActivity ?? 0,
  };

  // Loading state for stats
  if (isStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border animate-pulse"
            >
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentActivity: RecentActivity[] = [];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Navigation Test */}
      {process.env.NODE_ENV === "development" && <NavigationDebug />}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.first_name || user.username}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              {isAdmin && "Manage your learning platform from here."}
              {isInstructor && "Track your courses and student progress."}
              {isStudent && "Continue your learning journey."}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isStudent ? "Enrolled Courses" : "Total Courses"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCourses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {(isAdmin || isInstructor) && (
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {isAdmin ? "Total Users" : "Students"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isStudent ? "Assignments" : "Total Assignments"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAssignments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isStudent ? "Completion Rate" : "Activity"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isStudent
                    ? `${userStats?.completionRate || 0}%`
                    : stats.recentActivity}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Stay updated with your latest activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div
                    className={`
                    w-2 h-2 rounded-full mt-2 flex-shrink-0
                    ${
                      activity.status === "pending"
                        ? "bg-yellow-500"
                        : activity.status === "overdue"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }
                  `}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    {activity.status && (
                      <span
                        className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2
                        ${
                          activity.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : activity.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      `}
                      >
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStudent && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Jelajahi Kursus
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Lihat Tugas
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Cek Jadwal
                </Button>
              </>
            )}

            {isInstructor && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Buat Kursus
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Tugas Baru
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Lihat Siswa
                </Button>
              </>
            )}

            {isAdmin && (
              <>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Kelola Pengguna
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Kelola Kursus
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Lihat Analitik
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines - Student View */}
      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
            <CardDescription>Don't miss these important dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <h4 className="font-medium text-red-900">
                    Essay on World War II
                  </h4>
                  <p className="text-sm text-red-700">
                    History 101 - Due in 2 days
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-100"
                >
                  View
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <h4 className="font-medium text-yellow-900">
                    JavaScript Quiz
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Programming 101 - Due in 5 days
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
