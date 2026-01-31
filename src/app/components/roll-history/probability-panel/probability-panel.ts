import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProbabilityCalculator } from '../../../services/probability-calculator';
import { DiceExpressionState } from '../../../services/dice-expression-state';
import {
  DiceExpression,
  ProbabilityResult,
  CriticalProbabilities,
} from '../../../models';

/**
 * ProbabilityPanel Component - Displays comprehensive probability analysis.
 *
 * Features:
 * - Target DC input for success probability calculation
 * - Success probability card with color coding
 * - Statistical metrics (expected value, median, min/max)
 * - Probability distribution chart
 * - Critical roll probabilities (for d20)
 * - Calculation method indicator
 */
@Component({
  selector: 'app-probability-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './probability-panel.html',
  styleUrl: './probability-panel.scss',
})
export class ProbabilityPanel implements OnInit, OnDestroy {
  probabilityResult: ProbabilityResult | null = null;
  targetDC: number = 15; // Default DC
  successPercentage: number = 0;
  criticalProbs: CriticalProbabilities | null = null;
  isCalculating: boolean = false;
  currentExpression: DiceExpression | null = null;

  private destroy$ = new Subject<void>();
  private dcSubject = new BehaviorSubject<number>(15);

  constructor(
    private probabilityCalculator: ProbabilityCalculator,
    private diceExpressionState: DiceExpressionState
  ) {}

  ngOnInit(): void {
    // Subscribe to DC changes (debounced)
    this.dcSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.recalculate();
      });

    // Subscribe to dice expression changes
    this.diceExpressionState.currentExpression$
      .pipe(takeUntil(this.destroy$))
      .subscribe(expression => {
        this.setExpression(expression);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Called when target DC changes.
   */
  onDCChange(): void {
    this.dcSubject.next(this.targetDC);
  }

  /**
   * Sets the current dice expression and triggers calculation.
   * This will be called from the shared state service in Phase 5.
   *
   * @param expression The dice expression to analyze
   */
  setExpression(expression: DiceExpression | null): void {
    this.currentExpression = expression;
    this.recalculate();
  }

  /**
   * Recalculates probabilities for the current expression.
   */
  private recalculate(): void {
    if (!this.currentExpression || this.currentExpression.groups.length === 0) {
      this.probabilityResult = null;
      this.successPercentage = 0;
      this.criticalProbs = null;
      return;
    }

    this.isCalculating = true;

    try {
      // Calculate full probability result
      this.probabilityResult = this.probabilityCalculator.calculateProbabilities(
        this.currentExpression
      );

      // Calculate success percentage
      if (this.targetDC) {
        const success = this.probabilityCalculator.getSuccessProbability(
          this.currentExpression,
          this.targetDC
        );
        this.successPercentage = Math.round(success.percentage);
      } else {
        this.successPercentage = 0;
      }

      // Calculate critical probabilities
      this.criticalProbs = this.probabilityCalculator.getCriticalProbabilities(
        this.currentExpression
      );
    } catch (error) {
      console.error('Error calculating probabilities:', error);
      this.probabilityResult = null;
      this.successPercentage = 0;
      this.criticalProbs = null;
    } finally {
      this.isCalculating = false;
    }
  }

  /**
   * Gets the CSS class for success probability color coding.
   */
  getSuccessClass(): string {
    if (this.successPercentage >= 70) return 'high';
    if (this.successPercentage >= 40) return 'medium';
    return 'low';
  }

  /**
   * Checks if a value is in the success range.
   */
  isInSuccessRange(value: number): boolean {
    return this.targetDC > 0 && value >= this.targetDC;
  }
}
