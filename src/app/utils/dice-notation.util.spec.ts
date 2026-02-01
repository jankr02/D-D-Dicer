import { generateNotation, generateModifierNotation, parseNotation } from './dice-notation.util';
import { DiceExpression } from '../models';
import { AdvantageType, KeepDropType } from '../types/dice-types';
import { FixedModifier, CharacterModifier } from '../models/modifier.model';

describe('dice-notation.util', () => {
  describe('generateNotation', () => {
    it('should generate notation for simple d20 roll', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
      };

      expect(generateNotation(expression)).toBe('1d20');
    });

    it('should generate notation for multiple dice', () => {
      const expression: DiceExpression = {
        groups: [{ count: 3, sides: 6 }],
        modifier: { type: 'fixed', value: 0 },
      };

      expect(generateNotation(expression)).toBe('3d6');
    });

    it('should generate notation with positive modifier', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 5 },
      };

      expect(generateNotation(expression)).toBe('1d20 +5');
    });

    it('should generate notation with negative modifier', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: -3 },
      };

      expect(generateNotation(expression)).toBe('1d20 -3');
    });

    it('should generate notation for multiple groups', () => {
      const expression: DiceExpression = {
        groups: [
          { count: 1, sides: 20 },
          { count: 2, sides: 6 },
        ],
        modifier: { type: 'fixed', value: 4 },
      };

      expect(generateNotation(expression)).toBe('1d20 + 2d6 +4');
    });

    it('should generate notation with keep highest', () => {
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

      expect(generateNotation(expression)).toBe('4d6kh3');
    });

    it('should generate notation with keep lowest', () => {
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

      expect(generateNotation(expression)).toBe('2d20kl1');
    });

    it('should generate notation with drop highest', () => {
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

      expect(generateNotation(expression)).toBe('3d6dh1');
    });

    it('should generate notation with drop lowest', () => {
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

      expect(generateNotation(expression)).toBe('3d6dl1');
    });

    it('should generate notation with advantage', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.ADVANTAGE,
      };

      expect(generateNotation(expression)).toBe('2d20kh1');
    });

    it('should generate notation with disadvantage', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.DISADVANTAGE,
      };

      expect(generateNotation(expression)).toBe('2d20kl1');
    });

    it('should generate notation with advantage and modifier', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 7 },
        advantage: AdvantageType.ADVANTAGE,
      };

      expect(generateNotation(expression)).toBe('2d20kh1 +7');
    });

    it('should not modify notation for AdvantageType.NONE', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: { type: 'fixed', value: 0 },
        advantage: AdvantageType.NONE,
      };

      expect(generateNotation(expression)).toBe('1d20');
    });

    it('should generate notation for custom-sided dice', () => {
      const expression: DiceExpression = {
        groups: [{ count: 2, sides: 37 }],
        modifier: { type: 'fixed', value: 0 },
      };

      expect(generateNotation(expression)).toBe('2d37');
    });

    it('should handle advantage with additional groups', () => {
      const expression: DiceExpression = {
        groups: [
          { count: 1, sides: 20 },
          { count: 2, sides: 6 },
        ],
        modifier: { type: 'fixed', value: 3 },
        advantage: AdvantageType.ADVANTAGE,
      };

      expect(generateNotation(expression)).toBe('2d20kh1 + 2d6 +3');
    });

    it('should handle character modifier notation', () => {
      const expression: DiceExpression = {
        groups: [{ count: 1, sides: 20 }],
        modifier: {
          type: 'character',
          ability: 'STR',
          includeProficiency: true,
          additionalBonus: 0,
        },
      };

      expect(generateNotation(expression)).toBe('1d20 +STR+Prof');
    });
  });

  describe('generateModifierNotation', () => {
    it('should return empty string for zero fixed modifier', () => {
      const modifier: FixedModifier = { type: 'fixed', value: 0 };
      expect(generateModifierNotation(modifier)).toBe('');
    });

    it('should return +N for positive fixed modifier', () => {
      const modifier: FixedModifier = { type: 'fixed', value: 5 };
      expect(generateModifierNotation(modifier)).toBe('+5');
    });

    it('should return -N for negative fixed modifier', () => {
      const modifier: FixedModifier = { type: 'fixed', value: -3 };
      expect(generateModifierNotation(modifier)).toBe('-3');
    });

    it('should generate notation for ability modifier only', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'DEX',
        includeProficiency: false,
        additionalBonus: 0,
      };
      expect(generateModifierNotation(modifier)).toBe('+DEX');
    });

    it('should generate notation for ability + proficiency', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: true,
        additionalBonus: 0,
      };
      expect(generateModifierNotation(modifier)).toBe('+STR+Prof');
    });

    it('should generate notation for proficiency only', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: null,
        includeProficiency: true,
        additionalBonus: 0,
      };
      expect(generateModifierNotation(modifier)).toBe('+Prof');
    });

    it('should generate notation with additional positive bonus', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'DEX',
        includeProficiency: true,
        additionalBonus: 2,
      };
      expect(generateModifierNotation(modifier)).toBe('+DEX+Prof++2');
    });

    it('should generate notation with additional negative bonus', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: false,
        additionalBonus: -1,
      };
      expect(generateModifierNotation(modifier)).toBe('+STR+-1');
    });

    it('should return empty string for character modifier with no parts', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: null,
        includeProficiency: false,
        additionalBonus: 0,
      };
      expect(generateModifierNotation(modifier)).toBe('');
    });
  });

  describe('parseNotation', () => {
    it('should return null (not yet implemented)', () => {
      expect(parseNotation('1d20')).toBeNull();
      expect(parseNotation('2d6 + 3')).toBeNull();
      expect(parseNotation('4d6kh3')).toBeNull();
    });
  });
});
