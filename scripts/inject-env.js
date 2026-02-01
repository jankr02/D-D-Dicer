#!/usr/bin/env node
/**
 * Injects environment variables into the production environment file.
 * Run this before building for production.
 *
 * Usage: node scripts/inject-env.js
 *
 * Required environment variables:
 * - SENTRY_DSN: Sentry DSN for error tracking
 * - GA_MEASUREMENT_ID: Google Analytics Measurement ID
 */

const fs = require('fs');
const path = require('path');

const envProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

let content = fs.readFileSync(envProdPath, 'utf8');

const replacements = {
  __SENTRY_DSN__: process.env.SENTRY_DSN || '',
  __GA_MEASUREMENT_ID__: process.env.GA_MEASUREMENT_ID || '',
};

for (const [placeholder, value] of Object.entries(replacements)) {
  content = content.replace(placeholder, value);
}

fs.writeFileSync(envProdPath, content, 'utf8');

console.log('Environment variables injected successfully:');
console.log(`  SENTRY_DSN: ${replacements.__SENTRY_DSN__ ? 'Set' : 'Not set'}`);
console.log(`  GA_MEASUREMENT_ID: ${replacements.__GA_MEASUREMENT_ID__ ? 'Set' : 'Not set'}`);
