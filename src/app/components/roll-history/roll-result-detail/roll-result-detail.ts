import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RollResult } from '../../../models';
import { ToastService } from '../../../services/toast.service';

/**
 * RollResultDetailComponent - Displays detailed information about a dice roll.
 *
 * Shows:
 * - Dice notation
 * - Individual rolls per group (with dropped dice marked)
 * - Modifier
 * - Total result
 * - Timestamp
 */
@Component({
  selector: 'app-roll-result-detail',
  imports: [CommonModule],
  templateUrl: './roll-result-detail.html',
  styleUrl: './roll-result-detail.scss',
})
export class RollResultDetail {
  private toastService = inject(ToastService);

  @Input() result!: RollResult;
  @Input() compact = false;

  /**
   * Checks if a roll result represents a critical success (natural 20).
   */
  isCriticalSuccess(result: RollResult): boolean {
    // Check if it's a single d20 roll with value 20
    if (result.groupResults.length !== 1) return false;

    const group = result.groupResults[0];
    const activeRolls = group.rolls.filter(r => !r.isDropped);

    return activeRolls.length === 1 && activeRolls[0].value === 20;
  }

  /**
   * Checks if a roll result represents a critical failure (natural 1).
   */
  isCriticalFailure(result: RollResult): boolean {
    // Check if it's a single d20 roll with value 1
    if (result.groupResults.length !== 1) return false;

    const group = result.groupResults[0];
    const activeRolls = group.rolls.filter(r => !r.isDropped);

    return activeRolls.length === 1 && activeRolls[0].value === 1;
  }

  /**
   * Copies the roll result to clipboard in a shareable format.
   */
  async copyToClipboard(): Promise<void> {
    const text = this.formatResultForClipboard(this.result);

    try {
      await navigator.clipboard.writeText(text);
      this.toastService.success('Roll copied to clipboard!', 2000);
    } catch {
      this.toastService.error('Failed to copy to clipboard');
    }
  }

  /**
   * Formats a roll result as a shareable text string.
   */
  private formatResultForClipboard(result: RollResult): string {
    const parts: string[] = [];

    // Notation and total
    parts.push(`${result.notation} = ${result.total}`);

    // Individual rolls breakdown
    const rollDetails = result.groupResults.map((group) => {
      const rolls = group.rolls
        .map(r => (r.isDropped ? `(${r.value})` : r.value.toString()))
        .join(', ');
      return `[${rolls}]`;
    });

    if (rollDetails.length > 0) {
      parts.push(`Rolls: ${rollDetails.join(' + ')}`);
    }

    // Modifier if present
    if (result.modifier !== 0) {
      const sign = result.modifier > 0 ? '+' : '';
      parts.push(`Modifier: ${sign}${result.modifier}`);
    }

    return parts.join('\n');
  }
}
