import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Preset as PresetModel } from '../models';
import { PresetCategory, CategoryFilter, ALL_CATEGORIES, UNCATEGORIZED } from '../types/preset-category.type';

/**
 * PresetService - Manages saved dice roll configurations.
 *
 * Presets are persisted in browser localStorage and survive page refreshes.
 * The service uses a BehaviorSubject for reactive state updates.
 */
@Injectable({
  providedIn: 'root',
})
export class Preset {
  private readonly STORAGE_KEY = 'dnd_dicer_presets';
  private readonly STORAGE_VERSION_KEY = 'dnd_dicer_presets_version';
  private readonly CURRENT_VERSION = 4;

  private presetsSubject = new BehaviorSubject<PresetModel[]>([]);
  public presets$ = this.presetsSubject.asObservable();

  constructor() {
    // Load presets from localStorage on service initialization
    this.loadPresets();
  }

  /**
   * Loads presets from localStorage and updates the BehaviorSubject.
   * Called automatically on service initialization.
   * Includes migration support for older preset formats.
   */
  loadPresets(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      const version = parseInt(localStorage.getItem(this.STORAGE_VERSION_KEY) || '1', 10);

      if (storedData) {
        let presets: PresetModel[] = JSON.parse(storedData);

        // Migrate old presets to new format if needed
        if (version < this.CURRENT_VERSION) {
          presets = this.migratePresets(presets);
          // Save migrated data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
          localStorage.setItem(this.STORAGE_VERSION_KEY, this.CURRENT_VERSION.toString());
        }

        this.presetsSubject.next(presets);
      } else {
        // No presets stored yet - initialize with empty array
        this.presetsSubject.next([]);
        localStorage.setItem(this.STORAGE_VERSION_KEY, this.CURRENT_VERSION.toString());
      }
    } catch (error) {
      console.error('Failed to load presets from localStorage:', error);
      // On error, initialize with empty array
      this.presetsSubject.next([]);
    }
  }

  /**
   * Migrates presets from older versions to current format.
   * v1 → v2: Added categories field
   * v2 → v3: Changed modifier from number to Modifier union type
   * v3 → v4: Changed DiceGroup.type (DiceType enum) to DiceGroup.sides (number)
   */
  private migratePresets(presets: PresetModel[]): PresetModel[] {
    return presets.map(preset => {
      let migratedPreset = { ...preset };

      // Migration v1 → v2: Categories
      if (!migratedPreset.categories) {
        migratedPreset.categories = undefined;
      }

      // Migration v2 → v3: Modifier number → FixedModifier
      if (typeof migratedPreset.expression?.modifier === 'number') {
        migratedPreset.expression = {
          ...migratedPreset.expression,
          modifier: {
            type: 'fixed',
            value: migratedPreset.expression.modifier
          }
        };
      }

      // Migration v3 → v4: DiceType → sides
      if (migratedPreset.expression?.groups) {
        migratedPreset.expression = {
          ...migratedPreset.expression,
          groups: migratedPreset.expression.groups.map((group: any) => {
            // If group has type but no sides, convert type to sides
            if (group.type && group.sides === undefined) {
              const sides = parseInt(group.type.substring(1), 10); // "d20" -> 20
              return {
                count: group.count,
                sides,
                keepDrop: group.keepDrop
              };
            }
            return group;
          })
        };
      }

      return migratedPreset;
    });
  }

  /**
   * Saves a preset to localStorage.
   * If a preset with the same ID already exists, it will be updated.
   *
   * @param preset The preset to save
   */
  savePreset(preset: PresetModel): void {
    const currentPresets = this.presetsSubject.value;

    // Check if preset with this ID already exists
    const existingIndex = currentPresets.findIndex(p => p.id === preset.id);

    let updatedPresets: PresetModel[];

    if (existingIndex >= 0) {
      // Update existing preset
      updatedPresets = [...currentPresets];
      updatedPresets[existingIndex] = preset;
    } else {
      // Add new preset
      updatedPresets = [...currentPresets, preset];
    }

    // Persist to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPresets));
      this.presetsSubject.next(updatedPresets);
    } catch (error) {
      console.error('Failed to save preset to localStorage:', error);
      throw new Error('Failed to save preset');
    }
  }

  /**
   * Deletes a preset by its ID.
   *
   * @param id The UUID of the preset to delete
   */
  deletePreset(id: string): void {
    const currentPresets = this.presetsSubject.value;
    const updatedPresets = currentPresets.filter(p => p.id !== id);

    // Persist to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPresets));
      this.presetsSubject.next(updatedPresets);
    } catch (error) {
      console.error('Failed to delete preset from localStorage:', error);
      throw new Error('Failed to delete preset');
    }
  }

  /**
   * Gets the current list of presets.
   *
   * @returns Array of all saved presets
   */
  getPresets(): PresetModel[] {
    return this.presetsSubject.value;
  }

  /**
   * Gets an observable of presets filtered by category.
   *
   * @param categoryFilter The category to filter by, or 'All Categories'/'Uncategorized'
   * @returns Observable of filtered presets
   */
  getPresetsByCategory(categoryFilter: CategoryFilter): Observable<PresetModel[]> {
    return this.presets$.pipe(
      map(presets => {
        if (categoryFilter === ALL_CATEGORIES) {
          return presets;
        }

        if (categoryFilter === UNCATEGORIZED) {
          return presets.filter(preset =>
            !preset.categories || preset.categories.length === 0
          );
        }

        // Filter by specific category
        return presets.filter(preset =>
          preset.categories?.includes(categoryFilter as PresetCategory)
        );
      })
    );
  }

  /**
   * Checks if there are any uncategorized presets.
   *
   * @returns Observable of boolean indicating if uncategorized presets exist
   */
  hasUncategorizedPresets(): Observable<boolean> {
    return this.presets$.pipe(
      map(presets =>
        presets.some(preset => !preset.categories || preset.categories.length === 0)
      )
    );
  }
}
