import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { GoogleChartsModule } from 'angular-google-charts';

import { ChartComponent } from './chart.component';
const MOCK_PRICE_QUOTE_RESPONSE = require('../../../../../../stocks/data-access-price-query/src/lib/+state/price.query.mock.json')['price-query'];


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
    component.chartData = MOCK_PRICE_QUOTE_RESPONSE;

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

  it('should return a date object for January 1 2020 when given the string 1/1/2020', () => {
    const EXPECTED_YEAR = 2020;
    const EXPECTED_MONTH = 0;
    const EXPECTED_DATE = 1;

    const DATE = component.getDate('1/1/2020');
     
    expect(DATE.getFullYear()).toEqual(EXPECTED_YEAR);
    expect(DATE.getMonth()).toEqual(EXPECTED_MONTH);
    expect(DATE.getDate()).toEqual(EXPECTED_DATE);
  });

  it('should return a date object for January 1 2020 when given the string 2020-01-01', () => {
    const EXPECTED_YEAR = 2020;
    const EXPECTED_MONTH = 0;
    const EXPECTED_DATE = 1;

    const DATE = component.getDateFromChartData('2020-01-01');
     
    expect(DATE.getFullYear()).toEqual(EXPECTED_YEAR);
    expect(DATE.getMonth()).toEqual(EXPECTED_MONTH);
    expect(DATE.getDate()).toEqual(EXPECTED_DATE);
  });
});
