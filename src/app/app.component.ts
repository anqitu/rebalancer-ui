import { Component } from '@angular/core';
import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { DataService } from './data.service';
import { TripService, ChunckedTripsProgress } from './trip.service';

@Component({
  selector: 'rbc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  loading = true;

  loadingConfig = {
    animationType: ngxLoadingAnimationTypes.circle,
    primaryColour: '#fffff',
    secondaryColour: '#ccc'
  };

  progress: ChunckedTripsProgress;

  constructor(
    private dataService: DataService,
    private tripService: TripService,
  ) {
    this.dataService.loading$
      .subscribe(loading => this.loading = loading);

    this.tripService.chunkingProgress$.subscribe(progress => {
      this.progress = progress;
    });
  }
}

