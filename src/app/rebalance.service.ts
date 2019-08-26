import { Injectable } from '@angular/core';
import { TripService } from './trip.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class RebalanceService {

  private tripsPerRebalance = 10;

  constructor(private dataService: DataService, private tripService: TripService) { }

  public rebalance() {

    for (let index = 0; index < this.tripsPerRebalance; index++) {
      const source = this.dataService.getRandomStation();
      const destination = this.dataService.getRandomStation();
      this.tripService.createTrip(source.id, destination.id, Math.floor(source.count * 0.25));
    }

    this.tripService.startTrips();
  }
}
