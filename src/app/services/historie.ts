import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RollResult } from '../models';

/**
 * HistorieService - Manages the session history of dice rolls.
 *
 * Maintains an in-memory list of the last 30 roll results.
 * History is NOT persisted across browser sessions (unlike Presets).
 * Uses FIFO (First In, First Out) when the limit is reached.
 */
@Injectable({
  providedIn: 'root',
})
export class Historie {
  private readonly MAX_ENTRIES = 30;
  private historySubject = new BehaviorSubject<RollResult[]>([]);
  public history$ = this.historySubject.asObservable();

  /**
   * Adds a new roll result to the history.
   * If the history exceeds MAX_ENTRIES, the oldest entry is removed (FIFO).
   *
   * @param result The roll result to add
   */
  addRollResult(result: RollResult): void {
    const currentHistory = this.historySubject.value;

    // Add new result at the beginning (most recent first)
    const updatedHistory = [result, ...currentHistory];

    // Limit to MAX_ENTRIES (remove oldest entries if necessary)
    if (updatedHistory.length > this.MAX_ENTRIES) {
      updatedHistory.splice(this.MAX_ENTRIES);
    }

    this.historySubject.next(updatedHistory);
  }

  /**
   * Gets the current roll history.
   * History is ordered from newest to oldest.
   *
   * @returns Array of roll results (max 30 entries)
   */
  getHistory(): RollResult[] {
    return this.historySubject.value;
  }

  /**
   * Clears all entries from the roll history.
   */
  clearHistory(): void {
    this.historySubject.next([]);
  }
}
