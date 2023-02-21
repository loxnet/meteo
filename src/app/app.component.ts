import { WeatherResponse } from "./models/weather";
import { LocationService } from "./services/location.service";
import { ApiService } from "./services/api.service";
import { Component } from "@angular/core";

import { tap } from "rxjs/operators";
import { Commune } from "./models/commune";
import { DAYS_MAX } from "./constants/weather-params";
import { OneCallResponse } from "./models/weather-onecall";

import { GeolocationPosition } from "./models/geolocation-position";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "meteo";
  city?: Commune;
  cities: Commune[] = [
    { nom: "Paris" } as Commune,
    { nom: "Bordeaux" } as Commune,
    { nom: "Marseilles" } as Commune,
    { nom: "Reims" } as Commune,
    { nom: "Lille" } as Commune
  ];
  oneCall?: OneCallResponse;
  days?: number;
  daysOptions: number[] = [];
  lastCity?: Commune;
  coordinates?: GeolocationPosition;
  weather?: WeatherResponse;
  constructor(private api: ApiService, private location: LocationService) {
    for (let i = 1; i < DAYS_MAX; i++) {
      this.daysOptions.push(i);
    }
    this.location.coordinates.subscribe((coordinates) => {
      if (coordinates) {
        this.coordinates = coordinates;
        const query = `?lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}`;
        this.api
          .getFranceCities(query)
          .pipe(
            tap((cities) => {
              this.cities = this.cities.concat(cities);
              if (cities.length === 1) {
                this.city = cities[0];
                // this.updateCity(cities[0]);
                this.updatePrevision();
              }
            })
          )
          .subscribe();
      }
    });
  }

  updatePrevision() {
    if (this.coordinates && this.coordinates.coords) {
      const query = `?lat=${this.coordinates.coords.latitude}&lon=${this.coordinates.coords.longitude}&lang=fr`;
      this.api.getOneCall(query).subscribe((data: OneCallResponse) => {
        this.oneCall = data;
      });
    }
  }

  updateCity(city: Commune) {
    this.lastCity = city;
    const query = `?q=${city}&lang=fr`;
    this.api.getWeather(query).subscribe((data: WeatherResponse) => {
      this.weather = data;
    });
  }
}
