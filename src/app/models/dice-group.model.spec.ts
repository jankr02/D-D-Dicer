import { getDiceGroupSides, DiceGroup } from './dice-group.model';
import { DiceType } from '../types/dice-types';

describe('dice-group.model', () => {
  describe('getDiceGroupSides', () => {
    it('should return sides when sides property is set', () => {
      const group: DiceGroup = { count: 2, sides: 20 };
      expect(getDiceGroupSides(group)).toBe(20);
    });

    it('should return sides for custom dice', () => {
      const group: DiceGroup = { count: 1, sides: 37 };
      expect(getDiceGroupSides(group)).toBe(37);
    });

    it('should return sides for d100', () => {
      const group: DiceGroup = { count: 1, sides: 100 };
      expect(getDiceGroupSides(group)).toBe(100);
    });

    it('should fall back to legacy type property (d4)', () => {
      const group: DiceGroup = { count: 1, type: DiceType.D4 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(4);
    });

    it('should fall back to legacy type property (d6)', () => {
      const group: DiceGroup = { count: 3, type: DiceType.D6 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(6);
    });

    it('should fall back to legacy type property (d8)', () => {
      const group: DiceGroup = { count: 1, type: DiceType.D8 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(8);
    });

    it('should fall back to legacy type property (d10)', () => {
      const group: DiceGroup = { count: 1, type: DiceType.D10 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(10);
    });

    it('should fall back to legacy type property (d12)', () => {
      const group: DiceGroup = { count: 1, type: DiceType.D12 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(12);
    });

    it('should fall back to legacy type property (d20)', () => {
      const group: DiceGroup = { count: 2, type: DiceType.D20 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(20);
    });

    it('should fall back to legacy type property (d100)', () => {
      const group: DiceGroup = { count: 1, type: DiceType.D100 } as DiceGroup;
      expect(getDiceGroupSides(group)).toBe(100);
    });

    it('should prefer sides over legacy type when both are set', () => {
      const group: DiceGroup = { count: 1, sides: 37, type: DiceType.D20 };
      expect(getDiceGroupSides(group)).toBe(37);
    });

    it('should throw error when neither sides nor type is set', () => {
      const group = { count: 1 } as DiceGroup;
      expect(() => getDiceGroupSides(group)).toThrowError(
        'DiceGroup has neither sides nor type defined',
      );
    });
  });
});
