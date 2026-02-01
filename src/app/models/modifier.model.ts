import { Ability } from '../types/character-types';

/**
 * Fixer numerischer Modifikator (wie bisher).
 */
export interface FixedModifier {
  type: 'fixed';
  value: number;
}

/**
 * Modifikator basierend auf Charakterwerten.
 * Der tatsächliche Wert wird zur Würfelzeit aus dem Character berechnet.
 */
export interface CharacterModifier {
  type: 'character';
  ability: Ability | null;        // null = nur Proficiency, kein Ability Modifier
  includeProficiency: boolean;    // true = Proficiency Bonus addieren
  additionalBonus: number;        // Zusätzlicher fixer Bonus (z.B. +2 für magisches Schwert)
}

/**
 * Union-Type für alle Modifikator-Arten.
 */
export type Modifier = FixedModifier | CharacterModifier;
