import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics service for tracking page views and events.
 * Only active in production when GA_MEASUREMENT_ID is configured.
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (!environment.production || !environment.googleAnalyticsId || this.initialized) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', environment.googleAnalyticsId, {
      send_page_view: false,
    });

    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsId}`;
    document.head.appendChild(script);

    this.initialized = true;
  }

  /**
   * Track a page view
   */
  trackPageView(path: string, title?: string): void {
    if (!this.initialized) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, params?: Record<string, unknown>): void {
    if (!this.initialized) return;

    window.gtag('event', eventName, params);
  }

  /**
   * Track a dice roll event
   */
  trackDiceRoll(diceExpression: string, result: number): void {
    this.trackEvent('dice_roll', {
      dice_expression: diceExpression,
      result: result,
    });
  }

  /**
   * Track preset usage
   */
  trackPresetUsed(presetName: string): void {
    this.trackEvent('preset_used', {
      preset_name: presetName,
    });
  }
}
