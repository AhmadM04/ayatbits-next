/**
 * Security-specific logging utilities
 * Tracks authentication failures, rate limiting, and suspicious activities
 */

import { logger } from './logger';

export enum SecurityEventType {
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  WEBHOOK_SIGNATURE_FAILURE = 'WEBHOOK_SIGNATURE_FAILURE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ADMIN_ACTION = 'ADMIN_ACTION',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  INVALID_INPUT = 'INVALID_INPUT',
}

interface SecurityEventMetadata {
  userId?: string;
  email?: string;
  ip?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  [key: string]: any;
}

class SecurityLogger {
  logAuthFailure(metadata: SecurityEventMetadata): void {
    logger.warn('Authentication failed', {
      event: SecurityEventType.AUTH_FAILURE,
      ...metadata,
    });
  }

  logAuthSuccess(metadata: SecurityEventMetadata): void {
    logger.info('Authentication successful', {
      event: SecurityEventType.AUTH_SUCCESS,
      ...metadata,
    });
  }

  logRateLimitExceeded(metadata: SecurityEventMetadata): void {
    logger.warn('Rate limit exceeded', {
      event: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ...metadata,
    });
  }

  logWebhookSignatureFailure(metadata: SecurityEventMetadata): void {
    logger.error('Webhook signature verification failed', undefined, {
      event: SecurityEventType.WEBHOOK_SIGNATURE_FAILURE,
      ...metadata,
    });
  }

  logSuspiciousActivity(message: string, metadata: SecurityEventMetadata): void {
    logger.warn(`Suspicious activity: ${message}`, {
      event: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ...metadata,
    });
  }

  logAdminAction(action: string, metadata: SecurityEventMetadata): void {
    logger.info(`Admin action: ${action}`, {
      event: SecurityEventType.ADMIN_ACTION,
      ...metadata,
    });
  }

  logUnauthorizedAccess(metadata: SecurityEventMetadata): void {
    logger.warn('Unauthorized access attempt', {
      event: SecurityEventType.UNAUTHORIZED_ACCESS_ATTEMPT,
      ...metadata,
    });
  }

  logInvalidInput(message: string, metadata: SecurityEventMetadata): void {
    logger.warn(`Invalid input: ${message}`, {
      event: SecurityEventType.INVALID_INPUT,
      ...metadata,
    });
  }

  // Helper to detect repeated failures from same IP/user
  private failureTracking = new Map<string, number>();

  trackFailedAttempt(identifier: string): boolean {
    const count = (this.failureTracking.get(identifier) || 0) + 1;
    this.failureTracking.set(identifier, count);

    // Clear after 1 hour
    setTimeout(() => {
      this.failureTracking.delete(identifier);
    }, 3600000);

    // Flag as suspicious after 5 failures
    return count >= 5;
  }
}

export const securityLogger = new SecurityLogger();


