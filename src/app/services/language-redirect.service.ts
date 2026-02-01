import { Injectable, Inject, PLATFORM_ID, LOCALE_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * LanguageRedirectService - Handles language preference persistence and redirection.
 *
 * Since Angular i18n is compile-time based, each locale has its own build.
 * This service manages:
 * - Storing user's language preference in localStorage
 * - Redirecting to the correct locale-specific URL on app load
 * - Providing methods to switch languages
 */
@Injectable({ providedIn: 'root' })
export class LanguageRedirectService {
  private readonly STORAGE_KEY = 'preferred-language';
  private readonly SUPPORTED_LANGUAGES = ['en', 'de'] as const;
  private readonly DEFAULT_LANGUAGE = 'en';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(LOCALE_ID) public currentLocale: string
  ) {}

  /**
   * Checks localStorage preference and redirects if needed.
   * Call this in app initialization.
   */
  checkAndRedirect(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedLang = this.getPreferredLanguage();
    const currentLang = this.getCurrentLanguageFromUrl();

    // If no stored preference, save current and done
    if (!storedLang) {
      this.setPreferredLanguage(currentLang);
      return;
    }

    // If preference differs from current URL, redirect
    if (storedLang !== currentLang && this.isValidLanguage(storedLang)) {
      this.redirectToLanguage(storedLang as 'en' | 'de');
    }
  }

  /**
   * Gets current language from URL path.
   */
  getCurrentLanguageFromUrl(): 'en' | 'de' {
    if (!isPlatformBrowser(this.platformId)) return this.DEFAULT_LANGUAGE;

    const path = window.location.pathname;
    if (path.startsWith('/de')) return 'de';
    return 'en';
  }

  /**
   * Stores language preference and redirects to the new locale.
   */
  switchLanguage(lang: 'en' | 'de'): void {
    if (!this.isValidLanguage(lang)) return;

    this.setPreferredLanguage(lang);
    this.redirectToLanguage(lang);
  }

  /**
   * Saves preference to localStorage.
   */
  setPreferredLanguage(lang: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  /**
   * Returns stored preference.
   */
  getPreferredLanguage(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Validates if a language is supported.
   */
  private isValidLanguage(lang: string): lang is 'en' | 'de' {
    return this.SUPPORTED_LANGUAGES.includes(lang as 'en' | 'de');
  }

  /**
   * Redirects to the specified language version.
   */
  private redirectToLanguage(lang: 'en' | 'de'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentPath = window.location.pathname;
    const currentLang = this.getCurrentLanguageFromUrl();

    let newPath: string;

    // Replace language segment in path
    if (currentPath.startsWith(`/${currentLang}/`)) {
      newPath = currentPath.replace(`/${currentLang}/`, `/${lang}/`);
    } else if (currentPath === `/${currentLang}`) {
      newPath = `/${lang}`;
    } else if (currentPath.startsWith(`/${currentLang}`)) {
      newPath = currentPath.replace(`/${currentLang}`, `/${lang}`);
    } else {
      // Path doesn't have language prefix, add it
      newPath = `/${lang}${currentPath}`;
    }

    // Preserve query string and hash
    const search = window.location.search;
    const hash = window.location.hash;

    window.location.href = newPath + search + hash;
  }
}
