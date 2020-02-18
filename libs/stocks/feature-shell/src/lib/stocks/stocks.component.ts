import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  symbol: string;
  period: string;

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

  // Moved calls to fetchQuote into event hanlders on the FormConrols for
  // more control over when validation fires and stock price requests are made.
  // This also fixes our memory leak issue with not unsubscribing from 
  // the this.stockPickerForm.valueChanges Observable.
  ngOnInit() {}

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const { symbol, period } = this.stockPickerForm.value;
      this.priceQuery.fetchQuote(symbol, period);
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
