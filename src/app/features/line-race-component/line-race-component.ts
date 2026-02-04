import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexStroke,
  ApexDataLabels,
  ApexYAxis,
  ApexLegend,
  ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-line-race',
  templateUrl: './line-race-component.css'
})
export class LineRaceComponent implements OnInit {

  public chartOptions!: Partial<ChartOptions>;

  months = [
    'Ene','Feb','Mar','Abr','May','Jun',
    'Jul','Ago','Sep','Oct','Nov','Dic'
  ];

  cryptos = ['BTC','ETH','BNB','SOL','XRP'];

  data: Record<string, number[]> = {
    BTC: [100,120,150,180,200,230,260,300,330,360,400,450],
    ETH: [80,100,130,160,190,220,250,280,310,340,380,420],
    BNB: [60,80,110,140,170,200,230,260,290,320,350,380],
    SOL: [40,70,100,130,160,190,220,250,280,310,340,370],
    XRP: [30,50,70,90,110,130,160,190,220,250,280,310]
  };

  currentIndex = 1;

  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'line',
        height: 400,
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 800
          }
        }
      },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      xaxis: { categories: [this.months[0]] },
      series: this.cryptos.map(name => ({
        name,
        data: [this.data[name][0]]
      }))
    };

    this.startRace();
  }

  startRace() {
    const interval = setInterval(() => {
      if (this.currentIndex >= this.months.length) {
        clearInterval(interval);
        return;
      }

      this.chartOptions = {
        ...this.chartOptions,
        xaxis: {
          categories: this.months.slice(0, this.currentIndex + 1)
        },
        series: this.cryptos.map(name => ({
          name,
          data: this.data[name].slice(0, this.currentIndex + 1)
        }))
      };

      this.currentIndex++;
    }, 1200);
  }
}