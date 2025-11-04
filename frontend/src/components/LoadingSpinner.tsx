'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
        <div className="text-xl text-gray-700 mb-2">{message}</div>
        <div className="text-sm text-gray-500">
          If this takes too long, visit <a href="/debug" className="text-indigo-600 hover:underline">/debug</a> to check system status
        </div>
      </div>
    </div>
  );
}