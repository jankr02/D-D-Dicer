import { DiceExpression } from './dice-expression.model';

export interface Preset {
  id: string;          // UUID
  name: string;
  expression: DiceExpression;
}
