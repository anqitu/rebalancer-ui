import { Component, OnInit, ComponentFactoryResolver, ComponentFactory, ViewChild, ViewContainerRef, ComponentRef, HostListener } from '@angular/core';
import * as mapbox from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { DataService } from '../data.service';
import { Station } from 'src/models/station';
import { MarkerComponent, MarkerProperties } from '../marker/marker.component';
import * as turf from '@turf/turf';
import { faAngleUp, faCircle, faTruck } from '@fortawesome/free-solid-svg-icons';
import { Trip } from 'src/models/trip';
import { TripService } from '../trip.service';

@Component({
  selector: 'rbc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: mapbox.Map;
  stationMarkers: StationMarker[];

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
  stationColor = '#76DFFF';
  stationOpacity = 0.6;

  trailAnimationFrames = 50;
  trailAnimationFrameRate = 30;
  trailColor = '#3A73BD';
  trailWidth = 4;

  truckIcon = faTruck;
  truckSize = 40;
  truckColor = '#3A73BD';
  truckOpacity = 0.9;

  constructor(
    private dataService: DataService,
    private resolver: ComponentFactoryResolver,
    private tripService: TripService
  ) {
    (mapbox as any).accessToken = environment.mapboxToken;
    this.markerComponentFactory = this.resolver.resolveComponentFactory(MarkerComponent);
  }

  ngOnInit() {
    this.dataService.getStations().then(stations => {
      this.mapInitialBounds = this.buildMapBounds(stations.map(station => station.coordinates));
      this.map = this.buildMap(this.mapInitialBounds.getCenter());
      this.fitMapToBounds(this.mapInitialBounds);

      this.maxStationCount = stations.reduce((prev, current) => {
        return current.count > prev ? current.count : prev;
      }, 0);

      this.minStationCount = stations.reduce((prev, current) => {
        return current.count < prev ? current.count : prev;
      }, this.maxStationCount);

      this.stationMarkers = this.drawStationMarkers(stations);

      this.map.on('load', () => {
        setInterval(() => {
          const source = this.getRandomStation(stations);
          const destination = this.getRandomStation(stations);
          const trip = this.tripService.createTrip(source, destination, Math.floor(source.count * 0.25));
          this.drawTrip(trip);
        }, 1000);
      });
    });
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

  private getRandomStation(stations: Station[]) {
    return stations[Math.floor(Math.random() * stations.length)];

  }

  private drawStationMarkers(stations: Station[]) {
    const stationMarkers = stations.map(station => this.createStationMarker(station, {
      icon: this.stationIcon,
      size: this.calculateStationSize(station.count),
      color: this.stationColor,
      opacity: this.stationOpacity,
      label: station.count + ''
    }));
    stationMarkers.forEach(stationMarker => stationMarker.marker.addTo(this.map));
    return stationMarkers;
  }

  private calculateStationSize(count: number) {
    return (count - this.minStationCount) * 30 / (this.maxStationCount - this.minStationCount) + 40;
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
    };
  }

  drawTruck(coordinates: mapbox.LngLatLike, count: number) {
    const truckComponent = this.createMarkerComponent({
      icon: faTruck,
      size: this.truckSize,
      color: this.truckColor,
      opacity: this.truckOpacity,
      label: count + ''
    });

    const truckMarker = this.createMarker(truckComponent.location.nativeElement, coordinates);
    truckMarker.addTo(this.map);
    return truckMarker;
  }

  private setStationMarkerCount(stationId: string, newCount: number) {
    const sourceStationMarker = this.getStationMarker(stationId);
    sourceStationMarker.component.instance.properties.size = this.calculateStationSize(newCount);
    sourceStationMarker.component.instance.properties.label = newCount + '';
  }

  drawTrip(trip: Trip) {
    const path: any = this.buildLineStringGeoJSON([
      trip.source.station.coordinates,
      trip.destination.station.coordinates
    ]);

    const trail: any = {
      type: 'FeatureCollection',
      features: [this.buildLineStringGeoJSON([trip.source.station.coordinates])]
    };

    this.map.addLayer({
      id: trip.id,
      type: 'line',
      source: {
        type: 'geojson',
        data: trail
      },
      paint: {
        'line-color': this.trailColor,
        'line-width': this.trailWidth,
        'line-dasharray': [2, 2]
      }
    });

    const distance = turf.lineDistance(path, { units: 'kilometers' });
    const truckMarker = this.drawTruck(trip.source.station.coordinates, trip.count);
    const step = distance / this.trailAnimationFrames;

    let frame = 1;
    const interval = setInterval(() => {

      if (frame === 2) {
        this.setStationMarkerCount(trip.source.station.id, trip.source.newCount);
      }

      const nextCoordinates = turf.along(path, step * frame, {
        units: 'kilometers'
      }).geometry.coordinates as mapbox.LngLatLike;

      truckMarker.setLngLat(nextCoordinates);
      trail.features[0].geometry.coordinates.push(nextCoordinates);

      // update trail
      const trailSource = this.map.getSource(trip.id) as mapbox.GeoJSONSource;
      trailSource.setData(path);

      frame += 1;

      if (frame > this.trailAnimationFrames) {
        clearInterval(interval);
        this.setStationMarkerCount(trip.destination.station.id, trip.destination.newCount);
        truckMarker.remove();

        this.map.removeLayer(trip.id);
      }
    }, this.trailAnimationFrameRate);
  }

}

interface StationMarker {
  stationId: string;
  component: ComponentRef<MarkerComponent>;
  marker: mapbox.Marker;
}
