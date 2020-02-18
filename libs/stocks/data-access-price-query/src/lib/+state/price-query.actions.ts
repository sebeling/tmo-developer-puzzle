import { Action } from '@ngrx/store';
import { PriceQueryResponse } from './price-query.type';

export enum PriceQueryActionTypes {
  SelectSymbol = 'priceQuery.selectSymbol',
  FetchPriceQuery = 'priceQuery.fetch',
  PriceQueryFetched = 'priceQuery.fetched',
  PriceQueryFetchError = 'priceQuery.error'
}

export class FetchPriceQuery implements Action {
  readonly type = PriceQueryActionTypes.FetchPriceQuery;

  // Removed the period param because the new HAPI API 
  // will always request the max results so we can cache 
  // it and allow the chart to filter out the dates 
  // selected by the user.
  constructor(public symbol: string) {}
}

export class PriceQueryFetchError implements Action {
  readonly type = PriceQueryActionTypes.PriceQueryFetchError;
  constructor(public error: any) {}
}

export class PriceQueryFetched implements Action {
  readonly type = PriceQueryActionTypes.PriceQueryFetched;
  constructor(public queryResults: PriceQueryResponse[]) {}
}

export class SelectSymbol implements Action {
  readonly type = PriceQueryActionTypes.SelectSymbol;
  constructor(public symbol: string) {}
}

export type PriceQueryAction =
  | FetchPriceQuery
  | PriceQueryFetched
  | PriceQueryFetchError
  | SelectSymbol;

export const fromPriceQueryActions = {
  FetchPriceQuery,
  PriceQueryFetched,
  PriceQueryFetchError,
  SelectSymbol
};
