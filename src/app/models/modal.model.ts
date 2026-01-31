export type ModalType = 'confirm' | 'alert' | 'prompt';

export interface Modal {
  id: string;
  title: string;
  message: string;
  type: ModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  timestamp: Date;
}

export interface ModalConfig {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export interface ModalResult {
  confirmed: boolean;
  value?: string;
}
