import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KeepDropType } from '../../../types/dice-types';

/**
 * DiceGroupFormComponent - Reusable form for configuring a single dice group.
 *
 * Manages:
 * - Dice count (1-20)
 * - Dice sides (standard: 4, 6, 8, 10, 12, 20, 100 or custom: any number 1-10000)
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

  // Standard dice for quick selection
  standardDice: number[] = [4, 6, 8, 10, 12, 20, 100];
  keepDropTypes = Object.values(KeepDropType);

  // Flag to show/hide Keep/Drop options
  showKeepDrop = false;

  // Flag for custom dice input mode
  useCustomDice = false;

  ngOnInit(): void {
    if (!this.groupForm) {
      return;
    }

    // Check if Keep/Drop is already configured
    const keepDropValue = this.groupForm.get('keepDrop')?.value;
    this.showKeepDrop = keepDropValue !== null && keepDropValue !== undefined;

    // Check if current value is a non-standard die
    const sidesValue = this.groupForm.get('sides')?.value;
    this.useCustomDice = sidesValue && !this.standardDice.includes(sidesValue);
  }

  /**
   * Toggles between standard dice dropdown and custom dice input.
   */
  toggleCustomDice(): void {
    this.useCustomDice = !this.useCustomDice;

    if (!this.useCustomDice) {
      // Reset to d20 when switching back to standard
      this.groupForm.patchValue({ sides: 20 });
    }
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
