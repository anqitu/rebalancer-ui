import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StepResponse } from 'src/models/step.response';
import { environment } from 'src/environments/environment';
import { Status, StatusResponse } from 'src/models/status.response';
import { SettingsService } from './settings.service';
import { Result } from 'src/models/result.response';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) { }

  public getStatus(): Promise<StatusResponse> {
    return this.http.get<StatusResponse>(`${environment.serverEndpoint}/status`).toPromise();
  }

  public step(step: Status): Promise<StepResponse> {

    const body = step === 'start' ? {
      settings: this.settingsService.getSettings()
    } : {};

    return this.http.post<StepResponse>(`${environment.serverEndpoint}/step/${step}`, body).toPromise();
  }

  // public finish(): Promise<Result> {
  //   return this.http.post<Result>(`${environment.serverEndpoint}/finish`, {}).toPromise();
  // }

}
