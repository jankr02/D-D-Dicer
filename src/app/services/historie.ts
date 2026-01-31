import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RollResult } from '../models';

/**
 * HistorieService - Manages the session history of dice rolls.
 *
 * Maintains a list of roll results with localStorage persistence.
 * Stores up to 100 entries for statistics calculations.
 * Displays the most recent 30 entries in the UI.
 * Uses FIFO (First In, First Out) when the limit is reached.
 */
@Injectable({
  providedIn: 'root',
})
export class Historie {
  private readonly STORAGE_KEY = 'dnd_dicer_history';
  private readonly SESSION_KEY = 'dnd_dicer_session_start';
  private readonly MAX_DISPLAY_ENTRIES = 30;
  private readonly MAX_STATS_ENTRIES = 100;

  private historySubject = new BehaviorSubject<RollResult[]>([]);
  public history$ = this.historySubject.asObservable();
  private sessionStartTime: Date;

  constructor() {
    this.sessionStartTime = new Date();
    this.initializeSession();
    this.loadHistoryFromStorage();
  }

  /**
   * Initializes or restores the session.
   * Creates a new session if none exists or if the previous session is older than 1 hour.
   */
  private initializeSession(): void {
    const storedSessionStart = localStorage.getItem(this.SESSION_KEY);

    if (storedSessionStart) {
      const sessionDate = new Date(storedSessionStart);
      const hoursSinceSession = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60);

      // If more than 1 hour passed, start new session
      if (hoursSinceSession > 1) {
        this.startNewSession();
      } else {
        this.sessionStartTime = sessionDate;
      }
    } else {
      this.startNewSession();
    }
  }

  /**
   * Starts a new session by setting the current time as the session start.
   */
  private startNewSession(): void {
    this.sessionStartTime = new Date();
    localStorage.setItem(this.SESSION_KEY, this.sessionStartTime.toISOString());
  }

  /**
   * Loads roll history from localStorage.
   * Handles date deserialization and error cases.
   */
  private loadHistoryFromStorage(): void {
    try {
      const storedHistory = localStorage.getItem(this.STORAGE_KEY);

      if (storedHistory) {
        const parsed = JSON.parse(storedHistory) as RollResult[];

        // Convert timestamp strings back to Date objects
        const historyWithDates = parsed.map(result => ({
          ...result,
          timestamp: new Date(result.timestamp),
        }));

        this.historySubject.next(historyWithDates);
      }
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
      // If localStorage is corrupted, start fresh
      localStorage.removeItem(this.STORAGE_KEY);
      this.historySubject.next([]);
    }
  }

  /**
   * Saves the current roll history to localStorage.
   */
  private saveHistoryToStorage(): void {
    try {
      const history = this.historySubject.value;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
      // If localStorage quota is exceeded, continue without persistence
    }
  }

  /**
   * Adds a new roll result to the history.
   * If the history exceeds MAX_STATS_ENTRIES, the oldest entry is removed (FIFO).
   * Automatically saves to localStorage.
   *
   * @param result The roll result to add
   */
  addRollResult(result: RollResult): void {
    const currentHistory = this.historySubject.value;

    // Add new result at the beginning (most recent first)
    const updatedHistory = [result, ...currentHistory];

    // Limit to MAX_STATS_ENTRIES (remove oldest entries if necessary)
    if (updatedHistory.length > this.MAX_STATS_ENTRIES) {
      updatedHistory.splice(this.MAX_STATS_ENTRIES);
    }

    this.historySubject.next(updatedHistory);
    this.saveHistoryToStorage();
  }

  /**
   * Gets the current roll history (up to 100 entries for statistics).
   * History is ordered from newest to oldest.
   *
   * @returns Array of all roll results (max 100 entries)
   */
  getAllHistory(): RollResult[] {
    return this.historySubject.value;
  }

  /**
   * Gets the display history (up to 30 entries for UI).
   * History is ordered from newest to oldest.
   *
   * @returns Array of roll results (max 30 entries)
   */
  getDisplayHistory(): RollResult[] {
    const history = this.historySubject.value;
    return history.slice(0, this.MAX_DISPLAY_ENTRIES);
  }

  /**
   * Gets the current roll history (legacy method for backward compatibility).
   * Returns the same as getDisplayHistory().
   *
   * @returns Array of roll results (max 30 entries)
   */
  getHistory(): RollResult[] {
    return this.getDisplayHistory();
  }

  /**
   * Gets the timestamp when the current session started.
   *
   * @returns Session start date
   */
  getSessionStartTime(): Date {
    return this.sessionStartTime;
  }

  /**
   * Resets the session by creating a new session start timestamp.
   */
  resetSession(): void {
    this.startNewSession();
  }

  /**
   * Clears all entries from the roll history.
   * Also removes the history from localStorage.
   */
  clearHistory(): void {
    this.historySubject.next([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
