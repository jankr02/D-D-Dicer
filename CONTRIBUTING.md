# Contributing to D&D Dice Roller

Vielen Dank für dein Interesse, zu diesem Projekt beizutragen! Dieses Dokument erklärt, wie du zum Projekt beitragen kannst.

## Inhaltsverzeichnis

- [Code of Conduct](#code-of-conduct)
- [Wie kann ich beitragen?](#wie-kann-ich-beitragen)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Dieses Projekt folgt einem offenen und einladenden Umfeld. Wir erwarten von allen Teilnehmern:

- Respektvoller und konstruktiver Umgang
- Sachliche Diskussionen
- Offenheit für Feedback

## Wie kann ich beitragen?

### Bug Reports

Wenn du einen Bug findest:

1. Prüfe zuerst, ob der Bug bereits gemeldet wurde
2. Erstelle ein neues Issue mit:
   - Klarer Beschreibung des Problems
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Browser und OS-Version

### Feature Requests

Für neue Features:

1. Erstelle ein Issue mit dem Label "enhancement"
2. Beschreibe das Feature und den Use Case
3. Warte auf Feedback, bevor du mit der Implementierung beginnst

### Code Contributions

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/mein-feature`)
3. Implementiere deine Änderungen
4. Schreibe Tests für neue Funktionalität
5. Stelle sicher, dass alle Tests bestehen
6. Erstelle einen Pull Request

## Development Setup

### Voraussetzungen

- Node.js 22.x oder höher
- npm (wird mit Node.js installiert)
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/YOUR-USERNAME/d-and-d-dicer.git
cd d-and-d-dicer

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm start
```

### Verfügbare Scripts

| Script             | Beschreibung                      |
| ------------------ | --------------------------------- |
| `npm start`        | Startet den Entwicklungsserver    |
| `npm test`         | Führt Unit Tests aus (watch mode) |
| `npm run test:ci`  | Führt Tests einmalig aus (für CI) |
| `npm run build`    | Erstellt Production Build         |
| `npm run lint`     | Führt ESLint aus                  |
| `npm run lint:fix` | Führt ESLint mit Auto-Fix aus     |

## Code Style Guidelines

### TypeScript

- Verwende TypeScript strict mode
- Definiere Typen für alle Parameter und Rückgabewerte
- Vermeide `any` - nutze stattdessen spezifische Typen oder `unknown`
- Verwende Interfaces für Datenstrukturen

```typescript
// Gut
function calculateSum(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0);
}

// Schlecht
function calculateSum(values: any): any {
  return values.reduce((sum, val) => sum + val, 0);
}
```

### Angular

- Verwende Standalone Components
- Folge dem Single Responsibility Principle
- Nutze Services für Business Logic
- Verwende Reactive Forms für Formulare
- Implementiere `OnDestroy` und räume Subscriptions auf

```typescript
// Gut - Cleanup bei Destroy
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  someMethod(): void {
    this.service
      .getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        /* ... */
      });
  }
}
```

### Formatting

- Prettier wird automatisch beim Commit ausgeführt
- Print Width: 100 Zeichen
- Single Quotes
- 2 Spaces für Einrückung

### Dateinamen

- Komponenten: `kebab-case.ts` (z.B. `dice-roller.ts`)
- Services: `kebab-case.ts` (z.B. `dice-roller.ts`)
- Models: `kebab-case.model.ts` (z.B. `roll-result.model.ts`)
- Tests: `*.spec.ts` (z.B. `dice-roller.spec.ts`)

## Commit Messages

Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: Neues Feature
- `fix`: Bug Fix
- `docs`: Dokumentationsänderungen
- `style`: Formatierung, keine Codeänderung
- `refactor`: Code-Refactoring ohne Funktionsänderung
- `test`: Tests hinzufügen oder ändern
- `chore`: Build-Prozess oder Tooling

### Beispiele

```bash
feat(dice-roller): add support for custom dice sides
fix(history): prevent duplicate entries
docs(readme): update installation instructions
test(probability): add tests for Monte Carlo simulation
```

## Pull Request Process

1. **Branch erstellen**

   ```bash
   git checkout -b feature/mein-feature
   ```

2. **Änderungen committen**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Tests ausführen**

   ```bash
   npm run lint
   npm run test:ci
   npm run build
   ```

4. **Push und PR erstellen**

   ```bash
   git push origin feature/mein-feature
   ```

   Dann auf GitHub einen Pull Request erstellen.

5. **PR Beschreibung**
   - Beschreibe die Änderungen
   - Verlinke relevante Issues
   - Füge Screenshots hinzu (bei UI-Änderungen)

6. **Review**
   - Warte auf Review
   - Reagiere auf Feedback
   - Aktualisiere den PR bei Bedarf

### Checkliste vor dem PR

- [ ] Alle Tests bestehen (`npm run test:ci`)
- [ ] Linting bestanden (`npm run lint`)
- [ ] Build erfolgreich (`npm run build`)
- [ ] Neue Features sind getestet
- [ ] Commit Messages folgen Conventional Commits
- [ ] PR-Beschreibung ist vollständig

## Fragen?

Bei Fragen erstelle gerne ein Issue mit dem Label "question".
