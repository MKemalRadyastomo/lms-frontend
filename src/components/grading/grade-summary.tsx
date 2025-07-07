
import React from 'react';
import { Submission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GradeSummaryProps {
  submissions: Submission[];
}

export const GradeSummary: React.FC<GradeSummaryProps> = ({ submissions }) => {
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const averageGrade = gradedCount > 0
    ? submissions.reduce((acc, s) => acc + (s.grade || 0), 0) / gradedCount
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Submissions</span>
          <span>{submissions.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Graded Submissions</span>
          <span>{gradedCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Average Grade</span>
          <span>{averageGrade.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
