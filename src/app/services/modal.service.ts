import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Modal, ModalConfig, ModalResult } from '../models/modal.model';
import { generateUUID } from '../utils/uuid.util';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalsSubject = new BehaviorSubject<Modal[]>([]);
  public modals$: Observable<Modal[]> = this.modalsSubject.asObservable();

  private resultSubject = new Subject<{ id: string; result: ModalResult }>();

  /**
   * Öffnet ein Modal und wartet auf das Ergebnis.
   */
  async open(config: ModalConfig): Promise<ModalResult> {
    const modal: Modal = {
      id: generateUUID(),
      title: config.title,
      message: config.message,
      type: config.type || 'confirm',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel !== false,
      timestamp: new Date()
    };

    const currentModals = this.modalsSubject.value;
    this.modalsSubject.next([...currentModals, modal]);

    // Warte auf das Ergebnis
    const result = await firstValueFrom(
      this.resultSubject.pipe(
        filter(r => r.id === modal.id)
      )
    );

    return result.result;
  }

  /**
   * Convenience-Methode für Bestätigungsdialoge.
   */
  async confirm(title: string, message: string): Promise<boolean> {
    const result = await this.open({
      title,
      message,
      type: 'confirm',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      showCancel: true
    });
    return result.confirmed;
  }

  /**
   * Convenience-Methode für Alert-Dialoge.
   */
  async alert(title: string, message: string): Promise<void> {
    await this.open({
      title,
      message,
      type: 'alert',
      confirmText: 'OK',
      showCancel: false
    });
  }

  /**
   * Schließt ein Modal mit einem Ergebnis.
   */
  close(id: string, result: ModalResult): void {
    const currentModals = this.modalsSubject.value;
    const updatedModals = currentModals.filter(m => m.id !== id);
    this.modalsSubject.next(updatedModals);

    this.resultSubject.next({ id, result });
  }

  /**
   * Schließt alle Modals.
   */
  closeAll(): void {
    const currentModals = this.modalsSubject.value;
    currentModals.forEach(modal => {
      this.resultSubject.next({ id: modal.id, result: { confirmed: false } });
    });
    this.modalsSubject.next([]);
  }

  /**
   * Gibt alle aktuellen Modals zurück.
   */
  getModals(): Modal[] {
    return this.modalsSubject.value;
  }
}
