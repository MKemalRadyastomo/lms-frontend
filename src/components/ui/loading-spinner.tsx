
import { Loader2 } from 'lucide-react';
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, className }) => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <Loader2 size={size} className={`animate-spin ${className}`} />
    </div>
  );
};
