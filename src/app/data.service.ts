import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StepResponse } from 'src/models/step.response';
import { environment } from 'src/environments/environment';
import { Status, StatusResponse } from 'src/models/status.response';
import { SettingsService } from './settings.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
}
