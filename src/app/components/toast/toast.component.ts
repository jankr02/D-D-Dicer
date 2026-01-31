import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastType } from '../../models/toast.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent implements OnInit {
  @Input() toast!: Toast;
  @Output() dismiss = new EventEmitter<string>();

  ngOnInit(): void {
    // Component initialization
  }

  onClose(): void {
    this.dismiss.emit(this.toast.id);
  }

  getIcon(type: ToastType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  getAriaRole(type: ToastType): string {
    return type === 'error' || type === 'warning' ? 'alert' : 'status';
  }
}
