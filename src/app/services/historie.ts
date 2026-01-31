import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RollResult } from '../models';

@Injectable({
  providedIn: 'root',
})
export class Historie {
  private readonly MAX_ENTRIES = 30;
  private historySubject = new BehaviorSubject<RollResult[]>([]);
  public history$ = this.historySubject.asObservable();

  addRollResult(_result: RollResult): void {
    // TODO: Implementierung - use MAX_ENTRIES to limit history
    console.log(this.MAX_ENTRIES);
  }

  getHistory(): RollResult[] {
    return [];
  }

  clearHistory(): void {
    // TODO: Implementierung
  }
}
