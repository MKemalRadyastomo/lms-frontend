
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = Number(params.courseId);

  const { data: course, isLoading, isError, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => apiClient.getCourseById(courseId),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!course) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Course not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{course.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Code: {course.code}</p>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground mb-4">{course.description}</p>
          <p className="text-sm font-medium">Teacher: {course.teacher_name}</p>
          <p className="text-sm font-medium">Privacy: {course.privacy}</p>

          <div className="mt-6">
            <Link href={`/courses/${courseId}/assignments`} passHref>
              <Button>View Assignments</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetailPage;
