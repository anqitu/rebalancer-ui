import { Component, OnInit, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'rbc-marker',
  templateUrl: './marker.component.html',
  styleUrls: ['./marker.component.scss']
})
export class MarkerComponent implements OnInit {

  @Input()
  properties: MarkerProperties;

  constructor() { }

  ngOnInit() {
  }

}

export interface MarkerProperties {
  icon: IconDefinition;
  size?: number;
  color?: string;
  label?: string;
  opacity?: number;
}
