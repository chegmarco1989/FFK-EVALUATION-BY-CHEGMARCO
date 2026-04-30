/**
 * =============================================================================
 * LOGGING UTILITY
 * =============================================================================
 * Centralized logging system with different log levels and formatting.
 * In production, you'd integrate with services like Winston, Pino, or
 * cloud logging solutions (CloudWatch, Datadog, etc.)
 * 
 * For PHP/Laravel developers:
 * - This is similar to Laravel's Log facade
 * - Provides structured logging with levels
 * - Can be extended to write to files, databases, or external services
 */

import config from '../config/environment';

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Map log levels to numeric values for comparison
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
};

/**
 * ANSI color codes for terminal output
 * Makes logs easier to read during development
 */
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
};

/**
 * Format timestamp for log entries
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Check if a log level should be output based on configured level
 */
function shouldLog(level: LogLevel): boolean {
  const configuredLevel = config.logging.level as LogLevel;
  return LOG_LEVEL_VALUES[level] <= LOG_LEVEL_VALUES[configuredLevel];
}

/**
 * Format log message with color and metadata
 */
function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = getTimestamp();
  const color = {
    [LogLevel.ERROR]: COLORS.red,
    [LogLevel.WARN]: COLORS.yellow,
    [LogLevel.INFO]: COLORS.blue,
    [LogLevel.DEBUG]: COLORS.gray,
  }[level];
  
  let formatted = `${color}[${timestamp}] [${level.toUpperCase()}]${COLORS.reset} ${message}`;
  
  // Add metadata if provided
  if (meta !== undefined) {
    formatted += `\n${COLORS.gray}${JSON.stringify(meta, null, 2)}${COLORS.reset}`;
  }
  
  return formatted;
}

/**
 * Logger class with methods for each log level
 */
class Logger {
  /**
   * Log error messages
   * Use for: exceptions, critical failures, data corruption
   */
  error(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(formatMessage(LogLevel.ERROR, message, meta));
    }
  }
  
  /**
   * Log warning messages
   * Use for: deprecated features, recoverable errors, suspicious activity
   */
  warn(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage(LogLevel.WARN, message, meta));
    }
  }
  
  /**
   * Log informational messages
   * Use for: startup messages, important state changes, business events
   */
  info(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.INFO)) {
      console.log(formatMessage(LogLevel.INFO, message, meta));
    }
  }
  
  /**
   * Log debug messages
   * Use for: detailed diagnostic information, variable dumps
   * Only shown when LOG_LEVEL=debug
   */
  debug(message: string, meta?: unknown): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.log(formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
  
  /**
   * Log HTTP request
   * Special formatter for Express requests
   */
  request(method: string, url: string, statusCode: number, duration: number): void {
    if (!config.logging.enableRequestLogging) return;
    
    const color = statusCode >= 500 ? COLORS.red :
                  statusCode >= 400 ? COLORS.yellow :
                  statusCode >= 300 ? COLORS.blue :
                  COLORS.green;
    
    const message = `${color}${method} ${url} ${statusCode}${COLORS.reset} ${COLORS.gray}${duration}ms${COLORS.reset}`;
    console.log(`[${getTimestamp()}] ${message}`);
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;
