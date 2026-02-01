/**
 * Die sechs Ability Scores in D&D 5e.
 * Verwendet als Schlüssel für die AbilityScores-Map.
 */
export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

/**
 * Menschenlesbare Labels für Abilities.
 */
export const ABILITY_LABELS: Record<Ability, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
};
