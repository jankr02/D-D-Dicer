import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Historie } from '../../services/historie';
import { RollResult } from '../../models';
import { RollResultDetail } from './roll-result-detail/roll-result-detail';

/**
 * RollHistoryComponent - Displays the history of dice rolls.
 *
 * Shows the last 30 rolls in reverse chronological order (newest first).
 * Provides a clear button to reset the history.
 */
@Component({
  selector: 'app-roll-history',
  imports: [CommonModule, RollResultDetail],
  templateUrl: './roll-history.html',
  styleUrl: './roll-history.scss',
})
export class RollHistory implements OnInit {
  history$!: Observable<RollResult[]>;

  constructor(private historieService: Historie) {}

  ngOnInit(): void {
    this.history$ = this.historieService.history$;
  }

  /**
   * Clears all entries from the roll history.
   */
  clearHistory(): void {
    if (confirm('Are you sure you want to clear the roll history?')) {
      this.historieService.clearHistory();
    }
  }
}
