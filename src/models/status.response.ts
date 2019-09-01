import { Station } from './station';
import { Settings } from './settings';
import { StatisticItem } from './statistic-item';

export type Status = 'start' | 'rebalance' | 'rides' | 'next-cycle' | 'finish' | null;

export interface StatusResponse {
  time: number;
  currentStatus: Status;
  nextStatus: Status;
  settings: Settings;
  stations: Station[];
  statistics: StatisticItem[];
}
