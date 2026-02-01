import { DiceExpression } from './dice-expression.model';
import { TemplateCategory } from '../types/template-category.type';

/**
 * A built-in roll template for common D&D 5e rolls.
 * Unlike Presets, templates are read-only and included with the app.
 */
export interface RollTemplate {
  /** Unique identifier for the template */
  id: string;

  /** Display name (e.g., "Strength Check", "Longsword Attack") */
  name: string;

  /** Brief description of when to use this roll */
  description: string;

  /** The dice expression to execute */
  expression: DiceExpression;

  /** Category for filtering */
  category: TemplateCategory;

  /** Search tags for better discoverability */
  tags: string[];

  /** Icon identifier (emoji) */
  icon?: string;
}
