# Deployment Guide

Diese Anleitung beschreibt, wie die D&D Dice Roller App in Produktion gebracht wird.

## Inhaltsverzeichnis

- [Voraussetzungen](#voraussetzungen)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Vercel Deployment](#vercel-deployment)
- [GitHub Secrets konfigurieren](#github-secrets-konfigurieren)
- [Release erstellen](#release-erstellen)
- [Monitoring einrichten](#monitoring-einrichten)
- [Troubleshooting](#troubleshooting)

## Voraussetzungen

- Node.js 22.x oder höher
- npm 10.x oder höher
- Ein [Vercel](https://vercel.com) Account
- Ein [Sentry](https://sentry.io) Account (für Error-Tracking)
- Ein [Google Analytics](https://analytics.google.com) Account (für Analytics)

## Umgebungsvariablen

Die App verwendet folgende Umgebungsvariablen:

| Variable            | Beschreibung                    | Beispiel                                |
| ------------------- | ------------------------------- | --------------------------------------- |
| `SENTRY_DSN`        | Sentry Data Source Name         | `https://xxx@o123.ingest.sentry.io/456` |
| `GA_MEASUREMENT_ID` | Google Analytics Measurement ID | `G-XXXXXXXXXX`                          |

### Lokale Entwicklung

1. Kopiere `.env.example` nach `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fülle die Werte in `.env` aus.

**Hinweis**: Die `.env` Datei wird nicht in Git eingecheckt.

## Vercel Deployment

### Erstmaliges Setup

1. **Vercel Account erstellen** (falls noch nicht vorhanden):
   - Gehe zu [vercel.com](https://vercel.com)
   - Melde dich mit GitHub an

2. **Projekt importieren**:
   - Klicke auf "Add New..." → "Project"
   - Wähle dein GitHub Repository
   - Vercel erkennt automatisch die Angular-Konfiguration

3. **Umgebungsvariablen konfigurieren**:
   - Gehe zu Project Settings → Environment Variables
   - Füge hinzu:
     - `SENTRY_DSN` = dein Sentry DSN
     - `GA_MEASUREMENT_ID` = deine Google Analytics ID
   - Wähle "Production" als Environment

4. **Deploy**:
   - Klicke auf "Deploy"
   - Vercel baut und deployed automatisch

### Automatische Deployments

Nach dem Setup deployed Vercel automatisch bei:

- **Push auf `master`/`main`**: Production Deployment
- **Pull Request**: Preview Deployment

### Vercel Konfiguration

Die Datei `vercel.json` enthält:

- **Rewrites**: SPA-Routing für beide Locales (en/de)
- **Security Headers**: CSP, X-Frame-Options, HSTS, etc.
- **Caching**: Statische Assets werden aggressiv gecacht

## GitHub Secrets konfigurieren

Für CI/CD müssen die Secrets in GitHub konfiguriert werden:

1. Gehe zu deinem Repository → Settings → Secrets and variables → Actions

2. Füge folgende Secrets hinzu:

   | Secret              | Beschreibung                    |
   | ------------------- | ------------------------------- |
   | `SENTRY_DSN`        | Sentry Data Source Name         |
   | `GA_MEASUREMENT_ID` | Google Analytics Measurement ID |

3. Die CI-Pipeline verwendet diese Secrets für Production-Builds.

## Release erstellen

### Versionierung

Das Projekt folgt [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking Changes
- **MINOR** (1.0.0 → 1.1.0): Neue Features, abwärtskompatibel
- **PATCH** (1.0.0 → 1.0.1): Bugfixes

### Release-Workflow

1. **Version in package.json aktualisieren**:

   ```bash
   npm version patch  # oder minor, major
   ```

2. **Tag pushen**:

   ```bash
   git push origin --tags
   ```

3. Der GitHub Actions Workflow `.github/workflows/release.yml` wird automatisch:
   - Die App bauen
   - Ein GitHub Release erstellen
   - Release Notes generieren
   - Build-Artifacts hochladen

### Pre-Releases

Für Beta-Versionen:

```bash
npm version prerelease --preid=beta
# Erstellt z.B. 1.1.0-beta.0
```

Pre-Releases werden als "Pre-release" in GitHub markiert.

## Monitoring einrichten

### Sentry Error-Tracking

1. **Projekt erstellen**:
   - Gehe zu [sentry.io](https://sentry.io)
   - Erstelle ein neues Projekt (Platform: Angular)

2. **DSN kopieren**:
   - Project Settings → Client Keys (DSN)
   - Kopiere den DSN-String

3. **In Vercel konfigurieren**:
   - Füge `SENTRY_DSN` als Environment Variable hinzu

4. **Testen**:
   - Deploye die App
   - Öffne die Browser-Konsole und führe aus:
     ```javascript
     throw new Error('Test error for Sentry');
     ```
   - Der Fehler sollte in Sentry erscheinen

### Google Analytics

1. **Property erstellen**:
   - Gehe zu [analytics.google.com](https://analytics.google.com)
   - Admin → Create Property

2. **Data Stream erstellen**:
   - Wähle "Web"
   - Gib deine URL ein (z.B. `https://dnd-dicer.vercel.app`)

3. **Measurement ID kopieren**:
   - Format: `G-XXXXXXXXXX`

4. **In Vercel konfigurieren**:
   - Füge `GA_MEASUREMENT_ID` als Environment Variable hinzu

5. **Verifizieren**:
   - Öffne die App
   - In Google Analytics → Realtime solltest du Aktivität sehen

### Verfügbare Events

Die App trackt automatisch:

| Event         | Beschreibung                              |
| ------------- | ----------------------------------------- |
| `page_view`   | Seitenaufrufe und Tab-Wechsel             |
| `dice_roll`   | Würfelwürfe (mit Expression und Ergebnis) |
| `preset_used` | Verwendung von Presets                    |

## Bundle-Analyse

Um die Bundle-Größe zu analysieren:

```bash
npm run analyze
```

Dies öffnet eine interaktive Visualisierung der Bundle-Zusammensetzung.

### Bundle-Budgets

Die App hat folgende Limits (definiert in `angular.json`):

| Typ              | Warnung | Fehler |
| ---------------- | ------- | ------ |
| Initial Bundle   | 500 KB  | 1 MB   |
| Component Styles | 12 KB   | 16 KB  |

## Troubleshooting

### Build schlägt fehl

**Problem**: `npm run build` schlägt fehl

**Lösung**:

1. Prüfe, ob alle Dependencies installiert sind: `npm ci`
2. Prüfe TypeScript-Fehler: `npm run lint`
3. Prüfe die Node.js-Version: `node -v` (sollte 22.x sein)

### Sentry empfängt keine Fehler

**Problem**: Fehler werden nicht in Sentry angezeigt

**Lösung**:

1. Prüfe, ob `SENTRY_DSN` korrekt gesetzt ist
2. Prüfe die Browser-Konsole auf Sentry-Init-Fehler
3. Stelle sicher, dass du im Production-Modus bist (Sentry ist nur in Production aktiv)

### Analytics funktioniert nicht

**Problem**: Keine Daten in Google Analytics

**Lösung**:

1. Prüfe, ob `GA_MEASUREMENT_ID` korrekt gesetzt ist
2. Deaktiviere Ad-Blocker (blockieren oft Google Analytics)
3. Prüfe die Browser-Konsole auf gtag-Fehler
4. Warte 24-48 Stunden (Daten erscheinen manchmal verzögert)

### Locale-Routing funktioniert nicht

**Problem**: `/de/` zeigt 404

**Lösung**:

1. Prüfe `vercel.json` auf korrekte Rewrites
2. Stelle sicher, dass der Build beide Locales erzeugt hat
3. Prüfe die Output-Struktur: `dist/d-and-d-dicer/browser/de/` sollte existieren

### Security Headers fehlen

**Problem**: Security-Scanner meldet fehlende Headers

**Lösung**:

1. Prüfe `vercel.json` auf korrekte Header-Konfiguration
2. Teste mit: `curl -I https://deine-app.vercel.app`
3. Verwende [securityheaders.com](https://securityheaders.com) zur Überprüfung

## Checkliste vor Production

- [ ] Umgebungsvariablen in Vercel konfiguriert
- [ ] GitHub Secrets für CI/CD konfiguriert
- [ ] Sentry-Projekt erstellt und DSN eingefügt
- [ ] Google Analytics Property erstellt und ID eingefügt
- [ ] Production-Build lokal getestet: `npm run build`
- [ ] Security Headers überprüft
- [ ] Bundle-Größe analysiert: `npm run analyze`
- [ ] Lighthouse-Score überprüft
