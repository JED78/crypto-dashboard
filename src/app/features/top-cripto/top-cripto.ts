import { Component, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { forkJoin, of, timeout, retry, catchError, map } from 'rxjs';
import { BinanceService } from '../../services/binance.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-top-cripto',
  standalone: true,
  imports: [CommonModule, DecimalPipe, BaseChartDirective],
  templateUrl: './top-cripto.html',
  styleUrl: './top-cripto.css',
})
export class TopCripto {

  // Capturar TODAS las gráficas del carrusel
  @ViewChildren(BaseChartDirective) chartsList!: QueryList<BaseChartDirective>;

  isLoading = true;
  topGainers: any[] = [];
  monthlyTop: any[] = [];

  // -----------------------------
  // GRÁFICA DE ÁREA SUAVE (30 días)
  // -----------------------------
  public monthlyChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Beneficio mensual',
        fill: true,
        tension: 0.4,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.25)',
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  public monthlyChartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const value = ctx.raw as number;
          return value.toLocaleString() + ' $';
        }
      }
    }
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: false,
      reverse: false, // 👈 fuerza el eje correcto
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: {
        callback: (value) => value + ' $'
      }
    }
  }
};
  // -----------------------------
  // GRÁFICA DE BARRAS (90 días)
  // -----------------------------
  public quarterlyChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Beneficio últimos 3 meses',
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: '#1e40af',
        borderWidth: 1
      }
    ]
  };

  public quarterlyChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw as number;
            return value.toLocaleString() + ' $';
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (value) => value + ' $'
        }
      }
    }
  };

  symbols = [
    'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOGE','DOT','LINK',
    'MATIC','ATOM','LTC','TRX','ETC','UNI','XLM','FIL','APT','ARB'
  ];

  constructor(private binance: BinanceService) {}

  ngOnInit() {
    this.loadMonthlyTopGainers();
    this.loadQuarterlyGainers();
  }

 // -----------------------------
// TOP GAINERS 30 DÍAS
// -----------------------------
loadMonthlyTopGainers() {
  const requests = this.symbols.map(symbol =>
    this.binance.getKlines(symbol + 'USDT', '1d', 30).pipe(
      timeout(5000),
      retry(2),
      catchError(() => of([])),
      map((klines: any[]) => {
        if (!klines || klines.length < 2) return null;

        const first = parseFloat(klines[0][4]);
        const last = parseFloat(klines[klines.length - 1][4]);
        const volumes = klines.map(k => parseFloat(k[5]));
        const vol30d = volumes.reduce((a, b) => a + b, 0);

        const benefit = Math.abs((last - first) * vol30d);

        return { symbol, benefit };
      })
    )
  );

  forkJoin(requests).subscribe(results => {
    const valid = results.filter(r => r !== null);
    const top10 = valid.sort((a, b) => b.benefit - a.benefit).slice(0, 10);

    // Guardas si quieres usarlo en otro sitio
    this.monthlyTop = top10;

    // 🔥 Aquí está lo que faltaba: alimentar la gráfica
    this.monthlyChartData.labels = top10.map(x => x.symbol);
    this.monthlyChartData.datasets[0].data = top10.map(x => x.benefit);

    setTimeout(() => this.updateCharts(), 50);
  });
}
  // -----------------------------
  // TOP GAINERS 90 DÍAS
  // -----------------------------
  loadQuarterlyGainers() {
    const requests = this.symbols.map(symbol =>
      this.binance.getKlines(symbol + 'USDT', '1d', 90).pipe(
        timeout(5000),
        retry(2),
        catchError(() => of([])),
        map((klines: any[]) => {
          if (!klines || klines.length < 2) return null;

          const first = parseFloat(klines[0][4]);
          const last = parseFloat(klines[klines.length - 1][4]);
          const volumes = klines.map(k => parseFloat(k[5]));
          const vol90d = volumes.reduce((a, b) => a + b, 0);

         const benefit = Math.abs((last - first) * vol90d);

          return { symbol, benefit };
        })
      )
    );

    forkJoin(requests).subscribe(results => {
      const valid = results.filter(r => r !== null);
      const sorted = valid.sort((a, b) => b.benefit - a.benefit);

      this.quarterlyChartData.labels = sorted.map(x => x.symbol);
      this.quarterlyChartData.datasets[0].data = sorted.map(x => x.benefit);

      setTimeout(() => this.updateCharts(), 50);
    });
  }

  // -----------------------------
  // ACTUALIZAR TODAS LAS GRÁFICAS
  // -----------------------------
  updateCharts() {
    setTimeout(() => {
      if (this.chartsList && this.chartsList.length > 0) {
        this.chartsList.forEach(chart => chart.update());
      }
    }, 50);
  }

  // -----------------------------
  // Carrusel
  // -----------------------------
  currentChartIndex = 0;

  charts = [
    { title: 'Beneficio Económico (Últimos 30 días)', type: 'monthly' },
    { title: 'Beneficio Económico (Últimos 3 meses)', type: 'quarterly' }
  ];

  nextChart() {
    this.currentChartIndex =
      (this.currentChartIndex + 1) % this.charts.length;

    setTimeout(() => this.updateCharts(), 50);
  }

  prevChart() {
    this.currentChartIndex =
      (this.currentChartIndex - 1 + this.charts.length) % this.charts.length;

    setTimeout(() => this.updateCharts(), 50);
  }
}