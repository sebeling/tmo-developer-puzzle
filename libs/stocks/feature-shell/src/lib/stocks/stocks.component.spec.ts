import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule
} from '@angular/material';
import { SharedUiChartModule } from '@coding-challenge/shared/ui/chart';
import { ReactiveFormsModule } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { StoreModule } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs';
import { AbstractControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { StocksComponent } from './stocks.component';
const MOCK_PRICE_QUOTE_RESPONSE = require('../../../../data-access-price-query/src/lib/+state/price.query.mock.json')['price-query'];

describe('StocksComponent', () => {
  let component: StocksComponent;
  let fixture: ComponentFixture<StocksComponent>;
  let fetchQueryStatus: string;

  // Create new observable to provide mock data response 
  const MOCK_QUERIES = new Observable<any>( subscriber => {
    subscriber.next(MOCK_PRICE_QUOTE_RESPONSE);
  });

  // Create mock price query facade to avoid involving the store in our test
  class MockPriceQuery {
    selectedSymbol$ = '';
    priceQueries$ = [];
    fetchQuote() {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                MatDatepickerModule,
                MatNativeDateModule,
                SharedUiChartModule,
                StoreModule,
                NoopAnimationsModule],
      declarations: [ StocksComponent ],
      providers: [{ provide: PriceQueryFacade, useClass: MockPriceQuery }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StocksComponent);
    component = fixture.componentInstance;

    // Set quotes observable on the component to use our mock version
    // so the chart is created using our mock data.
    component.quotes$ = MOCK_QUERIES;

    // Reset status
    fetchQueryStatus = '';

    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a child form element', () => {
    const EXPECTED = 'form';
    expect(fixture.debugElement.children[0].name).toEqual(EXPECTED);
  });

  it('should call fetchQuery when symbol input field loses focus', () => {
    const EXPECTED = 'fetchQuery called on blur';

    // Override fetchQuote function so we have a way to validate that the
    // blur event is calling the fetchQuote funciton when triggered
    component.fetchQuote = function() {
      fetchQueryStatus = EXPECTED;
    };

    // Set a value for the symbol input field
    const SYMBOL: AbstractControl = component.stockPickerForm.get('symbol');
    SYMBOL.patchValue('AAPL');
    
    // Give symbol input field focus, then take it away to trigger the blur event
    const INPUT: HTMLInputElement = fixture.debugElement.queryAll(By.css('.mat-input-element'))[0].nativeElement;
    INPUT.focus();
    INPUT.blur();

    expect(fetchQueryStatus).toEqual(EXPECTED);
  });

  it('should call fetchQuery when selecting a from date from the datepicker', () => {
    const EXPECTED = 'fetchQuery called on dateChange';

    // Override fetchQuote function so we have a way to validate that the
    // selectionChange event is calling the fetchQuote funciton when triggered
    component.fetchQuote = function() {
      fetchQueryStatus = EXPECTED;
    };

    // Click toggle button element to open the datepicker
    const BUTTON: HTMLButtonElement = fixture.debugElement.queryAll(By.css('.mat-icon-button'))[0].nativeElement;
    BUTTON.click();

    // DOM should now include the options panel
    fixture.detectChanges();

    // Select the active date in the datepicker to trigger dateChange event
    const DATE = fixture.debugElement.queryAll(By.css('.mat-calendar-body-active'))[0].nativeElement;
    DATE.click();

    expect(fetchQueryStatus).toEqual(EXPECTED);
  });

  it('should call fetchQuery when selecting a to date from the datepicker', () => {
    const EXPECTED = 'fetchQuery called on dateChange';

    // Override fetchQuote function so we have a way to validate that the
    // selectionChange event is calling the fetchQuote funciton when triggered
    component.fetchQuote = function() {
      fetchQueryStatus = EXPECTED;
    };

    // Click toggle button element to open the datepicker
    const BUTTON: HTMLButtonElement = fixture.debugElement.queryAll(By.css('.mat-icon-button'))[1].nativeElement;
    BUTTON.click();

    // DOM should now include the options panel
    fixture.detectChanges();

    // Select the active date in the datepicker to trigger dateChange event
    const DATE = fixture.debugElement.queryAll(By.css('.mat-calendar-body-active'))[0].nativeElement;
    DATE.click();

    expect(fetchQueryStatus).toEqual(EXPECTED);
  });

  it('should display a validation error when the symbol field is touched but has no value on blur', () => {
    const EXPECTED = component.symbolContent.invalidErrMsg;

    // Touch symbol input field and give it an empty value
    const SYMBOL: AbstractControl = component.stockPickerForm.get('symbol');
    SYMBOL.markAsTouched();
    SYMBOL.patchValue('');

    // DOM should now include the validation error
    fixture.detectChanges();

    const ERROR: HTMLElement = fixture.debugElement.queryAll(By.css('.mat-error'))[0].nativeElement;
    const ERR_MSG: Element = ERROR.children[0];

    expect(ERR_MSG.textContent).toEqual(EXPECTED);
  });

  it('should display a validation error when from date input is touched but no date is selected', () => {
    const EXPECTED = component.datePickerContent.from.requiredErrorMsg;

    // Touch select list and give it an empty value
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue('');

    // DOM should now include the validation error
    fixture.detectChanges();

    const ERROR: HTMLElement = fixture.debugElement.queryAll(By.css('.mat-error'))[0].nativeElement;
    const ERR_MSG: Element = ERROR.children[0];

    expect(ERR_MSG.textContent).toEqual(EXPECTED);
  });

  it('should display a validation error when to date input is touched but no date is selected', () => {
    const EXPECTED = component.datePickerContent.to.requiredErrorMsg;

    // Touch select list and give it an empty value
    const TO_DATE: AbstractControl = component.stockPickerForm.get('toDate');
    TO_DATE.markAsTouched();
    TO_DATE.patchValue('');

    // DOM should now include the validation error
    fixture.detectChanges();

    const ERROR: HTMLElement = fixture.debugElement.queryAll(By.css('.mat-error'))[0].nativeElement;
    const ERR_MSG: Element = ERROR.children[0];

    expect(ERR_MSG.textContent).toEqual(EXPECTED);
  });

  it('should set the dates to the same date if the to date comes before the from date', () => {
    const EXPECTED = new Date(2020, 1, 1);
    
    const OLDER_DATE = new Date(2019, 11, 31);
    const NEWER_DATE = EXPECTED;

    // Set from date to the most recent date
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(NEWER_DATE);

    // Set the to date to a date that was before the from date
    const TO_DATE: AbstractControl = component.stockPickerForm.get('toDate');
    TO_DATE.markAsTouched();
    TO_DATE.patchValue(OLDER_DATE);

    // Give symbol input field focus, then take it away to trigger the blur event and calls fetchQuery
    const INPUT: HTMLInputElement = fixture.debugElement.queryAll(By.css('.mat-input-element'))[0].nativeElement;
    INPUT.focus();
    INPUT.blur();

    // DOM should now include the validation error
    fixture.detectChanges();

    expect(TO_DATE.value).toEqual(EXPECTED);
  });

  it('should set the hours, minutes, seconds, and milliseconds of a Date object to 0', () => {
    const EXPECTED = 0;

    const NEW_DATE = component.setTimeToMidnight(new Date());

    expect(NEW_DATE.getHours()).toEqual(EXPECTED);
    expect(NEW_DATE.getMinutes()).toEqual(EXPECTED);
    expect(NEW_DATE.getSeconds()).toEqual(EXPECTED);
    expect(NEW_DATE.getMilliseconds()).toEqual(EXPECTED);
  });

  it('should return a date with a year of 2015', () => {
    const OFFSET = 5;
    const DATE = new Date();
    const EXPECTED = DATE.getFullYear() - OFFSET;
    
    const NEW_DATE = component.getDateWithYearOffset(OFFSET);

    expect(NEW_DATE.getFullYear()).toEqual(EXPECTED);
  });

  it('should return a date 6 months before today', () => {
    const OFFSET = 6;
    const DATE = new Date();
    DATE.setMonth(DATE.getMonth() - OFFSET);

    const EXPECTED = DATE.getMonth();
    const NEW_DATE = component.getDateWithMonthOffset(OFFSET);

    expect(NEW_DATE.getMonth()).toEqual(EXPECTED);
  });

  it('should return max as the time period when selected date is over 5 years from today', () => {
    const EXPECTED = 'max';
    const TODAY = component.setTimeToMidnight(new Date());
    const DATE = new Date(TODAY.getFullYear() - 5, TODAY.getMonth(), TODAY.getDate() - 1);

    // Set from date to 5 years and a day ago from today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(DATE);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });

  it('should return 5y as the time period when selected date is over 2 years from today', () => {
    const EXPECTED = '5y';
    const TODAY = component.setTimeToMidnight(new Date());
    const DATE = new Date(TODAY.getFullYear() - 2, TODAY.getMonth(), TODAY.getDate() - 1);

    // Set from date to 2 years and a day ago from today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(DATE);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });

  it('should return 2y as the time period when selected date is over 1 year from today', () => {
    const EXPECTED = '2y';
    const TODAY = component.setTimeToMidnight(new Date());
    const DATE = new Date(TODAY.getFullYear() - 1, TODAY.getMonth(), TODAY.getDate() - 1);

    // Set from date to a year and a day ago from today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(DATE);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });

  it('should return 1y as the time period when selected date is over 6 months from today', () => {
    const EXPECTED = '1y';
    const TODAY = component.setTimeToMidnight(new Date());
    const DATE = new Date(TODAY.getFullYear(), TODAY.getMonth() - 6, TODAY.getDate() - 1);

    // Set from date to 6 months and a day ago from today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(DATE);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });

  it('should return 6m as the time period when selected date is over 3 months from today', () => {
    const EXPECTED = '6m';
    const TODAY = component.setTimeToMidnight(new Date());
    const DATE = new Date(TODAY.getFullYear(), TODAY.getMonth() - 3, TODAY.getDate() - 1);

    // Set from date to 3 months and a day ago from today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(DATE);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });

  it('should return 3m as the time period when selected date is over 1 month from today', () => {
    const EXPECTED = '3m';
    const TODAY = component.setTimeToMidnight(new Date());
    const DATE = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, TODAY.getDate() - 1);

    // Set from date to month and day ago from today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(DATE);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });

  it('should return 1m as the time period when selected date is today', () => {
    const EXPECTED = '1m';
    const TODAY = component.setTimeToMidnight(new Date());

    // Set from date to today
    const FROM_DATE: AbstractControl = component.stockPickerForm.get('fromDate');
    FROM_DATE.markAsTouched();
    FROM_DATE.patchValue(TODAY);

    expect(component.getTimePeriodByDateRange()).toEqual(EXPECTED);
  });
});
