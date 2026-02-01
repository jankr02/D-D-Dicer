import { Component, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Modifier, FixedModifier, CharacterModifier } from '../../models/modifier.model';
import { Ability, ABILITY_LABELS } from '../../types/character-types';
import { CharacterService } from '../../services/character';
import { ComputedCharacterValues } from '../../models/character.model';

/**
 * ModifierInput Component - Custom Form Control für Modifier.
 *
 * Implementiert ControlValueAccessor für Integration mit Angular Forms.
 * Unterstützt zwei Modi:
 * - Fixed: Manueller numerischer Modifier
 * - Character: Dynamischer Modifier basierend auf Charakterwerten
 */
@Component({
  selector: 'app-modifier-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './modifier-input.html',
  styleUrl: './modifier-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ModifierInput),
      multi: true
    }
  ]
})
export class ModifierInput implements OnInit, OnDestroy, ControlValueAccessor {
  // Modus: fixed oder character
  modifierType: 'fixed' | 'character' = 'fixed';

  // Fixed Mode
  fixedValue: number = 0;

  // Character Mode
  selectedAbility: Ability | null = null;
  includeProficiency: boolean = false;
  additionalBonus: number = 0;

  // Charakter-Daten
  hasCharacter: boolean = false;
  computedValues: ComputedCharacterValues | null = null;

  // Abilities für Dropdown
  abilities: (Ability | null)[] = [null, 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  private destroy$ = new Subject<void>();
  private onChange: (value: Modifier) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private characterService: CharacterService) {}

  ngOnInit(): void {
    // Subscribe auf Charakter-Änderungen
    this.characterService.character$
      .pipe(takeUntil(this.destroy$))
      .subscribe(character => {
        this.hasCharacter = character !== null;
      });

    // Subscribe auf berechnete Werte
    this.characterService.computedValues$
      .pipe(takeUntil(this.destroy$))
      .subscribe(computed => {
        this.computedValues = computed;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== ControlValueAccessor Implementation =====

  writeValue(modifier: Modifier): void {
    if (!modifier) {
      // Default: Fixed mit 0
      this.modifierType = 'fixed';
      this.fixedValue = 0;
      return;
    }

    if (modifier.type === 'fixed') {
      this.modifierType = 'fixed';
      this.fixedValue = modifier.value;
    } else {
      this.modifierType = 'character';
      this.selectedAbility = modifier.ability;
      this.includeProficiency = modifier.includeProficiency;
      this.additionalBonus = modifier.additionalBonus;
    }
  }

  registerOnChange(fn: (value: Modifier) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // ===== Interner State Management =====

  /**
   * Wird aufgerufen wenn sich ein Wert ändert.
   */
  onValueChange(): void {
    this.onTouched();
    this.onChange(this.getCurrentModifier());
  }

  /**
   * Gibt den aktuellen Modifier-Wert zurück.
   */
  private getCurrentModifier(): Modifier {
    if (this.modifierType === 'fixed') {
      return {
        type: 'fixed',
        value: this.fixedValue
      } as FixedModifier;
    } else {
      return {
        type: 'character',
        ability: this.selectedAbility,
        includeProficiency: this.includeProficiency,
        additionalBonus: this.additionalBonus
      } as CharacterModifier;
    }
  }

  /**
   * Wechselt zwischen Fixed und Character Modus.
   */
  switchMode(mode: 'fixed' | 'character'): void {
    this.modifierType = mode;
    this.onValueChange();
  }

  /**
   * Berechnet den Gesamt-Modifikator (nur für Preview).
   */
  getPreviewValue(): number | null {
    if (this.modifierType === 'fixed') {
      return this.fixedValue;
    }

    // Character Modifier
    if (!this.hasCharacter || !this.computedValues) {
      return null;
    }

    let total = this.additionalBonus;

    if (this.selectedAbility) {
      total += this.computedValues.abilityModifiers[this.selectedAbility];
    }

    if (this.includeProficiency) {
      total += this.computedValues.proficiencyBonus;
    }

    return total;
  }

  /**
   * Generiert die Formel-Anzeige für CharacterModifier.
   */
  getFormulaDisplay(): string {
    if (this.modifierType === 'fixed') {
      return '';
    }

    if (!this.hasCharacter || !this.computedValues) {
      return 'Kein Charakter';
    }

    const parts: string[] = [];

    if (this.selectedAbility) {
      const mod = this.computedValues.abilityModifiers[this.selectedAbility];
      const sign = mod >= 0 ? '+' : '';
      parts.push(`${this.selectedAbility} ${sign}${mod}`);
    }

    if (this.includeProficiency) {
      parts.push(`Prof +${this.computedValues.proficiencyBonus}`);
    }

    if (this.additionalBonus !== 0) {
      const sign = this.additionalBonus >= 0 ? '+' : '';
      parts.push(`Bonus ${sign}${this.additionalBonus}`);
    }

    if (parts.length === 0) {
      return '—';
    }

    return parts.join(', ');
  }

  /**
   * Gibt das Label für eine Ability zurück.
   */
  getAbilityLabel(ability: Ability | null): string {
    if (ability === null) {
      return 'Keins';
    }
    return ABILITY_LABELS[ability];
  }

  /**
   * Formatiert einen Modifier mit Vorzeichen.
   */
  formatModifier(value: number | null): string {
    if (value === null) return '?';
    if (value >= 0) return `+${value}`;
    return `${value}`;
  }
}
