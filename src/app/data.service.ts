import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Station } from 'src/models/station';
import * as uuid from 'uuid/v4';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private stations: BehaviorSubject<Station[]>;
  private stations$: Observable<Station[]>;

  constructor(private http: HttpClient) {
    this.stations = new BehaviorSubject([]);
    this.stations$ = this.stations.asObservable();

    this.http.get<Station[]>('./assets/stations.json').toPromise().then(stations => {
      stations.forEach(station => {
        station.id = uuid();
        station.count = Math.floor(Math.random() * 100);
      });
      this.stations.next(stations);
    });
  }

  public getStations() {
    return this.stations$;
  }

  public getRandomStation() {
    const stations = this.stations.getValue();
    return stations[Math.floor(Math.random() * stations.length)];
  }

  public randomizeStationCount() {
    const stations = this.stations.getValue();
    stations.forEach(station => {
      station.count = Math.floor(Math.random() * 100);
    });
    this.stations.next(stations);
  }
}
