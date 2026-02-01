import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MobileTab = 'dice' | 'presets' | 'stats' | 'character';

@Component({
  selector: 'app-bottom-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-tab-bar.component.html',
  styleUrl: './bottom-tab-bar.component.scss'
})
export class BottomTabBarComponent {
  @Input() activeTab: MobileTab = 'dice';
  @Output() tabChange = new EventEmitter<MobileTab>();

  tabs: { id: MobileTab; icon: string; labelKey: string }[] = [
    { id: 'dice', icon: '🎲', labelKey: 'Würfeln' },
    { id: 'presets', icon: '📁', labelKey: 'Presets' },
    { id: 'stats', icon: '📊', labelKey: 'Stats' },
    { id: 'character', icon: '👤', labelKey: 'Charakter' }
  ];

  selectTab(tab: MobileTab): void {
    this.tabChange.emit(tab);
  }
}
