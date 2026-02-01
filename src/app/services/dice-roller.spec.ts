import { TestBed } from '@angular/core/testing';
import { DiceRoller } from './dice-roller';
import { CharacterService } from './character';
import { DiceExpression } from '../models';
import { AdvantageType, KeepDropType } from '../types/dice-types';
import { CharacterModifier } from '../models/modifier.model';

describe('DiceRoller', () => {
  let service: DiceRoller;
  let characterServiceSpy: jasmine.SpyObj<CharacterService>;

  beforeEach(() => {
    characterServiceSpy = jasmine.createSpyObj('CharacterService', ['resolveModifier']);
    characterServiceSpy.resolveModifier.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [DiceRoller, { provide: CharacterService, useValue: characterServiceSpy }],
    });
    service = TestBed.inject(DiceRoller);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('rollExpression - Basic Rolls', () => {
    it('should roll a simple d20', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);

      expect(result).toBeTruthy();
      expect(result.groupResults.length).toBe(1);
      expect(result.groupResults[0].rolls.length).toBe(1);
      expect(result.groupResults[0].rolls[0].value).toBeGreaterThanOrEqual(1);
      expect(result.groupResults[0].rolls[0].value).toBeLessThanOrEqual(20);
      expect(result.total).toBe(result.groupResults[0].groupSum);
      expect(result.notation).toBe('1d20');
    });

    it('should roll multiple dice (3d6)', () => {
      const expression: DiceExpression = {
        groups: [{ count: 3, sides: 6 }],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);

      expect(result.groupResults[0].rolls.length).toBe(3);
      result.groupResults[0].rolls.forEach((roll) => {
        expect(roll.value).toBeGreaterThanOrEqual(1);
        expect(roll.value).toBeLessThanOrEqual(6);
      });

      const expectedSum = result.groupResults[0].rolls
        .filter((r) => !r.isDropped)
        .reduce((sum, r) => sum + r.value, 0);
      expect(result.groupResults[0].groupSum).toBe(expectedSum);
    });

    it('should roll with fixed modifier', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 5 },
      };

      const result = service.rollExpression(expression);

      expect(result.modifier).toBe(5);
      expect(result.total).toBe(result.groupResults[0].groupSum + 5);
      expect(result.notation).toBe('1d20 +5');
    });

    it('should roll with negative modifier', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: -3 },
      };

      const result = service.rollExpression(expression);

      expect(result.modifier).toBe(-3);
      expect(result.total).toBe(result.groupResults[0].groupSum - 3);
      expect(result.notation).toBe('1d20 -3');
    });

    it('should roll multiple dice groups', () => {
      const expression: DiceExpression = {
        groups: [
          { count: 1, sides: 20 },
          { count: 2, sides: 6 },
        ],
        modifier: { type: 'fixed', value: 4 },
      };

      const result = service.rollExpression(expression);

      expect(result.groupResults.length).toBe(2);
      expect(result.groupResults[0].rolls.length).toBe(1);
      expect(result.groupResults[1].rolls.length).toBe(2);

      const groupsTotal = result.groupResults.reduce((sum, gr) => sum + gr.groupSum, 0);
      expect(result.total).toBe(groupsTotal + 4);
    });

    it('should roll custom sided dice (d37)', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 37 }],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);

      expect(result.groupResults[0].rolls[0].value).toBeGreaterThanOrEqual(1);
      expect(result.groupResults[0].rolls[0].value).toBeLessThanOrEqual(37);
      expect(result.notation).toBe('1d37');
    });

    it('should include timestamp in result', () => {
      const beforeRoll = new Date();
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const afterRoll = new Date();

      expect(result.timestamp).toBeTruthy();
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(beforeRoll.getTime());
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(afterRoll.getTime());
    });

    it('should include expression in result', () => {
      const expression: DiceExpression = {
        groups: [{ count: 2, sides: 8 }],
        modifier: { type: 'fixed', value: 3 },
      };

      const result = service.rollExpression(expression);

      expect(result.expression).toEqual(expression);
    });
  });

  describe('rollExpression - Keep/Drop Logic', () => {
    it('should keep highest (4d6kh3)', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 4,
            sides: 6,
            keepDrop: { type: KeepDropType.KEEP_HIGHEST, count: 3 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const rolls = result.groupResults[0].rolls;

      expect(rolls.length).toBe(4);
      const droppedCount = rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(1);

      // The dropped one should be the lowest
      const keptRolls = rolls.filter((r) => !r.isDropped);
      const droppedRoll = rolls.find((r) => r.isDropped);
      expect(droppedRoll).toBeTruthy();
      keptRolls.forEach((kept) => {
        expect(kept.value).toBeGreaterThanOrEqual(droppedRoll!.value);
      });
    });

    it('should keep lowest (2d20kl1)', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 2,
            sides: 20,
            keepDrop: { type: KeepDropType.KEEP_LOWEST, count: 1 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const rolls = result.groupResults[0].rolls;

      expect(rolls.length).toBe(2);
      const droppedCount = rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(1);
    });

    it('should drop highest (3d6dh1)', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 3,
            sides: 6,
            keepDrop: { type: KeepDropType.DROP_HIGHEST, count: 1 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const rolls = result.groupResults[0].rolls;

      expect(rolls.length).toBe(3);
      const droppedCount = rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(1);
    });

    it('should drop lowest (3d6dl1)', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 3,
            sides: 6,
            keepDrop: { type: KeepDropType.DROP_LOWEST, count: 1 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const rolls = result.groupResults[0].rolls;

      expect(rolls.length).toBe(3);
      const droppedCount = rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(1);

      // The dropped one should be the lowest
      const keptRolls = rolls.filter((r) => !r.isDropped);
      const droppedRoll = rolls.find((r) => r.isDropped);
      expect(droppedRoll).toBeTruthy();
      keptRolls.forEach((kept) => {
        expect(kept.value).toBeGreaterThanOrEqual(droppedRoll!.value);
      });
    });

    it('should calculate sum only from kept dice', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 4,
            sides: 6,
            keepDrop: { type: KeepDropType.KEEP_HIGHEST, count: 3 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const rolls = result.groupResults[0].rolls;

      const expectedSum = rolls.filter((r) => !r.isDropped).reduce((sum, r) => sum + r.value, 0);

      expect(result.groupResults[0].groupSum).toBe(expectedSum);
      expect(result.total).toBe(expectedSum);
    });
  });

  describe('rollExpression - Advantage/Disadvantage', () => {
    it('should roll with advantage (2d20kh1)', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.ADVANTAGE,
      };

      const result = service.rollExpression(expression);

      // Advantage rolls 2 dice and keeps highest
      expect(result.groupResults[0].rolls.length).toBe(2);
      const droppedCount = result.groupResults[0].rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(1);
      expect(result.notation).toBe('2d20kh1');
    });

    it('should roll with disadvantage (2d20kl1)', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.DISADVANTAGE,
      };

      const result = service.rollExpression(expression);

      // Disadvantage rolls 2 dice and keeps lowest
      expect(result.groupResults[0].rolls.length).toBe(2);
      const droppedCount = result.groupResults[0].rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(1);
      expect(result.notation).toBe('2d20kl1');
    });

    it('should roll normally with AdvantageType.NONE', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.NONE,
      };

      const result = service.rollExpression(expression);

      expect(result.groupResults[0].rolls.length).toBe(1);
      expect(result.notation).toBe('1d20');
    });
  });

  describe('rollExpression - Character Modifiers', () => {
    it('should resolve character modifier from CharacterService', () => {
      characterServiceSpy.resolveModifier.and.returnValue(7); // STR +5, Prof +2

      const characterMod: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: true,
        additionalBonus: 0,
      };

      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: characterMod,
      };

      const result = service.rollExpression(expression);

      expect(characterServiceSpy.resolveModifier).toHaveBeenCalledWith(characterMod);
      expect(result.modifier).toBe(7);
      expect(result.total).toBe(result.groupResults[0].groupSum + 7);
    });

    it('should throw error when character modifier cannot be resolved', () => {
      characterServiceSpy.resolveModifier.and.returnValue(null);

      const characterMod: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: false,
        additionalBonus: 0,
      };

      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: characterMod,
      };

      expect(() => service.rollExpression(expression)).toThrowError(
        /Charaktermodifikator kann nicht berechnet werden/,
      );
    });
  });

  describe('rollExpression - Edge Cases and Validation', () => {
    it('should throw error for empty groups array', () => {
      const expression: DiceExpression = {
        groups: [],
        modifier: { type: 'fixed', value: 0 },
      };

      expect(() => service.rollExpression(expression)).toThrowError(
        /must contain at least one group/,
      );
    });

    it('should handle keep/drop count equal to dice count', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 3,
            sides: 6,
            keepDrop: { type: KeepDropType.KEEP_HIGHEST, count: 3 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const droppedCount = result.groupResults[0].rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(0); // All kept
    });

    it('should handle keep/drop count greater than dice count', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 2,
            sides: 6,
            keepDrop: { type: KeepDropType.KEEP_HIGHEST, count: 5 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const result = service.rollExpression(expression);
      const droppedCount = result.groupResults[0].rolls.filter((r) => r.isDropped).length;
      expect(droppedCount).toBe(0); // All kept since count > rolls
    });
  });

  describe('generateNotation', () => {
    it('should generate notation for simple roll', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 5 },
      };

      const notation = service.generateNotation(expression);
      expect(notation).toBe('1d20 +5');
    });

    it('should generate notation for multiple groups', () => {
      const expression: DiceExpression = {
        groups: [
          { count: 2, sides: 6 },
          { count: 1, sides: 8 },
        ],
        modifier: { type: 'fixed', value: 3 },
      };

      const notation = service.generateNotation(expression);
      expect(notation).toBe('2d6 + 1d8 +3');
    });

    it('should generate notation with keep/drop', () => {
      const expression: DiceExpression = {
        groups: [
          {
            count: 4,
            sides: 6,
            keepDrop: { type: KeepDropType.KEEP_HIGHEST, count: 3 },
          },
        ],
        modifier: { type: 'fixed', value: 0 },
      };

      const notation = service.generateNotation(expression);
      expect(notation).toBe('4d6kh3');
    });

    it('should generate notation with advantage', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 5 },
        advantage: AdvantageType.ADVANTAGE,
      };

      const notation = service.generateNotation(expression);
      expect(notation).toBe('2d20kh1 +5');
    });

    it('should generate notation with disadvantage', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.DISADVANTAGE,
      };

      const notation = service.generateNotation(expression);
      expect(notation).toBe('2d20kl1');
    });
  });

  describe('Statistical Distribution (randomness sanity check)', () => {
    it('should produce varied results over multiple rolls', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
      };

      const results: number[] = [];
      for (let i = 0; i < 100; i++) {
        const result = service.rollExpression(expression);
        results.push(result.total);
      }

      // Check that we got more than just one unique value
      const uniqueValues = new Set(results);
      expect(uniqueValues.size).toBeGreaterThan(5);

      // Check that all values are within valid range
      results.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(20);
      });
    });
  });
});
