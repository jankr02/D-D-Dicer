import { DiceGroupResult } from './dice-group-result.model';

export interface RollResult {
  groupResults: DiceGroupResult[];
  modifier: number;
  total: number;
  timestamp: Date;
  notation: string;  // z.B. "2d20kh1 + 3d6 + 5"
}
