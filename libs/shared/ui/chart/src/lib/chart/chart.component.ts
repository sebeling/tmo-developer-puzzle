import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'coding-challenge-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {
  @Input() data$: Observable<any>;
  @Input() symbol: string;
  @Input() toDate: string;
  @Input() fromDate: string;
  chartData: any;
  chartDataSubscription: Subscription;

  chart: {
    title: string;
    type: string;
    data: any;
    columnNames: string[];
    options: any;
  };

  toDateObj: Date;
  fromDateObj: Date;
  noResultsFoundMsg = 'Sorry, no results were found.';
  defaultChartTitle = 'Stock price';

  get chartTitle() {
    return (this.symbol) ? this.defaultChartTitle + ' for ' + this.symbol : this.defaultChartTitle;
  }


  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.chart = {
      title: '',
      type: 'LineChart',
      data: [],
      columnNames: ['period', 'close'],
      options: { title: `Stock price`, width: '600', height: '400' }
    };

    // Add check for Input variable - needed for unit tests
    if (this.data$) {
      this.chartDataSubscription = this.data$.subscribe(newData => this.filterResults(newData));
    }
  }

  ngOnDestroy() {
    if (this.chartDataSubscription) {
      this.chartDataSubscription.unsubscribe();
    }
  }

  filterResults(inData: Array<any>): void {
    // Convert input dates to Date objects
    this.toDateObj = this.getDate(this.toDate);
    this.fromDateObj = this.getDate(this.fromDate);

    // Update chart title to include the symbol entered by user
    this.chart.options.title = this.chartTitle;

    // The store will return the 'max' (all) stock prices for the entered
    // symbol, so we need to filter it down to only use the selected dates
    // in the chart.
    
    // The reasoning behind having the full list of stock prices for a symbol
    // in the store is that other future components may not care about the selected
    // date range for the chart. This allows other future components that may not be
    // tied directly to the chart to filter the data down based on their specific needs.

    // If we were given business requirements that stated all future components should  
    // use the stock pricing data based on the selected dates, we would want to implement
    // the filtering of the data in the ngrx layer so we are storing the filtered data
    // in the store. Then all components could receive the same prefiltered data.

    this.chartData = inData.filter(data => {
      // Create Date object for closing date and verify
      // that it falls into the selected date range.
      const DATE = this.getDateFromChartData(data[0]);
      return ((DATE >= this.fromDateObj) && (DATE <= this.toDateObj));
    });
  }

  // Creates a new Date object from a string like "1/1/2020"
  getDate(dateStr: string): Date {
    const PARTS = dateStr.split('/');
    return new Date(parseInt(PARTS[2], 10), parseInt(PARTS[0], 10) - 1, parseInt(PARTS[1], 10), 0, 0, 0, 0);
  }

  // Creates a new Date object from a string like "2020-01-01"
  getDateFromChartData(dateStr: string): Date {
    const PARTS = dateStr.split('-');
    return new Date(parseInt(PARTS[0], 10), parseInt(PARTS[1], 10) - 1, parseInt(PARTS[2], 10), 0, 0, 0, 0);
  }
}
