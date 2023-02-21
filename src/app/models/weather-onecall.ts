// To parse this data:
//
//   import { Convert, Welcome } from "./file";
//
//   const welcome = Convert.toWelcome(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface OneCallResponse {
  lat:             number;
  lon:             number;
  timezone:        string;
  timezoneoffset: number;
  current:         Current;
  minutely:        Minutely[];
  hourly:          Current[];
  daily:           Daily[];
}

export interface Current {
  dt:         number;
  sunrise?:   number;
  sunset?:    number;
  temp:       number;
  feelslike: number;
  pressure:   number;
  humidity:   number;
  dewpoint:  number;
  uvi:        number;
  clouds:     number;
  visibility: number;
  windspeed: number;
  winddeg:   number;
  windgust:  number;
  weather:    Weather[];
  pop?:       number;
  rain?:      Rain;
}

export interface Rain {
  "1h": number;
}

export interface Weather {
  id:          number;
  main:        Main;
  description: string;
  icon:        string;
}

export enum Main {
  Clear = "Clear",
  Clouds = "Clouds",
  Rain = "Rain",
}

export interface Daily {
  dt:         number;
  sunrise:    number;
  sunset:     number;
  moonrise:   number;
  moonset:    number;
  moonphase: number;
  temp:       Temp;
  feelslike: FeelsLike;
  pressure:   number;
  humidity:   number;
  dewpoint:  number;
  windspeed: number;
  winddeg:   number;
  windgust:  number;
  weather:    Weather[];
  clouds:     number;
  pop:        number;
  uvi:        number;
  rain?:      number;
}

export interface FeelsLike {
  day:   number;
  night: number;
  eve:   number;
  morn:  number;
}

export interface Temp {
  day:   number;
  min:   number;
  max:   number;
  night: number;
  eve:   number;
  morn:  number;
}

export interface Minutely {
  dt:            number;
  precipitation: number;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toWelcome(json: string): OneCallResponse {
      return cast(JSON.parse(json), r("Welcome"));
  }

  public static welcomeToJson(value: OneCallResponse): string {
      return JSON.stringify(uncast(value, r("Welcome")), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
  if (key) {
      throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
      typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
      typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
          const typ = typs[i];
          try {
              return transform(val, typ, getProps);
          } catch (_) {}
      }
      return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val)) return invalidValue("array", val);
      return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
      if (val === null) {
          return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
          return invalidValue("Date", val);
      }
      return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
          return invalidValue("object", val);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach(key => {
          const prop = props[key];
          const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
          result[prop.key] = transform(v, prop.typ, getProps, prop.key);
      });
      Object.getOwnPropertyNames(val).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(props, key)) {
              result[key] = transform(val[key], additional, getProps, key);
          }
      });
      return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
      typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
          : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
          : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  "Welcome": o([
      { json: "lat", js: "lat", typ: 3.14 },
      { json: "lon", js: "lon", typ: 3.14 },
      { json: "timezone", js: "timezone", typ: "" },
      { json: "timezoneoffset", js: "timezoneoffset", typ: 0 },
      { json: "current", js: "current", typ: r("Current") },
      { json: "minutely", js: "minutely", typ: a(r("Minutely")) },
      { json: "hourly", js: "hourly", typ: a(r("Current")) },
      { json: "daily", js: "daily", typ: a(r("Daily")) },
  ], false),
  "Current": o([
      { json: "dt", js: "dt", typ: 0 },
      { json: "sunrise", js: "sunrise", typ: u(undefined, 0) },
      { json: "sunset", js: "sunset", typ: u(undefined, 0) },
      { json: "temp", js: "temp", typ: 3.14 },
      { json: "feelslike", js: "feelslike", typ: 3.14 },
      { json: "pressure", js: "pressure", typ: 0 },
      { json: "humidity", js: "humidity", typ: 0 },
      { json: "dewpoint", js: "dewpoint", typ: 3.14 },
      { json: "uvi", js: "uvi", typ: 3.14 },
      { json: "clouds", js: "clouds", typ: 0 },
      { json: "visibility", js: "visibility", typ: 0 },
      { json: "windspeed", js: "windspeed", typ: 3.14 },
      { json: "winddeg", js: "winddeg", typ: 0 },
      { json: "windgust", js: "windgust", typ: 3.14 },
      { json: "weather", js: "weather", typ: a(r("Weather")) },
      { json: "pop", js: "pop", typ: u(undefined, 3.14) },
      { json: "rain", js: "rain", typ: u(undefined, r("Rain")) },
  ], false),
  "Rain": o([
      { json: "1h", js: "1h", typ: 3.14 },
  ], false),
  "Weather": o([
      { json: "id", js: "id", typ: 0 },
      { json: "main", js: "main", typ: r("Main") },
      { json: "description", js: "description", typ: "" },
      { json: "icon", js: "icon", typ: "" },
  ], false),
  "Daily": o([
      { json: "dt", js: "dt", typ: 0 },
      { json: "sunrise", js: "sunrise", typ: 0 },
      { json: "sunset", js: "sunset", typ: 0 },
      { json: "moonrise", js: "moonrise", typ: 0 },
      { json: "moonset", js: "moonset", typ: 0 },
      { json: "moonphase", js: "moonphase", typ: 3.14 },
      { json: "temp", js: "temp", typ: r("Temp") },
      { json: "feelslike", js: "feelslike", typ: r("FeelsLike") },
      { json: "pressure", js: "pressure", typ: 0 },
      { json: "humidity", js: "humidity", typ: 0 },
      { json: "dewpoint", js: "dewpoint", typ: 3.14 },
      { json: "windspeed", js: "windspeed", typ: 3.14 },
      { json: "winddeg", js: "winddeg", typ: 0 },
      { json: "windgust", js: "windgust", typ: 3.14 },
      { json: "weather", js: "weather", typ: a(r("Weather")) },
      { json: "clouds", js: "clouds", typ: 0 },
      { json: "pop", js: "pop", typ: 3.14 },
      { json: "uvi", js: "uvi", typ: 3.14 },
      { json: "rain", js: "rain", typ: u(undefined, 3.14) },
  ], false),
  "FeelsLike": o([
      { json: "day", js: "day", typ: 3.14 },
      { json: "night", js: "night", typ: 3.14 },
      { json: "eve", js: "eve", typ: 3.14 },
      { json: "morn", js: "morn", typ: 3.14 },
  ], false),
  "Temp": o([
      { json: "day", js: "day", typ: 3.14 },
      { json: "min", js: "min", typ: 3.14 },
      { json: "max", js: "max", typ: 3.14 },
      { json: "night", js: "night", typ: 3.14 },
      { json: "eve", js: "eve", typ: 3.14 },
      { json: "morn", js: "morn", typ: 3.14 },
  ], false),
  "Minutely": o([
      { json: "dt", js: "dt", typ: 0 },
      { json: "precipitation", js: "precipitation", typ: 0 },
  ], false),
  "Main": [
      "Clear",
      "Clouds",
      "Rain",
  ],
};
