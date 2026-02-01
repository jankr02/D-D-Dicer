import { Component, ViewChild, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceRoller } from './components/dice-roller/dice-roller';
import { RollHistory } from './components/roll-history/roll-history';
import { PresetManager } from './components/preset-manager/preset-manager';
import { CharacterSheet } from './components/character-sheet/character-sheet';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ToastContainerComponent } from './components/toast/toast-container.component';
import { ModalContainerComponent } from './components/modal/modal-container.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher';
import { BottomTabBarComponent, MobileTab } from './components/bottom-tab-bar/bottom-tab-bar.component';
import { PwaInstallButtonComponent } from './components/pwa-install-button/pwa-install-button.component';
import { DiceExpression } from './models';
import { Settings } from './services/settings';
import { ToastService } from './services/toast.service';
import { PwaUpdateService } from './services/pwa-update.service';
import { PwaInstallService } from './services/pwa-install.service';

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
    ModalContainerComponent,
    LanguageSwitcherComponent,
    BottomTabBarComponent,
    PwaInstallButtonComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'D&D Dice Roller';
  activeTab: 'dice' | 'character' = 'dice';
  mobileTab: MobileTab = 'dice';
  isMobile = false;

  private readonly MOBILE_BREAKPOINT = 768;

  constructor(
    _settings: Settings,
    private toastService: ToastService,
    _pwaUpdateService: PwaUpdateService,
    _pwaInstallService: PwaInstallService
  ) {
    // Services are injected to initialize them as singletons
  }

  ngOnInit(): void {
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;
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
      this.toastService.error($localize`:@@error.invalidDiceExpression:Please configure a valid dice expression first`);
      return;
    }

    this.presetManager.savePreset(name, expression);
  }

  /**
   * Switches between tabs (desktop).
   */
  switchTab(tab: 'dice' | 'character'): void {
    this.activeTab = tab;
  }

  /**
   * Switches between mobile tabs.
   */
  switchMobileTab(tab: MobileTab): void {
    this.mobileTab = tab;
    // Sync with desktop tabs where applicable
    if (tab === 'character') {
      this.activeTab = 'character';
    } else {
      this.activeTab = 'dice';
    }
  }
}
