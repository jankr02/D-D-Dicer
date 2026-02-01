import { Injectable } from '@angular/core';
import {
  DiceExpression,
  RollResult,
  DiceGroup,
  DiceGroupResult,
  IndividualRoll,
  getDiceGroupSides,
} from '../models';
import { Modifier } from '../models/modifier.model';
import { AdvantageType, KeepDropType } from '../types/dice-types';
import { generateNotation } from '../utils/dice-notation.util';
import { CharacterService } from './character';

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
  constructor(private characterService: CharacterService) {}
  /**
   * Löst einen Modifier zu einem numerischen Wert auf.
   * Bei CharacterModifier wird der aktuelle Charakterwert verwendet.
   * Wirft einen Fehler, wenn ein CharacterModifier ohne Charakter verwendet wird.
   *
   * @param modifier Der aufzulösende Modifier
   * @returns Der numerische Modifikator-Wert
   * @throws Error wenn CharacterModifier ohne Charakter verwendet wird
   */
  private resolveModifier(modifier: Modifier): number {
    if (modifier.type === 'fixed') {
      return modifier.value;
    }

    // CharacterModifier
    const resolved = this.characterService.resolveModifier(modifier);
    if (resolved === null) {
      throw new Error(
        'Charaktermodifikator kann nicht berechnet werden. ' +
        'Bitte überprüfen Sie Ihren Charakterbogen im Charakterbogen-Tab.'
      );
    }
    return resolved;
  }

  /**
   * Rolls a single die with the specified number of sides.
   *
   * @param sides Number of sides on the die (e.g., 6 for d6, 37 for d37)
   * @returns A random integer between 1 and sides (inclusive)
   */
  private rollDie(sides: number): number {
    if (sides < 1) {
      throw new Error('Die must have at least 1 side');
    }
    return Math.floor(Math.random() * sides) + 1;
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
   * Rolls a complete dice group (e.g., 3d6, 2d20kh1, 4d37).
   *
   * @param group The dice group configuration
   * @returns Result containing all rolls and the group sum
   */
  private rollDiceGroup(group: DiceGroup): DiceGroupResult {
    // Validate input
    if (group.count < 1 || group.count > 20) {
      throw new Error('Dice count must be between 1 and 20');
    }

    // Get sides (new property or legacy type)
    const sides = getDiceGroupSides(group);

    if (sides < 1 || sides > 10000) {
      throw new Error('Die sides must be between 1 and 10000');
    }

    // Roll all dice in the group
    const rolls: IndividualRoll[] = Array.from({ length: group.count }, () => ({
      value: this.rollDie(sides),
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
      getDiceGroupSides(expression.groups[0]) === 20
    ) {
      // Roll two d20s and keep highest or lowest
      const advantageGroup: DiceGroup = {
        count: 2,
        sides: 20,
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

    // Resolve modifier to numeric value
    const resolvedModifier = this.resolveModifier(expression.modifier);
    const total = groupsTotal + resolvedModifier;

    // Generate notation for this roll
    const notation = this.generateNotation(expression);

    return {
      groupResults,
      modifier: resolvedModifier,
      total,
      timestamp: new Date(),
      notation,
      expression: expression,
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
