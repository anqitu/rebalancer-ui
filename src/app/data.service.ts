import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StepResponse } from 'src/models/step.response';
import { environment } from 'src/environments/environment';
import { Status, StatusResponse } from 'src/models/status.response';
import { SettingsService } from './settings.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConfigResponse } from 'src/models/config.response';
import { SimulationRecordResponse } from 'src/models/simulation-record-response';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private loading: Subject<boolean>;
  public readonly loading$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {
    this.loading = new Subject();
    this.loading$ = this.loading.asObservable();
  }

  public getStatus(): Promise<StatusResponse> {
    this.loading.next(true);
    return this.http.get<StatusResponse>(`${environment.serverEndpoint}/status`).toPromise().then(res => {
      this.loading.next(false);
      return res;
    });
  }

  public getConfig(): Promise<ConfigResponse> {
    this.loading.next(true);
    return this.http.get<ConfigResponse>(`${environment.serverEndpoint}/config`).toPromise().then(res => {
      this.loading.next(false);
      return res;
    });
  }

  public getSimulationRecords(): Promise<SimulationRecordResponse> {
    // this.loading.next(true);
    return this.http.get<SimulationRecordResponse>(`${environment.serverEndpoint}/records`).toPromise().then(res => {
      // this.loading.next(false);
      return res;
    });
  }

  public deleteSimulationRecords(recordId): Promise<{}> {
    // this.loading.next(true);
    return this.http.get<{}>(`${environment.serverEndpoint}/delete/${recordId}`).toPromise().then(res => {
      // this.loading.next(false);
      return res;
    });
  }

  public step(step: Status): Promise<StepResponse> {
    this.loading.next(true);
    const body = step === 'start' ? {
      settings: this.settingsService.getSettings()
    } : {};
    return this.http.post<StepResponse>(`${environment.serverEndpoint}/step/${step}`, body).toPromise().then(res => {
      this.loading.next(false);
      return res;
    });
  }

  public advance(advanceSteps: number, stepStatus: Status): Promise<StepResponse> {
    this.loading.next(true);
    const body = stepStatus === 'start' ? {
      settings: this.settingsService.getSettings()
    } : {};
    return this.http.post<StepResponse>(`${environment.serverEndpoint}/advance/${advanceSteps}`, body).toPromise().then(res => {
      this.loading.next(false);
      return res;
    });
  }
}
