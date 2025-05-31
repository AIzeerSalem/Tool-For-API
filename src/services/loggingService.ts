import { ApiRequest, ApiResponse } from '../types';

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  request?: ApiRequest;
  response?: ApiResponse;
  error?: Error;
}

export class LoggingService {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
    this.printLog(entry);
  }

  private printLog(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level}]`;

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry);
        break;
      case LogLevel.WARNING:
        console.warn(prefix, entry.message, entry);
        break;
      default:
        console.log(prefix, entry.message, entry);
    }
  }

  logRequest(request: ApiRequest): void {
    this.addLog({
      timestamp: Date.now(),
      level: LogLevel.INFO,
      message: `Request: ${request.method} ${request.url}`,
      request,
    });
  }

  logResponse(request: ApiRequest, response: ApiResponse): void {
    const level = response.status >= 400 ? LogLevel.WARNING : LogLevel.INFO;
    this.addLog({
      timestamp: Date.now(),
      level,
      message: `Response: ${response.status} ${response.statusText} for ${request.method} ${request.url}`,
      request,
      response,
    });
  }

  logError(error: Error, request?: ApiRequest): void {
    this.addLog({
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      message: `Error: ${error.message}`,
      request,
      error,
    });
  }

  getLogs(
    options: {
      level?: LogLevel;
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): LogEntry[] {
    let filtered = this.logs;

    if (options.level) {
      filtered = filtered.filter(log => log.level === options.level);
    }

    if (options.startTime) {
      filtered = filtered.filter(log => log.timestamp >= options.startTime!);
    }

    if (options.endTime) {
      filtered = filtered.filter(log => log.timestamp <= options.endTime!);
    }

    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
} 