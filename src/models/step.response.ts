import { StatisticItem } from './statistic-item';
import { StationUpdate } from './station-update';
import { Trip } from './trip';
import { Status } from './status.response';

export interface StepResponse {
  time: number;
  currentStatus: Status;
  nextStatus: Status;
  statistics?: StatisticItem[];
  stations?: StationUpdate[];
  trips?: Trip[][];
}
