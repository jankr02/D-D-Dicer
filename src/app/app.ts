import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceRoller } from './components/dice-roller/dice-roller';
import { RollHistory } from './components/roll-history/roll-history';
import { PresetManager } from './components/preset-manager/preset-manager';
import { CharacterSheet } from './components/character-sheet/character-sheet';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ToastContainerComponent } from './components/toast/toast-container.component';
import { ModalContainerComponent } from './components/modal/modal-container.component';
import { DiceExpression } from './models';
import { Settings } from './services/settings';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    DiceRoller,
    RollHistory,
    PresetManager,
    CharacterSheet,
    ThemeToggleComponent,
    ToastContainerComponent,
    ModalContainerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'D&D Dice Roller';
  activeTab: 'dice' | 'character' = 'dice';

  constructor(
    _settings: Settings,
    private toastService: ToastService
  ) {
    // Settings service is injected and initializes automatically
    // No need to store the reference as it's a singleton service
  }

  ngOnInit(): void {
    // Component initialization
  }

  @ViewChild(DiceRoller) diceRoller!: DiceRoller;
  @ViewChild(PresetManager) presetManager!: PresetManager;

  /**
   * Handles loading a preset from the PresetManager into the DiceRoller.
   */
  onLoadPreset(expression: DiceExpression): void {
    this.diceRoller.loadPreset(expression);
  }

  /**
   * Gets the current expression from the DiceRoller for saving as a preset.
   */
  getCurrentExpression(): DiceExpression | null {
    return this.diceRoller.getCurrentExpression();
  }

  /**
   * Handles the request to save the current dice configuration as a preset.
   */
  onSavePreset(name: string): void {
    const expression = this.diceRoller.getCurrentExpression();

    if (!expression) {
      this.toastService.error('Please configure a valid dice expression first');
      return;
    }

    this.presetManager.savePreset(name, expression);
  }

  /**
   * Switches between tabs.
   */
  switchTab(tab: 'dice' | 'character'): void {
    this.activeTab = tab;
  }
}
