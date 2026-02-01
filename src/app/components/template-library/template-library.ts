import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RollTemplate } from '../../models/roll-template.model';
import { DiceExpression } from '../../models';
import { RollTemplateService } from '../../services/roll-template.service';
import { CharacterService } from '../../services/character';
import { DiceNotationPipe } from '../../pipes/dice-notation.pipe';
import { ToastService } from '../../services/toast.service';
import {
  TemplateCategory,
  TEMPLATE_CATEGORIES,
  ALL_TEMPLATE_CATEGORIES,
  TemplateCategoryFilter,
  getTemplateCategoryLabel
} from '../../types/template-category.type';

/**
 * TemplateLibrary - Browse and use built-in D&D 5e roll templates.
 *
 * Features:
 * - Display all built-in templates
 * - Filter by category
 * - Search by name, description, or tags
 * - Load template into dice roller
 * - Copy template to user presets
 */
@Component({
  selector: 'app-template-library',
  imports: [CommonModule, FormsModule, DiceNotationPipe],
  templateUrl: './template-library.html',
  styleUrl: './template-library.scss',
})
export class TemplateLibrary implements OnInit {
  @Output() useTemplate = new EventEmitter<DiceExpression>();
  @Output() copyToPresets = new EventEmitter<RollTemplate>();

  // Template data
  filteredTemplates: RollTemplate[] = [];

  // Search and filter state
  searchQuery = '';
  selectedCategory: TemplateCategoryFilter = ALL_TEMPLATE_CATEGORIES;

  // Constants for template
  readonly allCategories = TEMPLATE_CATEGORIES;
  readonly ALL_CATEGORIES = ALL_TEMPLATE_CATEGORIES;

  constructor(
    private templateService: RollTemplateService,
    private characterService: CharacterService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.updateFilteredTemplates();
  }

  /**
   * Updates the filtered template list based on search and category.
   */
  updateFilteredTemplates(): void {
    this.filteredTemplates = this.templateService.searchTemplates(
      this.searchQuery,
      this.selectedCategory
    );
  }

  /**
   * Handles search input changes.
   */
  onSearchChange(): void {
    this.updateFilteredTemplates();
  }

  /**
   * Handles category filter changes.
   */
  onCategoryChange(): void {
    this.updateFilteredTemplates();
  }

  /**
   * Uses a template - loads it into the dice roller.
   */
  onUseTemplate(template: RollTemplate): void {
    if (!this.isTemplateAvailable(template)) {
      this.toastService.error($localize`:@@template.error.requiresCharacter:This template requires a character sheet`);
      return;
    }
    this.useTemplate.emit(template.expression);
    this.toastService.info($localize`:@@template.toast.loaded:Loaded template "${template.name}"`);
  }

  /**
   * Copies a template to user presets.
   */
  onCopyToPresets(template: RollTemplate): void {
    this.copyToPresets.emit(template);
  }

  /**
   * Gets the localized label for a category.
   */
  getCategoryLabel(category: TemplateCategory | typeof ALL_TEMPLATE_CATEGORIES): string {
    return getTemplateCategoryLabel(category);
  }

  /**
   * Checks if a template is available (character-based templates need character).
   */
  isTemplateAvailable(template: RollTemplate): boolean {
    if (template.expression.modifier.type === 'fixed') {
      return true;
    }
    // CharacterModifier requires character
    const char = this.characterService.getCharacter();
    return char !== null;
  }

  /**
   * Gets the count of templates in a category.
   */
  getCategoryCount(category: TemplateCategory): number {
    return this.templateService.getTemplatesByCategory(category).length;
  }
}
