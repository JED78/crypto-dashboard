import { Component, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BaseChartDirective } from 'ng2-charts';
import { BinanceService } from '../../Services/binance.service';
import { interval, Subscription, switchMap, forkJoin, map } from 'rxjs';

import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  BarElement,
  BarController,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  LineController,
  BarElement,
  BarController,
  Filler,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    BaseChartDirective
  ]
})
export class Dashboard implements OnInit, OnDestroy {

  @ViewChildren(BaseChartDirective) charts?: QueryList<BaseChartDirective>;

  // ⭐ TOP 50 CRYPTOS IMPORTANTES
  top50 = [
    'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOGE','DOT','LINK',
    'MATIC','ATOM','LTC','UNI','ETC','XLM','FIL','APT','HBAR','ICP',
    'VET','NEAR','AAVE','SAND','MANA','THETA','EGLD','RUNE','KAVA','FTM',
    'ALGO','GRT','AXS','FLOW','CHZ','CRV','SNX','IMX','OP','ARB',
    'INJ','RNDR','QNT','MINA','DYDX','ZIL','1INCH','BAT','GMT','ROSE'
  ];

  allCryptos: string[] = [];
  allQuotes: string[] = [];

  refreshOptions = [
    { label: '5 segundos', value: 5000 },
    { label: '10 segundos', value: 10000 },
    { label: '30 segundos', value: 30000 },
    { label: '1 minuto', value: 60000 },
  ];

  selectedCrypto = 'BTC';
  selectedQuote = 'USDT';
  selectedRefresh = 5000;

  currentPrice: number | undefined = undefined;
  lastUpdate: Date | undefined = undefined;
  priceSub: Subscription | undefined = undefined;

  // ⭐ GRÁFICA PRECIO
  chartData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        label: 'Precio',
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }
    ]
  };

  chartOptions = { responsive: true, scales: { x: {}, y: {} } };

  // ⭐ GRÁFICA VOLUMEN
  chartVolumeData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        label: 'Volumen',
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderWidth: 0
      }
    ]
  };

  chartVolumeOptions = { responsive: true, scales: { x: {}, y: {} } };

  // ⭐ GRÁFICA RSI
  chartRsiData = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        label: 'RSI (14)',
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: false,
        tension: 0.3,
        pointRadius: 0
      },
      {
        data: [] as number[],
        label: 'Sobrecompra (70)',
        borderColor: 'rgba(255, 0, 0, 0.4)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      },
      {
        data: [] as number[],
        label: 'Sobreventa (30)',
        borderColor: 'rgba(0, 150, 255, 0.4)',
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0
      }
    ]
  };

  chartRsiOptions = { responsive: true, scales: { x: {}, y: { min: 0, max: 100 } } };

  // ⭐ GRÁFICA TOP 5 SUBIDAS MENSUALES
  chartTop5Data = {
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        label: 'Subida mensual (%)',
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderWidth: 1
      }
    ]
  };

  chartTop5Options = {
    indexAxis: 'y' as const,
    responsive: true,
    scales: { x: {}, y: {} }
  };

  constructor(private binance: BinanceService) {}

  ngOnInit() {
    this.loadSymbols();
    this.startPriceStream();
    this.loadChartData();
    this.loadTop5Monthly();
  }

  ngOnDestroy() {
    this.priceSub?.unsubscribe();
  }

  loadSymbols() {
    this.binance.getExchangeInfo().subscribe(info => {
      const symbols = info.symbols;

      Promise.resolve().then(() => {
        this.allCryptos = Array.from(new Set(symbols.map((s: any) => s.baseAsset))) as string[];
        this.allQuotes = Array.from(new Set(symbols.map((s: any) => s.quoteAsset))) as string[];

        this.allCryptos.sort();
        this.allQuotes.sort();
      });
    });
  }

  onSelectionChange(value?: number) {
    if (value) this.selectedRefresh = Number(value);
    this.restartPriceStream();
    this.loadChartData();
  }

  buildSymbol() {
    return `${this.selectedCrypto}${this.selectedQuote}`;
  }

  startPriceStream() {
    this.priceSub = interval(this.selectedRefresh)
      .pipe(switchMap(() => this.binance.getTickerPrice(this.buildSymbol())))
      .subscribe((data) => {
        this.currentPrice = parseFloat(data.price);
        this.lastUpdate = new Date();
      });

    this.binance.getTickerPrice(this.buildSymbol()).subscribe((data) => {
      this.currentPrice = parseFloat(data.price);
      this.lastUpdate = new Date();
    });
  }

  restartPriceStream() {
    this.priceSub?.unsubscribe();
    this.startPriceStream();
  }

  calculateRSI(closes: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    rsi.push(100 - (100 / (1 + avgGain / avgLoss)));

    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];

      if (diff >= 0) {
        avgGain = (avgGain * (period - 1) + diff) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - diff) / period;
      }

      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }

    while (rsi.length < closes.length) rsi.unshift(NaN);

    return rsi;
  }

  // ⭐ PRECIO + VOLUMEN + RSI
  loadChartData() {
    const symbol = this.buildSymbol();

    this.binance.getKlines(symbol, '1m', 50).subscribe((klines) => {
      const labels: string[] = [];
      const prices: number[] = [];
      const volumes: number[] = [];

      for (const k of klines) {
        labels.push(new Date(k[0]).toLocaleTimeString());
        prices.push(parseFloat(k[4]));
        volumes.push(parseFloat(k[5]));
      }

      this.chartData.labels = labels;
      this.chartData.datasets[0].data = prices;

      this.chartVolumeData.labels = labels;
      this.chartVolumeData.datasets[0].data = volumes;

      const rsi = this.calculateRSI(prices, 14);

      this.chartRsiData.labels = labels;
      this.chartRsiData.datasets[0].data = rsi;
      this.chartRsiData.datasets[1].data = labels.map(() => 70);
      this.chartRsiData.datasets[2].data = labels.map(() => 30);

      this.charts?.forEach(c => c.update());
    });
  }

  // ⭐ TOP 5 SUBIDAS MENSUALES
  loadTop5Monthly() {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;

    const start = new Date(year, month, 1).getTime();
    const end = new Date(year, month + 1, 1).getTime();

    const requests = this.top50.map(symbol =>
      this.binance.getKlines(symbol + 'USDT', '1d', 60).pipe(
        map((klines: any[]) => {
          const monthData = klines.filter(k => k[0] >= start && k[0] < end);
          if (monthData.length < 2) return null;

          const first = parseFloat(monthData[0][4]);
          const last = parseFloat(monthData[monthData.length - 1][4]);
          const change = ((last - first) / first) * 100;

          return { symbol, change };
        })
      )
    );

    forkJoin(requests).subscribe(results => {
      const valid = results.filter(r => r !== null) as any[];

      const top5 = valid
        .sort((a, b) => b.change - a.change)
        .slice(0, 5);

      this.chartTop5Data.labels = top5.map(t => t.symbol);
      this.chartTop5Data.datasets[0].data = top5.map(t => t.change);

      this.charts?.forEach(c => c.update());
    });
  }
}