import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RollResult } from '../../../models';

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
}
