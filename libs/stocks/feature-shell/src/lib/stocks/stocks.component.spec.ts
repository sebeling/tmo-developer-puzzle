import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import {
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
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

  it('should call fetchQuery when changes form controls are made', () => {
    // First we need to unsubscribe to avoid using debounce in our test
    component.formValueChangeSubscription.unsubscribe();

    // Next, we resubscribe but omit the debounce value to avoid the 1 sec delay
    component.formValueChangeSubscription = component.stockPickerForm.valueChanges
    .subscribe(params => component.fetchQuote(params));

    // Set up Spy on fetchQuote
    const priceFacade = fixture.debugElement.injector.get(PriceQueryFacade);
    const fetchQuoteSpy = jest.spyOn(priceFacade, 'fetchQuote');

    // Set a value for the symbol input field
    const SYMBOL: AbstractControl = component.stockPickerForm.get('symbol');
    SYMBOL.patchValue('AAPL');

    // Set value for the peroid input field
    const PERIOD: AbstractControl = component.stockPickerForm.get('period');
    PERIOD.patchValue('5y');

    expect(fetchQuoteSpy).toHaveBeenCalled();
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

  it('should display a validation error when the time period select list is touched but no option is selected', () => {
    const EXPECTED = component.periodContent.invalidErrMsg;

    // Touch select list and give it an empty value
    const PERIOD: AbstractControl = component.stockPickerForm.get('period');
    PERIOD.markAsTouched();
    PERIOD.patchValue('');

    // DOM should now include the validation error
    fixture.detectChanges();

    const ERROR: HTMLElement = fixture.debugElement.queryAll(By.css('.mat-error'))[0].nativeElement;
    const ERR_MSG: Element = ERROR.children[0];

    expect(ERR_MSG.textContent).toEqual(EXPECTED);
  });
});
