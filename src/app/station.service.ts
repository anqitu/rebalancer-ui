import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Station } from 'src/models/station';
import { StationUpdate } from 'src/models/station-update';

@Injectable({
  providedIn: 'root'
})
export class StationService {

  private stations: BehaviorSubject<Station[]>;
  public readonly stations$: Observable<Station[]>;

  constructor() {
    this.stations = new BehaviorSubject([]);
    this.stations$ = this.stations.asObservable();
  }

  public updateStations(updates: StationUpdate[]) {
    const stations = this.stations.getValue();
    updates.forEach(update => {
      const station = stations.find(s => s.id === update.id);
      station.count = update.count;
    });
    this.stations.next(stations);
  }
}
