# D&D Dice Roller

Ein moderner, funktionsreicher Würfel-Roller für Dungeons & Dragons, entwickelt mit Angular 20 und TypeScript. Die Anwendung bietet umfassende Würfelmechaniken, detaillierte Wahrscheinlichkeitsanalysen und ein leistungsstarkes Statistik-Dashboard für optimale Spielerfahrung.

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Hauptfunktionen](#hauptfunktionen)
  - [Würfelmechanik](#würfelmechanik)
  - [Wahrscheinlichkeitsanalyse](#wahrscheinlichkeitsanalyse)
  - [Preset-Verwaltung](#preset-verwaltung)
  - [Statistik-Dashboard](#statistik-dashboard)
  - [Würfel-Historie](#würfel-historie)
  - [Dark Mode](#dark-mode)
  - [Benachrichtigungssystem](#benachrichtigungssystem)
- [Technischer Hintergrund](#technischer-hintergrund)
  - [Architektur-Übersicht](#architektur-übersicht)
  - [Kern-Services](#kern-services)
  - [Komponenten-Struktur](#komponenten-struktur)
  - [Datenmodelle](#datenmodelle)
  - [Algorithmen](#algorithmen)
  - [Datenpersistenz](#datenpersistenz)
- [Installation und Entwicklung](#installation-und-entwicklung)
- [Projektstruktur](#projektstruktur)
- [Verwendung](#verwendung)
- [Tastenkombinationen](#tastenkombinationen)
- [Technologie-Stack](#technologie-stack)
- [Browser-Kompatibilität](#browser-kompatibilität)
- [Datenschutz und Speicherung](#datenschutz-und-speicherung)
- [Lizenz](#lizenz)

## Über das Projekt

D&D Dice Roller ist eine Web-Anwendung, die speziell für Dungeons & Dragons-Spieler und Spielleiter entwickelt wurde. Die Anwendung geht weit über einfaches Würfeln hinaus und bietet fortgeschrittene Features wie Wahrscheinlichkeitsberechnungen, Keep/Drop-Mechaniken und umfassende Statistikanalysen.

Das Projekt zeichnet sich durch eine moderne Architektur mit Angular 20 aus und bietet eine intuitive Benutzeroberfläche mit Dark Mode-Unterstützung. Alle Daten werden lokal im Browser gespeichert, wodurch keine Server-Kommunikation erforderlich ist und die Privatsphäre gewahrt bleibt.

### Hauptmerkmale

- **Fortgeschrittene Würfelmechanik**: Unterstützung für alle D&D-Standardwürfel mit Keep/Drop-Logik und Vorteil/Nachteil-System
- **Wissenschaftliche Wahrscheinlichkeitsanalyse**: Exakte Berechnungen mittels Faltungsalgorithmus und Monte-Carlo-Simulationen
- **Umfassendes Statistik-Dashboard**: Detaillierte Analysen der Würfelergebnisse mit Export-Funktionalität
- **Preset-System**: Speichern und Kategorisieren häufig verwendeter Würfelkonfigurationen
- **Vollständige Offline-Funktionalität**: Alle Daten lokal gespeichert, keine Internet-Verbindung erforderlich

## Hauptfunktionen

### Würfelmechanik

Die Würfelmechanik unterstützt alle Standard-D&D-Würfeltypen und bietet erweiterte Funktionen für komplexe Würfe:

#### Unterstützte Würfeltypen
- **d4** (vierseitiger Würfel)
- **d6** (sechsseitiger Würfel)
- **d8** (achtseitiger Würfel)
- **d10** (zehnseitiger Würfel)
- **d12** (zwölfseitiger Würfel)
- **d20** (zwanzigseitiger Würfel)
- **d100** (hundertseitiger Würfel / Prozent-Würfel)

#### Erweiterte Funktionen

**Mehrere Würfelgruppen**: Es können mehrere Würfelgruppen in einem einzelnen Wurf kombiniert werden, z.B. `2d20 + 3d6 + 5` für einen Angriff mit mehreren Schadensquellen.

**Keep/Drop-Mechaniken**: Vier verschiedene Mechaniken zum Behalten oder Verwerfen von Würfelergebnissen:
- **Keep Highest (kh)**: Die höchsten n Würfel werden behalten (z.B. `4d6kh3` für Charakterattribute)
- **Keep Lowest (kl)**: Die niedrigsten n Würfel werden behalten
- **Drop Highest (dh)**: Die höchsten n Würfel werden verworfen
- **Drop Lowest (dl)**: Die niedrigsten n Würfel werden verworfen (z.B. `4d6dl1`)

**Vorteil/Nachteil-System**: Speziell für d20-Würfe implementiert:
- **Vorteil**: Würfelt 2d20 und nimmt das höhere Ergebnis (`2d20kh1`)
- **Nachteil**: Würfelt 2d20 und nimmt das niedrigere Ergebnis (`2d20kl1`)

**Globale Modifikatoren**: Ein Modifikator kann auf das Endergebnis aller Würfelgruppen angewendet werden (z.B. +5 für einen Angriffsbonus).

**Automatische Notation-Generierung**: Die Anwendung zeigt die Standard-D&D-Notation für jeden Wurf an (z.B. `2d6+3`, `4d6kh3`, `2d20kh1+5`).

### Wahrscheinlichkeitsanalyse

Das Wahrscheinlichkeits-Panel bietet eine wissenschaftlich fundierte Analyse der Würfelkonfigurationen:

#### Berechnungsmethoden

Die Anwendung verwendet zwei verschiedene Berechnungsmethoden und wählt automatisch die geeignete aus:

**Exakte Berechnung (Faltungsalgorithmus)**:
- Wird für einfachere Würfelausdrücke verwendet
- Berechnet exakte Wahrscheinlichkeiten durch Kombination von Würfelverteilungen
- Garantiert mathematisch präzise Ergebnisse
- Automatisch gewählt, wenn die Anzahl möglicher Ergebnisse unter 10.000 liegt

**Monte-Carlo-Simulation**:
- Wird für komplexe Würfelausdrücke verwendet
- Führt 100.000 simulierte Würfe durch
- Liefert statistisch sehr genaue Annäherungen
- Automatisch gewählt, wenn die Anzahl möglicher Ergebnisse 10.000 übersteigt

#### Features

**Live-Wahrscheinlichkeitsvorschau**: Während der Konfiguration eines Wurfs wird die Wahrscheinlichkeitsverteilung in Echtzeit aktualisiert.

**Target DC (Difficulty Class)**: Ein Zielwert kann eingegeben werden, um die Erfolgswahrscheinlichkeit zu berechnen:
- **Hohe Wahrscheinlichkeit** (≥70%): Grün hervorgehoben
- **Mittlere Wahrscheinlichkeit** (30-70%): Orange hervorgehoben
- **Niedrige Wahrscheinlichkeit** (<30%): Rot hervorgehoben

**Statistische Kennzahlen**:
- **Erwartungswert (Mean)**: Der durchschnittlich zu erwartende Wert
- **Median**: Der Wert, der die Verteilung in zwei Hälften teilt
- **Modus**: Der/die wahrscheinlichste(n) Wert(e)
- **Minimum/Maximum**: Kleinstmöglicher und größtmöglicher Wert

**Wahrscheinlichkeitsverteilungsdiagramm**: Visualisiert die Wahrscheinlichkeit für jeden möglichen Wert als Balkendiagramm.

**Kritische Würfe**: Für Würfe, die einen d20 enthalten, werden die Wahrscheinlichkeiten für eine natürliche 20 und natürliche 1 separat angezeigt.

**LRU-Cache**: Die 100 zuletzt berechneten Wahrscheinlichkeitsverteilungen werden gecacht (Least Recently Used), um die Performance zu optimieren.

**Berechnungsmethoden-Indikator**: Zeigt an, ob die exakte Berechnung oder die Simulation verwendet wurde.

### Preset-Verwaltung

Das Preset-System ermöglicht das Speichern und schnelle Laden häufig verwendeter Würfelkonfigurationen:

#### Funktionen

**Speichern von Konfigurationen**: Jede Würfelkonfiguration kann mit einem Namen und einer Kategorie gespeichert werden.

**Kategoriebasierte Organisation**: Presets können in vordefinierten Kategorien organisiert werden:
- **Combat**: Angriffswürfe und Kampf-bezogene Würfe
- **Utility**: Allgemeine Hilfswürfe
- **Character**: Charaktererstellung und -entwicklung
- **Skill Check**: Fertigkeitswürfe
- **Damage**: Schadenswürfe
- **Healing**: Heilungswürfe
- **Custom**: Benutzerdefinierte Kategorien

**Tag-basiertes Filtersystem**: Presets können nach Kategorie gefiltert werden:
- Alle Kategorien anzeigen
- Unkategorisierte Presets
- Spezifische Kategorie auswählen

**Ein-Klick-Laden**: Gespeicherte Presets können mit einem einzigen Klick geladen werden, wodurch die gesamte Würfelkonfiguration wiederhergestellt wird.

**Löschen mit Bestätigung**: Presets können gelöscht werden, wobei ein Bestätigungsdialog unbeabsichtigtes Löschen verhindert.

**Migrations-Support**: Das System unterstützt automatische Migration von älteren Preset-Formaten (Version 2 mit Kategorie-Support).

**UUID-basierte Identifikation**: Jedes Preset erhält eine eindeutige ID für zuverlässige Verwaltung.

### Statistik-Dashboard

Das Statistik-Dashboard bietet umfassende Analysen aller durchgeführten Würfe:

#### Zeitbasierte Filter

Drei verschiedene Zeitfilter ermöglichen flexible Analysen:
- **Heute**: Alle Würfe seit Mitternacht
- **Sitzung**: Würfe der aktuellen Spielsitzung (letzte Stunde Aktivität)
- **Alle**: Alle gespeicherten Würfe (bis zu 100 Einträge)

#### Basis-Metriken

**Würfe gesamt**: Gesamtanzahl der durchgeführten Würfe im gewählten Zeitraum

**Durchschnittliches Ergebnis**: Mittleres Ergebnis aller Würfe

**Minimum/Maximum**: Niedrigstes und höchstes gewürfeltes Ergebnis

**Totale Summe**: Summe aller Würfelergebnisse

#### Kritische Statistiken

Für Würfe, die einen d20 enthalten, werden zusätzliche Statistiken angezeigt:
- **Natürliche 20**: Anzahl und Prozentsatz der kritischen Treffer
- **Natürliche 1**: Anzahl und Prozentsatz der kritischen Fehlschläge

Diese Statistiken werden nur für Würfe berücksichtigt, bei denen tatsächlich ein d20 verwendet wurde.

#### Ergebnis-Verteilungsanalyse

Ein Balkendiagramm zeigt die Häufigkeitsverteilung aller gewürfelten Ergebnisse, wodurch Muster und Trends erkennbar werden.

#### Würfeltyp-Nutzungsstatistiken

Zeigt an, welche Würfeltypen am häufigsten verwendet wurden und was die durchschnittlichen Ergebnisse für jeden Würfeltyp waren.

#### Export-Funktionalität

Die Statistiken können in zwei Formaten exportiert werden:
- **JSON**: Strukturiertes Format für weitere Verarbeitung
- **CSV**: Tabellenformat für Excel, Google Sheets, etc.

#### Sitzungsverwaltung

**Automatischer Sitzungs-Timeout**: Nach einer Stunde Inaktivität startet automatisch eine neue Sitzung.

**Neue Sitzung starten**: Manuell eine neue Sitzung starten mit Bestätigungsdialog.

**Historie löschen**: Alle gespeicherten Würfe können gelöscht werden (mit Bestätigung).

### Würfel-Historie

Die Historie-Funktion speichert alle durchgeführten Würfe und ermöglicht deren detaillierte Ansicht:

#### Speicherung

**Anzeige**: Die letzten 30 Würfe werden in der Benutzeroberfläche angezeigt.

**Speicherung**: Bis zu 100 Würfe werden für Statistikzwecke gespeichert.

**FIFO-Strategie**: First In, First Out - älteste Würfe werden automatisch entfernt, wenn das Limit erreicht wird.

#### Detaillierte Würfelaufschlüsselung

Jeder Wurf in der Historie zeigt:
- **Würfelnotation**: Die verwendete D&D-Notation (z.B. `2d6+3`)
- **Einzelne Würfelwerte**: Alle gewürfelten Werte für jeden Würfel
- **Verworfene Würfel**: Durch Keep/Drop-Mechaniken verworfene Würfel werden durchgestrichen dargestellt
- **Gruppensummen**: Summe jeder Würfelgruppe vor Anwendung des Modifikators
- **Endergebnis**: Finales Ergebnis nach Anwendung aller Modifikatoren

#### Funktionen

**"Letzten Wurf wiederholen"**: Ein Button ermöglicht das sofortige Wiederholen des letzten Wurfs mit exakt derselben Konfiguration.

**Sitzungsverwaltung**: Nach einer Stunde Inaktivität wird die Historie zurückgesetzt und eine neue Sitzung beginnt.

**localStorage-Persistierung**: Alle Würfe werden im Browser gespeichert und bleiben auch nach Neuladen der Seite erhalten.

**Löschen mit Bestätigung**: Die gesamte Historie kann gelöscht werden, wobei ein Bestätigungsdialog unbeabsichtigtes Löschen verhindert.

### Dark Mode

Ein vollständig implementierter Dark Mode mit intelligenter Auto-Umschaltung:

#### Automatische Theme-Erkennung

**Beim ersten Besuch**: Die Anwendung erkennt die Browser-/System-Präferenz für Dark Mode (`prefers-color-scheme`) und wendet diese automatisch an.

#### Zeitbasierte Auto-Umschaltung

Das Theme wechselt automatisch basierend auf der Tageszeit:
- **Dark Mode**: 20:00 Uhr bis 08:00 Uhr
- **Light Mode**: 08:00 Uhr bis 20:00 Uhr

Diese Einstellung kann jederzeit manuell überschrieben werden.

#### Manuelle Steuerung

**Theme-Toggle-Button**: Ein Button in der Benutzeroberfläche ermöglicht das manuelle Umschalten zwischen Light und Dark Mode.

**Tastenkombination**:
- **Windows/Linux**: Strg+Shift+D
- **macOS**: Cmd+Shift+D

#### Visuelle Gestaltung

**Sanfte Gradient-Übergänge**: Beide Themes verwenden moderne Gradient-Hintergründe für eine ansprechende visuelle Darstellung.

**Optimierte Kontraste**: Alle UI-Elemente sind in beiden Modi optimal lesbar.

#### Persistierung

Die Theme-Präferenz wird in localStorage gespeichert und bleibt auch nach Neuladen der Seite oder Schließen des Browsers erhalten.

### Benachrichtigungssystem

Ein zweistufiges Benachrichtigungssystem für optimales Benutzer-Feedback:

#### Toast-Benachrichtigungen

**Typen**: Success, Error, Info, Warning

**Auto-Dismiss**: Toasts verschwinden automatisch nach 4 Sekunden (konfigurierbar).

**Manuelles Schließen**: Jeder Toast kann manuell geschlossen werden.

**Queue-Management**: Maximal 5 Toasts werden gleichzeitig angezeigt; ältere werden automatisch entfernt (FIFO).

**Verwendung**: Für informative Rückmeldungen wie "Preset gespeichert", "Historie gelöscht", etc.

#### Modale Dialoge

**Bestätigungsdialoge**: Für kritische Aktionen wie Löschen von Presets oder Historie.

**Alert-Dialoge**: Für wichtige Benachrichtigungen.

**Promise-basierte API**: Ermöglicht saubere async/await-Syntax für Dialog-Handling.

**Modal-Stacking**: Mehrere Modals können in einer Warteschlange verwaltet werden.

**Anpassbare Buttons**: Konfigurierbarer Text für Bestätigen/Abbrechen-Buttons.

#### Service-basierte Architektur

Beide Systeme sind als Angular Services implementiert, wodurch sie von jeder Komponente der Anwendung aus zugänglich sind.

## Technischer Hintergrund

### Architektur-Übersicht

Die Anwendung basiert auf moderner Angular-Architektur mit Fokus auf Wartbarkeit und Testbarkeit:

#### Standalone Component Architecture

Verwendet die neueste Angular 20-Feature: Standalone Components ohne NgModules. Dies führt zu:
- Reduziertem Boilerplate-Code
- Besserer Tree-Shaking-Fähigkeit
- Einfacherer Komponentenstruktur
- Schnelleren Build-Zeiten

#### Service-basiertes State Management

Zentralisiertes State Management durch Services statt komplexer State Management Libraries:
- **BehaviorSubject** für reaktive State-Updates
- **RxJS Operators** für Datenfluss-Transformation
- **Observable Streams** für Komponenten-Kommunikation
- **Immutable State Updates** für Vorhersagbarkeit

#### Reactive Programming Patterns

Durchgehende Verwendung von RxJS für reaktive Programmierung:
- **debounceTime**: Für verzögerte Updates (z.B. DC-Input)
- **distinctUntilChanged**: Vermeidung redundanter Updates
- **map/filter**: Datenfluss-Transformation
- **takeUntil**: Automatisches Unsubscribe bei Component Destroy

#### Pure Functions

Kern-Logik (Würfelmechanik, Wahrscheinlichkeitsberechnungen) ist in Pure Functions implementiert:
- Vorhersagbares Verhalten
- Einfaches Testing
- Keine Seiteneffekte
- Wiederverwendbarkeit

#### Dependency Injection

Angular's Dependency Injection System für lose Kopplung:
- Services werden in Komponenten injiziert
- Einfaches Mocking für Tests
- Klare Abhängigkeiten

### Kern-Services

Die Anwendung verwendet neun spezialisierte Services für verschiedene Verantwortlichkeiten:

#### 1. DiceRoller Service
**Pfad**: [src/app/services/dice-roller.ts](src/app/services/dice-roller.ts)

**Verantwortlichkeit**: Kern-Würfellogik

**Funktionalität**:
- Würfeln einzelner Würfel und Würfelgruppen
- Anwendung von Keep/Drop-Mechaniken
- Vorteil/Nachteil-Berechnung
- Pure Functions für Testbarkeit
- Deterministische Zufallszahlen-Generierung

**Hauptmethoden**:
- `rollDice()`: Würfelt einen einzelnen Würfel
- `rollDiceGroup()`: Würfelt eine Gruppe von Würfeln mit Keep/Drop
- `rollExpression()`: Führt einen kompletten Wurf-Ausdruck aus

#### 2. ProbabilityCalculator Service
**Pfad**: [src/app/services/probability-calculator.ts](src/app/services/probability-calculator.ts)

**Verantwortlichkeit**: Wahrscheinlichkeitsberechnungen

**Funktionalität**:
- Exakte Berechnungen mittels Faltungsalgorithmus
- Monte-Carlo-Simulationen (100.000 Läufe)
- Automatische Methodenauswahl basierend auf Komplexität
- LRU-Cache für Performance (100 Einträge)
- Berechnung statistischer Kennzahlen

**Algorithmen**:
- Faltung für einfache Würfelausdrücke
- Simulation für komplexe Ausdrücke mit Keep/Drop
- DC-Erfolgswahrscheinlichkeit
- Verteilungsanalyse

#### 3. Historie Service
**Pfad**: [src/app/services/historie.ts](src/app/services/historie.ts)

**Verantwortlichkeit**: Verwaltung der Würfel-Historie

**Funktionalität**:
- Speicherung von bis zu 100 Würfen
- FIFO-Eviction-Policy
- localStorage-Persistierung
- Sitzungsverwaltung (1-Stunden-Timeout)
- Observable Stream für Komponenten

**Hauptmethoden**:
- `addRoll()`: Fügt einen neuen Wurf hinzu
- `getHistory()`: Gibt Historie als Observable zurück
- `clearHistory()`: Löscht alle Würfe
- `getLastRoll()`: Gibt den letzten Wurf zurück

#### 4. Preset Service
**Pfad**: [src/app/services/preset.ts](src/app/services/preset.ts)

**Verantwortlichkeit**: Preset-Verwaltung

**Funktionalität**:
- CRUD-Operationen für Presets
- Kategorisierung mit Tags
- localStorage-Persistierung
- Migrations-Support (Version 2 mit Kategorien)
- UUID-Generierung für eindeutige IDs

**Hauptmethoden**:
- `savePreset()`: Speichert ein neues Preset
- `loadPresets()`: Lädt alle Presets
- `deletePreset()`: Löscht ein Preset
- `migratePresets()`: Migriert alte Preset-Formate

#### 5. Statistics Service
**Pfad**: [src/app/services/statistics.ts](src/app/services/statistics.ts)

**Verantwortlichkeit**: Statistische Berechnungen

**Funktionalität**:
- Berechnung von Basis-Metriken
- Kritische Würfe (Nat 20/Nat 1) für d20
- Ergebnis-Verteilungsanalyse
- Würfeltyp-Nutzungsstatistiken
- Zeitbasierte Filter (Heute, Sitzung, Alle)

**Hauptmethoden**:
- `calculateStatistics()`: Berechnet alle Statistiken
- `filterByTime()`: Filtert Würfe nach Zeitraum
- `exportToJSON()`: Exportiert Statistiken als JSON
- `exportToCSV()`: Exportiert Statistiken als CSV

#### 6. Settings Service
**Pfad**: [src/app/services/settings.ts](src/app/services/settings.ts)

**Verantwortlichkeit**: Anwendungseinstellungen

**Funktionalität**:
- Theme-Verwaltung (Light/Dark)
- System-Präferenz-Erkennung (`prefers-color-scheme`)
- Zeitbasierte Auto-Umschaltung (20:00-08:00)
- localStorage-Persistierung
- Observable für Theme-Updates

**Hauptmethoden**:
- `toggleTheme()`: Wechselt zwischen Light und Dark
- `getTheme()`: Gibt aktuelles Theme als Observable zurück
- `detectSystemPreference()`: Erkennt System-Theme-Präferenz
- `getTimeBasedTheme()`: Berechnet Theme basierend auf Uhrzeit

#### 7. Modal Service
**Pfad**: [src/app/services/modal.service.ts](src/app/services/modal.service.ts)

**Verantwortlichkeit**: Modal-Dialog-Verwaltung

**Funktionalität**:
- Promise-basierte API für sauberes async/await
- Bestätigungs- und Alert-Dialoge
- Modal-Stacking (Queue-Verwaltung)
- Anpassbare Button-Texte
- Rückgabe von Boolean-Ergebnissen

**Hauptmethoden**:
- `confirm()`: Zeigt Bestätigungsdialog und gibt Promise zurück
- `alert()`: Zeigt Alert-Dialog
- `close()`: Schließt aktuellen Modal

#### 8. Toast Service
**Pfad**: [src/app/services/toast.service.ts](src/app/services/toast.service.ts)

**Verantwortlichkeit**: Toast-Benachrichtigungen

**Funktionalität**:
- Toast-Queue-Verwaltung (max. 5)
- Auto-Dismiss (konfigurierbar, default 4000ms)
- Verschiedene Toast-Typen (Success, Error, Info, Warning)
- Observable Stream für UI-Updates
- FIFO-Eviction bei Queue-Überlauf

**Hauptmethoden**:
- `show()`: Zeigt einen Toast
- `success()`, `error()`, `info()`, `warning()`: Type-spezifische Convenience-Methoden
- `dismiss()`: Schließt einen spezifischen Toast
- `getToasts()`: Gibt Toast-Liste als Observable zurück

#### 9. DiceExpressionState Service
**Pfad**: [src/app/services/dice-expression-state.ts](src/app/services/dice-expression-state.ts)

**Verantwortlichkeit**: Shared State für aktuellen Würfelausdruck

**Funktionalität**:
- Synchronisation zwischen DiceRoller und ProbabilityPanel
- BehaviorSubject für reaktive Updates
- Ermöglicht Live-Wahrscheinlichkeitsvorschau

**Hauptmethoden**:
- `updateExpression()`: Aktualisiert den aktuellen Ausdruck
- `getExpression()`: Gibt Ausdruck als Observable zurück

### Komponenten-Struktur

Die Anwendung ist in wiederverwendbare Komponenten organisiert:

```
AppRoot (app.ts)
├── DiceRoller (dice-roller/)
│   └── DiceGroupForm (dice-roller/ - nested form)
│       - Verwaltung einzelner Würfelgruppen
│       - Reactive Forms mit FormArray
│       - Validierung
├── RollHistory (roll-history/)
│   ├── RollResultDetail (roll-result-detail/)
│   │   - Anzeige einzelner Würfelergebnisse
│   │   - Detaillierte Aufschlüsselung
│   │   - Dropped-Würfel-Visualisierung
│   ├── ProbabilityPanel (probability-panel/)
│   │   - Wahrscheinlichkeitsberechnung
│   │   - DC-Input mit Debouncing
│   │   - Verteilungsdiagramm
│   │   - Statistikausgabe
│   └── StatisticsDashboard (statistics-dashboard/)
│       - Zeitfilter-Auswahl
│       - Metriken-Anzeige
│       - Export-Buttons
│       - Sitzungsverwaltung
├── PresetManager (preset-manager/)
│   - Preset-Speicherung
│   - Kategorie-Filter
│   - Preset-Liste
│   - Delete-Funktionalität
├── ThemeToggleComponent (theme-toggle/)
│   - Toggle-Button
│   - Icon-Animation
│   - Tastenkombinations-Tooltip
├── ToastContainerComponent (toast/)
│   └── ToastComponent (toast/ - individual toast)
│       - Toast-Anzeige
│       - Auto-Dismiss-Timer
│       - Dismiss-Button
└── ModalContainerComponent (modal/)
    └── ModalComponent (modal/ - individual modal)
        - Dialog-Anzeige
        - Button-Handling
        - Backdrop
```

### Datenmodelle

Die Anwendung verwendet typsichere TypeScript-Interfaces für alle Datenstrukturen:

#### DiceExpression
**Pfad**: [src/app/models/dice-expression.model.ts](src/app/models/dice-expression.model.ts)

Beschreibt eine vollständige Würfelkonfiguration:
```typescript
{
  groups: DiceGroup[];        // Array von Würfelgruppen
  modifier: number;           // Globaler Modifikator
}
```

#### DiceGroup
**Pfad**: [src/app/models/dice-group.model.ts](src/app/models/dice-group.model.ts)

Beschreibt eine einzelne Würfelgruppe:
```typescript
{
  count: number;              // Anzahl Würfel
  diceType: DiceType;         // Würfeltyp (d4-d100)
  keepDropType?: KeepDropType; // Optional: Keep/Drop-Mechanik
  keepDropCount?: number;     // Optional: Anzahl zu behalten/verwerfen
  advantage?: AdvantageType;  // Optional: Vorteil/Nachteil (nur d20)
}
```

#### RollResult
**Pfad**: [src/app/models/roll-result.model.ts](src/app/models/roll-result.model.ts)

Beschreibt das Ergebnis eines Wurfs:
```typescript
{
  expression: DiceExpression; // Ursprüngliche Konfiguration
  groupResults: DiceGroupResult[]; // Ergebnisse jeder Gruppe
  total: number;              // Endergebnis
  timestamp: Date;            // Zeitstempel
  notation: string;           // D&D-Notation
}
```

#### Preset
**Pfad**: [src/app/models/preset.model.ts](src/app/models/preset.model.ts)

Beschreibt ein gespeichertes Preset:
```typescript
{
  id: string;                 // UUID
  name: string;               // Preset-Name
  expression: DiceExpression; // Würfelkonfiguration
  category?: PresetCategory;  // Optional: Kategorie
  version: number;            // Format-Version (aktuell: 2)
}
```

#### ProbabilityResult
**Pfad**: [src/app/models/probability.model.ts](src/app/models/probability.model.ts)

Beschreibt eine Wahrscheinlichkeitsanalyse:
```typescript
{
  distribution: Map<number, number>; // Wert -> Wahrscheinlichkeit
  mean: number;               // Erwartungswert
  median: number;             // Median
  mode: number[];             // Modus (häufigste Werte)
  min: number;                // Minimum
  max: number;                // Maximum
  successProbability?: number; // Optional: Erfolgswahrscheinlichkeit für DC
  method: 'exact' | 'simulation'; // Verwendete Methode
}
```

#### StatisticsData
**Pfad**: [src/app/models/statistics.model.ts](src/app/models/statistics.model.ts)

Beschreibt aggregierte Statistiken:
```typescript
{
  totalRolls: number;
  averageResult: number;
  minResult: number;
  maxResult: number;
  totalSum: number;
  nat20Count?: number;        // Optional: Anzahl Nat 20
  nat1Count?: number;         // Optional: Anzahl Nat 1
  distribution: Map<number, number>; // Ergebnis-Häufigkeit
  diceTypeStats: Map<DiceType, DiceTypeStatistic>; // Pro-Würfel-Statistiken
}
```

### Algorithmen

#### Faltungsalgorithmus (Convolution)
**Pfad**: [src/app/utils/probability-algorithms.util.ts](src/app/utils/probability-algorithms.util.ts)

Der Faltungsalgorithmus berechnet exakte Wahrscheinlichkeitsverteilungen durch Kombination individueller Würfelverteilungen:

**Prinzip**:
1. Jeder Würfeltyp hat eine Grundverteilung (z.B. d6: 1-6 jeweils 1/6 Wahrscheinlichkeit)
2. Für mehrere Würfel werden die Verteilungen "gefaltet" (kombiniert)
3. Das Ergebnis ist eine exakte Wahrscheinlichkeitsverteilung für alle möglichen Summen

**Beispiel**: Für 2d6:
- Mögliche Summen: 2-12
- Wahrscheinlichkeit für 7: 6/36 (16,67%)
- Wahrscheinlichkeit für 2 oder 12: 1/36 (2,78%)

**Vorteile**:
- Mathematisch exakt
- Deterministisch
- Schnell für einfache Ausdrücke

**Nachteile**:
- Rechenintensiv bei vielen Würfeln
- Nicht praktikabel für sehr komplexe Ausdrücke

#### Keep/Drop-Algorithmus
**Pfad**: [src/app/services/probability-calculator.ts](src/app/services/probability-calculator.ts)

Für Keep/Drop-Mechaniken wird eine Enumeration aller möglichen Kombinationen durchgeführt:

**Prinzip**:
1. Alle möglichen Würfelkombinationen werden generiert
2. Für jede Kombination wird die Keep/Drop-Logik angewendet
3. Die Wahrscheinlichkeiten werden entsprechend aggregiert

**Beispiel**: Für 4d6kh3 (behalte höchste 3):
- Alle 1296 Kombinationen von 4d6 werden betrachtet
- Für jede Kombination werden die höchsten 3 Würfel summiert
- Die resultierende Verteilung zeigt die Wahrscheinlichkeit jeder möglichen Summe

**Komplexität**: O(n^k), wobei n = Würfelseiten, k = Anzahl Würfel

#### Monte-Carlo-Simulation
**Pfad**: [src/app/services/probability-calculator.ts](src/app/services/probability-calculator.ts)

Für komplexe Ausdrücke wird eine statistische Simulation durchgeführt:

**Prinzip**:
1. Der Würfelausdruck wird 100.000 Mal ausgeführt
2. Die Häufigkeit jedes Ergebnisses wird gezählt
3. Die relative Häufigkeit approximiert die Wahrscheinlichkeit

**Beispiel**: Für 10d20kh5+2d6dl1+15:
- 100.000 simulierte Würfe
- Statistische Genauigkeit: ±0,1% (bei 95% Konfidenz)

**Vorteile**:
- Funktioniert für beliebig komplexe Ausdrücke
- Gleichmäßige Performance

**Nachteile**:
- Nur Approximation (nicht exakt)
- Erfordert viele Iterationen für Genauigkeit

#### Schwellenwert-Logik
**Pfad**: [src/app/services/probability-calculator.ts](src/app/services/probability-calculator.ts)

Die Anwendung wählt automatisch zwischen Faltung und Simulation:

**Kriterium**: Anzahl möglicher Ergebnisse
- **< 10.000 Ergebnisse**: Exakte Berechnung (Faltung)
- **≥ 10.000 Ergebnisse**: Monte-Carlo-Simulation

**Berechnung der Ergebnisanzahl**:
- Ohne Keep/Drop: Produkt aller Würfelseiten
- Mit Keep/Drop: Kombinatorische Berechnung
- Mehrere Gruppen: Produkt der Gruppengrößen

Diese Logik gewährleistet optimale Performance bei maximaler Genauigkeit.

### Datenpersistenz

Alle Daten werden lokal im Browser mittels localStorage gespeichert:

#### localStorage-Struktur

**Schlüssel**:
- `dnd-roller-history`: Array von RollResult-Objekten (max. 100)
- `dnd-roller-presets`: Array von Preset-Objekten (unbegrenzt)
- `dnd-roller-settings`: Objekt mit Theme-Einstellungen
- `dnd-roller-session`: Sitzungsinformationen (Timestamp)

**Serialisierung**: Alle Objekte werden als JSON gespeichert.

**Deserialisierung**: Beim Laden werden Timestamps als Date-Objekte wiederhergestellt.

#### Automatische Migration

Das System unterstützt Migrations-Logik für Breaking Changes:

**Preset-Migration (v1 → v2)**:
- Version 1: Presets ohne Kategorien
- Version 2: Presets mit optionalem `category`-Feld
- Migration: Automatisch beim Laden, fügt `version: 2` hinzu

**Mechanismus**:
1. Beim Laden von Presets wird Version geprüft
2. Alte Formate werden automatisch konvertiert
3. Neue Formate werden zurückgeschrieben

#### Fehlerbehandlung

**Quota Exceeded**: Falls localStorage-Limit erreicht:
- Älteste Einträge werden entfernt (FIFO)
- Benutzer wird benachrichtigt (Toast)
- Graceful Degradation (App bleibt funktional)

**Parse-Fehler**: Bei korrupten Daten:
- Daten werden zurückgesetzt
- Benutzer wird informiert
- Fallback auf Standardwerte

#### Sitzungsverwaltung

**Session Timeout**: 1 Stunde Inaktivität
- Nach Timeout: Neue Sitzung startet
- Alte Daten bleiben erhalten (für "Alle"-Filter)
- Session-Filter zeigt nur aktuelle Sitzung

**Implementierung**:
- Timestamp bei jedem Wurf aktualisiert
- Beim Laden: Prüfung der Zeitdifferenz
- Bei Überschreitung: Session-Reset

## Installation und Entwicklung

### Voraussetzungen

Die folgenden Tools müssen installiert sein:

- **Node.js** 18.x oder höher
- **npm** (wird mit Node.js installiert)
- **Angular CLI** 20.3 oder höher (optional, aber empfohlen)
- **Moderner Web-Browser** mit ES2022-Support (Chrome 94+, Firefox 93+, Safari 15+, Edge 94+)

### Installation

1. Repository klonen:
```bash
git clone <repository-url>
cd d-and-d-dicer
```

2. Abhängigkeiten installieren:
```bash
npm install
```

### Entwicklung

#### Entwicklungsserver starten

```bash
npm start
# oder
ng serve
```

Die Anwendung ist danach unter `http://localhost:4200/` erreichbar. Die Anwendung lädt automatisch neu, wenn Quelldateien geändert werden (Hot Module Replacement).

#### Development Build mit Watch Mode

Für manuelle Builds während der Entwicklung:

```bash
npm run watch
```

Dieser Befehl erstellt einen Development Build und überwacht Dateiänderungen für automatische Rebuilds.

### Build

#### Development Build

Erstellt einen nicht-optimierten Build für Entwicklungszwecke:

```bash
ng build
```

Output-Verzeichnis: `dist/d-and-d-dicer/browser/`

Eigenschaften:
- Source Maps aktiviert
- Keine Optimierungen
- Größerer Bundle-Größe
- Schnellere Build-Zeit

#### Production Build

Erstellt einen optimierten Build für Produktion:

```bash
npm run build
# oder
ng build --configuration production
```

Output-Verzeichnis: `dist/d-and-d-dicer/browser/`

Eigenschaften:
- AOT (Ahead-of-Time) Compilation
- Minifizierung und Uglification
- Tree-Shaking (Entfernung ungenutzten Codes)
- Output Hashing (für Cache-Busting)
- Bundle-Größen-Optimierung

#### Bundle-Größen-Budgets

Die Anwendung verwendet strenge Bundle-Größen-Limits:
- **Initial Bundle**: 500 KB Warnung, 1 MB Fehler
- **Component Styles**: 8 KB Warnung, 12 KB Fehler

Bei Überschreitung der Limits schlägt der Build fehl.

### Tests

#### Unit Tests ausführen

```bash
npm test
# oder
ng test
```

Startet den Karma Test Runner im Watch Mode. Tests werden bei Dateiänderungen automatisch erneut ausgeführt.

#### Test-Konfiguration

- **Test Runner**: Karma 6.4
- **Framework**: Jasmine 5.9
- **Browser**: Chrome (headless für CI/CD)
- **Coverage**: Aktiviert via `karma-coverage`

#### Test-Struktur

Tests befinden sich neben den jeweiligen Komponenten/Services:
- `component-name.component.spec.ts`
- `service-name.service.spec.ts`

### Code-Formatierung

Das Projekt verwendet Prettier für einheitliche Code-Formatierung:

**Konfiguration**:
- Print Width: 100 Zeichen
- Single Quotes: Aktiviert
- Angular HTML Parser für Templates

**Manuelles Formatieren**:
```bash
npx prettier --write "src/**/*.{ts,html,scss}"
```

## Projektstruktur

```
d-and-d-dicer/
├── src/
│   ├── app/
│   │   ├── components/              # UI-Komponenten
│   │   │   ├── dice-roller/         # Hauptinterface für Würfelkonfiguration
│   │   │   │   ├── dice-roller.ts
│   │   │   │   ├── dice-roller.html
│   │   │   │   └── dice-roller.scss
│   │   │   ├── preset-manager/      # Preset-Verwaltung
│   │   │   │   ├── preset-manager.ts
│   │   │   │   ├── preset-manager.html
│   │   │   │   └── preset-manager.scss
│   │   │   ├── roll-history/        # Historie-Hauptkomponente
│   │   │   │   ├── roll-history.ts
│   │   │   │   ├── roll-history.html
│   │   │   │   ├── roll-history.scss
│   │   │   │   ├── probability-panel/      # Wahrscheinlichkeitsanalyse
│   │   │   │   │   ├── probability-panel.ts
│   │   │   │   │   ├── probability-panel.html
│   │   │   │   │   └── probability-panel.scss
│   │   │   │   ├── statistics-dashboard/   # Statistik-Dashboard
│   │   │   │   │   ├── statistics-dashboard.ts
│   │   │   │   │   ├── statistics-dashboard.html
│   │   │   │   │   └── statistics-dashboard.scss
│   │   │   │   └── roll-result-detail/     # Einzelne Würfelergebnis-Anzeige
│   │   │   │       ├── roll-result-detail.ts
│   │   │   │       ├── roll-result-detail.html
│   │   │   │       └── roll-result-detail.scss
│   │   │   ├── theme-toggle/        # Dark Mode Toggle
│   │   │   │   ├── theme-toggle.component.ts
│   │   │   │   ├── theme-toggle.component.html
│   │   │   │   └── theme-toggle.component.scss
│   │   │   ├── toast/               # Toast-Benachrichtigungen
│   │   │   │   ├── toast.component.ts
│   │   │   │   ├── toast.component.html
│   │   │   │   ├── toast.component.scss
│   │   │   │   ├── toast-container.component.ts
│   │   │   │   ├── toast-container.component.html
│   │   │   │   └── toast-container.component.scss
│   │   │   └── modal/               # Modale Dialoge
│   │   │       ├── modal.component.ts
│   │   │       ├── modal.component.html
│   │   │       ├── modal.component.scss
│   │   │       ├── modal-container.component.ts
│   │   │       ├── modal-container.component.html
│   │   │       └── modal-container.component.scss
│   │   ├── services/                # Business Logic und State Management
│   │   │   ├── dice-roller.ts       # Kern-Würfellogik
│   │   │   ├── probability-calculator.ts # Wahrscheinlichkeitsberechnungen
│   │   │   ├── historie.ts          # Roll History Management
│   │   │   ├── preset.ts            # Preset-Verwaltung
│   │   │   ├── statistics.ts        # Statistik-Berechnungen
│   │   │   ├── settings.ts          # Theme und Einstellungen
│   │   │   ├── toast.service.ts     # Toast-Service
│   │   │   ├── modal.service.ts     # Modal-Service
│   │   │   └── dice-expression-state.ts # Shared Expression State
│   │   ├── models/                  # TypeScript-Interfaces
│   │   │   ├── dice-expression.model.ts
│   │   │   ├── dice-group.model.ts
│   │   │   ├── roll-result.model.ts
│   │   │   ├── preset.model.ts
│   │   │   ├── probability.model.ts
│   │   │   ├── statistics.model.ts
│   │   │   ├── modal.model.ts
│   │   │   └── toast.model.ts
│   │   ├── types/                   # Type Definitions
│   │   │   ├── dice-types.ts        # DiceType, AdvantageType, KeepDropType
│   │   │   └── preset-category.type.ts
│   │   ├── utils/                   # Utility-Funktionen
│   │   │   ├── dice-notation.util.ts # D&D-Notation-Generierung
│   │   │   ├── probability-algorithms.util.ts # Mathematische Algorithmen
│   │   │   └── uuid.util.ts         # UUID-Generierung
│   │   ├── pipes/                   # Angular Pipes
│   │   │   └── dice-notation.pipe.ts # Formatierung für D&D-Notation
│   │   ├── app.ts                   # Root-Komponente (Logik)
│   │   ├── app.html                 # Root-Template
│   │   ├── app.scss                 # Root-Styles
│   │   ├── app.config.ts            # App-Konfiguration und Providers
│   │   └── app.routes.ts            # Routing-Konfiguration
│   ├── main.ts                      # Application Bootstrap
│   └── styles.scss                  # Globale Styles (Themes, CSS Variables)
├── public/                          # Statische Assets
│   └── favicon.ico
├── angular.json                     # Angular CLI Konfiguration
├── tsconfig.json                    # TypeScript Compiler-Konfiguration
├── tsconfig.app.json                # App-spezifische TS-Konfiguration
├── tsconfig.spec.json               # Test-spezifische TS-Konfiguration
├── package.json                     # NPM Dependencies und Scripts
├── .editorconfig                    # Editor-Konfiguration
├── .gitignore                       # Git Ignore-Regeln
└── README.md                        # Diese Datei
```

### Wichtige Verzeichnisse

**`src/app/components/`**: Alle UI-Komponenten, organisiert nach Feature-Bereichen.

**`src/app/services/`**: Alle Services für Business Logic und State Management.

**`src/app/models/`**: TypeScript-Interfaces für typsichere Datenstrukturen.

**`src/app/utils/`**: Wiederverwendbare Utility-Funktionen (Pure Functions).

**`src/app/pipes/`**: Custom Angular Pipes für Template-Transformationen.

## Verwendung

### Grundlegende Würfe

1. **Würfeltyp auswählen**: Einen der verfügbaren Würfeltypen (d4, d6, d8, d10, d12, d20, d100) aus dem Dropdown wählen.

2. **Anzahl festlegen**: Die Anzahl der zu würfelnden Würfel eingeben (z.B. 2 für 2d6).

3. **Optional: Modifikator hinzufügen**: Einen globalen Modifikator eingeben (z.B. +5 für einen Angriffsbonus).

4. **Würfeln**: Den "Roll"-Button klicken.

5. **Ergebnis einsehen**: Das Ergebnis erscheint in der Historie mit detaillierter Aufschlüsselung.

### Erweiterte Würfe

#### Keep/Drop-Mechaniken verwenden

**Beispiel: 4d6, höchste 3 behalten (für D&D-Charakterattribute)**:

1. Würfelgruppe hinzufügen: d6
2. Anzahl: 4
3. Keep/Drop: "Keep Highest" auswählen
4. Anzahl: 3 eingeben
5. Würfeln

**Notation**: `4d6kh3`

#### Vorteil/Nachteil für d20

**Beispiel: Angriffswurf mit Vorteil**:

1. Würfelgruppe hinzufügen: d20
2. Vorteil/Nachteil: "Advantage" auswählen
3. Optional: Modifikator hinzufügen (z.B. +7)
4. Würfeln

**Notation**: `2d20kh1+7`

Das System würfelt automatisch 2d20 und nimmt das höhere Ergebnis.

#### Mehrere Würfelgruppen kombinieren

**Beispiel: Angriff mit Flammenzunge (1d8 + 2d6 Feuerschaden + 5)**:

1. Erste Gruppe: 1d8
2. "Add Dice Group" klicken
3. Zweite Gruppe: 2d6
4. Globaler Modifikator: +5
5. Würfeln

**Notation**: `1d8+2d6+5`

### Presets erstellen und laden

#### Preset erstellen:

1. Würfelkonfiguration wie gewünscht einstellen
2. Im Preset-Manager einen Namen eingeben
3. Optional: Kategorie auswählen (z.B. "Combat" für Kampfwürfe)
4. "Save Preset" klicken

#### Preset laden:

1. Optional: Nach Kategorie filtern
2. Gewünschtes Preset in der Liste finden
3. "Load"-Button klicken
4. Die Würfelkonfiguration wird automatisch wiederhergestellt

#### Preset löschen:

1. "Delete"-Button beim gewünschten Preset klicken
2. Bestätigung im Dialog

### Wahrscheinlichkeiten analysieren

1. Würfelkonfiguration einstellen (wird automatisch analysiert)
2. Zum "Probabilities"-Tab wechseln
3. Die Wahrscheinlichkeitsverteilung wird angezeigt
4. Optional: Target DC eingeben (z.B. 15 für eine DC 15 Skill Check)
5. Erfolgswahrscheinlichkeit wird farbcodiert angezeigt:
   - **Grün**: ≥70% Erfolgswahrscheinlichkeit
   - **Orange**: 30-70% Erfolgswahrscheinlichkeit
   - **Rot**: <30% Erfolgswahrscheinlichkeit
6. Statistiken einsehen (Erwartungswert, Median, Modus, Min/Max)
7. Verteilungsdiagramm analysieren

### Statistiken einsehen und exportieren

#### Statistiken einsehen:

1. Zum "Statistics"-Tab wechseln
2. Zeitfilter auswählen:
   - **Today**: Würfe seit Mitternacht
   - **Session**: Würfe der aktuellen Sitzung
   - **All**: Alle gespeicherten Würfe
3. Metriken und Diagramme analysieren

#### Statistiken exportieren:

**JSON-Export**:
1. "Export JSON"-Button klicken
2. Datei wird automatisch heruntergeladen
3. Format: Strukturiertes JSON für weitere Verarbeitung

**CSV-Export**:
1. "Export CSV"-Button klicken
2. Datei wird automatisch heruntergeladen
3. Format: Tabellenformat für Excel, Google Sheets, etc.

#### Neue Sitzung starten:

1. "New Session"-Button klicken
2. Bestätigung im Dialog
3. Sitzungs-Filter wird zurückgesetzt

#### Historie löschen:

1. "Clear History"-Button klicken
2. Bestätigung im Dialog
3. Alle Würfe werden gelöscht (nicht rückgängig machbar)

## Tastenkombinationen

Die Anwendung unterstützt die folgenden Tastenkombinationen:

- **Strg+Shift+D** (Windows/Linux) / **Cmd+Shift+D** (macOS): Dark Mode umschalten

## Technologie-Stack

### Frontend Framework
- **Angular** 20.3.16
  - Standalone Components (kein NgModules)
  - Reactive Forms
  - Angular Animations
  - Dependency Injection
- **TypeScript** 5.9.2
  - Strict Mode aktiviert
  - ES2022 Target
  - Experimentelle Decorators

### Reactive Programming
- **RxJS** 7.8.0
  - BehaviorSubject für State
  - Observable Streams
  - Operators: debounceTime, distinctUntilChanged, map, filter, takeUntil

### Styling
- **SCSS** (Sass)
  - CSS Custom Properties für Theming
  - Component-scoped Styles
  - Gradient Backgrounds
  - Responsive Design

### State Management
- Service-basierte Architektur
  - BehaviorSubject für reaktive Updates
  - localStorage für Persistenz
  - Immutable State Updates

### Dependencies
- **date-fns** 4.1.0 - Datum-Formatierung und -Manipulation
- **uuid** 13.0.0 - Eindeutige ID-Generierung für Presets

### Development Tools
- **Angular CLI** 20.3.7 - Build-System und Entwicklungstools
- **esbuild** - Schneller JavaScript/TypeScript-Bundler
- **Karma** 6.4.0 - Test Runner
- **Jasmine** 5.9.0 - Testing Framework
- **Prettier** - Code-Formatierung (100 Zeichen, Single Quotes)

### Build & Deployment
- **@angular/build** - Angular Build System (esbuild-basiert)
- AOT (Ahead-of-Time) Compilation für Production
- Tree-Shaking für optimale Bundle-Größe
- Output Hashing für Cache-Busting
- Bundle-Größen-Budgets (500 KB initial, 1 MB max)

## Browser-Kompatibilität

Die Anwendung erfordert einen modernen Browser mit folgenden Features:

### Erforderliche Features
- **ES2022-Support** (Classes, Modules, async/await, etc.)
- **localStorage API** für Datenpersistenz
- **CSS Custom Properties** (CSS Variables) für Theming
- **CSS Grid** und **Flexbox** für Layout

### Unterstützte Browser (Minimum-Versionen)
- **Google Chrome** 94+
- **Mozilla Firefox** 93+
- **Apple Safari** 15+
- **Microsoft Edge** 94+
- **Opera** 80+

### Nicht unterstützt
- Internet Explorer (alle Versionen)
- Ältere mobile Browser ohne ES2022-Support

### Progressive Enhancement
- Die Anwendung prüft `prefers-color-scheme` für automatische Theme-Erkennung
- Zeitbasierte Theme-Umschaltung nutzt Browser-Datums-API

## Datenschutz und Speicherung

### Lokale Datenspeicherung

Alle Daten werden ausschließlich lokal im Browser des Benutzers gespeichert:

**Gespeicherte Daten**:
- **Würfel-Historie**: Bis zu 100 Würfelergebnisse
- **Presets**: Unbegrenzte Anzahl gespeicherter Würfelkonfigurationen
- **Einstellungen**: Theme-Präferenz (Light/Dark)
- **Sitzungsinformationen**: Timestamp der letzten Aktivität

**Speicherort**: Browser localStorage (typischerweise unter `C:\Users\<user>\AppData\Local\<browser>\User Data\Default\Local Storage` auf Windows)

### Keine Server-Kommunikation

Die Anwendung ist eine vollständig client-seitige Single-Page-Application (SPA):
- **Keine API-Aufrufe**: Es werden keine Daten an externe Server gesendet
- **Keine Telemetrie**: Keine Nutzungsstatistiken oder Analytics
- **Keine Tracking-Cookies**: Keine Cookies werden gesetzt
- **Vollständig offline-fähig**: Nach dem ersten Laden funktioniert die App auch ohne Internet-Verbindung

### Datenlöschung

Alle Daten können jederzeit gelöscht werden:

**Einzelne Presets löschen**: Via "Delete"-Button im Preset-Manager

**Historie löschen**: Via "Clear History"-Button im History-Tab

**Alle Daten löschen**: Durch Löschen der Browser-Daten (localStorage):
- Chrome: Einstellungen → Datenschutz und Sicherheit → Browserdaten löschen → Cookies und Websitedaten
- Firefox: Einstellungen → Datenschutz & Sicherheit → Cookies und Website-Daten → Daten entfernen
- Safari: Einstellungen → Datenschutz → Website-Daten verwalten

### Datenportabilität

**Export**: Statistiken können als JSON oder CSV exportiert werden.

**Import**: Aktuell kein Import von Presets oder Historie implementiert (zukünftige Feature-Möglichkeit).

### Datensicherheit

- **Keine sensiblen Daten**: Die Anwendung speichert nur Würfelkonfigurationen und -ergebnisse
- **Lokale Speicherung**: Daten verbleiben auf dem Gerät des Benutzers
- **Browser-Sicherheit**: Profitiert von der Same-Origin-Policy und localStorage-Sicherheit des Browsers

## Lizenz

MIT License

Copyright (c) 2026 D&D Dice Roller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
