'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development, could send to error tracking service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          {error.digest && (
            <p className="text-gray-600 text-xs mt-2">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-xl text-left">
          <p className="text-gray-400 text-xs mb-2">Troubleshooting tips:</p>
          <ul className="text-gray-500 text-xs space-y-1">
            <li>• Check your internet connection</li>
            <li>• Clear your browser cache</li>
            <li>• Try refreshing the page</li>
            <li>• If the problem persists, contact support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


