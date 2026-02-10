import { Loader as LucideLoader } from 'lucide-react';

// Loader used inside buttons with optional text
interface ButtonLoaderProps {
  size?: number;
  color?: string;
  loadingText?: string;
}

export const ButtonLoader = ({
  size = 20,
  color = 'text-white',
  loadingText,
}: ButtonLoaderProps) => {
  return (
    <div className="flex items-center space-x-2">
      <LucideLoader className={`animate-spin ${color}`} size={size} />
      {loadingText && <span>{loadingText}</span>}
    </div>
  );
};

// Loader used for page-level loading with a message
interface PageLoaderProps {
  size?: number;
  message?: string;
  color?: string;
}

export const PageLoader = ({
  size = 50,
  message = 'Loading...',
  color = 'text-blue-500',
}: PageLoaderProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <LucideLoader className={`animate-spin ${color}`} size={size} />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

// Fullscreen loader, blocking the entire UI during long operations
interface FullScreenLoaderProps {
  size?: number;
  message?: string;
  color?: string;
}

export const FullScreenLoader = ({
  size = 60,
  message = 'Loading...',
  color = 'text-gray-600',
}: FullScreenLoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center space-y-4 bg-white/30 backdrop-blur-md">
      <LucideLoader className={`animate-spin ${color}`} size={size} />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
};
