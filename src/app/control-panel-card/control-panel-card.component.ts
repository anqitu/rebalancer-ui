import { Component, OnInit } from '@angular/core';
import { Trip } from 'src/models/trip';
import { TripService } from '../trip.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'rbc-control-panel-card',
  templateUrl: './control-panel-card.component.html',
  styleUrls: ['./control-panel-card.component.scss']
})
export class ControlPanelCardComponent implements OnInit {

  intervalOptions: Interval[] = [];
  trips: Trip[];

  cycles = -1;
  hasRebalancedForCycle = false;
  time = moment('12', 'HH');

  settingsForm: FormGroup;

  constructor(private tripService: TripService, private formBuilder: FormBuilder) {
    this.trips = tripService.getTrips();
    for (let hour = 1; hour < 13; hour++) {
      this.intervalOptions.push({
        hours: hour,
        label: `${hour} hour(s)`
      });
    }

    this.settingsForm = formBuilder.group({
      interval: [1],
      peakCost: [0],
      offPeakCost: [0]
    });
  }

  ngOnInit() {
  }

  nextCycle() {
    this.cycles += 1;
    this.hasRebalancedForCycle = false;
    this.time = moment(this.time).add(this.settingsForm.get('interval').value, 'hours');
  }

  rebalance() {
    this.hasRebalancedForCycle = true;
  }

}

interface Interval {
  hours: number;
  label: string;
}
