/**
 * Predefined preset categories for organizing dice roll presets.
 * Categories help users organize and filter their saved configurations.
 */
export type PresetCategory =
  | 'Combat'
  | 'Utility'
  | 'Character'
  | 'Skill Check'
  | 'Damage'
  | 'Healing'
  | 'Custom';

/**
 * All available preset categories as a constant array.
 * Useful for rendering dropdowns and validation.
 */
export const PRESET_CATEGORIES: readonly PresetCategory[] = [
  'Combat',
  'Utility',
  'Character',
  'Skill Check',
  'Damage',
  'Healing',
  'Custom',
] as const;

/**
 * Special filter value to show all presets regardless of category.
 */
export const ALL_CATEGORIES = 'All Categories' as const;

/**
 * Virtual category for presets without any assigned categories.
 */
export const UNCATEGORIZED = 'Uncategorized' as const;

/**
 * Union type for all filter options (categories + special filters).
 */
export type CategoryFilter = PresetCategory | typeof ALL_CATEGORIES | typeof UNCATEGORIZED;

/**
 * Returns localized labels for preset categories.
 */
export function getCategoryLabel(category: PresetCategory | typeof ALL_CATEGORIES | typeof UNCATEGORIZED): string {
  switch (category) {
    case 'Combat':
      return $localize`:@@category.combat:Combat`;
    case 'Utility':
      return $localize`:@@category.utility:Utility`;
    case 'Character':
      return $localize`:@@category.character:Character`;
    case 'Skill Check':
      return $localize`:@@category.skillCheck:Skill Check`;
    case 'Damage':
      return $localize`:@@category.damage:Damage`;
    case 'Healing':
      return $localize`:@@category.healing:Healing`;
    case 'Custom':
      return $localize`:@@category.custom:Custom`;
    case ALL_CATEGORIES:
      return $localize`:@@category.allCategories:All Categories`;
    case UNCATEGORIZED:
      return $localize`:@@category.uncategorized:Uncategorized`;
    default:
      return category;
  }
}
