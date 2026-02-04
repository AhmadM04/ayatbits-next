/**
 * Production-safe logging utility
 * 
 * In development: Pretty console logs with colors
 * In production: Structured JSON logs compatible with Vercel log drains
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogMetadata {
  userId?: string;
  requestId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatDevelopmentLog(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): void {
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString();

    console.log(
      `${colors[level]}[${level}]${reset} ${timestamp} - ${message}`,
      metadata ? metadata : ''
    );
  }

  private formatProductionLog(entry: LogEntry): void {
    // Structured JSON for production (Vercel compatible)
    console.log(JSON.stringify(entry));
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.isDevelopment) {
      this.formatDevelopmentLog(level, message, metadata);
      if (error) {
        console.error(error);
      }
    } else {
      this.formatProductionLog(entry);
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    // Only log debug in development
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, metadata);
    }
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  // Helper method for API route logging
  apiLog(options: {
    method: string;
    route: string;
    statusCode: number;
    userId?: string;
    duration?: number;
    message?: string;
  }): void {
    const level = options.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = options.message || `${options.method} ${options.route} - ${options.statusCode}`;
    
    this.log(level, message, {
      method: options.method,
      route: options.route,
      statusCode: options.statusCode,
      userId: options.userId,
      duration: options.duration,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export helper for timing operations
export function createRequestTimer() {
  const start = Date.now();
  return {
    end: () => Date.now() - start,
  };
}


