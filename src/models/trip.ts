import { Station } from './station';

export interface Trip {
    id: string;
    progress: number;
    time: number;
    count: number;
    source: {
        station: Station;
        oldCount: number;
        newCount: number;
    };
    destination: {
        station: Station;
        oldCount: number;
        newCount: number;
    };
}
