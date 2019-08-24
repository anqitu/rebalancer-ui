import { Injectable } from '@angular/core';
import { Trip } from 'src/models/trip';
import { Station } from 'src/models/station';
import * as uuid from 'uuid/v4';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private trips: Trip[] = [];

  constructor() { }

  public getTrips() {
    return this.trips;
  }

  public createTrip(source: Station, destination: Station, count: number) {
    const trip: Trip = {
      id: uuid(),
      progress: 0,
      time: (new Date).getTime(),
      count,
      source: {
        station: source,
        oldCount: source.count,
        newCount: source.count - count
      },
      destination: {
        station: destination,
        oldCount: destination.count,
        newCount: destination.count + count
      }
    };
    this.trips.push(trip);
    return trip;
  }

}
