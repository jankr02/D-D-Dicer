import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { DiceRoller as DiceRollerService } from '../../services/dice-roller';
import { Historie } from '../../services/historie';
import { DiceExpression, DiceGroup } from '../../models';
import { DiceType, AdvantageType } from '../../types/dice-types';
import { DiceGroupForm } from './dice-group-form/dice-group-form';

/**
 * DiceRollerComponent - Main dice rolling interface.
 *
 * Manages:
 * - Multiple dice groups via FormArray
 * - Global modifier
 * - Advantage/Disadvantage for d20 rolls
 * - Roll execution and history integration
 */
@Component({
  selector: 'app-dice-roller',
  imports: [CommonModule, ReactiveFormsModule, DiceGroupForm],
  templateUrl: './dice-roller.html',
  styleUrl: './dice-roller.scss',
})
export class DiceRoller implements OnInit {
  diceForm!: FormGroup;
  advantageTypes = Object.values(AdvantageType);

  constructor(
    private fb: FormBuilder,
    private diceRollerService: DiceRollerService,
    private historieService: Historie
  ) {}

  ngOnInit(): void {
    this.diceForm = this.fb.group({
      groups: this.fb.array([this.createDiceGroupForm()]),
      modifier: [0],
      advantage: [AdvantageType.NONE]
    });
  }

  /**
   * Creates a new FormGroup for a dice group.
   */
  private createDiceGroupForm(): FormGroup {
    return this.fb.group({
      count: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      type: [DiceType.D20, Validators.required],
      keepDrop: [null]
    });
  }

  /**
   * Gets the FormArray containing all dice groups.
   */
  get groups(): FormArray {
    return this.diceForm.get('groups') as FormArray;
  }

  /**
   * Adds a new dice group to the form.
   */
  addGroup(): void {
    this.groups.push(this.createDiceGroupForm());
  }

  /**
   * Removes a dice group from the form.
   * Ensures at least one group remains.
   */
  removeGroup(index: number): void {
    if (this.groups.length > 1) {
      this.groups.removeAt(index);
    }
  }

  /**
   * Executes the dice roll and adds result to history.
   */
  rollDice(): void {
    if (this.diceForm.invalid) {
      return;
    }

    const formValue = this.diceForm.value;

    // Build DiceExpression from form
    const expression: DiceExpression = {
      groups: formValue.groups.map((g: DiceGroup) => ({
        count: g.count,
        type: g.type,
        keepDrop: g.keepDrop
      })),
      modifier: formValue.modifier || 0,
      advantage: formValue.advantage
    };

    // Execute roll
    const result = this.diceRollerService.rollExpression(expression);

    // Add to history
    this.historieService.addRollResult(result);
  }

  /**
   * Checks if the current form represents a d20 roll (for Advantage/Disadvantage).
   */
  isD20Roll(): boolean {
    if (this.groups.length === 0) return false;
    const firstGroup = this.groups.at(0).value;
    return firstGroup.type === DiceType.D20;
  }
}
