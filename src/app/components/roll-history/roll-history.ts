import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Historie } from '../../services/historie';
import { RollResult } from '../../models';
import { RollResultDetail } from './roll-result-detail/roll-result-detail';
import { StatisticsDashboard } from './statistics-dashboard/statistics-dashboard';

/**
 * RollHistoryComponent - Displays the history of dice rolls and statistics.
 *
 * Features:
 * - Tab system to switch between Roll History and Statistics views
 * - Shows the last 30 rolls in reverse chronological order (newest first)
 * - Provides a clear button to reset the history
 * - Displays comprehensive statistics about roll history
 */
@Component({
  selector: 'app-roll-history',
  imports: [CommonModule, RollResultDetail, StatisticsDashboard],
  templateUrl: './roll-history.html',
  styleUrl: './roll-history.scss',
})
export class RollHistory implements OnInit {
  history$!: Observable<RollResult[]>;
  activeTab: 'history' | 'statistics' = 'history';

  constructor(private historieService: Historie) {}

  ngOnInit(): void {
    this.history$ = this.historieService.history$;
  }

  /**
   * Switches between history and statistics tabs.
   *
   * @param tab The tab to switch to
   */
  switchTab(tab: 'history' | 'statistics'): void {
    this.activeTab = tab;
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
