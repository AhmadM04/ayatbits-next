'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * 
 * Catches React errors in child components and displays a fallback UI
 * instead of crashing the entire application.
 * 
 * Usage:
 * <ErrorBoundary fallback={<StartReadingButton />}>
 *   <ComponentThatMightCrash />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    // You could also log to an error reporting service here
    // e.g., Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI or default
      return this.props.fallback || <DefaultErrorFallback />;
    }

    return this.props.children;
  }
}

/**
 * Default fallback UI shown when an error occurs
 */
function DefaultErrorFallback() {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl">
      <p className="text-sm text-red-800 dark:text-red-400 mb-2">
        Something went wrong. Please refresh the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
}

/**
 * Start Reading Button - Fallback for Continue Learning button
 */
export function StartReadingButton() {
  return (
    <Link
      href="/dashboard/juz/1/surah/1?ayah=1"
      className="relative -mt-8 flex-shrink-0"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" />
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[60px] sm:max-w-none">
        <span className="text-[8px] sm:text-[10px] text-[#8E7F71] dark:text-gray-500 block text-center truncate">
          Start
        </span>
      </div>
    </Link>
  );
}

