import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Modal, ModalResult } from '../../models/modal.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('250ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ])
  ]
})
export class ModalComponent implements OnInit {
  @Input() modal!: Modal;
  @Output() close = new EventEmitter<{ id: string; result: ModalResult }>();

  ngOnInit(): void {
    // Component initialization
  }

  onConfirm(): void {
    this.close.emit({ id: this.modal.id, result: { confirmed: true } });
  }

  onCancel(): void {
    this.close.emit({ id: this.modal.id, result: { confirmed: false } });
  }

  onBackdropClick(event: MouseEvent): void {
    // Nur schließen, wenn direkt auf das Backdrop geklickt wurde
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
