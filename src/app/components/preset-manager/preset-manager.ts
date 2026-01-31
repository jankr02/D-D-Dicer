import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Preset } from '../../services/preset';
import { Preset as PresetModel, DiceExpression } from '../../models';
import { generateUUID } from '../../utils/uuid.util';
import { DiceNotationPipe } from '../../pipes/dice-notation.pipe';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';
import {
  PresetCategory,
  CategoryFilter,
  PRESET_CATEGORIES,
  ALL_CATEGORIES,
  UNCATEGORIZED
} from '../../types/preset-category.type';

/**
 * PresetManagerComponent - Manages saved dice roll configurations.
 *
 * Features:
 * - Display all saved presets
 * - Save current configuration as preset
 * - Load preset into dice roller
 * - Delete presets
 */
@Component({
  selector: 'app-preset-manager',
  imports: [CommonModule, FormsModule, DiceNotationPipe],
  templateUrl: './preset-manager.html',
  styleUrl: './preset-manager.scss',
})
export class PresetManager implements OnInit {
  @Output() loadPreset = new EventEmitter<DiceExpression>();
  @Output() requestSave = new EventEmitter<string>();

  // Preset data
  filteredPresets$!: Observable<PresetModel[]>;
  hasUncategorized$!: Observable<boolean>;

  // Form state
  newPresetName = '';
  selectedCategories: PresetCategory[] = [];
  showSaveForm = false;

  // Filter state
  selectedFilter: CategoryFilter = ALL_CATEGORIES;

  // Constants for template
  readonly allCategories = PRESET_CATEGORIES;
  readonly ALL_CATEGORIES = ALL_CATEGORIES;
  readonly UNCATEGORIZED = UNCATEGORIZED;

  constructor(
    private presetService: Preset,
    private toastService: ToastService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Initialize filtered presets based on selected filter
    this.filteredPresets$ = this.presetService.getPresetsByCategory(this.selectedFilter);
    this.hasUncategorized$ = this.presetService.hasUncategorizedPresets();
  }

  /**
   * Toggles the save preset form visibility.
   */
  toggleSaveForm(): void {
    this.showSaveForm = !this.showSaveForm;
    if (!this.showSaveForm) {
      this.newPresetName = '';
      this.selectedCategories = [];
    }
  }

  /**
   * Requests to save the current dice configuration as a new preset.
   * Emits the preset name to the parent component, which will
   * retrieve the current expression and complete the save.
   */
  onSaveCurrentAsPreset(): void {
    if (!this.newPresetName.trim()) {
      this.toastService.error('Please enter a preset name');
      return;
    }

    this.requestSave.emit(this.newPresetName.trim());
    // Note: Form state will be reset after successful save via savePreset()
  }

  /**
   * Internal method to save a preset directly.
   * Used when the parent component provides the complete preset.
   */
  savePreset(name: string, expression: DiceExpression): void {
    const preset: PresetModel = {
      id: generateUUID(),
      name: name,
      expression: expression,
      categories: this.selectedCategories.length > 0 ? [...this.selectedCategories] : undefined
    };

    this.presetService.savePreset(preset);
    this.toastService.success(`Preset "${name}" saved successfully!`);

    // Reset form state
    this.newPresetName = '';
    this.selectedCategories = [];
    this.showSaveForm = false;
  }

  /**
   * Loads a preset and emits it to parent component.
   */
  onLoadPreset(preset: PresetModel): void {
    this.loadPreset.emit(preset.expression);
    this.toastService.info(`Loaded preset "${preset.name}"`);
  }

  /**
   * Deletes a preset after confirmation.
   */
  async deletePreset(preset: PresetModel): Promise<void> {
    const confirmed = await this.modalService.confirm(
      'Delete Preset',
      `Are you sure you want to delete the preset "${preset.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.presetService.deletePreset(preset.id);
      this.toastService.success(`Preset "${preset.name}" deleted`);
    }
  }

  /**
   * Updates the category filter and refreshes the preset list.
   */
  onFilterChange(filter: CategoryFilter): void {
    this.selectedFilter = filter;
    this.filteredPresets$ = this.presetService.getPresetsByCategory(filter);
  }

  /**
   * Toggles category selection when saving a preset.
   */
  toggleCategory(category: PresetCategory): void {
    const index = this.selectedCategories.indexOf(category);
    if (index >= 0) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  /**
   * Checks if a category is currently selected.
   */
  isCategorySelected(category: PresetCategory): boolean {
    return this.selectedCategories.includes(category);
  }

  /**
   * Gets a display-friendly category badge list for a preset.
   */
  getCategoryBadges(preset: PresetModel): PresetCategory[] {
    return preset.categories || [];
  }
}
