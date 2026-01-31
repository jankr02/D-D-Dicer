import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Historie } from '../../services/historie';
import { RollResult } from '../../models';
import { RollResultDetail } from './roll-result-detail/roll-result-detail';
import { StatisticsDashboard } from './statistics-dashboard/statistics-dashboard';
import { ProbabilityPanel } from './probability-panel/probability-panel';
import { ModalService } from '../../services/modal.service';

/**
 * RollHistoryComponent - Displays the history of dice rolls and statistics.
 *
 * Features:
 * - Tab system to switch between Roll History, Statistics, and Probabilities views
 * - Shows the last 30 rolls in reverse chronological order (newest first)
 * - Provides a clear button to reset the history
 * - Displays comprehensive statistics about roll history
 * - Displays probability analysis for dice expressions
 */
@Component({
  selector: 'app-roll-history',
  imports: [CommonModule, RollResultDetail, StatisticsDashboard, ProbabilityPanel],
  templateUrl: './roll-history.html',
  styleUrl: './roll-history.scss',
})
export class RollHistory implements OnInit {
  history$!: Observable<RollResult[]>;
  activeTab: 'history' | 'statistics' | 'probabilities' = 'history';

  constructor(
    private historieService: Historie,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.history$ = this.historieService.history$;
  }

  /**
   * Switches between history, statistics, and probabilities tabs.
   *
   * @param tab The tab to switch to
   */
  switchTab(tab: 'history' | 'statistics' | 'probabilities'): void {
    this.activeTab = tab;
  }

  /**
   * Clears all entries from the roll history.
   */
  async clearHistory(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Clear Roll History',
      'Are you sure you want to clear the entire roll history? This action cannot be undone.'
    );

    if (confirmed) {
      this.historieService.clearHistory();
    }
  }
}
