/**
 * API client with built-in error handling and network detection
 * Use this instead of raw fetch() for better error handling on mobile
 */

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Enhanced fetch with timeout and better error handling
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;

  // Check if we're online (browser only)
  if (typeof window !== 'undefined' && !navigator.onLine) {
    throw new NetworkError('No internet connection. Please check your network settings.');
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const errorMessage = 
        (errorData as { error?: string })?.error ||
        (errorData as { message?: string })?.message ||
        `Request failed with status ${response.status}`;

      throw new ApiError(errorMessage, response.status, errorData);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return {} as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timed out. Please try again.');
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Failed to connect to server. Please check your internet connection.');
    }

    // Re-throw our custom errors
    if (error instanceof NetworkError || error instanceof ApiError) {
      throw error;
    }

    // Wrap unknown errors
    throw new NetworkError(
      'An unexpected error occurred. Please try again.',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(
  url: string,
  data?: unknown,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  return apiFetch<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Hook-friendly wrapper that returns error info for toast display
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return error.message;
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}







