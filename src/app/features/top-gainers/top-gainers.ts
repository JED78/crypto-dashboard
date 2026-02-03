import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of, timeout, retry, catchError, map } from 'rxjs';
import { BinanceService } from '../../services/binance.service';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-top-gainers',
  standalone: true,
  imports: [CommonModule,DecimalPipe],
  templateUrl: './top-gainers.html',
  styleUrls: ['./top-gainers.css']
})
export class TopGainersComponent {

  isLoading = true;
  topGainers: any[] = [];

  symbols = [
    'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOGE','DOT','LINK',
    'MATIC','ATOM','LTC','TRX','ETC','UNI','XLM','FIL','APT','ARB'
  ];

  constructor(private binance: BinanceService) {}

  ngOnInit() {
    this.loadTopGainers();
  }

  loadTopGainers() {

    this.isLoading = true;

    const requests = this.symbols.map(symbol =>
      this.binance.getKlines(symbol + 'USDT', '1h', 24).pipe(

        timeout(5000),
        retry(2),
        catchError(() => of([])),

        map((klines: any[]) => {

          if (!klines || klines.length < 2) return null;

          const first = parseFloat(klines[0][4]);   // precio hace 24h
          const last = parseFloat(klines[klines.length - 1][4]); // precio actual

          const volumes = klines.map(k => parseFloat(k[5]));
          const vol24h = volumes.reduce((a, b) => a + b, 0);

          const benefit = (last - first) * vol24h;

          return {
            symbol,
            first,
            last,
            vol24h,
            benefit
          };
        })
      )
    );

    forkJoin(requests).subscribe(results => {

      const valid = results.filter(r => r !== null);

      this.topGainers = valid
        .sort((a, b) => b.benefit - a.benefit)
        .slice(0, 10);

      this.isLoading = false;
    });
  }
}