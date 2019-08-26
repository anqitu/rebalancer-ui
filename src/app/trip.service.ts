import { Injectable } from '@angular/core';
import { Trip } from 'src/models/trip';
import * as uuid from 'uuid/v4';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private trips: BehaviorSubject<Trip[]>;
  private trips$: Observable<Trip[]>;
  private tripsBuffer: Trip[] = [];

  constructor() {
    this.trips = new BehaviorSubject<Trip[]>(this.tripsBuffer);
    this.trips$ = this.trips.asObservable();
  }

  public getTrips() {
    return this.trips$;
  }

  public createTrip(sourceId: string, destinationId: string, count: number): Trip {
    const trip: Trip = {
      id: uuid(),
      progress: 0,
      count,
      sourceId,
      destinationId
    };
    this.tripsBuffer.push(trip);
    return trip;
  }

  public startTrips() {
    this.trips.next(this.tripsBuffer);
    this.tripsBuffer = [];
  }

}
