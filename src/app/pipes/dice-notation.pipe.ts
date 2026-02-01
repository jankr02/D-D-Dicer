import { Pipe, PipeTransform } from '@angular/core';
import { DiceExpression } from '../models';
import { AdvantageType, KeepDropType } from '../types/dice-types';
import { generateModifierNotation } from '../utils/dice-notation.util';

/**
 * Transforms a DiceExpression object into a human-readable dice notation string.
 *
 * Examples:
 * - { groups: [{count: 2, type: 'd20'}], modifier: 5 } => "2d20 + 5"
 * - { groups: [{count: 4, type: 'd6', keepDrop: {type: 'keep_highest', count: 3}}], modifier: 0 } => "4d6 keep highest 3"
 * - { groups: [{count: 1, type: 'd20'}], modifier: 3, advantage: 'advantage' } => "1d20 (Advantage) + 3"
 */
@Pipe({
  name: 'diceNotation',
  standalone: true
})
export class DiceNotationPipe implements PipeTransform {
  transform(expression: DiceExpression): string {
    if (!expression || !expression.groups || expression.groups.length === 0) {
      return '—';
    }

    const parts: string[] = [];

    // Convert each dice group to notation
    for (const group of expression.groups) {
      let groupNotation = `${group.count}${group.type}`;

      // Add keep/drop notation
      if (group.keepDrop) {
        groupNotation += ` ${this.formatKeepDrop(group.keepDrop.type, group.keepDrop.count)}`;
      }

      parts.push(groupNotation);
    }

    let notation = parts.join(' + ');

    // Add advantage/disadvantage
    if (expression.advantage && expression.advantage !== AdvantageType.NONE) {
      const advantageText = expression.advantage === AdvantageType.ADVANTAGE ? 'Advantage' : 'Disadvantage';
      notation += ` (${advantageText})`;
    }

    // Add modifier
    const modifierNotation = generateModifierNotation(expression.modifier);
    if (modifierNotation) {
      notation += ` ${modifierNotation}`;
    }

    return notation;
  }

  private formatKeepDrop(type: KeepDropType, count: number): string {
    switch (type) {
      case KeepDropType.KEEP_HIGHEST:
        return `keep highest ${count}`;
      case KeepDropType.KEEP_LOWEST:
        return `keep lowest ${count}`;
      case KeepDropType.DROP_HIGHEST:
        return `drop highest ${count}`;
      case KeepDropType.DROP_LOWEST:
        return `drop lowest ${count}`;
      default:
        return '';
    }
  }
}
