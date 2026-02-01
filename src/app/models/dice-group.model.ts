import { DiceType, KeepDropType } from '../types/dice-types';

export interface KeepDropConfig {
  type: KeepDropType;
  count: number;
}

export interface DiceGroup {
  count: number;        // 1-20 Würfel
  sides: number;        // Seitenzahl (4, 6, 8, 10, 12, 20, 37, 73, 100, etc.)
  /** @deprecated Use sides instead. Kept for backwards compatibility. */
  type?: DiceType;
  keepDrop?: KeepDropConfig;
}

/**
 * Gets the number of sides for a DiceGroup.
 * Supports both new `sides` property and legacy `type` for backwards compatibility.
 */
export function getDiceGroupSides(group: DiceGroup): number {
  if (group.sides !== undefined) return group.sides;
  // Legacy fallback
  if (group.type) {
    return parseInt(group.type.substring(1), 10); // "d20" -> 20
  }
  throw new Error('DiceGroup has neither sides nor type defined');
}
