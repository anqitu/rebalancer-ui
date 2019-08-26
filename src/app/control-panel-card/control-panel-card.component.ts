import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RebalanceService } from '../rebalance.service';
import { DataService } from '../data.service';

@Component({
  selector: 'rbc-control-panel-card',
  templateUrl: './control-panel-card.component.html',
  styleUrls: ['./control-panel-card.component.scss']
})
export class ControlPanelCardComponent implements OnInit {

  intervalOptions: Interval[] = [];

  cycles = -1;
  hasRebalancedForCycle = false;
  time = moment('12', 'HH');

  settingsForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private rebalanceService: RebalanceService, private dataService: DataService) {

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

    // start
    if (this.cycles === -1) {
      this.cycles += 1;
      return;
    }

    this.hasRebalancedForCycle = false;
    this.time = moment(this.time).add(this.settingsForm.get('interval').value, 'hours');
    this.dataService.randomizeStationCount();
  }

  rebalance() {
    this.hasRebalancedForCycle = true;
    this.rebalanceService.rebalance();
  }

}

interface Interval {
  hours: number;
  label: string;
}
