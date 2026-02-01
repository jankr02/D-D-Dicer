import { Component, Inject, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageRedirectService } from '../../services/language-redirect.service';

/**
 * LanguageSwitcherComponent - UI for switching between languages.
 *
 * Displays language toggle buttons (EN/DE) and handles
 * language switching via the LanguageRedirectService.
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.scss'
})
export class LanguageSwitcherComponent {
  constructor(
    @Inject(LOCALE_ID) public currentLocale: string,
    private languageService: LanguageRedirectService
  ) {}

  /**
   * Switches to the specified language.
   * This will trigger a page redirect to the locale-specific URL.
   */
  switchTo(lang: 'en' | 'de'): void {
    this.languageService.switchLanguage(lang);
  }

  /**
   * Gets the current language from the URL.
   */
  getCurrentLanguage(): 'en' | 'de' {
    return this.languageService.getCurrentLanguageFromUrl();
  }
}
