/**
 * Error logging utility for tracking and reporting errors
 */

export interface ErrorLogOptions {
  error: Error & { digest?: string };
  context?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log error to console and external services (can be extended with Sentry, LogRocket, etc.)
 */
export function logError({ error, context, metadata }: ErrorLogOptions): void {
  const isDev = process.env.NODE_ENV === 'development';

  // Always log to console in development
  if (isDev) {
    console.group(`❌ Error in ${context || 'Unknown Context'}`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    if (error.digest) {
      console.error('Digest:', error.digest);
    }
    if (metadata) {
      console.error('Metadata:', metadata);
    }
    console.groupEnd();
  }

  // In production, send to error tracking service
  // Example: Sentry, LogRocket, Datadog, etc.
  if (!isDev) {
    // Log basic info to console for server logs
    console.error(`[${context}] Error:`, error.message, error.digest);

    // TODO: Integrate with error tracking service
    // Example:
    // Sentry.captureException(error, {
    //   contexts: { custom: { context, metadata } },
    //   tags: { digest: error.digest }
    // });
  }
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  // Check for specific error types
  if (error.message.includes('ENOENT')) {
    return '파일을 찾을 수 없습니다.';
  }

  if (error.message.includes('EACCES')) {
    return '파일 접근 권한이 없습니다.';
  }

  if (error.message.includes('fetch')) {
    return '네트워크 연결에 문제가 있습니다.';
  }

  if (error.message.includes('timeout')) {
    return '요청 시간이 초과되었습니다.';
  }

  // Default message
  return '예상치 못한 오류가 발생했습니다.';
}
