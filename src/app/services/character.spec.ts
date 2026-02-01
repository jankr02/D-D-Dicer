import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { CharacterService } from './character';
import { CharacterModifier } from '../models/modifier.model';

describe('CharacterService', () => {
  let service: CharacterService;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });

    TestBed.configureTestingModule({
      providers: [CharacterService],
    });
    service = TestBed.inject(CharacterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('static calculateAbilityModifier', () => {
    it('should return +0 for score 10', () => {
      expect(CharacterService.calculateAbilityModifier(10)).toBe(0);
    });

    it('should return +0 for score 11', () => {
      expect(CharacterService.calculateAbilityModifier(11)).toBe(0);
    });

    it('should return +1 for score 12', () => {
      expect(CharacterService.calculateAbilityModifier(12)).toBe(1);
    });

    it('should return +2 for score 14', () => {
      expect(CharacterService.calculateAbilityModifier(14)).toBe(2);
    });

    it('should return +5 for score 20', () => {
      expect(CharacterService.calculateAbilityModifier(20)).toBe(5);
    });

    it('should return -1 for score 8', () => {
      expect(CharacterService.calculateAbilityModifier(8)).toBe(-1);
    });

    it('should return -2 for score 6', () => {
      expect(CharacterService.calculateAbilityModifier(6)).toBe(-2);
    });

    it('should return -5 for score 1', () => {
      expect(CharacterService.calculateAbilityModifier(1)).toBe(-5);
    });
  });

  describe('static calculateProficiencyBonus', () => {
    it('should return +2 for level 1', () => {
      expect(CharacterService.calculateProficiencyBonus(1)).toBe(2);
    });

    it('should return +2 for level 4', () => {
      expect(CharacterService.calculateProficiencyBonus(4)).toBe(2);
    });

    it('should return +3 for level 5', () => {
      expect(CharacterService.calculateProficiencyBonus(5)).toBe(3);
    });

    it('should return +3 for level 8', () => {
      expect(CharacterService.calculateProficiencyBonus(8)).toBe(3);
    });

    it('should return +4 for level 9', () => {
      expect(CharacterService.calculateProficiencyBonus(9)).toBe(4);
    });

    it('should return +5 for level 13', () => {
      expect(CharacterService.calculateProficiencyBonus(13)).toBe(5);
    });

    it('should return +6 for level 17', () => {
      expect(CharacterService.calculateProficiencyBonus(17)).toBe(6);
    });

    it('should return +6 for level 20', () => {
      expect(CharacterService.calculateProficiencyBonus(20)).toBe(6);
    });
  });

  describe('getCharacter', () => {
    it('should return null when no character exists', () => {
      expect(service.getCharacter()).toBeNull();
    });

    it('should return character after update', () => {
      service.updateCharacter({ name: 'Hero', level: 3 });
      const char = service.getCharacter();
      expect(char).toBeTruthy();
      expect(char?.name).toBe('Hero');
    });
  });

  describe('updateCharacter', () => {
    it('should create a new character with defaults if none exists', () => {
      service.updateCharacter({ name: 'New Hero' });
      const char = service.getCharacter();

      expect(char).toBeTruthy();
      expect(char?.name).toBe('New Hero');
      expect(char?.level).toBe(1);
      expect(char?.abilityScores.STR).toBe(10);
    });

    it('should update existing character', () => {
      service.updateCharacter({ name: 'Hero', level: 5 });
      service.updateCharacter({ level: 10 });

      const char = service.getCharacter();
      expect(char?.name).toBe('Hero');
      expect(char?.level).toBe(10);
    });

    it('should persist to localStorage', () => {
      service.updateCharacter({ name: 'Hero' });
      expect(localStorage.setItem).toHaveBeenCalledWith('dnd_dicer_character', jasmine.any(String));
    });

    it('should notify subscribers', (done) => {
      service.character$.pipe(take(2)).subscribe({
        complete: () => done(),
      });

      service.updateCharacter({ name: 'Hero' });
    });
  });

  describe('updateAbilityScore', () => {
    beforeEach(() => {
      service.updateCharacter({ name: 'Hero', level: 5 });
    });

    it('should update a single ability score', () => {
      service.updateAbilityScore('STR', 18);
      const char = service.getCharacter();
      expect(char?.abilityScores.STR).toBe(18);
    });

    it('should not change other ability scores', () => {
      service.updateAbilityScore('STR', 18);
      const char = service.getCharacter();
      expect(char?.abilityScores.DEX).toBe(10);
    });

    it('should reject invalid score below 1', () => {
      spyOn(console, 'warn');
      service.updateAbilityScore('STR', 0);
      const char = service.getCharacter();
      expect(char?.abilityScores.STR).toBe(10);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should reject invalid score above 30', () => {
      spyOn(console, 'warn');
      service.updateAbilityScore('STR', 31);
      const char = service.getCharacter();
      expect(char?.abilityScores.STR).toBe(10);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn when no character exists', () => {
      service.clearCharacter();
      spyOn(console, 'warn');
      service.updateAbilityScore('STR', 15);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('setLevel', () => {
    beforeEach(() => {
      service.updateCharacter({ name: 'Hero', level: 5 });
    });

    it('should set level', () => {
      service.setLevel(10);
      expect(service.getCharacter()?.level).toBe(10);
    });

    it('should reject level below 1', () => {
      spyOn(console, 'warn');
      service.setLevel(0);
      expect(service.getCharacter()?.level).toBe(5);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should reject level above 20', () => {
      spyOn(console, 'warn');
      service.setLevel(21);
      expect(service.getCharacter()?.level).toBe(5);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn when no character exists', () => {
      service.clearCharacter();
      spyOn(console, 'warn');
      service.setLevel(10);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('clearCharacter', () => {
    it('should remove character', () => {
      service.updateCharacter({ name: 'Hero' });
      service.clearCharacter();
      expect(service.getCharacter()).toBeNull();
    });

    it('should remove from localStorage', () => {
      service.updateCharacter({ name: 'Hero' });
      service.clearCharacter();
      expect(localStorage.removeItem).toHaveBeenCalledWith('dnd_dicer_character');
    });
  });

  describe('resolveModifier', () => {
    beforeEach(() => {
      service.updateCharacter({
        name: 'Hero',
        level: 5,
        abilityScores: {
          STR: 16, // +3 modifier
          DEX: 14, // +2 modifier
          CON: 12, // +1 modifier
          INT: 10, // +0 modifier
          WIS: 8, // -1 modifier
          CHA: 6, // -2 modifier
        },
      });
    });

    it('should return null when no character exists', () => {
      service.clearCharacter();
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: false,
        additionalBonus: 0,
      };
      expect(service.resolveModifier(modifier)).toBeNull();
    });

    it('should resolve ability modifier only', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: false,
        additionalBonus: 0,
      };
      expect(service.resolveModifier(modifier)).toBe(3); // STR 16 = +3
    });

    it('should resolve ability + proficiency', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'STR',
        includeProficiency: true,
        additionalBonus: 0,
      };
      expect(service.resolveModifier(modifier)).toBe(6); // STR +3 + Prof +3 (level 5)
    });

    it('should resolve proficiency only', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: null,
        includeProficiency: true,
        additionalBonus: 0,
      };
      expect(service.resolveModifier(modifier)).toBe(3); // Prof +3 (level 5)
    });

    it('should include additional bonus', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'DEX',
        includeProficiency: true,
        additionalBonus: 2,
      };
      expect(service.resolveModifier(modifier)).toBe(7); // DEX +2 + Prof +3 + Bonus +2
    });

    it('should handle negative ability modifiers', () => {
      const modifier: CharacterModifier = {
        type: 'character',
        ability: 'CHA',
        includeProficiency: false,
        additionalBonus: 0,
      };
      expect(service.resolveModifier(modifier)).toBe(-2); // CHA 6 = -2
    });
  });

  describe('computedValues$', () => {
    it('should emit null when no character', (done) => {
      service.computedValues$.pipe(take(1)).subscribe((values) => {
        expect(values).toBeNull();
        done();
      });
    });

    it('should compute ability modifiers', (done) => {
      service.updateCharacter({
        name: 'Hero',
        level: 5,
        abilityScores: { STR: 16, DEX: 14, CON: 12, INT: 10, WIS: 8, CHA: 6 },
      });

      service.computedValues$.pipe(take(1)).subscribe((values) => {
        expect(values?.abilityModifiers.STR).toBe(3);
        expect(values?.abilityModifiers.DEX).toBe(2);
        expect(values?.abilityModifiers.CON).toBe(1);
        expect(values?.abilityModifiers.INT).toBe(0);
        expect(values?.abilityModifiers.WIS).toBe(-1);
        expect(values?.abilityModifiers.CHA).toBe(-2);
        done();
      });
    });

    it('should compute proficiency bonus', (done) => {
      service.updateCharacter({ name: 'Hero', level: 9 });

      service.computedValues$.pipe(take(1)).subscribe((values) => {
        expect(values?.proficiencyBonus).toBe(4);
        done();
      });
    });
  });
});
