'use client'

import Link from 'next/link'
import { ChevronRight, Loader2 } from 'lucide-react'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { useBreadcrumb, BreadcrumbItem as BreadcrumbItemType } from '@/hooks/useBreadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

interface DynamicBreadcrumbProps {
  customItems?: BreadcrumbItemType[]
  className?: string
}

export function DynamicBreadcrumb({ customItems, className }: DynamicBreadcrumbProps) {
  const defaultBreadcrumbs = useBreadcrumb()
  
  // Use custom items if provided, otherwise use default
  const breadcrumbs = customItems || defaultBreadcrumbs
  
  if (breadcrumbs.length <= 1) {
    return null // Don't show breadcrumb if only one item
  }

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem key={item.href}>
            {item.isActive ? (
              <BreadcrumbPage>
                {item.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ) : (
                  item.label
                )}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={item.href}>
                  {item.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ) : (
                    item.label
                  )}
                </Link>
              </BreadcrumbLink>
            )}
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

// Specific breadcrumb components for common patterns (deprecated - use dynamic breadcrumbs instead)
export function CourseBreadcrumb({ courseId, courseName }: { courseId: string, courseName?: string }) {
  console.warn('CourseBreadcrumb is deprecated, use DynamicBreadcrumb instead')
  return <DynamicBreadcrumb />
}

export function AssignmentBreadcrumb({ 
  courseId, 
  courseName, 
  assignmentId, 
  assignmentTitle 
}: { 
  courseId: string
  courseName?: string
  assignmentId: string
  assignmentTitle?: string
}) {
  console.warn('AssignmentBreadcrumb is deprecated, use DynamicBreadcrumb instead')
  return <DynamicBreadcrumb />
}

export function UserBreadcrumb({ userId, userName }: { userId: string, userName?: string }) {
  console.warn('UserBreadcrumb is deprecated, use DynamicBreadcrumb instead')
  return <DynamicBreadcrumb />
}
