
import React from 'react';
import { Submission } from '@/types';
import { Badge } from '@/components/ui/badge';

interface SubmissionStatusProps {
  status: Submission['status'];
}

export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({ status }) => {
  const getBadgeVariant = () => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'graded':
        return 'success';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getBadgeVariant()}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
