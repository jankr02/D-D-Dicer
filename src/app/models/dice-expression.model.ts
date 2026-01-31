import { DiceGroup } from './dice-group.model';
import { AdvantageType } from '../types/dice-types';

export interface DiceExpression {
  groups: DiceGroup[];
  modifier: number;
  advantage?: AdvantageType;
}
