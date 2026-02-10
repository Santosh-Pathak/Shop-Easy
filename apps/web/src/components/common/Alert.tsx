import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'default',
  className = '',
}) => (
  <div
    role="alert"
    className={`
      relative w-full rounded-lg border p-4 
      ${
        variant === 'destructive'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-gray-200 bg-background text-foreground'
      } 
      ${className}
    `}
  >
    {children}
  </div>
);

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = '',
}) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
);
