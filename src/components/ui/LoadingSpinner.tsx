import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-primary border-r-primary border-b-transparent border-l-transparent",
          sizes[size]
        )}
      ></div>
    </div>
  );
};
