/**
 * Categories specific to D&D 5e roll templates.
 * More specific than PresetCategory for better organization.
 */
export type TemplateCategory =
  | 'Ability Check'
  | 'Saving Throw'
  | 'Attack Roll'
  | 'Damage'
  | 'Healing'
  | 'Utility'
  | 'Character Creation';

/**
 * All available template categories as a constant array.
 */
export const TEMPLATE_CATEGORIES: readonly TemplateCategory[] = [
  'Ability Check',
  'Saving Throw',
  'Attack Roll',
  'Damage',
  'Healing',
  'Utility',
  'Character Creation',
] as const;

/**
 * Special filter value to show all templates regardless of category.
 */
export const ALL_TEMPLATE_CATEGORIES = 'All Categories' as const;

/**
 * Union type for all template filter options.
 */
export type TemplateCategoryFilter = TemplateCategory | typeof ALL_TEMPLATE_CATEGORIES;

/**
 * Returns localized labels for template categories.
 */
export function getTemplateCategoryLabel(category: TemplateCategory | typeof ALL_TEMPLATE_CATEGORIES): string {
  switch (category) {
    case 'Ability Check':
      return $localize`:@@templateCategory.abilityCheck:Ability Check`;
    case 'Saving Throw':
      return $localize`:@@templateCategory.savingThrow:Saving Throw`;
    case 'Attack Roll':
      return $localize`:@@templateCategory.attackRoll:Attack Roll`;
    case 'Damage':
      return $localize`:@@templateCategory.damage:Damage`;
    case 'Healing':
      return $localize`:@@templateCategory.healing:Healing`;
    case 'Utility':
      return $localize`:@@templateCategory.utility:Utility`;
    case 'Character Creation':
      return $localize`:@@templateCategory.characterCreation:Character Creation`;
    case ALL_TEMPLATE_CATEGORIES:
      return $localize`:@@templateCategory.all:All Categories`;
    default:
      return category;
  }
}
