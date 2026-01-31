import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Preset } from '../../services/preset';
import { Preset as PresetModel, DiceExpression } from '../../models';
import { generateUUID } from '../../utils/uuid.util';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './preset-manager.html',
  styleUrl: './preset-manager.scss',
})
export class PresetManager implements OnInit {
  @Output() loadPreset = new EventEmitter<DiceExpression>();

  presets$!: Observable<PresetModel[]>;
  newPresetName = '';
  showSaveForm = false;

  constructor(private presetService: Preset) {}

  ngOnInit(): void {
    this.presets$ = this.presetService.presets$;
  }

  /**
   * Toggles the save preset form visibility.
   */
  toggleSaveForm(): void {
    this.showSaveForm = !this.showSaveForm;
    if (!this.showSaveForm) {
      this.newPresetName = '';
    }
  }

  /**
   * Saves the current configuration as a new preset.
   * Note: This is a placeholder - actual implementation needs
   * to receive DiceExpression from parent component.
   */
  saveCurrentAsPreset(expression: DiceExpression): void {
    if (!this.newPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const preset: PresetModel = {
      id: generateUUID(),
      name: this.newPresetName.trim(),
      expression: expression
    };

    this.presetService.savePreset(preset);
    this.newPresetName = '';
    this.showSaveForm = false;
  }

  /**
   * Loads a preset and emits it to parent component.
   */
  onLoadPreset(preset: PresetModel): void {
    this.loadPreset.emit(preset.expression);
  }

  /**
   * Deletes a preset after confirmation.
   */
  deletePreset(preset: PresetModel): void {
    if (confirm(`Delete preset "${preset.name}"?`)) {
      this.presetService.deletePreset(preset.id);
    }
  }
}
