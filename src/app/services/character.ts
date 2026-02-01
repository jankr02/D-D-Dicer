import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Character, AbilityScores, ComputedCharacterValues } from '../models/character.model';
import { CharacterModifier } from '../models/modifier.model';
import { Ability } from '../types/character-types';

/**
 * CharacterService - Verwaltet den Charakterbogen.
 *
 * Der Charakterbogen wird in localStorage persistiert und über
 * BehaviorSubject reaktiv verfügbar gemacht. Berechnete Werte
 * (Ability Modifiers, Proficiency Bonus) werden automatisch
 * aus den Grundwerten abgeleitet.
 */
@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private readonly STORAGE_KEY = 'dnd_dicer_character';

  private characterSubject = new BehaviorSubject<Character | null>(null);
  public character$ = this.characterSubject.asObservable();

  /**
   * Observable für berechnete Charakterwerte.
   * Wird automatisch aktualisiert wenn sich der Charakter ändert.
   */
  public computedValues$: Observable<ComputedCharacterValues | null>;

  constructor() {
    this.loadCharacter();

    // Berechnete Werte als Observable bereitstellen
    this.computedValues$ = this.character$.pipe(
      map(char => char ? this.computeValues(char) : null)
    );
  }

  /**
   * Berechnet den Ability Modifier aus einem Score.
   * Formel: floor((score - 10) / 2)
   *
   * Beispiele:
   *   Score 10-11 → Modifier +0
   *   Score 14-15 → Modifier +2
   *   Score 20    → Modifier +5
   *   Score 8     → Modifier -1
   */
  static calculateAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Berechnet den Proficiency Bonus aus dem Level.
   * Formel: floor((level - 1) / 4) + 2
   *
   * Level 1-4:   +2
   * Level 5-8:   +3
   * Level 9-12:  +4
   * Level 13-16: +5
   * Level 17-20: +6
   */
  static calculateProficiencyBonus(level: number): number {
    return Math.floor((level - 1) / 4) + 2;
  }

  /**
   * Berechnet alle abgeleiteten Werte aus einem Character.
   */
  private computeValues(char: Character): ComputedCharacterValues {
    const abilityModifiers: AbilityScores = {
      STR: CharacterService.calculateAbilityModifier(char.abilityScores.STR),
      DEX: CharacterService.calculateAbilityModifier(char.abilityScores.DEX),
      CON: CharacterService.calculateAbilityModifier(char.abilityScores.CON),
      INT: CharacterService.calculateAbilityModifier(char.abilityScores.INT),
      WIS: CharacterService.calculateAbilityModifier(char.abilityScores.WIS),
      CHA: CharacterService.calculateAbilityModifier(char.abilityScores.CHA),
    };

    const proficiencyBonus = CharacterService.calculateProficiencyBonus(char.level);

    return {
      abilityModifiers,
      proficiencyBonus,
    };
  }

  /**
   * Lädt den Charakter aus localStorage.
   * Wird automatisch im Constructor aufgerufen.
   */
  private loadCharacter(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const character: Character = JSON.parse(stored);
        this.characterSubject.next(character);
      } else {
        // Kein Charakter gespeichert - bleibt null
        this.characterSubject.next(null);
      }
    } catch (error) {
      console.error('Failed to load character from localStorage:', error);
      this.characterSubject.next(null);
    }
  }

  /**
   * Speichert den aktuellen Charakter in localStorage.
   */
  private saveCharacter(): void {
    try {
      const character = this.characterSubject.value;
      if (character) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(character));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save character to localStorage:', error);
      throw new Error('Failed to save character');
    }
  }

  /**
   * Gibt den aktuellen Charakter zurück (synchron).
   */
  getCharacter(): Character | null {
    return this.characterSubject.value;
  }

  /**
   * Aktualisiert den Charakter mit neuen Werten.
   * Wenn kein Charakter existiert, wird ein neuer erstellt.
   *
   * @param updates Partielle Updates für den Charakter
   */
  updateCharacter(updates: Partial<Omit<Character, 'id'>>): void {
    const current = this.characterSubject.value;

    let updated: Character;

    if (current) {
      // Bestehenden Charakter aktualisieren
      updated = {
        ...current,
        ...updates,
      };
    } else {
      // Neuen Charakter erstellen mit Default-Werten
      updated = {
        id: crypto.randomUUID(),
        name: updates.name || '',
        level: updates.level || 1,
        abilityScores: updates.abilityScores || {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        },
      };
    }

    this.characterSubject.next(updated);
    this.saveCharacter();
  }

  /**
   * Aktualisiert einen einzelnen Ability Score.
   *
   * @param ability Die zu aktualisierende Ability
   * @param value Der neue Wert (1-30)
   */
  updateAbilityScore(ability: Ability, value: number): void {
    const current = this.characterSubject.value;

    if (!current) {
      console.warn('Cannot update ability score: No character exists');
      return;
    }

    // Validierung
    if (value < 1 || value > 30) {
      console.warn(`Invalid ability score value: ${value}. Must be between 1 and 30.`);
      return;
    }

    const updated: Character = {
      ...current,
      abilityScores: {
        ...current.abilityScores,
        [ability]: value,
      },
    };

    this.characterSubject.next(updated);
    this.saveCharacter();
  }

  /**
   * Setzt das Level des Charakters.
   *
   * @param level Das neue Level (1-20)
   */
  setLevel(level: number): void {
    const current = this.characterSubject.value;

    if (!current) {
      console.warn('Cannot set level: No character exists');
      return;
    }

    // Validierung
    if (level < 1 || level > 20) {
      console.warn(`Invalid level: ${level}. Must be between 1 and 20.`);
      return;
    }

    const updated: Character = {
      ...current,
      level,
    };

    this.characterSubject.next(updated);
    this.saveCharacter();
  }

  /**
   * Löscht den aktuellen Charakter.
   */
  clearCharacter(): void {
    this.characterSubject.next(null);
    this.saveCharacter();
  }

  /**
   * Löst einen CharacterModifier in einen numerischen Wert auf.
   * Gibt null zurück, wenn kein Charakter vorhanden ist.
   *
   * @param modifier Der aufzulösende CharacterModifier
   * @returns Der berechnete Modifikator-Wert, oder null wenn kein Charakter existiert
   */
  resolveModifier(modifier: CharacterModifier): number | null {
    const char = this.characterSubject.getValue();
    if (!char) {
      return null;
    }

    let total = modifier.additionalBonus;

    // Ability Modifier hinzufügen
    if (modifier.ability) {
      const score = char.abilityScores[modifier.ability];

      // Validierung
      if (score < 1 || score > 30) {
        console.warn(`Invalid ability score for ${modifier.ability}: ${score}`);
        return null;
      }

      total += CharacterService.calculateAbilityModifier(score);
    }

    // Proficiency Bonus hinzufügen
    if (modifier.includeProficiency) {
      // Validierung
      if (char.level < 1 || char.level > 20) {
        console.warn(`Invalid character level: ${char.level}`);
        return null;
      }

      total += CharacterService.calculateProficiencyBonus(char.level);
    }

    return total;
  }
}
