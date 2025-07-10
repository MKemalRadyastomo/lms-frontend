"use client";

import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
// Note: Import toast in components that use this hook if needed

// Utility function to truncate text at word boundaries
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Find the last space before the maximum length
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // If there's a space, cut at that point, otherwise use the max length
  const cutPoint = lastSpaceIndex > maxLength * 0.7 ? lastSpaceIndex : maxLength;
  
  return text.substring(0, cutPoint).trim() + '...';
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
  isLoading?: boolean;
  fullLabel?: string; // Original full text for tooltips
}

export function useBreadcrumb(): BreadcrumbItem[] {
  const pathname = usePathname();
  const { t } = useTranslation();

  const pathSegments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  // Find dynamic segments that need data fetching
  const dynamicSegments = useMemo(() => {
    const segments = [];
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const previousSegment = pathSegments[i - 1];

      if (segment.match(/^\d+$/)) {
        segments.push({
          segment,
          previousSegment,
          index: i,
        });
      }
    }
    return segments;
  }, [pathSegments]);

  // Fetch course data if needed
  const courseIds = dynamicSegments
    .filter((d) => d.previousSegment === "courses")
    .map((d) => parseInt(d.segment));

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", courseIds],
    queryFn: async () => {
      const courses = await Promise.all(
        courseIds.map(async (id) => {
          try {
            const course = await apiClient.getCourseById(id);
            return { id, name: course?.name ?? `Course ${id}` };
          } catch (error) {
            // Keep console.error for debugging, handle gracefully
            console.error(`Failed to fetch course ${id}:`, error);
            return { id, name: `Course ${id}` };
          }
        })
      );
      return courses.reduce((acc, course) => {
        acc[course.id] = course.name;
        return acc;
      }, {} as Record<number, string>);
    },
    enabled: courseIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch assignment data if needed
  const assignmentIds = dynamicSegments
    .filter((d) => d.previousSegment === "assignments")
    .map((d) => parseInt(d.segment));

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", assignmentIds],
    queryFn: async () => {
      // Find courseId for each assignmentId by looking back in the pathSegments
      const assignments = await Promise.all(
        assignmentIds.map(async (id) => {
          // Find the index of this assignment segment
          const assignmentIndex = pathSegments.findIndex(
            (seg, idx) =>
              seg === id.toString() && pathSegments[idx - 1] === "assignments"
          );
          // Find the nearest "courses" segment before this assignment
          let courseId: number | undefined = undefined;
          for (let j = assignmentIndex - 1; j >= 0; j--) {
            if (
              pathSegments[j] === "courses" &&
              pathSegments[j + 1]?.match(/^\d+$/)
            ) {
              courseId = parseInt(pathSegments[j + 1]);
              break;
            }
          }
          try {
            if (courseId !== undefined) {
              const assignment = await apiClient.getAssignmentById(
                courseId,
                id
              );
              return { id, title: assignment.title };
            } else {
              return { id, title: `Assignment ${id}` };
            }
          } catch (error) {
            // Keep console.error for debugging, handle gracefully
            console.error(`Failed to fetch assignment ${id}:`, error);
            return { id, title: `Assignment ${id}` };
          }
        })
      );
      return assignments.reduce((acc, assignment) => {
        acc[assignment.id] = assignment.title;
        return acc;
      }, {} as Record<number, string>);
    },
    enabled: assignmentIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user data if needed
  const userIds = dynamicSegments
    .filter((d) => d.previousSegment === "users")
    .map((d) => parseInt(d.segment));

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", userIds],
    queryFn: async () => {
      const users = await Promise.all(
        userIds.map(async (id) => {
          try {
            const user = await apiClient.getUserById(id);
            const name =
              user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username;
            return { id, name };
          } catch (error) {
            // Keep console.error for debugging, handle gracefully
            console.error(`Failed to fetch user ${id}:`, error);
            return { id, name: `User ${id}` };
          }
        })
      );
      return users.reduce((acc, user) => {
        acc[user.id] = user.name;
        return acc;
      }, {} as Record<number, string>);
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [];

    // Always add home/dashboard as first item
    items.push({
      label: t("dashboard"),
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    });

    // Handle different route patterns
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const href = "/" + pathSegments.slice(0, i + 1).join("/");
      const isActive = href === pathname;

      // Skip dashboard since it's already added
      if (segment === "dashboard") continue;

      switch (segment) {
        case "courses":
          items.push({
            label: t("courses"),
            href: "/courses",
            isActive: isActive,
          });
          break;

        case "assignments":
          items.push({
            label: t("assignments"),
            href: "/assignments",
            isActive: isActive,
          });
          break;

        case "users":
          items.push({
            label: t("users"),
            href: "/users",
            isActive: isActive,
          });
          break;

        case "profile":
          items.push({
            label: t("profile"),
            href: "/profile",
            isActive: isActive,
          });
          break;

        case "analytics":
          items.push({
            label: t("analytics"),
            href: "/analytics",
            isActive: isActive,
          });
          break;

        case "new":
          items.push({
            label: t("new"),
            href: href,
            isActive: isActive,
          });
          break;

        case "edit":
          items.push({
            label: t("edit"),
            href: href,
            isActive: isActive,
          });
          break;

        case "create":
          items.push({
            label: t("create"),
            href: href,
            isActive: isActive,
          });
          break;

        case "settings":
          items.push({
            label: t("settings"),
            href: href,
            isActive: isActive,
          });
          break;

        default:
          // Handle dynamic segments (IDs, etc.)
          if (segment.match(/^\d+$/)) {
            const previousSegment = pathSegments[i - 1];
            const id = parseInt(segment);

            if (previousSegment === "courses") {
              const courseName = coursesData?.[id] || t("course_detail");
              // Truncate long course names for breadcrumbs
              const truncatedName = truncateText(courseName, 25);
              
              items.push({
                label: truncatedName,
                href: href,
                isActive: isActive,
                isLoading: coursesLoading,
                fullLabel: courseName !== truncatedName ? courseName : undefined,
              });
            } else if (previousSegment === "assignments") {
              const assignmentTitle = assignmentsData?.[id] || t("assignment_detail");
              // Truncate long assignment titles for breadcrumbs
              const truncatedTitle = truncateText(assignmentTitle, 30);
              
              items.push({
                label: truncatedTitle,
                href: href,
                isActive: isActive,
                isLoading: assignmentsLoading,
                fullLabel: assignmentTitle !== truncatedTitle ? assignmentTitle : undefined,
              });
            } else if (previousSegment === "users") {
              const userName = usersData?.[id] || t("user_detail");
              // Truncate long user names for breadcrumbs
              const truncatedUserName = truncateText(userName, 20);
              
              items.push({
                label: truncatedUserName,
                href: href,
                isActive: isActive,
                isLoading: usersLoading,
                fullLabel: userName !== truncatedUserName ? userName : undefined,
              });
            } else {
              items.push({
                label: t("detail"),
                href: href,
                isActive: isActive,
              });
            }
          } else {
            // Try to get translation for the segment, fallback to capitalized version
            const translationKey = segment.toLowerCase();
            const translatedLabel = t(translationKey);

            // Check if translation exists (if it's different from key or doesn't include key)
            const label =
              translatedLabel !== translationKey &&
              !translatedLabel.includes(translationKey)
                ? translatedLabel
                : segment.charAt(0).toUpperCase() + segment.slice(1);

            items.push({
              label: label,
              href: href,
              isActive: isActive,
            });
          }
          break;
      }
    }

    return items;
  }, [
    pathname,
    pathSegments,
    t,
    coursesData,
    coursesLoading,
    assignmentsData,
    assignmentsLoading,
    usersData,
    usersLoading,
  ]);

  return breadcrumbs;
}

// Hook for custom breadcrumb items (for complex scenarios)
export function useCustomBreadcrumb(
  customItems: BreadcrumbItem[]
): BreadcrumbItem[] {
  const defaultBreadcrumbs = useBreadcrumb();

  return useMemo(() => {
    // Replace the last item with custom items, or append them
    const items = [...defaultBreadcrumbs];
    if (customItems.length > 0) {
      // Remove the last item if it's the current page
      if (items.length > 0 && items[items.length - 1].isActive) {
        items.pop();
      }
      items.push(...customItems);
    }
    return items;
  }, [defaultBreadcrumbs, customItems]);
}
