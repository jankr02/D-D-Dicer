/**
 * Die sechs Ability Scores in D&D 5e.
 * Verwendet als Schlüssel für die AbilityScores-Map.
 */
export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

/**
 * Returns localized labels for abilities.
 * Using a function to ensure $localize is evaluated at runtime after initialization.
 */
export function getAbilityLabels(): Record<Ability, string> {
  return {
    STR: $localize`:@@ability.strength:Strength`,
    DEX: $localize`:@@ability.dexterity:Dexterity`,
    CON: $localize`:@@ability.constitution:Constitution`,
    INT: $localize`:@@ability.intelligence:Intelligence`,
    WIS: $localize`:@@ability.wisdom:Wisdom`,
    CHA: $localize`:@@ability.charisma:Charisma`
  };
}

/**
 * Menschenlesbare Labels für Abilities.
 * @deprecated Use getAbilityLabels() for i18n support
 */
export const ABILITY_LABELS: Record<Ability, string> = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
};
