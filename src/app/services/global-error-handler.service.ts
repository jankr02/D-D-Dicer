import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  url?: string;
  userAgent: string;
}

/**
 * Global error handler that catches unhandled errors and logs them.
 * Also shows user-friendly toast notifications for errors.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly toastService = inject(ToastService);
  private readonly MAX_LOGS = 50;
  private readonly STORAGE_KEY = 'dnd_dicer_error_logs';

  handleError(error: unknown): void {
    // Extract error details
    const errorMessage = this.getErrorMessage(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log to console in development
    console.error('Global Error Handler caught:', error);

    // Create error log entry
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      message: errorMessage,
      stack: errorStack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    // Store error log
    this.storeErrorLog(errorLog);

    // Show user-friendly notification
    this.showErrorNotification(errorMessage);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Ein unerwarteter Fehler ist aufgetreten';
  }

  private showErrorNotification(message: string): void {
    // Don't show technical details to users
    const userMessage = message.includes('ChunkLoadError')
      ? 'Die Anwendung wurde aktualisiert. Bitte laden Sie die Seite neu.'
      : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';

    this.toastService.error(userMessage, 5000);
  }

  private storeErrorLog(log: ErrorLog): void {
    try {
      const existingLogs = this.getStoredLogs();
      const updatedLogs = [log, ...existingLogs].slice(0, this.MAX_LOGS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch {
      // Silently fail if storage is not available
      console.warn('Could not store error log');
    }
  }

  private getStoredLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get all stored error logs for debugging purposes.
   */
  getErrorLogs(): ErrorLog[] {
    return this.getStoredLogs();
  }

  /**
   * Clear all stored error logs.
   */
  clearErrorLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Silently fail
    }
  }
}
