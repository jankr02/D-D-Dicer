/// <reference types="@angular/localize" />

import * as Sentry from '@sentry/angular';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

// Initialize Sentry for error tracking
if (environment.production && environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: 'production',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
  });
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
