import { Injectable } from '@angular/core';
import {
  DiceExpression,
  RollResult,
  DiceGroup,
  DiceGroupResult,
  IndividualRoll,
} from '../models';
import { DiceType, AdvantageType, KeepDropType } from '../types/dice-types';
import { generateNotation } from '../utils/dice-notation.util';

/**
 * DiceRoller Service - Core dice rolling logic for D&D.
 *
 * This service is built with pure functions to ensure testability
 * and predictability. All randomness is isolated in the rollDie method.
 */
@Injectable({
  providedIn: 'root',
})
export class DiceRoller {
  /**
   * Rolls a single die of the specified type.
   *
   * @param type The type of die to roll (d4, d6, d8, d10, d12, d20, d100)
   * @returns A random integer between 1 and the die's maximum value
   */
  private rollDie(type: DiceType): number {
    const maxValueMap: Record<DiceType, number> = {
      [DiceType.D4]: 4,
      [DiceType.D6]: 6,
      [DiceType.D8]: 8,
      [DiceType.D10]: 10,
      [DiceType.D12]: 12,
      [DiceType.D20]: 20,
      [DiceType.D100]: 100,
    };

    const max = maxValueMap[type];
    return Math.floor(Math.random() * max) + 1;
  }

  /**
   * Applies Keep/Drop logic to a set of rolls.
   *
   * @param rolls Array of individual roll results
   * @param keepDrop Keep/Drop configuration
   * @returns Modified array with isDropped flags set appropriately
   */
  private applyKeepDrop(
    rolls: IndividualRoll[],
    keepDrop: { type: KeepDropType; count: number }
  ): IndividualRoll[] {
    if (keepDrop.count >= rolls.length) {
      // If keeping/dropping all or more, no change needed
      return rolls;
    }

    // Sort by value for easier keep/drop logic
    const sorted = [...rolls].sort((a, b) => a.value - b.value);

    // Determine which indices to keep
    let indicesToKeep: number[];

    switch (keepDrop.type) {
      case KeepDropType.KEEP_HIGHEST:
        indicesToKeep = sorted
          .slice(-keepDrop.count)
          .map(roll => rolls.indexOf(roll));
        break;
      case KeepDropType.KEEP_LOWEST:
        indicesToKeep = sorted
          .slice(0, keepDrop.count)
          .map(roll => rolls.indexOf(roll));
        break;
      case KeepDropType.DROP_HIGHEST:
        indicesToKeep = sorted
          .slice(0, rolls.length - keepDrop.count)
          .map(roll => rolls.indexOf(roll));
        break;
      case KeepDropType.DROP_LOWEST:
        indicesToKeep = sorted
          .slice(keepDrop.count)
          .map(roll => rolls.indexOf(roll));
        break;
    }

    // Mark rolls as dropped or kept
    return rolls.map((roll, index) => ({
      ...roll,
      isDropped: !indicesToKeep.includes(index),
    }));
  }

  /**
   * Rolls a complete dice group (e.g., 3d6, 2d20kh1).
   *
   * @param group The dice group configuration
   * @returns Result containing all rolls and the group sum
   */
  private rollDiceGroup(group: DiceGroup): DiceGroupResult {
    // Validate input
    if (group.count < 1 || group.count > 20) {
      throw new Error('Dice count must be between 1 and 20');
    }

    // Roll all dice in the group
    const rolls: IndividualRoll[] = Array.from({ length: group.count }, () => ({
      value: this.rollDie(group.type),
      isDropped: false,
    }));

    // Apply keep/drop if configured
    const finalRolls = group.keepDrop
      ? this.applyKeepDrop(rolls, group.keepDrop)
      : rolls;

    // Calculate sum (only non-dropped dice)
    const groupSum = finalRolls
      .filter(roll => !roll.isDropped)
      .reduce((sum, roll) => sum + roll.value, 0);

    return {
      rolls: finalRolls,
      groupSum,
    };
  }

  /**
   * Rolls a complete dice expression with optional advantage/disadvantage.
   *
   * @param expression The complete dice expression to roll
   * @returns Complete roll result with all group results, modifier, and total
   */
  rollExpression(expression: DiceExpression): RollResult {
    // Validate expression
    if (!expression.groups || expression.groups.length === 0) {
      throw new Error('DiceExpression must contain at least one group');
    }

    let groupResults: DiceGroupResult[];

    // Handle Advantage/Disadvantage for d20 rolls
    if (
      expression.advantage &&
      expression.advantage !== AdvantageType.NONE &&
      expression.groups.length > 0 &&
      expression.groups[0].type === DiceType.D20
    ) {
      // Roll two d20s and keep highest or lowest
      const advantageGroup: DiceGroup = {
        count: 2,
        type: DiceType.D20,
        keepDrop: {
          type:
            expression.advantage === AdvantageType.ADVANTAGE
              ? KeepDropType.KEEP_HIGHEST
              : KeepDropType.KEEP_LOWEST,
          count: 1,
        },
      };

      const advantageResult = this.rollDiceGroup(advantageGroup);

      // Roll remaining groups (if any)
      const remainingResults = expression.groups
        .slice(1)
        .map(group => this.rollDiceGroup(group));

      groupResults = [advantageResult, ...remainingResults];
    } else {
      // No advantage/disadvantage - roll all groups normally
      groupResults = expression.groups.map(group => this.rollDiceGroup(group));
    }

    // Calculate total sum
    const groupsTotal = groupResults.reduce(
      (sum, result) => sum + result.groupSum,
      0
    );
    const total = groupsTotal + expression.modifier;

    // Generate notation for this roll
    const notation = this.generateNotation(expression);

    return {
      groupResults,
      modifier: expression.modifier,
      total,
      timestamp: new Date(),
      notation,
    };
  }

  /**
   * Generates standard D&D dice notation from an expression.
   *
   * @param expression The dice expression to convert
   * @returns A human-readable dice notation string (e.g., "2d20kh1 + 3d6 + 5")
   */
  generateNotation(expression: DiceExpression): string {
    return generateNotation(expression);
  }
}
