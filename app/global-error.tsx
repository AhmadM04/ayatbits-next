'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console, could send to error tracking service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Application Error</h1>
              <p className="text-gray-400 text-sm">
                A critical error occurred. Please try refreshing the page.
              </p>
              {error.digest && (
                <p className="text-gray-600 text-xs mt-2">Error ID: {error.digest}</p>
              )}
            </div>

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>

            <div className="mt-8 p-4 bg-white/5 rounded-xl text-left">
              <p className="text-gray-400 text-xs mb-2">If this keeps happening:</p>
              <ul className="text-gray-500 text-xs space-y-1">
                <li>• Clear your browser cache and cookies</li>
                <li>• Try a different browser</li>
                <li>• Check if JavaScript is enabled</li>
                <li>• Contact support at support@ayatbits.com</li>
              </ul>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


