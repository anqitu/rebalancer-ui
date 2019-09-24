import { Injectable } from '@angular/core';
import { Trip } from 'src/models/trip';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { TRIP_ANIMATION_START_DELAY, TRIP_ANIMATION_FRAME_RATE, TRIP_ANIMATION_FRAMES, TRIP_BATCH_SIZE } from './constants';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private trips: BehaviorSubject<Trip[]>;
  public readonly trips$: Observable<Trip[]>;
  private readonly batchDuration = TRIP_ANIMATION_FRAMES * TRIP_ANIMATION_FRAME_RATE * 1.5 + TRIP_ANIMATION_START_DELAY;

  private chunkingProgress: BehaviorSubject<ChunckedTripsProgress>;
  public readonly chunkingProgress$: Observable<ChunckedTripsProgress>;

  constructor() {
    this.trips = new BehaviorSubject<Trip[]>([]);
    this.trips$ = this.trips.asObservable();

    this.chunkingProgress = new BehaviorSubject(undefined);
    this.chunkingProgress$ = this.chunkingProgress.asObservable();
  }

  public async setTrips(trips: Trip[]) {
    const chunks = _.chunk(trips, TRIP_BATCH_SIZE);
    this.trips.next(chunks[0]);
    let tripsDone = chunks[0].length;
    if (chunks.length > 1) {
      this.chunkingProgress.next({
        current: tripsDone,
        total: trips.length
      });
    }

    return new Promise(resolve => {
      let i = 1;

      const interval = setInterval(() => {

        if (i === chunks.length) {
          clearInterval(interval);

          if (chunks.length > 1) {
            this.chunkingProgress.next(undefined);
          }

          return resolve();
        }

        const currentChunk = chunks[i];

        tripsDone += currentChunk.length;

        if (chunks.length > 1) {
          this.chunkingProgress.next({
            current: tripsDone,
            total: trips.length
          });
        }

        this.trips.next(currentChunk);
        i += 1;
      }, this.batchDuration);
    });
  }

}

export interface ChunckedTripsProgress {
  current: number;
  total: number;
}
