import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preset as PresetModel } from '../models';

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
  private presetsSubject = new BehaviorSubject<PresetModel[]>([]);
  public presets$ = this.presetsSubject.asObservable();

  constructor() {
    // Load presets from localStorage on service initialization
    this.loadPresets();
  }

  /**
   * Loads presets from localStorage and updates the BehaviorSubject.
   * Called automatically on service initialization.
   */
  loadPresets(): void {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);

      if (storedData) {
        const presets: PresetModel[] = JSON.parse(storedData);
        this.presetsSubject.next(presets);
      } else {
        // No presets stored yet - initialize with empty array
        this.presetsSubject.next([]);
      }
    } catch (error) {
      console.error('Failed to load presets from localStorage:', error);
      // On error, initialize with empty array
      this.presetsSubject.next([]);
    }
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
}
