import { Injectable } from '@angular/core';
import { Trip } from 'src/models/trip';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private trips: BehaviorSubject<Trip[]>;
  public readonly trips$: Observable<Trip[]>;

  constructor() {
    this.trips = new BehaviorSubject<Trip[]>([]);
    this.trips$ = this.trips.asObservable();
  }

  public setTrips(trips: Trip[]) {
    this.trips.next(trips);
  }

}
