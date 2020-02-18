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

  maxDate: Date;
  fiveYearsAgo: Date;
  twoYearsAgo: Date;
  oneYearAgo: Date;
  sixMonthsAgo: Date;
  threeMonthsAgo: Date;
  oneMonthAgo: Date;


  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    // Set maxDate to today, which will be used hiding all dates after today in the datepickers.
    this.maxDate = this.setTimeToMidnight(new Date());

    // Set variables for each time period that can be passed into the priceQuery API
    this.fiveYearsAgo = this.getDateWithYearOffset(5);    // Set date for five years before today
    this.twoYearsAgo = this.getDateWithYearOffset(2);     // Set date for two years before today
    this.oneYearAgo = this.getDateWithYearOffset(1);      // Set date for one year before today
    this.sixMonthsAgo = this.getDateWithMonthOffset(6);   // Set date for 6 months before today
    this.threeMonthsAgo = this.getDateWithMonthOffset(3); // Set date for 3 months before today
    this.oneMonthAgo = this.getDateWithMonthOffset(1);    // Set date for 1 month before today

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
      const PERIOD = this.getTimePeriodByDateRange();
      const SYMBOL = this.stockPickerForm.get('symbol').value;
      this.priceQuery.fetchQuote(SYMBOL, PERIOD);
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

  getTimePeriodByDateRange(): string {
    let outPeriod = null;
    
    // Get selected to date from and datepicker control
    const FROM_DATE = this.stockPickerForm.get('fromDate').value;

    if (FROM_DATE instanceof Date) {
      // First, determine the date range of data we need to request. The 
      // priceQuery API assumes we are requesting data from today's date, 
      // so we need to use today's date as the 'from' value and filter down 
      // the returned data to only include the selected dates.

      // NOTE: The year-to-date scenario is covered with the logic below
      // as the correct results would be returned if the user selected
      // today's date and January 1st of this year.

      if(FROM_DATE < this.fiveYearsAgo) {
        outPeriod = this.timePeriods[0].value; // max
      } else if (FROM_DATE < this.twoYearsAgo) {
        outPeriod = this.timePeriods[1].value; // 5y
      } else if (FROM_DATE < this.oneYearAgo) {
        outPeriod = this.timePeriods[2].value; // 2y
      } else if (FROM_DATE < this.sixMonthsAgo) {
        outPeriod = this.timePeriods[3].value; // 1y
      } else if (FROM_DATE < this.threeMonthsAgo) {
        outPeriod = this.timePeriods[5].value; // 6m
      } else if (FROM_DATE < this.oneMonthAgo) {
        outPeriod = this.timePeriods[6].value; // 3m
      } else {
        outPeriod = this.timePeriods[7].value; // 1m
      }
    }

    return outPeriod;
  }

  getDateWithYearOffset(offset: number): Date {
    const DATE = this.setTimeToMidnight(new Date());
    return new Date(DATE.setFullYear(DATE.getFullYear() - offset));
  }

  getDateWithMonthOffset(offset: number): Date {
    const DATE = this.setTimeToMidnight(new Date());
    return new Date(DATE.setMonth(DATE.getMonth() - offset));
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
