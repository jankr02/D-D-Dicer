import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { Toast } from '../../models/toast.model';
import { ToastComponent } from './toast.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.toasts$;
  }

  onDismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
