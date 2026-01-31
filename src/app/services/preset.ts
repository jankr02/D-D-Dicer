import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Preset as PresetModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class Preset {
  private readonly STORAGE_KEY = 'dnd_dicer_presets';
  private presetsSubject = new BehaviorSubject<PresetModel[]>([]);
  public presets$ = this.presetsSubject.asObservable();

  loadPresets(): void {
    // TODO: Implementierung - use STORAGE_KEY for localStorage
    console.log(this.STORAGE_KEY);
  }

  savePreset(_preset: PresetModel): void {
    // TODO: Implementierung
  }

  deletePreset(_id: string): void {
    // TODO: Implementierung
  }

  getPresets(): PresetModel[] {
    return [];
  }
}
