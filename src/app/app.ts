import { Component, ViewChild, OnInit } from '@angular/core';
import { DiceRoller } from './components/dice-roller/dice-roller';
import { RollHistory } from './components/roll-history/roll-history';
import { PresetManager } from './components/preset-manager/preset-manager';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { DiceExpression } from './models';
import { Settings } from './services/settings';

@Component({
  selector: 'app-root',
  imports: [
    DiceRoller,
    RollHistory,
    PresetManager,
    ThemeToggleComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'D&D Dice Roller';

  constructor(_settings: Settings) {
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
      alert('Please configure a valid dice expression first');
      return;
    }

    this.presetManager.savePreset(name, expression);
  }
}
