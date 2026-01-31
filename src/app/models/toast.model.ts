export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  dismissible?: boolean;
  timestamp: Date;
}

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
}
