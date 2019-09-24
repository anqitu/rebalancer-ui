import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, ViewContainerRef, ComponentRef, HostListener } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DataService } from '../data.service';
import { Station } from 'src/models/station';
import { MarkerComponent, MarkerProperties } from '../marker/marker.component';
import { faCircle, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Trip } from 'src/models/trip';
import { skip } from 'rxjs/operators';
import { StationService } from '../station.service';
import { Feature } from '@turf/turf';
import * as turf from '@turf/turf';
import * as mapbox from 'mapbox-gl';
import { TRIP_ANIMATION_START_DELAY, TRIP_ANIMATION_FRAMES, TRIP_ANIMATION_FRAME_RATE } from '../constants';
import { TripService } from '../trip.service';

@Component({
  selector: 'rbc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: mapbox.Map;
  stationMarkers: StationMarker[];
  stationsMap: {[stationId in string]: Station};
  tripDrawings: TripDrawing[];

  maxStationCount: number;
  minStationCount: number;

  @ViewChild('map', { read: ViewContainerRef, static: false })
  markersContainer: ViewContainerRef;
  markerComponentFactory: ComponentFactory<MarkerComponent>;

  resizeDebounceTimeout: NodeJS.Timer;
  mapInitialBounds: mapbox.LngLatBounds;

  mapPadding = 100;
  mapZoom = 13;
  mapStyle = 'mapbox://styles/mapbox/light-v10';

  stationIcon = faCircle;
  stationColor = '#2d2d2d';
  stationOpacity = 0.6;
  stationSize = 10;
  stationScales = [25, 5];

  trailColor = '#3A73BD';
  trailWidth = 4;
  trailSourceStationColor = '#7ac13b';
  trailDestinationStationColor = '#f6685c';
  trailStationScales = [30, 30];

  truckIcon = faTruck;
  truckSize = 25;
  truckColor = '#59aaff';
  truckOpacity = 0.75;

  constructor(
    private dataService: DataService,
    private resolver: ComponentFactoryResolver,
    private tripService: TripService,
    private stationService: StationService
  ) {
    (mapbox as any).accessToken = environment.mapboxToken;
    this.markerComponentFactory = this.resolver.resolveComponentFactory(MarkerComponent);

    this.tripService.trips$.subscribe(trips => {
      if (trips && trips.length > 0) {
        this.drawTripDrawings(TRIP_ANIMATION_START_DELAY, trips.map(trip => this.buildTripDrawing(trip)));
      }
    });

    this.stationService.stations$.pipe(skip(1)).subscribe(stations => {

      this.stationsMap = stations.reduce((map, station) => {
        map[station.id] = station;
        return map;
      }, {});
      this.mapInitialBounds = this.buildMapBounds(stations.map(station => station.coordinates));

      if (!this.map) {
        this.map = this.buildMap(this.mapInitialBounds.getCenter());
      }

      this.fitMapToBounds(this.mapInitialBounds);

      this.maxStationCount = stations.reduce((prev, current) => {
        return current.count > prev ? current.count : prev;
      }, 0);

      this.minStationCount = stations.reduce((prev, current) => {
        return current.count < prev ? current.count : prev;
      }, this.maxStationCount);

      if (this.stationMarkers) {
        this.stationMarkers.forEach(stationMarker => {
          stationMarker.component.destroy();
          stationMarker.marker.remove();
        });
      }

      this.stationMarkers = this.drawStationMarkers(stations);
    });
  }

  ngOnInit() {
  }

  private buildMapBounds(coordinates: mapbox.LngLatLike[]) {
    const bounds = new mapbox.LngLatBounds();
    coordinates
      .map(lngLat => mapbox.LngLat.convert(lngLat))
      .forEach(lngLat => bounds.extend(lngLat));
    return bounds;
  }

  private fitMapToBounds(bounds: mapbox.LngLatBounds) {
    this.map.fitBounds(bounds, {
      padding: {top: this.mapPadding, bottom: this.mapPadding, left: 500 + this.mapPadding, right: this.mapPadding}
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.resizeDebounceTimeout) {
      clearTimeout(this.resizeDebounceTimeout);
    }

    this.resizeDebounceTimeout = setTimeout(() => {
      this.fitMapToBounds(this.mapInitialBounds);
    }, 1000);
  }

  private drawStationMarkers(stations: Station[]) {
    const stationMarkers = stations.map(station => this.createStationMarker(station, {
      icon: this.stationIcon,
      size: this.calculateStationSize(this.stationScales[0], this.stationScales[1], station.count),
      color: this.stationColor,
      opacity: this.stationOpacity
    }));
    stationMarkers.forEach(stationMarker => stationMarker.marker.addTo(this.map));
    return stationMarkers;
  }

  private calculateStationSize(a: number, b: number, count: number) {
    return (count - this.minStationCount) * a / (this.maxStationCount - this.minStationCount) + b;
  }

  private buildMap(center: mapbox.LngLat): mapbox.Map {
    return new mapbox.Map({
      container: 'map',
      style: this.mapStyle,
      zoom: this.mapZoom,
      center
    });
  }

  private createMarkerComponent(properties: MarkerProperties): ComponentRef<MarkerComponent> {
    const component: ComponentRef<MarkerComponent> = this.markersContainer.createComponent(this.markerComponentFactory);
    component.instance.properties = properties;
    return component;
  }

  private createMarker(element: HTMLElement, coordinates: mapbox.LngLatLike) {
    return new mapbox.Marker(element).setLngLat(coordinates);
  }

  getStationMarker(stationId: string) {
    return this.stationMarkers.find(stationMarker => stationMarker.stationId === stationId);
  }

  createStationMarker(station: Station, properties: MarkerProperties): StationMarker {

    const component = this.createMarkerComponent(properties);
    const marker = this.createMarker(component.location.nativeElement, station.coordinates);

    return {
      stationId: station.id,
      component,
      marker
    };
  }

  private buildLineStringGeoJSON(coordinates: mapbox.LngLatLike[]) {
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates
      },
      properties: {}
    } as Feature;
  }

  buildTruckComponent(count: number): ComponentRef<MarkerComponent> {
    return this.createMarkerComponent({
      icon: faTruck,
      size: this.truckSize,
      color: this.truckColor,
      opacity: this.truckOpacity,
      label: count + '',
      hidden: true
    });
  }

  drawTruck(truckComponent: ComponentRef<MarkerComponent>, coordinates: mapbox.LngLatLike) {
    const truckMarker = this.createMarker(truckComponent.location.nativeElement, coordinates);
    truckMarker.addTo(this.map);
    return truckMarker;
  }

  private updateStationMarkerProperties(stationId: string, properties: Partial<MarkerProperties>) {
    const sourceStationMarker = this.getStationMarker(stationId);
    const markerComponent: MarkerComponent = sourceStationMarker.component.instance;
    markerComponent.updateProperties(properties);
  }

  // private setStationMarkerCount(stationId: string, newCount: number) {
  //   const sourceStationMarker = this.getStationMarker(stationId);
  //   const markerComponent: MarkerComponent = sourceStationMarker.component.instance;
  //   markerComponent.properties.color = 'red';
  //   markerComponent.properties.size = this.calculateStationSize(newCount);
  //   markerComponent.properties.label = newCount + '';
  // }

  buildTripDrawing(trip: Trip): TripDrawing {
    const source = this.stationsMap[trip.sourceId];
    const destination = this.stationsMap[trip.destinationId];
    const trail = {
      type: 'FeatureCollection',
      features: [this.buildLineStringGeoJSON([source.coordinates])]
    };
    const path = this.buildLineStringGeoJSON([
      source.coordinates,
      destination.coordinates
    ]);
    const distance = turf.lineDistance(path, { units: 'kilometers' });

    const truckComponent = this.buildTruckComponent(trip.count);

    return {
      trip,
      source,
      destination,
      trail,
      path,
      distance,
      truck: {
        marker: this.drawTruck(truckComponent, source.coordinates),
        component: truckComponent.instance
      },
      step: distance / TRIP_ANIMATION_FRAMES
    };
  }

  drawTripDrawings(startDelay: number, drawings: TripDrawing[]) {

    this.stationMarkers.forEach(station => {
      station.component.instance.updateProperties({
        hidden: true
      });
    });

    const tripCoordinates = [];
    drawings.forEach(drawing => {
      this.map.addLayer({
        id: drawing.trip.id,
        type: 'line',
        source: {
          type: 'geojson',
          data: drawing.trail
        },
        paint: {
          'line-color': this.trailColor,
          'line-width': this.trailWidth,
          'line-dasharray': [2, 2]
        }
      });

      // draw source stations
      this.updateStationMarkerProperties(drawing.source.id, {
        color: this.trailSourceStationColor,
        size: this.calculateStationSize(this.trailStationScales[0], this.trailStationScales[1], drawing.source.count),
        label: drawing.source.count + '',
        hidden: false
      });

      // draw destination stations
      this.updateStationMarkerProperties(drawing.destination.id, {
        color: this.trailDestinationStationColor,
        size: this.calculateStationSize(this.trailStationScales[0], this.trailStationScales[1], drawing.destination.count),
        label: drawing.destination.count + '',
        hidden: false
      });

      tripCoordinates.push(drawing.destination.coordinates);
      tripCoordinates.push(drawing.source.coordinates);
    });

    this.fitMapToBounds(this.buildMapBounds(tripCoordinates));

    setTimeout(() => {
      let frame = 1;
      const interval = setInterval(() => {

        if (frame === 1) {
          drawings.forEach(drawing => {
            drawing.truck.component.properties.hidden = false;
            drawing.source.count -= drawing.trip.count;
            this.updateStationMarkerProperties(drawing.source.id, {
              size: this.calculateStationSize(this.trailStationScales[0], this.trailStationScales[1], drawing.source.count),
              label: drawing.source.count + ''
            });
          });
        }

        drawings.forEach(drawing => {
          const nextCoordinates = turf.along(drawing.path, drawing.step * frame, {
            units: 'kilometers'
          }).geometry.coordinates as mapbox.LngLatLike;

          drawing.truck.marker.setLngLat(nextCoordinates);
          drawing.trail.features[0].geometry.coordinates.push(nextCoordinates);

          // update trail
          const trailSource = this.map.getSource(drawing.trip.id) as mapbox.GeoJSONSource;
          trailSource.setData(drawing.path);
        });

        frame += 1;

        if (frame > TRIP_ANIMATION_FRAMES) {
          clearInterval(interval);

          drawings.forEach(drawing => {

            drawing.destination.count += drawing.trip.count;
            this.updateStationMarkerProperties(drawing.destination.id, {
              size: this.calculateStationSize(this.trailStationScales[0], this.trailStationScales[1], drawing.destination.count),
              label: drawing.destination.count + ''
            });

            drawing.truck.marker.remove();
            this.map.removeLayer(drawing.trip.id);
          });
        }
      }, TRIP_ANIMATION_FRAME_RATE);
    }, startDelay);
  }

}

interface TripDrawing {
  trip: Trip;
  source: Station;
  destination: Station;
  path: any;
  trail: any;
  distance: number;
  truck: {
    marker: mapbox.Marker;
    component: MarkerComponent;
  };
  step: number;
}

interface StationMarker {
  stationId: string;
  component: ComponentRef<MarkerComponent>;
  marker: mapbox.Marker;
}
