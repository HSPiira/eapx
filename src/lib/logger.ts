type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
  stack?: string;
}

class Logger {
  private context: Record<string, unknown> = {};
  private userId?: string;
  private requestId?: string;

  constructor(defaultContext?: Record<string, unknown>) {
    this.context = defaultContext || {};
  }

  /**
   * Creates a new logger instance with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger({ ...this.context, ...context });
    childLogger.userId = this.userId;
    childLogger.requestId = this.requestId;
    return childLogger;
  }

  /**
   * Sets the user ID for all subsequent logs
   */
  setUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  /**
   * Sets the request ID for all subsequent logs
   */
  setRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  /**
   * Logs a debug message (development only)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  }

  /**
   * Logs an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Logs a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Logs an error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const logContext = { ...context };
    
    if (error instanceof Error) {
      logContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      logContext.error = error;
    }

    this.log('error', message, logContext, error instanceof Error ? error.stack : undefined);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    stack?: string
  ): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...context },
      userId: this.userId,
      requestId: this.requestId,
      stack,
    };

    // In development, use console for better formatting
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(logEntry);
    } else {
      // In production, output structured JSON logs
      this.structuredLog(logEntry);
    }
  }

  /**
   * Console logging for development
   */
  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
    const suffix = entry.userId ? ` (User: ${entry.userId})` : '';
    
    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix}${suffix}:`, entry.message, entry.context);
        break;
      case 'info':
        console.info(`${prefix}${suffix}:`, entry.message, entry.context);
        break;
      case 'warn':
        console.warn(`${prefix}${suffix}:`, entry.message, entry.context);
        break;
      case 'error':
        console.error(`${prefix}${suffix}:`, entry.message, entry.context);
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  /**
   * Structured logging for production
   */
  private structuredLog(entry: LogEntry): void {
    // Remove undefined values to keep logs clean
    const cleanEntry = JSON.parse(JSON.stringify(entry));
    console.log(JSON.stringify(cleanEntry));
  }
}

// Security logging helpers
class SecurityLogger extends Logger {
  constructor() {
    super({ module: 'security' });
  }

  loginAttempt(email: string, success: boolean, ip?: string): void {
    this.info('Login attempt', {
      email,
      success,
      ip,
      event: 'login_attempt',
    });
  }

  loginSuccess(userId: string, email: string, ip?: string): void {
    this.info('Successful login', {
      userId,
      email,
      ip,
      event: 'login_success',
    });
  }

  loginFailure(email: string, reason: string, ip?: string): void {
    this.warn('Failed login', {
      email,
      reason,
      ip,
      event: 'login_failure',
    });
  }

  logout(userId: string, email: string): void {
    this.info('User logout', {
      userId,
      email,
      event: 'logout',
    });
  }

  suspiciousActivity(description: string, userId?: string, ip?: string): void {
    this.warn('Suspicious activity detected', {
      description,
      userId,
      ip,
      event: 'suspicious_activity',
    });
  }

  accessDenied(userId: string, resource: string, action: string): void {
    this.warn('Access denied', {
      userId,
      resource,
      action,
      event: 'access_denied',
    });
  }
}

// API logging helpers
class ApiLogger extends Logger {
  constructor() {
    super({ module: 'api' });
  }

  requestStart(method: string, path: string, userId?: string): void {
    this.debug('API request started', {
      method,
      path,
      userId,
      event: 'request_start',
    });
  }

  requestEnd(method: string, path: string, status: number, duration: number): void {
    this.info('API request completed', {
      method,
      path,
      status,
      duration,
      event: 'request_end',
    });
  }

  requestError(method: string, path: string, error: Error, userId?: string): void {
    this.error('API request failed', error, {
      method,
      path,
      userId,
      event: 'request_error',
    });
  }

  rateLimit(ip: string, endpoint: string): void {
    this.warn('Rate limit exceeded', {
      ip,
      endpoint,
      event: 'rate_limit',
    });
  }
}

// Database logging helpers
class DatabaseLogger extends Logger {
  constructor() {
    super({ module: 'database' });
  }

  queryError(query: string, error: Error, userId?: string): void {
    this.error('Database query failed', error, {
      query: query.substring(0, 200), // Truncate long queries
      userId,
      event: 'query_error',
    });
  }

  slowQuery(query: string, duration: number, userId?: string): void {
    this.warn('Slow database query detected', {
      query: query.substring(0, 200),
      duration,
      userId,
      event: 'slow_query',
    });
  }

  connectionError(error: Error): void {
    this.error('Database connection failed', error, {
      event: 'connection_error',
    });
  }
}

// Export logger instances
export const logger = new Logger();
export const securityLogger = new SecurityLogger();
export const apiLogger = new ApiLogger();
export const dbLogger = new DatabaseLogger();

// Export logger class for creating custom instances
export { Logger };

// Helper to create request-scoped logger
export function createRequestLogger(requestId: string, userId?: string): Logger {
  return logger.child({ requestId }).setRequestId(requestId).setUserId(userId || '');
}