import { AlertCircle } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

import { Alert, AlertDescription } from './Alert';

interface ErrorComponentProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  error,
  onRetry,
  className = 'mb-6',
}) => (
  <Alert variant="destructive" className={className}>
    <AlertCircle className="size-4" />
    <AlertDescription className="flex items-center justify-between">
      <span>{error}</span>
      <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
        Retry
      </Button>
    </AlertDescription>
  </Alert>
);

// Simple error display without retry button
export const SimpleError: React.FC<{
  error: string;
  className?: string;
}> = ({ error, className = '' }) => (
  <Alert variant="destructive" className={className}>
    <AlertCircle className="size-4" />
    <AlertDescription>{error}</AlertDescription>
  </Alert>
);

// Generic error boundary fallback
export const ErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => (
  <div className="flex min-h-[400px] items-center justify-center">
    <div className="mx-auto max-w-md p-6 text-center">
      <AlertCircle className="mx-auto mb-4 size-12 text-red-500" />
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Something went wrong
      </h2>
      <p className="mb-4 text-gray-600">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={resetError} className="w-full">
        Try again
      </Button>
    </div>
  </div>
);
