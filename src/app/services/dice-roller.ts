import { Injectable } from '@angular/core';
import { DiceExpression, RollResult } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DiceRoller {

  rollExpression(_expression: DiceExpression): RollResult {
    // TODO: Implementierung
    throw new Error('Not implemented');
  }

  generateNotation(_expression: DiceExpression): string {
    // TODO: Implementierung
    return '';
  }
}
