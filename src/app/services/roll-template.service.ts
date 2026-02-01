import { Injectable } from '@angular/core';
import { RollTemplate } from '../models/roll-template.model';
import { ROLL_TEMPLATES } from '../data/roll-templates.data';
import {
  TemplateCategory,
  TEMPLATE_CATEGORIES,
  ALL_TEMPLATE_CATEGORIES,
  TemplateCategoryFilter,
} from '../types/template-category.type';

/**
 * Service providing read-only access to built-in D&D 5e roll templates.
 * Templates are static and loaded from compiled data.
 */
@Injectable({
  providedIn: 'root',
})
export class RollTemplateService {
  private templates: RollTemplate[] = ROLL_TEMPLATES;

  /**
   * Gets all available templates.
   */
  getTemplates(): RollTemplate[] {
    return this.templates;
  }

  /**
   * Gets templates filtered by category.
   */
  getTemplatesByCategory(filter: TemplateCategoryFilter): RollTemplate[] {
    if (filter === ALL_TEMPLATE_CATEGORIES) {
      return this.templates;
    }
    return this.templates.filter((t) => t.category === filter);
  }

  /**
   * Searches templates by name, description, or tags.
   * Case-insensitive search.
   */
  searchTemplates(
    query: string,
    categoryFilter: TemplateCategoryFilter = ALL_TEMPLATE_CATEGORIES,
  ): RollTemplate[] {
    const results = this.getTemplatesByCategory(categoryFilter);

    if (!query.trim()) {
      return results;
    }

    const lowerQuery = query.toLowerCase();
    return results.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }

  /**
   * Gets a template by ID.
   */
  getTemplateById(id: string): RollTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }

  /**
   * Gets all available categories.
   */
  getCategories(): TemplateCategory[] {
    return [...TEMPLATE_CATEGORIES];
  }

  /**
   * Gets templates grouped by category.
   */
  getTemplatesGroupedByCategory(): Map<TemplateCategory, RollTemplate[]> {
    const grouped = new Map<TemplateCategory, RollTemplate[]>();

    for (const category of TEMPLATE_CATEGORIES) {
      grouped.set(
        category,
        this.templates.filter((t) => t.category === category),
      );
    }

    return grouped;
  }
}
