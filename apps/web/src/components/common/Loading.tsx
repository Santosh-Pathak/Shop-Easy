import React from 'react';

import { cn } from '@/lib/utils';
// Loading skeleton component
export const LoadingSkeleton: React.FC = () => (
  <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-3">
    <div className="lg:col-span-1">
      <div className="h-96 rounded-lg bg-gray-200"></div>
    </div>
    <div className="lg:col-span-2">
      <div className="h-96 rounded-lg bg-gray-200"></div>
    </div>
  </div>
);

// Generic loading spinner
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

// Full page loading component
export const PageLoading: React.FC<{ message?: string }> = ({
  message = 'Loading...',
}) => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
}

const Skeleton = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  count = 1,
  ...props
}: SkeletonProps) => {
  const skeletonClasses = cn(
    'bg-gray-200 rounded-md dark:bg-gray-700',
    {
      'rounded-full': variant === 'circular',
      'rounded-none': variant === 'rectangular',
      'animate-pulse': animation === 'pulse',
      'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent':
        animation === 'wave',
    },
    className
  );

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={skeletonClasses}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : '1rem'),
        ...(variant === 'text' && { transform: 'scale(1, 0.6)' }),
      }}
      {...props}
    />
  ));

  if (count === 1) {
    return skeletons[0];
  }

  return <>{skeletons}</>;
};

// Container for grouped skeletons
interface SkeletonGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

const SkeletonGroup = ({ children, className, spacing = 'md' }: SkeletonGroupProps) => {
  return (
    <div
      className={cn('flex flex-col', {
        'space-y-2': spacing === 'sm',
        'space-y-4': spacing === 'md',
        'space-y-6': spacing === 'lg',
        className
      })}
    >
      {children}
    </div>
  );
};

// Specific skeleton components for common use cases
const CardSkeleton = () => (
  <div className="space-y-4 rounded-lg border p-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex justify-end pt-2">
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

const ProfileSkeleton = () => (
  <div className="flex items-center space-x-4">
    <Skeleton variant="circular" className="size-12" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-4">
    {/* Table header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-6 flex-1" />
      ))}
    </div>
    
    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export { CardSkeleton, ProfileSkeleton, Skeleton, SkeletonGroup, TableSkeleton };