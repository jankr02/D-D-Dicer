import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CharacterService } from '../../services/character';
import { ModalService } from '../../services/modal.service';
import { ComputedCharacterValues } from '../../models/character.model';
import { Ability, ABILITY_LABELS } from '../../types/character-types';

/**
 * CharacterSheet Component - Charakterbogen Verwaltung.
 *
 * Ermöglicht die Eingabe und Verwaltung von:
 * - Charaktername
 * - Level (1-20)
 * - Ability Scores (STR, DEX, CON, INT, WIS, CHA)
 *
 * Zeigt automatisch berechnete Werte:
 * - Ability Modifiers
 * - Proficiency Bonus
 */
@Component({
  selector: 'app-character-sheet',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './character-sheet.html',
  styleUrl: './character-sheet.scss',
})
export class CharacterSheet implements OnInit, OnDestroy {
  characterForm!: FormGroup;
  computedValues: ComputedCharacterValues | null = null;

  // Liste der Abilities für *ngFor
  abilities: Ability[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToCharacter();
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialisiert das Formular mit Default-Werten.
   */
  private initializeForm(): void {
    this.characterForm = this.fb.group({
      name: [''],
      level: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      abilityScores: this.fb.group({
        STR: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
        DEX: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
        CON: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
        INT: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
        WIS: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
        CHA: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
      }),
    });
  }

  /**
   * Subscribt auf Charakter-Änderungen vom Service.
   */
  private subscribeToCharacter(): void {
    // Charakter laden
    this.characterService.character$
      .pipe(takeUntil(this.destroy$))
      .subscribe(character => {
        if (character) {
          this.characterForm.patchValue({
            name: character.name,
            level: character.level,
            abilityScores: character.abilityScores,
          }, { emitEvent: false });
        }
      });

    // Berechnete Werte laden
    this.characterService.computedValues$
      .pipe(takeUntil(this.destroy$))
      .subscribe(computed => {
        this.computedValues = computed;
      });
  }

  /**
   * Subscribt auf Form-Änderungen für Auto-Save.
   */
  private subscribeToFormChanges(): void {
    this.characterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveCharacter();
      });
  }

  /**
   * Speichert den aktuellen Formular-Zustand.
   */
  private saveCharacter(): void {
    if (this.characterForm.invalid) {
      return;
    }

    const formValue = this.characterForm.value;

    this.characterService.updateCharacter({
      name: formValue.name,
      level: formValue.level,
      abilityScores: formValue.abilityScores,
    });
  }

  /**
   * Löscht den Charakter nach Bestätigung.
   */
  async resetCharacter(): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Charakter zurücksetzen',
      'Möchten Sie den aktuellen Charakter wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
    );

    if (confirmed) {
      this.characterService.clearCharacter();
      // Formular auf Default-Werte zurücksetzen
      this.characterForm.reset({
        name: '',
        level: 1,
        abilityScores: {
          STR: 10,
          DEX: 10,
          CON: 10,
          INT: 10,
          WIS: 10,
          CHA: 10,
        },
      });
    }
  }

  /**
   * Gibt das Label für eine Ability zurück.
   */
  getAbilityLabel(ability: Ability): string {
    return `${ABILITY_LABELS[ability]} (${ability})`;
  }

  /**
   * Formatiert einen Modifier mit Vorzeichen.
   */
  formatModifier(value: number | undefined): string {
    if (value === undefined) return '+0';
    if (value >= 0) return `+${value}`;
    return `${value}`;
  }

  /**
   * Prüft ob ein Charakter existiert.
   */
  hasCharacter(): boolean {
    return this.characterService.getCharacter() !== null;
  }
}
