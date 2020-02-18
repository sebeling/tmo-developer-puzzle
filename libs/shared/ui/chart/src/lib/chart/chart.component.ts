import {
  ChangeDetectionStrategy,
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
      this.chartDataSubscription = this.data$.subscribe(newData => {
        // Convert input dates to Date objects
        this.toDateObj = this.getDate(this.toDate);
        this.fromDateObj = this.getDate(this.fromDate);

        this.chartData = newData.filter(data => {
          // Create Date object for closing date and verify
          // that it falls into the selected date range.
          const DATE = this.getDateFromChartData(data[0]);
          return ((DATE >= this.fromDateObj) && (DATE <= this.toDateObj));
        });
      });
    }
  }

  ngOnDestroy() {
    if (this.chartDataSubscription) {
      this.chartDataSubscription.unsubscribe();
    }
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
