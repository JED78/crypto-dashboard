import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';

  constructor(private http: HttpClient) {}

  // ✔ Método estándar para obtener precio actual
  getPrice(symbol: string): Observable<{ symbol: string; price: string }> {
    return this.http.get<{ symbol: string; price: string }>(
      `${this.baseUrl}/ticker/price`,
      { params: { symbol } }
    );
  }

  // ✔ Alias para compatibilidad con Dashboard
  getTickerPrice(symbol: string): Observable<{ symbol: string; price: string }> {
    return this.http.get<{ symbol: string; price: string }>(
      `${this.baseUrl}/ticker/price`,
      { params: { symbol } }
    );
  }

  // ✔ Velas
  getKlines(symbol: string, interval: string, limit = 50): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/klines`, {
      params: { symbol, interval, limit },
    });
  }

  // ✔ Info del exchange
  getExchangeInfo() {
    return this.http.get<any>(`${this.baseUrl}/exchangeInfo`);
  }
}