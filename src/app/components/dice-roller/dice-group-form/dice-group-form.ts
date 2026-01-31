import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DiceType, KeepDropType } from '../../../types/dice-types';

/**
 * DiceGroupFormComponent - Reusable form for configuring a single dice group.
 *
 * Manages:
 * - Dice count (1-20)
 * - Dice type (d4, d6, d8, d10, d12, d20, d100)
 * - Optional Keep/Drop configuration
 */
@Component({
  selector: 'app-dice-group-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dice-group-form.html',
  styleUrl: './dice-group-form.scss',
})
export class DiceGroupForm implements OnInit {
  @Input() groupForm!: FormGroup;
  @Input() groupIndex!: number;

  diceTypes = Object.values(DiceType);
  keepDropTypes = Object.values(KeepDropType);

  // Flag to show/hide Keep/Drop options
  showKeepDrop = false;

  ngOnInit(): void {
    // Check if Keep/Drop is already configured
    const keepDropValue = this.groupForm.get('keepDrop')?.value;
    this.showKeepDrop = keepDropValue !== null && keepDropValue !== undefined;
  }

  /**
   * Toggles the Keep/Drop configuration section.
   */
  toggleKeepDrop(): void {
    this.showKeepDrop = !this.showKeepDrop;

    if (!this.showKeepDrop) {
      // Clear Keep/Drop configuration when disabled
      this.groupForm.patchValue({
        keepDrop: null
      });
    } else {
      // Initialize with default values
      this.groupForm.patchValue({
        keepDrop: {
          type: KeepDropType.KEEP_HIGHEST,
          count: 1
        }
      });
    }
  }

  /**
   * Gets the maximum count for Keep/Drop based on dice count.
   */
  getMaxKeepDropCount(): number {
    const diceCount = this.groupForm.get('count')?.value || 1;
    return Math.max(1, diceCount - 1);
  }
}
