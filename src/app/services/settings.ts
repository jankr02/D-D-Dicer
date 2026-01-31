import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';

export type Theme = 'light' | 'dark';
export type ThemeTrigger = 'manual' | 'system' | 'time';

interface ThemeSettings {
  theme: Theme;
  autoDetectEnabled: boolean;
  timeBasedSwitchEnabled: boolean;
  lastTrigger: ThemeTrigger;
}

/**
 * Settings Service - Manages application-wide settings, including theme preferences.
 *
 * Features:
 * - Theme State Management (light/dark)
 * - localStorage Persistenz
 * - Auto-detection via prefers-color-scheme (first visit only)
 * - Time-based auto-switch (20:00-08:00 = dark mode)
 * - Keyboard shortcut (Ctrl+Shift+D)
 */
@Injectable({
  providedIn: 'root',
})
export class Settings {
  private readonly STORAGE_KEY = 'dnd_dicer_settings';
  private readonly FIRST_VISIT_KEY = 'dnd_dicer_first_visit';

  private settingsSubject = new BehaviorSubject<ThemeSettings>({
    theme: 'light',
    autoDetectEnabled: true,
    timeBasedSwitchEnabled: true,
    lastTrigger: 'manual'
  });

  public settings$ = this.settingsSubject.asObservable();
  public theme$: Observable<Theme>;

  constructor() {
    this.theme$ = new Observable(observer => {
      this.settings$.subscribe(settings => observer.next(settings.theme));
    });

    this.initializeTheme();
    this.setupTimeBasedSwitch();
    this.setupKeyboardShortcut();
  }

  /**
   * Initializes the theme based on localStorage, first-visit detection,
   * and time-based auto-switch.
   */
  private initializeTheme(): void {
    // Load from localStorage
    const settings = this.loadSettings();

    // First visit detection
    const isFirstVisit = !localStorage.getItem(this.FIRST_VISIT_KEY);

    if (isFirstVisit) {
      localStorage.setItem(this.FIRST_VISIT_KEY, 'false');

      // Auto-detect system preference on first visit
      if (settings.autoDetectEnabled) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        settings.theme = systemPrefersDark ? 'dark' : 'light';
        settings.lastTrigger = 'system';
      }
    }

    // Check time-based switch
    if (settings.timeBasedSwitchEnabled) {
      const hour = new Date().getHours();
      const isDarkTime = hour >= 20 || hour < 8;

      if (isDarkTime && settings.theme !== 'dark') {
        settings.theme = 'dark';
        settings.lastTrigger = 'time';
      } else if (!isDarkTime && settings.lastTrigger === 'time') {
        settings.theme = 'light';
      }
    }

    this.settingsSubject.next(settings);
    this.applyTheme(settings.theme);
    this.saveSettings(settings);
  }

  /**
   * Loads settings from localStorage.
   * Returns default settings if none are stored or if loading fails.
   */
  private loadSettings(): ThemeSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    return {
      theme: 'light',
      autoDetectEnabled: true,
      timeBasedSwitchEnabled: true,
      lastTrigger: 'manual'
    };
  }

  /**
   * Saves settings to localStorage.
   */
  private saveSettings(settings: ThemeSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Applies the theme by setting the data-theme attribute on the root element.
   */
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Sets up the time-based theme switch.
   * Checks every minute whether the current time falls within dark hours (20:00-08:00).
   */
  private setupTimeBasedSwitch(): void {
    // Check every minute for time-based theme switch
    interval(60000).subscribe(() => {
      const settings = this.settingsSubject.value;

      if (!settings.timeBasedSwitchEnabled) return;

      const hour = new Date().getHours();
      const isDarkTime = hour >= 20 || hour < 8;

      if (isDarkTime && settings.theme !== 'dark') {
        this.setTheme('dark', 'time');
      } else if (!isDarkTime && settings.lastTrigger === 'time') {
        this.setTheme('light', 'time');
      }
    });
  }

  /**
   * Sets up the keyboard shortcut (Ctrl+Shift+D / Cmd+Shift+D) for toggling the theme.
   */
  private setupKeyboardShortcut(): void {
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Ctrl+Shift+D (or Cmd+Shift+D on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Sets the theme manually or automatically.
   *
   * @param theme The theme to set ('light' or 'dark')
   * @param trigger The trigger source ('manual', 'system', or 'time')
   */
  public setTheme(theme: Theme, trigger: ThemeTrigger = 'manual'): void {
    const settings = this.settingsSubject.value;
    settings.theme = theme;
    settings.lastTrigger = trigger;

    this.applyTheme(theme);
    this.settingsSubject.next(settings);
    this.saveSettings(settings);
  }

  /**
   * Toggles between light and dark themes.
   */
  public toggleTheme(): void {
    const current = this.settingsSubject.value.theme;
    this.setTheme(current === 'light' ? 'dark' : 'light', 'manual');
  }

  /**
   * Enables or disables the time-based auto-switch feature.
   *
   * @param enabled Whether time-based switching should be enabled
   */
  public setTimeBasedSwitch(enabled: boolean): void {
    const settings = this.settingsSubject.value;
    settings.timeBasedSwitchEnabled = enabled;
    this.settingsSubject.next(settings);
    this.saveSettings(settings);
  }

  /**
   * Gets the current theme.
   *
   * @returns The current theme ('light' or 'dark')
   */
  public getCurrentTheme(): Theme {
    return this.settingsSubject.value.theme;
  }
}
