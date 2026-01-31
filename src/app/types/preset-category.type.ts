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
