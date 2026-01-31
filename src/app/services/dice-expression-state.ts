import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DiceExpression } from '../models';

/**
 * DiceExpressionState Service - Shared state for the current dice expression.
 *
 * This service allows components to share the current dice expression state.
 * The DiceRoller component updates the expression when the user changes it,
 * and the ProbabilityPanel component subscribes to these changes.
 */
@Injectable({
  providedIn: 'root',
})
export class DiceExpressionState {
  private currentExpressionSubject = new BehaviorSubject<DiceExpression | null>(
    null
  );

  /**
   * Observable of the current dice expression.
   * Components can subscribe to this to get updates when the expression changes.
   */
  public currentExpression$: Observable<DiceExpression | null> =
    this.currentExpressionSubject.asObservable();

  /**
   * Updates the current dice expression.
   * This triggers all subscribers to receive the new expression.
   *
   * @param expression The new dice expression
   */
  setExpression(expression: DiceExpression | null): void {
    this.currentExpressionSubject.next(expression);
  }

  /**
   * Gets the current expression value (synchronous).
   *
   * @returns The current dice expression or null
   */
  getCurrentExpression(): DiceExpression | null {
    return this.currentExpressionSubject.value;
  }
}
