import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteoWidgetComponent } from './meteo-widget.component';

describe('MeteoWidgetComponent', () => {
  let component: MeteoWidgetComponent;
  let fixture: ComponentFixture<MeteoWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeteoWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteoWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
