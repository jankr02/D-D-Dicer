import { DiceType, KeepDropType } from '../types/dice-types';

export interface KeepDropConfig {
  type: KeepDropType;
  count: number;
}

export interface DiceGroup {
  count: number;        // 1-20 Würfel
  type: DiceType;      // d4, d6, d8, d10, d12, d20, d100
  keepDrop?: KeepDropConfig;
}
