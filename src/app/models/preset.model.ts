import { DiceExpression } from './dice-expression.model';
import { PresetCategory } from '../types/preset-category.type';

export interface Preset {
  id: string;          // UUID
  name: string;
  expression: DiceExpression;
  categories?: PresetCategory[];  // Optional array of categories (tag-based)
}
