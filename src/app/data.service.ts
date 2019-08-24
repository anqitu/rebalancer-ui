import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Station } from 'src/models/station';
import * as uuid from 'uuid/v4';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  public getStations(): Promise<Station[]> {
    return this.http.get<Station[]>('./assets/stations.json').toPromise().then(stations => {
      stations.forEach(station => {
        station.id = uuid();
        station.count = Math.floor(Math.random() * 100);
      });
      return stations;
    });
  }
}
