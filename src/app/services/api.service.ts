import { Commune } from "./../models/commune";
import { WeatherResponse } from "./../models/weather";
import { environment } from "./../../environments/environment";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  getWeather(query: string): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(
      `${environment.apiWeather.url}/weather${query}&appId=${environment.apiWeather.key}`
    );
  }

  getOneCall(query: string): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(
      `${environment.apiWeather.url}/onecall${query}&eclude=hourly,daily&appId=${environment.apiWeather.key}`
    );
  }

  getFranceCities(query?: string): Observable<Commune[]> {
    return this.http.get<Commune[]>(
      `${environment.apiCities.url}${query ? query : ""}`
    );
  }

  constructor(private http: HttpClient) {}
}
