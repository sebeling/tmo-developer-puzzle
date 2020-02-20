import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit, OnDestroy {
  stockPickerForm: FormGroup;
  symbol: string;
  period: string;

  formValueChangeSubscription: Subscription;

  // Move hard coded symbol content out of template for testing convenience.
  // Could also potentially come from a content service in the furture.
  symbolContent = {
    placeholder: 'Symbol e.g AAPL',
    invalidErrMsg: 'Please enter a symbol'
  };

  // Move hard coded time period content out of template for testing convenience.
  // Could also potentially come from a content service in the furture.
  periodContent = {
    label: 'Favorite time period',
    invalidErrMsg: 'Please choose a time period'
  }

  quotes$ = this.priceQuery.priceQueries$;

  timePeriods = [
    { viewValue: 'All available data', value: 'max' },
    { viewValue: 'Five years', value: '5y' },
    { viewValue: 'Two years', value: '2y' },
    { viewValue: 'One year', value: '1y' },
    { viewValue: 'Year-to-date', value: 'ytd' },
    { viewValue: 'Six months', value: '6m' },
    { viewValue: 'Three months', value: '3m' },
    { viewValue: 'One month', value: '1m' }
  ];

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required]
    });
  }

  ngOnInit() {
    // Use form's valueChanges Observable to detect changes to the form
    this.formValueChangeSubscription = this.stockPickerForm.valueChanges.pipe(
      debounceTime(1000) // Wait 1 sec between changes to emit form values
    )
    .subscribe(params => this.fetchQuote(params));
  }

  ngOnDestroy() {
    if (this.formValueChangeSubscription) {
      this.formValueChangeSubscription.unsubscribe();
    }
  }

  fetchQuote(formVals: { symbol: string, period: string }) {
    if (this.stockPickerForm.valid) {
      this.priceQuery.fetchQuote(formVals.symbol, formVals.period);
    }
  }

  // Moved symbol field validation out of template to keep template lightweight
  isInvalidSymbol(): boolean {
    const SYMBOL = this.stockPickerForm.get('symbol');
    return !SYMBOL.valid && SYMBOL.touched;
  }

  // Added required validation function for time period select list
  isInvalidTimePeriod(): boolean {
    const PERIOD = this.stockPickerForm.get('period');
    return !PERIOD.valid && PERIOD.touched;
  }
}
