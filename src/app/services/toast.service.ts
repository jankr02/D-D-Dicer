import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast, ToastConfig } from '../models/toast.model';
import { generateUUID } from '../utils/uuid.util';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly DEFAULT_DURATION = 4000;
  private readonly MAX_TOASTS = 5;

  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  /**
   * Zeigt einen Toast an.
   */
  show(config: ToastConfig): string {
    const toast: Toast = {
      id: generateUUID(),
      message: config.message,
      type: config.type || 'info',
      duration: config.duration ?? this.DEFAULT_DURATION,
      dismissible: config.dismissible !== false,
      timestamp: new Date()
    };

    const currentToasts = this.toastsSubject.value;

    // FIFO: Ältesten Toast entfernen, wenn Limit erreicht
    let updatedToasts = [...currentToasts, toast];
    if (updatedToasts.length > this.MAX_TOASTS) {
      updatedToasts = updatedToasts.slice(-this.MAX_TOASTS);
    }

    this.toastsSubject.next(updatedToasts);

    // Auto-Dismiss nach duration (wenn > 0)
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => this.dismiss(toast.id), toast.duration);
    }

    return toast.id;
  }

  /**
   * Convenience-Methoden für verschiedene Toast-Typen
   */
  success(message: string, duration?: number): string {
    return this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): string {
    return this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): string {
    return this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): string {
    return this.show({ message, type: 'warning', duration });
  }

  /**
   * Schließt einen bestimmten Toast.
   */
  dismiss(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(t => t.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Schließt alle Toasts.
   */
  dismissAll(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Gibt alle aktuellen Toasts zurück.
   */
  getToasts(): Toast[] {
    return this.toastsSubject.value;
  }
}
