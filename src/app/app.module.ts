import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MeteoWidgetComponent } from './components/meteo-widget/meteo-widget.component';
import { TemperaturesPipe } from './pipes/temperatures.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MeteoWidgetComponent,
    TemperaturesPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
