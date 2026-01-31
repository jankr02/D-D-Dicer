import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { Modal, ModalResult } from '../../models/modal.model';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './modal-container.component.html',
  styleUrl: './modal-container.component.scss',
})
export class ModalContainerComponent implements OnInit {
  modals$!: Observable<Modal[]>;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.modals$ = this.modalService.modals$;
  }

  onClose(event: { id: string; result: ModalResult }): void {
    this.modalService.close(event.id, event.result);
  }
}
