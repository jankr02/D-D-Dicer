import { DiceGroup } from './dice-group.model';
import { AdvantageType } from '../types/dice-types';
import { Modifier } from './modifier.model';

export interface DiceExpression {
  groups: DiceGroup[];
  modifier: Modifier;
  advantage?: AdvantageType;
}
