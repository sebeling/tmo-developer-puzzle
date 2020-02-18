import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { GoogleChartsModule } from 'angular-google-charts';
import { Observable } from 'rxjs';

import { ChartComponent } from './chart.component';
const MOCK_PRICE_QUOTE_RESPONSE = require('../../../../../../stocks/data-access-price-query/src/lib/+state/price.query.mock.json')['price-query'];


describe('ChartComponent', () => {
  let component: ChartComponent;
  let fixture: ComponentFixture<ChartComponent>;

  const MOCK_QUERIES = new Observable<any>( subscriber => {
    subscriber.next(MOCK_PRICE_QUOTE_RESPONSE);
  });

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

  it('should not create any DOM elements when missing chartData', () => {
    component.chartData = null;
    fixture.detectChanges();

    const EXPECTED = 0;
    expect(fixture.debugElement.children.length).toEqual(EXPECTED);
  });

  it('should show no results found h3 element instead of chart element in the DOM when chartData is an empty array', () => {
    component.chartData = [];
    fixture.detectChanges();

    const EXPECTED1 = 'google-chart';
    expect(fixture.debugElement.children[0].name).not.toEqual(EXPECTED1);

    const EXPECTED2 = 'h3';
    expect(fixture.debugElement.children[0].name).toEqual(EXPECTED2);
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

  it('should filter data down to only January 28 2020 when selected dates are both January 28 2020', () => {
    const EXPECTED = "2020-01-28";

    component.toDate = "1/28/2020";
    component.fromDate = "1/28/2020";
    component.filterResults(MOCK_PRICE_QUOTE_RESPONSE);

    expect(component.chartData[0][0]).toEqual(EXPECTED);
  });

  it('should use default chart title when no symbol is defined', () => {
    const EXPECTED = component.defaultChartTitle;
    expect(component.chartTitle).toEqual(EXPECTED);
  });

  it('should include symbol in chart title when symbol has been set', () => {
    const EXPECTED = 'AAPL';

    component.symbol = EXPECTED;

    expect(component.chartTitle).toContain(EXPECTED);
  });
});
