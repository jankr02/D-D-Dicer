import { DiceGroupResult } from './dice-group-result.model';
import { DiceExpression } from './dice-expression.model';

export interface RollResult {
  groupResults: DiceGroupResult[];
  modifier: number;
  total: number;
  timestamp: Date;
  notation: string;  // z.B. "2d20kh1 + 3d6 + 5"
  expression?: DiceExpression;  // Original expression for repeating rolls
}
