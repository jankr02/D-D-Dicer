import { RollTemplate } from '../models/roll-template.model';
import { AdvantageType, KeepDropType } from '../types/dice-types';
import { CharacterModifier, FixedModifier } from '../models/modifier.model';
import { Ability } from '../types/character-types';

// Helper to create CharacterModifier
const charMod = (
  ability: Ability | null,
  includeProficiency: boolean = false,
  additionalBonus: number = 0
): CharacterModifier => ({
  type: 'character',
  ability,
  includeProficiency,
  additionalBonus
});

// Helper to create FixedModifier
const fixedMod = (value: number): FixedModifier => ({
  type: 'fixed',
  value
});

/**
 * All built-in D&D 5e roll templates.
 */
export const ROLL_TEMPLATES: RollTemplate[] = [
  // ============================================
  // ABILITY CHECKS
  // ============================================
  {
    id: 'ability-str-check',
    name: $localize`:@@template.strCheck:Strength Check`,
    description: $localize`:@@template.strCheck.desc:Roll a Strength ability check`,
    category: 'Ability Check',
    tags: ['strength', 'str', 'athletics', 'lift', 'push', 'break', 'grapple'],
    icon: '\u{1F4AA}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('STR'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'ability-dex-check',
    name: $localize`:@@template.dexCheck:Dexterity Check`,
    description: $localize`:@@template.dexCheck.desc:Roll a Dexterity ability check`,
    category: 'Ability Check',
    tags: ['dexterity', 'dex', 'acrobatics', 'stealth', 'sleight of hand'],
    icon: '\u{1F3C3}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'ability-con-check',
    name: $localize`:@@template.conCheck:Constitution Check`,
    description: $localize`:@@template.conCheck.desc:Roll a Constitution ability check`,
    category: 'Ability Check',
    tags: ['constitution', 'con', 'endurance', 'concentration'],
    icon: '\u{1F9BE}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('CON'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'ability-int-check',
    name: $localize`:@@template.intCheck:Intelligence Check`,
    description: $localize`:@@template.intCheck.desc:Roll an Intelligence ability check`,
    category: 'Ability Check',
    tags: ['intelligence', 'int', 'investigation', 'arcana', 'history', 'nature', 'religion'],
    icon: '\u{1F9E0}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('INT'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'ability-wis-check',
    name: $localize`:@@template.wisCheck:Wisdom Check`,
    description: $localize`:@@template.wisCheck.desc:Roll a Wisdom ability check`,
    category: 'Ability Check',
    tags: ['wisdom', 'wis', 'perception', 'insight', 'survival', 'medicine', 'animal handling'],
    icon: '\u{1F441}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('WIS'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'ability-cha-check',
    name: $localize`:@@template.chaCheck:Charisma Check`,
    description: $localize`:@@template.chaCheck.desc:Roll a Charisma ability check`,
    category: 'Ability Check',
    tags: ['charisma', 'cha', 'persuasion', 'deception', 'intimidation', 'performance'],
    icon: '\u{2728}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('CHA'),
      advantage: AdvantageType.NONE
    }
  },

  // ============================================
  // SAVING THROWS
  // ============================================
  {
    id: 'save-str',
    name: $localize`:@@template.strSave:Strength Save`,
    description: $localize`:@@template.strSave.desc:Roll a Strength saving throw`,
    category: 'Saving Throw',
    tags: ['strength', 'str', 'save', 'saving throw'],
    icon: '\u{1F6E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('STR', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'save-dex',
    name: $localize`:@@template.dexSave:Dexterity Save`,
    description: $localize`:@@template.dexSave.desc:Roll a Dexterity saving throw`,
    category: 'Saving Throw',
    tags: ['dexterity', 'dex', 'save', 'saving throw', 'reflex'],
    icon: '\u{1F6E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('DEX', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'save-con',
    name: $localize`:@@template.conSave:Constitution Save`,
    description: $localize`:@@template.conSave.desc:Roll a Constitution saving throw`,
    category: 'Saving Throw',
    tags: ['constitution', 'con', 'save', 'saving throw', 'fortitude'],
    icon: '\u{1F6E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('CON', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'save-int',
    name: $localize`:@@template.intSave:Intelligence Save`,
    description: $localize`:@@template.intSave.desc:Roll an Intelligence saving throw`,
    category: 'Saving Throw',
    tags: ['intelligence', 'int', 'save', 'saving throw'],
    icon: '\u{1F6E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('INT', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'save-wis',
    name: $localize`:@@template.wisSave:Wisdom Save`,
    description: $localize`:@@template.wisSave.desc:Roll a Wisdom saving throw`,
    category: 'Saving Throw',
    tags: ['wisdom', 'wis', 'save', 'saving throw', 'will'],
    icon: '\u{1F6E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('WIS', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'save-cha',
    name: $localize`:@@template.chaSave:Charisma Save`,
    description: $localize`:@@template.chaSave.desc:Roll a Charisma saving throw`,
    category: 'Saving Throw',
    tags: ['charisma', 'cha', 'save', 'saving throw'],
    icon: '\u{1F6E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('CHA', true),
      advantage: AdvantageType.NONE
    }
  },

  // ============================================
  // ATTACK ROLLS
  // ============================================
  {
    id: 'attack-melee-str',
    name: $localize`:@@template.meleeAttackStr:Melee Attack (STR)`,
    description: $localize`:@@template.meleeAttackStr.desc:Standard melee weapon attack using Strength`,
    category: 'Attack Roll',
    tags: ['attack', 'melee', 'strength', 'sword', 'axe', 'mace', 'hammer'],
    icon: '\u{2694}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('STR', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'attack-melee-dex',
    name: $localize`:@@template.meleeAttackDex:Melee Attack (DEX/Finesse)`,
    description: $localize`:@@template.meleeAttackDex.desc:Finesse weapon attack using Dexterity`,
    category: 'Attack Roll',
    tags: ['attack', 'melee', 'dexterity', 'finesse', 'rapier', 'dagger', 'shortsword'],
    icon: '\u{1F5E1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('DEX', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'attack-ranged',
    name: $localize`:@@template.rangedAttack:Ranged Attack (DEX)`,
    description: $localize`:@@template.rangedAttack.desc:Ranged weapon attack using Dexterity`,
    category: 'Attack Roll',
    tags: ['attack', 'ranged', 'dexterity', 'bow', 'crossbow', 'thrown'],
    icon: '\u{1F3F9}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('DEX', true),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'attack-spell',
    name: $localize`:@@template.spellAttack:Spell Attack`,
    description: $localize`:@@template.spellAttack.desc:Spell attack roll (set your spellcasting ability)`,
    category: 'Attack Roll',
    tags: ['attack', 'spell', 'magic', 'cantrip'],
    icon: '\u{1FA84}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('INT', true),
      advantage: AdvantageType.NONE
    }
  },

  // ============================================
  // DAMAGE ROLLS
  // ============================================
  {
    id: 'damage-longsword-1h',
    name: $localize`:@@template.longsword1h:Longsword (1-handed)`,
    description: $localize`:@@template.longsword1h.desc:Longsword damage, one-handed (1d8 + STR)`,
    category: 'Damage',
    tags: ['longsword', 'sword', 'melee', 'slashing', 'versatile', '1d8'],
    icon: '\u{1F5E1}',
    expression: {
      groups: [{ count: 1, sides: 8 }],
      modifier: charMod('STR'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-longsword-2h',
    name: $localize`:@@template.longsword2h:Longsword (2-handed)`,
    description: $localize`:@@template.longsword2h.desc:Longsword damage, two-handed (1d10 + STR)`,
    category: 'Damage',
    tags: ['longsword', 'sword', 'melee', 'slashing', 'versatile', '1d10'],
    icon: '\u{1F5E1}',
    expression: {
      groups: [{ count: 1, sides: 10 }],
      modifier: charMod('STR'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-greatsword',
    name: $localize`:@@template.greatsword:Greatsword`,
    description: $localize`:@@template.greatsword.desc:Greatsword damage (2d6 + STR)`,
    category: 'Damage',
    tags: ['greatsword', 'sword', 'melee', 'slashing', 'two-handed', 'heavy', '2d6'],
    icon: '\u{2694}',
    expression: {
      groups: [{ count: 2, sides: 6 }],
      modifier: charMod('STR'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-greataxe',
    name: $localize`:@@template.greataxe:Greataxe`,
    description: $localize`:@@template.greataxe.desc:Greataxe damage (1d12 + STR)`,
    category: 'Damage',
    tags: ['greataxe', 'axe', 'melee', 'slashing', 'two-handed', 'heavy', '1d12'],
    icon: '\u{1FA93}',
    expression: {
      groups: [{ count: 1, sides: 12 }],
      modifier: charMod('STR'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-dagger',
    name: $localize`:@@template.dagger:Dagger`,
    description: $localize`:@@template.dagger.desc:Dagger damage (1d4 + DEX)`,
    category: 'Damage',
    tags: ['dagger', 'melee', 'finesse', 'light', 'thrown', 'piercing', '1d4'],
    icon: '\u{1F5E1}',
    expression: {
      groups: [{ count: 1, sides: 4 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-shortbow',
    name: $localize`:@@template.shortbow:Shortbow`,
    description: $localize`:@@template.shortbow.desc:Shortbow damage (1d6 + DEX)`,
    category: 'Damage',
    tags: ['shortbow', 'bow', 'ranged', 'piercing', '1d6'],
    icon: '\u{1F3F9}',
    expression: {
      groups: [{ count: 1, sides: 6 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-longbow',
    name: $localize`:@@template.longbow:Longbow`,
    description: $localize`:@@template.longbow.desc:Longbow damage (1d8 + DEX)`,
    category: 'Damage',
    tags: ['longbow', 'bow', 'ranged', 'piercing', 'heavy', '1d8'],
    icon: '\u{1F3F9}',
    expression: {
      groups: [{ count: 1, sides: 8 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-light-crossbow',
    name: $localize`:@@template.lightCrossbow:Light Crossbow`,
    description: $localize`:@@template.lightCrossbow.desc:Light crossbow damage (1d8 + DEX)`,
    category: 'Damage',
    tags: ['crossbow', 'light crossbow', 'ranged', 'piercing', '1d8'],
    icon: '\u{1F3F9}',
    expression: {
      groups: [{ count: 1, sides: 8 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-heavy-crossbow',
    name: $localize`:@@template.heavyCrossbow:Heavy Crossbow`,
    description: $localize`:@@template.heavyCrossbow.desc:Heavy crossbow damage (1d10 + DEX)`,
    category: 'Damage',
    tags: ['crossbow', 'heavy crossbow', 'ranged', 'piercing', 'heavy', '1d10'],
    icon: '\u{1F3F9}',
    expression: {
      groups: [{ count: 1, sides: 10 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'damage-sneak-attack',
    name: $localize`:@@template.sneakAttack:Sneak Attack (1d6)`,
    description: $localize`:@@template.sneakAttack.desc:Rogue Sneak Attack extra damage`,
    category: 'Damage',
    tags: ['sneak attack', 'rogue', 'extra damage', '1d6'],
    icon: '\u{1F3AF}',
    expression: {
      groups: [{ count: 1, sides: 6 }],
      modifier: fixedMod(0),
      advantage: AdvantageType.NONE
    }
  },

  // ============================================
  // HEALING
  // ============================================
  {
    id: 'healing-cure-wounds',
    name: $localize`:@@template.cureWounds:Cure Wounds (1st level)`,
    description: $localize`:@@template.cureWounds.desc:Cure Wounds healing (1d8 + spellcasting mod)`,
    category: 'Healing',
    tags: ['cure wounds', 'healing', 'spell', '1st level', 'cleric', 'paladin', 'bard', 'druid'],
    icon: '\u{1F49A}',
    expression: {
      groups: [{ count: 1, sides: 8 }],
      modifier: charMod('WIS'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'healing-healing-word',
    name: $localize`:@@template.healingWord:Healing Word (1st level)`,
    description: $localize`:@@template.healingWord.desc:Healing Word bonus action heal (1d4 + spellcasting mod)`,
    category: 'Healing',
    tags: ['healing word', 'healing', 'spell', '1st level', 'bonus action', 'cleric', 'bard', 'druid'],
    icon: '\u{1F49A}',
    expression: {
      groups: [{ count: 1, sides: 4 }],
      modifier: charMod('WIS'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'healing-potion',
    name: $localize`:@@template.healingPotion:Potion of Healing`,
    description: $localize`:@@template.healingPotion.desc:Standard Potion of Healing (2d4 + 2)`,
    category: 'Healing',
    tags: ['potion', 'healing', 'item', 'consumable', '2d4'],
    icon: '\u{1F9EA}',
    expression: {
      groups: [{ count: 2, sides: 4 }],
      modifier: fixedMod(2),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'healing-potion-greater',
    name: $localize`:@@template.healingPotionGreater:Potion of Greater Healing`,
    description: $localize`:@@template.healingPotionGreater.desc:Potion of Greater Healing (4d4 + 4)`,
    category: 'Healing',
    tags: ['potion', 'healing', 'item', 'consumable', 'greater', '4d4'],
    icon: '\u{1F9EA}',
    expression: {
      groups: [{ count: 4, sides: 4 }],
      modifier: fixedMod(4),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'healing-potion-superior',
    name: $localize`:@@template.healingPotionSuperior:Potion of Superior Healing`,
    description: $localize`:@@template.healingPotionSuperior.desc:Potion of Superior Healing (8d4 + 8)`,
    category: 'Healing',
    tags: ['potion', 'healing', 'item', 'consumable', 'superior', '8d4'],
    icon: '\u{1F9EA}',
    expression: {
      groups: [{ count: 8, sides: 4 }],
      modifier: fixedMod(8),
      advantage: AdvantageType.NONE
    }
  },

  // ============================================
  // UTILITY
  // ============================================
  {
    id: 'utility-initiative',
    name: $localize`:@@template.initiative:Initiative`,
    description: $localize`:@@template.initiative.desc:Roll for initiative (d20 + DEX)`,
    category: 'Utility',
    tags: ['initiative', 'combat', 'dexterity', 'turn order'],
    icon: '\u{26A1}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: charMod('DEX'),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'utility-death-save',
    name: $localize`:@@template.deathSave:Death Saving Throw`,
    description: $localize`:@@template.deathSave.desc:Death saving throw (d20, no modifier)`,
    category: 'Utility',
    tags: ['death', 'save', 'saving throw', 'unconscious', 'dying'],
    icon: '\u{1F480}',
    expression: {
      groups: [{ count: 1, sides: 20 }],
      modifier: fixedMod(0),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'utility-percentile',
    name: $localize`:@@template.percentile:Percentile (d100)`,
    description: $localize`:@@template.percentile.desc:Roll percentile dice for random tables`,
    category: 'Utility',
    tags: ['percentile', 'd100', 'random', 'table', 'wild magic'],
    icon: '\u{1F3B2}',
    expression: {
      groups: [{ count: 1, sides: 100 }],
      modifier: fixedMod(0),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'utility-coin-flip',
    name: $localize`:@@template.coinFlip:Coin Flip (d2)`,
    description: $localize`:@@template.coinFlip.desc:Flip a coin (1 = heads, 2 = tails)`,
    category: 'Utility',
    tags: ['coin', 'flip', 'd2', 'random', 'heads', 'tails'],
    icon: '\u{1FA99}',
    expression: {
      groups: [{ count: 1, sides: 2 }],
      modifier: fixedMod(0),
      advantage: AdvantageType.NONE
    }
  },

  // ============================================
  // CHARACTER CREATION
  // ============================================
  {
    id: 'chargen-4d6-drop-lowest',
    name: $localize`:@@template.4d6DropLowest:Ability Score (4d6 drop lowest)`,
    description: $localize`:@@template.4d6DropLowest.desc:Standard ability score generation: roll 4d6, drop lowest`,
    category: 'Character Creation',
    tags: ['ability score', 'character creation', 'stat', 'generation', '4d6'],
    icon: '\u{1F4DC}',
    expression: {
      groups: [{
        count: 4,
        sides: 6,
        keepDrop: { type: KeepDropType.DROP_LOWEST, count: 1 }
      }],
      modifier: fixedMod(0),
      advantage: AdvantageType.NONE
    }
  },
  {
    id: 'chargen-3d6',
    name: $localize`:@@template.3d6:Ability Score (3d6)`,
    description: $localize`:@@template.3d6.desc:Classic ability score generation: roll 3d6`,
    category: 'Character Creation',
    tags: ['ability score', 'character creation', 'stat', 'generation', 'classic', '3d6'],
    icon: '\u{1F4DC}',
    expression: {
      groups: [{ count: 3, sides: 6 }],
      modifier: fixedMod(0),
      advantage: AdvantageType.NONE
    }
  }
];
