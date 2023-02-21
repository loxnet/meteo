import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  coordinates = new Subject<GeolocationPosition>();
  updateCoord(): void {
    navigator.geolocation.getCurrentPosition( async (coord) => {
      this.coordinates.next(coord);

    }, (error) => {

    });
  }
  constructor() {
    this.updateCoord();
  }
}
