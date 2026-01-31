import { DiceExpression, DiceGroup } from '../models';
import { KeepDropType, AdvantageType } from '../types/dice-types';

/**
 * Converts a DiceGroup to standard D&D notation.
 * Examples: "2d6", "4d6kh3", "1d8dl1"
 */
function groupToNotation(group: DiceGroup): string {
  let notation = `${group.count}${group.type}`;

  if (group.keepDrop) {
    const { type, count } = group.keepDrop;

    // Convert KeepDropType enum to notation suffix
    const suffixMap: Record<KeepDropType, string> = {
      [KeepDropType.KEEP_HIGHEST]: 'kh',
      [KeepDropType.KEEP_LOWEST]: 'kl',
      [KeepDropType.DROP_HIGHEST]: 'dh',
      [KeepDropType.DROP_LOWEST]: 'dl',
    };

    notation += suffixMap[type] + count;
  }

  return notation;
}

/**
 * Generates standard D&D dice notation from a DiceExpression.
 *
 * Examples:
 * - Simple: "1d20 + 5"
 * - Multiple groups: "2d20kh1 + 3d6 + 5"
 * - Advantage: "2d20kh1 + 3"
 * - No modifier: "1d8"
 *
 * @param expression The dice expression to convert
 * @returns A human-readable dice notation string
 */
export function generateNotation(expression: DiceExpression): string {
  const parts: string[] = [];

  // Handle Advantage/Disadvantage for single d20 group
  if (expression.advantage && expression.advantage !== AdvantageType.NONE) {
    // Advantage/Disadvantage is represented as 2d20 with keep highest/lowest
    const advantageNotation = expression.advantage === AdvantageType.ADVANTAGE
      ? '2d20kh1'
      : '2d20kl1';
    parts.push(advantageNotation);

    // Add remaining groups (excluding the first d20 if it exists)
    expression.groups.slice(1).forEach(group => {
      parts.push(groupToNotation(group));
    });
  } else {
    // No advantage/disadvantage - process all groups normally
    expression.groups.forEach(group => {
      parts.push(groupToNotation(group));
    });
  }

  // Join groups with " + "
  let notation = parts.join(' + ');

  // Add modifier if present
  if (expression.modifier !== 0) {
    if (expression.modifier > 0) {
      notation += ` + ${expression.modifier}`;
    } else {
      notation += ` - ${Math.abs(expression.modifier)}`;
    }
  }

  return notation;
}

/**
 * Parses a dice notation string into a DiceExpression.
 * This is a future feature - not yet implemented.
 *
 * @param notation The notation string to parse
 * @returns A DiceExpression or null if parsing fails
 */
export function parseNotation(_notation: string): DiceExpression | null {
  // TODO: Future feature - implement notation parsing
  return null;
}
