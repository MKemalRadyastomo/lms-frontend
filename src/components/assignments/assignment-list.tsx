"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Assignment, AssignmentFilters, Course } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { isPast } from "date-fns";
import {
  AlertCircle,
  Clock,
  FileText,
  HelpCircle,
  Plus,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AssignmentCard } from "./assignment-card";

interface AssignmentListProps {
  filters: AssignmentFilters;
  userRole?: number;
  userId?: number;
  courses: Course[];
}

export function AssignmentList({
  filters,
  userRole,
  userId,
  courses,
}: AssignmentListProps) {
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  console.log("AssignmentList: Received props", { filters, userRole, userId, courses }); // Debug log

  // Get assignments from all relevant courses
  const {
    data: assignmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allAssignments", filters, userRole, userId],
    queryFn: async () => {
      console.log("AssignmentList: Fetching assignments..."); // Debug log
      if (!courses.length) {
        console.log("AssignmentList: No courses available, returning empty array."); // Debug log
        return [];
      }

      setLoading(true);
      const assignments: Assignment[] = [];

      // Determine which courses to fetch from based on user role
      const relevantCourses =
        userRole === 1
          ? courses.filter((course) => course.privacy === "public") // Students see public courses
          : userRole === 2
          ? courses.filter((course) => course.teacher_id === userId) // Teachers see their courses
          : courses; // Admins see all courses

      console.log("AssignmentList: Relevant courses", relevantCourses); // Debug log

      // Apply course filter if specified
      const coursesToFetch = filters.course_id
        ? relevantCourses.filter((course) => course.id === filters.course_id)
        : relevantCourses;

      console.log("AssignmentList: Courses to fetch", coursesToFetch); // Debug log

      // Fetch assignments from each course
      for (const course of coursesToFetch) {
        try {
          console.log(`AssignmentList: Fetching assignments for course ${course.id}`); // Debug log
          const response = await apiClient.getCourseAssignments(course.id);
          console.log(`AssignmentList: Received assignments for course ${course.id}:`, response.data); // Debug log
          const courseAssignments = response.data.map((assignment) => ({
            ...assignment,
            course_name: course.name,
            teacher_name: course.teacher_name,
          }));
          assignments.push(...courseAssignments);
        } catch (error) {
          console.error(
            `AssignmentList: Error fetching assignments for course ${course.id}:`,
            error
          );
        }
      }

      setLoading(false);
      console.log("AssignmentList: All assignments fetched", assignments); // Debug log
      return assignments;
    },
    enabled: courses.length > 0,
  });

  console.log("AssignmentList: assignmentsData from useQuery", assignmentsData); // Debug log

  // Filter assignments based on the current filters
  const filteredAssignments = (assignmentsData || []).filter((assignment) => {
    console.log("AssignmentList: Filtering assignment", assignment); // Debug log
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !assignment.title.toLowerCase().includes(searchLower) &&
        !assignment.description?.toLowerCase().includes(searchLower)
      ) {
        console.log("AssignmentList: Filtered out by search"); // Debug log
        return false;
      }
    }

    // Type filter
    if (filters.type && assignment.type !== filters.type) {
      console.log("AssignmentList: Filtered out by type"); // Debug log
      return false;
    }

    // Status filter (for students)
    if (filters.status) {
      const now = new Date();
      const dueDate = new Date(assignment.due_date);

      switch (filters.status) {
        case "pending":
          // No submission and not overdue
          console.log("AssignmentList: Filtering by pending"); // Debug log
          return !isPast(dueDate);
        case "overdue":
          // No submission and past due date
          console.log("AssignmentList: Filtering by overdue"); // Debug log
          return isPast(dueDate);
        case "submitted":
        case "graded":
          // These would need submission data - for now, return false
          console.log("AssignmentList: Filtering by submitted/graded (not yet implemented)"); // Debug log
          return false;
        default:
          return true;
      }
    }

    // Due date filters
    if (filters.due_date_after) {
      const filterDate = new Date(filters.due_date_after);
      const assignmentDate = new Date(assignment.due_date);
      if (assignmentDate < filterDate) {
        console.log("AssignmentList: Filtered out by due_date_after"); // Debug log
        return false;
      }
    }

    if (filters.due_date_before) {
      const filterDate = new Date(filters.due_date_before);
      const assignmentDate = new Date(assignment.due_date);
      if (assignmentDate > filterDate) {
        console.log("AssignmentList: Filtered out by due_date_before"); // Debug log
        return false;
      }
    }

    console.log("AssignmentList: Assignment passed filters"); // Debug log
    return true;
  });

  console.log("AssignmentList: Filtered assignments", filteredAssignments); // Debug log

  // Group assignments by status for better organization
  const groupedAssignments = {
    upcoming: filteredAssignments.filter((a) => !isPast(new Date(a.due_date))),
    overdue: filteredAssignments.filter((a) => isPast(new Date(a.due_date))),
  };

  console.log("AssignmentList: Grouped assignments", groupedAssignments); // Debug log

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "essay":
        return <FileText className="w-4 h-4" />;
      case "file_upload":
        return <Upload className="w-4 h-4" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "essay":
        return "Esai";
      case "file_upload":
        return "Upload File";
      case "quiz":
        return "Kuis";
      default:
        return type;
    }
  };

  if (isLoading || loading) {
    console.log("AssignmentList: Loading state..."); // Debug log
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("AssignmentList: Error fetching assignments", error); // Debug log
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Terjadi kesalahan saat memuat tugas</p>
            <Button
              onClick={() => refetch()}
              className="mt-2"
              variant="outline"
            >
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredAssignments.length === 0) {
    console.log("AssignmentList: No filtered assignments."); // Debug log
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Tidak ada tugas ditemukan
            </h3>
            <p className="mb-4">
              {filters.search || filters.course_id || filters.type
                ? "Coba ubah filter pencarian Anda"
                : userRole === 2
                ? "Belum ada tugas yang dibuat. Buat tugas pertama Anda!"
                : "Belum ada tugas yang tersedia"}
            </p>

            {userRole === 2 && courses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Pilih kursus untuk membuat tugas:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {courses
                    .filter((course) => course.teacher_id === userId)
                    .map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}/assignments/create`}
                      >
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          {course.name}
                        </Button>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("AssignmentList: Rendering assignments."); // Debug log
  return (
    <div className="space-y-6">
      {/* Upcoming Assignments */}
      {groupedAssignments.upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Tugas Mendatang</h3>
            <Badge variant="secondary">
              {groupedAssignments.upcoming.length}
            </Badge>
          </div>
          <div className="grid gap-4">
            {groupedAssignments.upcoming.map((assignment) => (
              <AssignmentCard
                key={`${assignment.course_id}-${assignment.id}`}
                assignment={assignment}
                userRole={userRole}
                userId={userId}
                showCourse={!filters.course_id} // Show course name if not filtering by specific course
              />
            ))}
          </div>
        </div>
      )}

      {/* Overdue Assignments */}
      {groupedAssignments.overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">
              Tugas Terlambat
            </h3>
            <Badge variant="destructive">
              {groupedAssignments.overdue.length}
            </Badge>
          </div>
          <div className="grid gap-4">
            {groupedAssignments.overdue.map((assignment) => (
              <AssignmentCard
                key={`${assignment.course_id}-${assignment.id}`}
                assignment={assignment}
                userRole={userRole}
                userId={userId}
                showCourse={!filters.course_id}
                isOverdue={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        <span>
          Menampilkan {filteredAssignments.length} tugas
          {filters.search && ` untuk "${filters.search}"`}
        </span>

        {userRole === 2 && (
          <div className="flex gap-2">
            {courses
              .filter((course) => course.teacher_id === userId)
              .slice(0, 3)
              .map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}/assignments/create`}
                >
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Buat Tugas
                  </Button>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}