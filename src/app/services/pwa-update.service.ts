import { Injectable, ApplicationRef, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { concat, interval, first, filter } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);
  private toastService = inject(ToastService);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.initializeUpdateChecks();
      this.listenForUpdates();
    }
  }

  private initializeUpdateChecks(): void {
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );

    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        await this.swUpdate.checkForUpdate();
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  private listenForUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        this.promptUserForUpdate();
      });

    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('SW unrecoverable error:', event.reason);
      this.toastService.error($localize`:@@pwa.unrecoverable:An error occurred. Please refresh the page.`);
    });
  }

  private promptUserForUpdate(): void {
    this.toastService.info($localize`:@@pwa.updateAvailable:A new version is available! Refresh to update.`, 10000);
  }

  async activateUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch (err) {
      console.error('Failed to activate update:', err);
    }
  }

  async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Update check failed:', err);
      return false;
    }
  }
}
