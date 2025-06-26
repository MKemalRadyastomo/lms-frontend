
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AssignmentList } from '@/components/assignments/assignment-list'
import { AssignmentFilters } from '@/components/assignments/assignment-filters'
import { apiClient } from '@/lib/api'
import { Assignment, AssignmentFilters as IAssignmentFilters } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

export default function AssignmentsPage() {
  const [filters, setFilters] = useState<IAssignmentFilters>({})
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Get current user info to determine role
  const { data: userInfo, isLoading: isLoadingUserInfo } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const userId = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_id='))
        ?.split('=')[1]
      
      if (userId) {
        const user = await apiClient.getUserById(parseInt(userId))
        setCurrentUser(user)
        console.log("Fetched current user:", user); // Debug log
        return user
      }
      console.log("User ID not found in cookies."); // Debug log
      return null
    }
  })

  // Get user's courses to filter assignments
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiClient.getCourses({}),
    onSuccess: (data) => {
      console.log("Fetched courses data:", data); // Debug log
    },
    onError: (error) => {
      console.error("Error fetching courses:", error); // Debug log
    }
  })

  // Get assignment statistics
  const { data: assignmentStats, isLoading: statsLoading } = useQuery({
    queryKey: ['assignmentStats', currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !coursesData?.data) {
        console.log("Skipping assignment stats fetch: currentUser or coursesData missing.", { currentUser, coursesData }); // Debug log
        return null
      }
      
      // For students, get assignments from enrolled courses
      // For teachers, get assignments from their courses
      // For admins, get all assignments
      const allAssignments = await apiClient.getCourseAssignments(0, { // Assuming 0 or a special ID for all assignments
        // Add filters based on user role if needed
      });

      const completedAssignments = allAssignments.data.filter(a => a.status === 'graded').length;
      const totalAssignments = allAssignments.data.length;
      const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;

      console.log("Fetched assignment stats:", { completedAssignments, totalAssignments, completionRate }); // Debug log
      return {
        completedAssignments,
        totalAssignments,
        completionRate,
      };
    },
    enabled: !!currentUser && !!coursesData?.data, // Only enable if user and courses are loaded
  });

  console.log("Rendering AssignmentsPage with:", { filters, currentUser, coursesData }); // Debug log

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tugas</h2>

      <AssignmentFilters
        filters={filters}
        onFiltersChange={setFilters}
        courses={coursesData?.data || []}
        userRole={currentUser?.role_id}
      />

      {(isLoadingUserInfo || isLoadingCourses) ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <AssignmentList
          filters={filters}
          userRole={currentUser?.role_id}
          userId={currentUser?.id}
          courses={coursesData?.data || []}
        />
      )}
    </div>
  )
}
