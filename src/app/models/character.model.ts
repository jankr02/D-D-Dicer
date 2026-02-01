/**
 * Ability Scores eines Charakters.
 * Werte typischerweise zwischen 1 und 30 (Standard: 8-20).
 */
export interface AbilityScores {
  STR: number;  // Strength - Nahkampf, Athletik, Tragfähigkeit
  DEX: number;  // Dexterity - Fernkampf, Initiative, Akrobatik
  CON: number;  // Constitution - HP, Ausdauer, Konzentration
  INT: number;  // Intelligence - Wissen, Arkane Magie
  WIS: number;  // Wisdom - Wahrnehmung, Göttliche Magie, Willenskraft
  CHA: number;  // Charisma - Soziale Interaktion, Barden/Hexer-Magie
}

/**
 * Vollständiger Charakterbogen.
 * Enthält alle für das Würfeln relevanten Charakterdaten.
 */
export interface Character {
  id: string;           // UUID für Multi-Character-Support (Zukunft)
  name: string;         // Charaktername (kann leer sein)
  level: number;        // Level 1-20
  abilityScores: AbilityScores;
}

/**
 * Berechnete Werte, die aus dem Character abgeleitet werden.
 * Diese werden nicht persistiert, sondern bei Bedarf berechnet.
 */
export interface ComputedCharacterValues {
  proficiencyBonus: number;      // +2 bis +6, abhängig vom Level
  abilityModifiers: AbilityScores;  // floor((score - 10) / 2) für jeden Score
}
