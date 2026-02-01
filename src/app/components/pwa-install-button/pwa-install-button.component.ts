import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaInstallService } from '../../services/pwa-install.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-pwa-install-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pwa-install-button.component.html',
  styleUrl: './pwa-install-button.component.scss'
})
export class PwaInstallButtonComponent {
  protected installService = inject(PwaInstallService);
  private toastService = inject(ToastService);

  async onInstall(): Promise<void> {
    const installed = await this.installService.promptInstall();

    if (installed) {
      this.toastService.success($localize`:@@pwa.installSuccess:App installed successfully!`);
    }
  }
}
