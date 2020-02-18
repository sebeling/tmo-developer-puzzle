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
  
  // Move hard coded symbol content out of template for testing convenience.
  // Could also potentially come from a content service in the furture.
  symbolContent = {
    placeholder: 'Symbol e.g AAPL',
    invalidErrMsg: 'Please enter a symbol'
  };

  // Move hard coded time period content out of template for testing convenience.
  // Could also potentially come from a content service in the furture.
  datePickerContent = {
    from: {
      placeholder: 'From date',
      requiredErrorMsg: 'Please choose a start date'
    },
    to: {
      placeholder: 'To date',
      requiredErrorMsg: 'Please choose an end date'
    }
  }

  quotes$ = this.priceQuery.priceQueries$;
  
  maxDate: Date;


  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    // Set maxDate to today, which will be used hiding all dates after today in the datepickers.
    this.maxDate = this.setTimeToMidnight(new Date());

    // Create form group
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required]
    });
  }

  // Moved calls to fetchQuote into event hanlders on the FormConrols for
  // more control over when validation fires and stock price requests are made.
  // This also fixes our memory leak issue with not unsubscribing from 
  // the this.stockPickerForm.valueChanges Observable.
  ngOnInit() {}

  fetchQuote() {
    // Adjust date range if invalid range is selected
    // Example: select 'to' date comes before the selected 'from' date
    this.correctInvalidDateRanges();

    if (this.stockPickerForm.valid) {
      const SYMBOL = this.stockPickerForm.get('symbol').value;

      // We no longer need to pass the period as a second
      // param because the new HAPI API will always
      // request the max results so we can cache it and
      // allow the chart to filter out the dates selected
      // by the user.
      this.priceQuery.fetchQuote(SYMBOL);
      this.symbol = SYMBOL;
    }
  }

  // Moved symbol field validation out of template to keep template lightweight
  isInvalidSymbol(): boolean {
    const SYMBOL = this.stockPickerForm.get('symbol');
    return !SYMBOL.valid && SYMBOL.touched;
  }

  // Added required validation function for from date
  isInvalidFromDate(): boolean {
    const FROM_DATE = this.stockPickerForm.get('fromDate');
    return !FROM_DATE.valid && FROM_DATE.touched;
  }

  // Added required validation function for to date
  isInvalidToDate(): boolean {
    const TO_DATE = this.stockPickerForm.get('toDate');
    return !TO_DATE.valid && TO_DATE.touched;
  }

  setTimeToMidnight(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  correctInvalidDateRanges() {
    const FROM_DATE = this.stockPickerForm.get('fromDate');
    const TO_DATE = this.stockPickerForm.get('toDate');

    // Set 'to' date to 'from' date if it's a day that comes before the 'from' date
    if (FROM_DATE.value && TO_DATE.value && TO_DATE.value < FROM_DATE.value) {
      TO_DATE.patchValue(FROM_DATE.value);
    }
  }
}
