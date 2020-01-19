import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from '../data.service';
import { Status } from 'src/models/status.response';
import { TripService } from '../trip.service';
import { StationService } from '../station.service';
import { StatisticItem } from 'src/models/statistic-item';
import { SettingsService } from '../settings.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'rbc-control-panel-card',
  templateUrl: './control-panel-card.component.html',
  styleUrls: ['./control-panel-card.component.scss']
})
export class ControlPanelCardComponent implements OnInit {

  // intervalOptions: Interval[] = [];
  predictionModeOptions: string[] = [];

  disableStep = false;
  currentStatus: Status;
  nextStatus: Status;
  time = moment('12', 'HH');

  settingsForm: FormGroup;

  statusLabels: {[key in Status]?: string} = {
    start: 'Start',
    'next-cycle': 'Next Cycle',
    rebalance: 'Rebalance',
    rides: 'Simulate Rides',
  };

  statistics: StatisticItem[] = [];

  exportUrl = `${environment.serverEndpoint}/download`;

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private tripService: TripService,
    private stationService: StationService,
    private settingsService: SettingsService
  ) {

    // this.buildIntervalOptions(12);
    this.setConfig();
    this.settingsForm = this.formBuilder.group({
      predictionMode: [],
      peakCost: [],
      offPeakCost: [],
      budgetPerCycle: [],
      costCoef: []
    });

    this.settingsForm.valueChanges.subscribe(() => {
      this.settingsService.setSettings(this.settingsForm.value);
    });
  }

  setConfig() {
    this.dataService.getConfig().then(response => {
      this.predictionModeOptions = response.predictionMode;
    });
  }

  // buildIntervalOptions(maxHours: number) {
  //   for (let hour = 1; hour < maxHours + 1; hour++) {
  //     this.intervalOptions.push({
  //       hours: hour,
  //       label: `${hour} hour(s)`
  //     });
  //   }
  // }

  step(step: Status) {
    this.disableStep = true;
    this.dataService.step(step).then(response => {

      this.time = moment.unix(response.time).local();
      this.nextStatus = response.nextStatus;
      this.currentStatus = response.currentStatus;
      this.statistics = response.statistics;

      if (response.trips && response.trips.length > 0) {
        this.tripService
          .setTrips(response.trips)
          .then(() => this.disableStep = false);
      } else {
        this.disableStep = false;
      }

      if (response.stations && !response.trips) {
        this.stationService.updateStations(response.stations);
      }

      if (this.nextStatus !== 'start') {
        this.settingsForm.disable();
      } else {
        this.settingsForm.enable();
      }
    });
  }

  ngOnInit() {
    this.dataService.getStatus().then(response => {
      this.time = moment.unix(response.time).local();
      this.statistics = response.statistics;
      this.currentStatus = response.currentStatus;
      this.nextStatus = response.nextStatus;

      this.settingsForm.patchValue(response.settings);
      this.settingsService.setSettings(response.settings);
      this.stationService.setStations(response.stations);

      if (this.nextStatus !== 'start') {
        this.settingsForm.disable();
      }
    });
  }

}

// interface Interval {
//   hours: number;
//   label: string;
// }
