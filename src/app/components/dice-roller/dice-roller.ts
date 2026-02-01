import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DiceRoller as DiceRollerService } from '../../services/dice-roller';
import { Historie } from '../../services/historie';
import { ProbabilityCalculator } from '../../services/probability-calculator';
import { DiceExpressionState } from '../../services/dice-expression-state';
import { ToastService } from '../../services/toast.service';
import { DiceExpression, DiceGroup } from '../../models';
import { Modifier } from '../../models/modifier.model';
import { DiceType, AdvantageType } from '../../types/dice-types';
import { DiceGroupForm } from './dice-group-form/dice-group-form';
import { ModifierInput } from '../modifier-input/modifier-input';

/**
 * DiceRollerComponent - Main dice rolling interface.
 *
 * Manages:
 * - Multiple dice groups via FormArray
 * - Global modifier
 * - Advantage/Disadvantage for d20 rolls
 * - Roll execution and history integration
 * - Live probability preview
 */
@Component({
  selector: 'app-dice-roller',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DiceGroupForm, ModifierInput],
  templateUrl: './dice-roller.html',
  styleUrl: './dice-roller.scss',
})
export class DiceRoller implements OnInit, OnDestroy {
  diceForm!: FormGroup;
  advantageTypes = Object.values(AdvantageType);

  // Live probability preview
  targetDC: number = 15;
  liveSuccessProbability: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private diceRollerService: DiceRollerService,
    private historieService: Historie,
    private probabilityCalculator: ProbabilityCalculator,
    private diceExpressionState: DiceExpressionState,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.diceForm = this.fb.group({
      groups: this.fb.array([this.createDiceGroupForm()]),
      modifier: [{ type: 'fixed', value: 0 } as Modifier],
      advantage: [AdvantageType.NONE]
    });

    // Subscribe to form changes for live probability preview
    this.diceForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateLiveProbability();
      });

    // Initial calculation
    this.updateLiveProbability();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      modifier: formValue.modifier,
      advantage: formValue.advantage
    };

    try {
      // Execute roll
      const result = this.diceRollerService.rollExpression(expression);

      // Add to history
      this.historieService.addRollResult(result);
    } catch (error) {
      // Show error toast
      this.toastService.error(
        error instanceof Error ? error.message : $localize`:@@error.diceRoll:Dice roll error`
      );
    }
  }

  /**
   * Checks if the current form represents a d20 roll (for Advantage/Disadvantage).
   */
  isD20Roll(): boolean {
    if (this.groups.length === 0) return false;
    const firstGroup = this.groups.at(0).value;
    return firstGroup.type === DiceType.D20;
  }

  /**
   * Loads a preset into the dice roller form.
   */
  loadPreset(expression: DiceExpression): void {
    // Clear existing groups
    while (this.groups.length > 0) {
      this.groups.removeAt(0);
    }

    // Add groups from preset
    expression.groups.forEach(group => {
      const formGroup = this.fb.group({
        count: [group.count, [Validators.required, Validators.min(1), Validators.max(20)]],
        type: [group.type, Validators.required],
        keepDrop: [group.keepDrop]
      });
      this.groups.push(formGroup);
    });

    // Set modifier and advantage
    this.diceForm.patchValue({
      modifier: expression.modifier,
      advantage: expression.advantage || AdvantageType.NONE
    });
  }

  /**
   * Gets the current dice expression from the form.
   */
  getCurrentExpression(): DiceExpression | null {
    if (this.diceForm.invalid) {
      return null;
    }

    const formValue = this.diceForm.value;

    return {
      groups: formValue.groups.map((g: DiceGroup) => ({
        count: g.count,
        type: g.type,
        keepDrop: g.keepDrop
      })),
      modifier: formValue.modifier,
      advantage: formValue.advantage
    };
  }

  /**
   * Checks if there is a last roll available to repeat.
   */
  hasLastRoll(): boolean {
    const history = this.historieService.getAllHistory();
    return history.length > 0 && history[0].expression !== undefined;
  }

  /**
   * Repeats the last roll by loading its expression and executing it again.
   * This creates a NEW entry in history and statistics.
   */
  repeatLastRoll(): void {
    const history = this.historieService.getAllHistory();

    if (history.length === 0) {
      return;
    }

    const lastRoll = history[0];

    // Edge case: Old rolls without expression
    if (!lastRoll.expression) {
      console.warn('Last roll does not have expression data');
      return;
    }

    // Load the expression into the form (reuses existing loadPreset logic)
    this.loadPreset(lastRoll.expression);

    // Execute the roll immediately
    this.rollDice();
  }

  /**
   * Updates the live probability preview.
   * Called when form changes or DC changes.
   */
  private updateLiveProbability(): void {
    const expression = this.getCurrentExpression();

    // Update shared state for probability panel
    this.diceExpressionState.setExpression(expression);

    // Calculate live success probability
    if (expression && this.targetDC > 0) {
      try {
        const result = this.probabilityCalculator.getSuccessProbability(
          expression,
          this.targetDC
        );
        this.liveSuccessProbability = Math.round(result.percentage);
      } catch (error) {
        console.error('Error calculating live probability:', error);
        this.liveSuccessProbability = null;
      }
    } else {
      this.liveSuccessProbability = null;
    }
  }

  /**
   * Called when target DC changes.
   */
  onDCChange(): void {
    this.updateLiveProbability();
  }

  /**
   * Gets CSS class for success indicator based on probability.
   */
  getSuccessIndicatorClass(): string {
    if (!this.liveSuccessProbability) return '';
    if (this.liveSuccessProbability >= 70) return 'high';
    if (this.liveSuccessProbability >= 40) return 'medium';
    return 'low';
  }
}
