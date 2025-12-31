import { cn } from '../../lib/utils';

export function Spinner({ className, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <svg
      className={cn('animate-spin text-blue-600', sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function LoadingPage() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingOverlay({ message = 'Processing...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-xl bg-white p-6 shadow-xl">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
      </div>
    </div>
  );
}
