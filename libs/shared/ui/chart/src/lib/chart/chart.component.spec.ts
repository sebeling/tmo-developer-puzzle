import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { GoogleChartsModule } from 'angular-google-charts';

import { ChartComponent } from './chart.component';
const MOCK_PRICE_QUOTE_REPSONSE = require('../../../../../../stocks/data-access-price-query/src/lib/+state/price.query.mock.json')['price-query'];


describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, GoogleChartsModule.forRoot()],
      declarations: [ ChartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartComponent);
    component = fixture.componentInstance;

    // Set chartData to mock response to ensure chart renders
    component.chartData = MOCK_PRICE_QUOTE_REPSONSE;

    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have chart data starting with the date 2019-12-30', () => {
    const EXPECTED = '2019-12-30';
    expect(component.chartData[0][0]).toEqual(EXPECTED);
  });

  it('should create a google-chart child element in the DOM', () => {
    const EXPECTED = 'google-chart';
    expect(fixture.debugElement.children[0].name).toEqual(EXPECTED);
  });

  it('should not create a google-chart child element in the DOM when missing chartData', () => {
    component.chartData = null;
    fixture.detectChanges();

    const EXPECTED = 0;
    expect(fixture.debugElement.children.length).toEqual(EXPECTED);
  });
});
