import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Settings, Theme } from '../../services/settings';
import { Observable } from 'rxjs';

/**
 * Theme Toggle Component - Provides a UI control for switching between light and dark themes.
 *
 * Features:
 * - Visual toggle button with theme icon (🌙/☀️)
 * - Keyboard shortcut hint in tooltip
 * - Reactive to theme state changes
 * - Responsive design (mobile shows icon only)
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {
  theme$: Observable<Theme>;

  constructor(private settings: Settings) {
    this.theme$ = this.settings.theme$;
  }

  toggleTheme(): void {
    this.settings.toggleTheme();
  }

  getThemeIcon(theme: Theme): string {
    return theme === 'light' ? '🌙' : '☀️';
  }

  getThemeLabel(theme: Theme): string {
    return theme === 'light' ? 'Dark Mode' : 'Light Mode';
  }
}
