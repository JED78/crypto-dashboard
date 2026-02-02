import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';

  constructor(private http: HttpClient) {}

  getTickerPrice(symbol: string): Observable<{ symbol: string; price: string }> {
    return this.http.get<{ symbol: string; price: string }>(
      `${this.baseUrl}/ticker/price`,
      { params: { symbol } }
    );
  }

  getKlines(symbol: string, interval: string, limit = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/klines`, {
      params: { symbol, interval, limit },
    });
  }

  getExchangeInfo() {
  return this.http.get<any>('https://api.binance.com/api/v3/exchangeInfo');
}
}