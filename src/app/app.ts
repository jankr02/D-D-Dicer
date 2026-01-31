import { Component } from '@angular/core';
import { DiceRoller } from './components/dice-roller/dice-roller';
import { RollHistory } from './components/roll-history/roll-history';
import { PresetManager } from './components/preset-manager/preset-manager';

@Component({
  selector: 'app-root',
  imports: [
    DiceRoller,
    RollHistory,
    PresetManager
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'D&D Dice Roller';
}
