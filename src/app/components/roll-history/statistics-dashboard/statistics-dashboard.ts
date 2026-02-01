import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Statistics } from '../../../services/statistics';
import { Historie } from '../../../services/historie';
import { StatisticsData, TimeFilter } from '../../../models';
import { ModalService } from '../../../services/modal.service';

/**
 * StatisticsDashboard Component - Displays comprehensive statistics from roll history.
 *
 * Features:
 * - Basic metrics (average, min, max, total rolls)
 * - Critical tracking (nat 20/nat 1 for d20 rolls)
 * - Distribution chart (frequency of results)
 * - Dice type analysis (most used dice types)
 * - Time filtering (today, session, all)
 * - Export to JSON and CSV
 */
@Component({
  selector: 'app-statistics-dashboard',
  imports: [CommonModule],
  templateUrl: './statistics-dashboard.html',
  styleUrl: './statistics-dashboard.scss',
})
export class StatisticsDashboard implements OnInit {
  stats$!: Observable<StatisticsData | null>;
  selectedTimeFilter: TimeFilter = 'all';

  constructor(
    private statisticsService: Statistics,
    private historieService: Historie,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.stats$ = this.statisticsService.stats$;
  }

  /**
   * Sets the time filter and triggers statistics recalculation.
   *
   * @param filter Time filter to apply
   */
  setTimeFilter(filter: TimeFilter): void {
    this.selectedTimeFilter = filter;
    this.statisticsService.setTimeFilter(filter);
  }

  /**
   * Exports statistics as JSON file.
   */
  exportJSON(): void {
    const json = this.statisticsService.exportAsJSON();
    this.downloadFile(json, 'dnd-dicer-stats.json', 'application/json');
  }

  /**
   * Exports statistics as CSV file.
   */
  exportCSV(): void {
    const csv = this.statisticsService.exportAsCSV();
    this.downloadFile(csv, 'dnd-dicer-stats.csv', 'text/csv');
  }

  /**
   * Triggers browser download of a file.
   *
   * @param content File content
   * @param filename Filename for download
   * @param type MIME type
   */
  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Starts a new session, resetting the session timer.
   */
  async newSession(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      $localize`:@@modal.newSession.title:New Session`,
      $localize`:@@modal.newSession.message:Start a new session? This will reset the session timer.`
    );

    if (confirmed) {
      this.historieService.resetSession();
    }
  }
}
