import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "temperatures"
})
export class TemperaturesPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): number {
    if (args && args.length > 0) {
      switch (args[0]) {
        case "celcius":
          value = value - 273.15;
      }
    }
    return Math.round(value);
  }
}
