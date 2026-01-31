import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Preset } from '../../services/preset';
import { Preset as PresetModel, DiceExpression } from '../../models';
import { generateUUID } from '../../utils/uuid.util';
import { DiceNotationPipe } from '../../pipes/dice-notation.pipe';

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
   * Requests to save the current dice configuration as a new preset.
   * Emits the preset name to the parent component, which will
   * retrieve the current expression and complete the save.
   */
  onSaveCurrentAsPreset(): void {
    if (!this.newPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    this.requestSave.emit(this.newPresetName.trim());
    this.newPresetName = '';
    this.showSaveForm = false;
  }

  /**
   * Internal method to save a preset directly.
   * Used when the parent component provides the complete preset.
   */
  savePreset(name: string, expression: DiceExpression): void {
    const preset: PresetModel = {
      id: generateUUID(),
      name: name,
      expression: expression
    };

    this.presetService.savePreset(preset);
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
