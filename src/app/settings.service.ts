import { Injectable } from '@angular/core';
import { Settings } from 'src/models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private settings: Settings;

  constructor() { }

  public getSettings(): Settings {
    return this.settings;
  }

  public setSettings(settings: Settings) {
    this.settings = settings;
  }
}
