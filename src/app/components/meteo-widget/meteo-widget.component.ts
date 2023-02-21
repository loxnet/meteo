import { Daily, Temp } from "./../../models/weather-onecall";
import { Component, ElementRef, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { WeatherResponse } from "src/app/models/weather";

@Component({
  selector: "app-meteo-widget",
  templateUrl: "./meteo-widget.component.html",
  styleUrls: ["./meteo-widget.component.scss"]
})
export class MeteoWidgetComponent implements OnInit {
  @Input() daily?: Daily;
  private _weater: WeatherResponse;
  @Input()
  get weather(): WeatherResponse {
    return this._weater;
  }
  set weather(value: WeatherResponse) {
    this._weater = value;
    this.daily = this.mapToDaily(value);
  }

  mapToDaily(weather?: WeatherResponse): Daily {
    let daily = null;
    console.log(weather);
    if (weather) {
      daily = {
        dt: weather.dt,
        weather: weather.weather,
        temp: { day: weather.main.temp } as Temp,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        windspeed: weather.wind.speed
      };
    }
    return daily;
  }

  constructor(
    private el: ElementRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.daily) {
    }
  }
}
