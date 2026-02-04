import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BinanceService } from '../../services/binance.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class AlertsComponent {

  symbols = [
    'BTC','ETH','BNB','SOL','XRP','ADA','AVAX','DOGE','DOT','LINK',
    'MATIC','ATOM','LTC','TRX','ETC','UNI','XLM','FIL','APT','ARB'
  ];

  alerts: any[] = [];

  newAlert = {
    symbol: 'BTC',
    target: null,
    condition: 'above' // above | below
  };

  constructor(private binance: BinanceService) {}

  // ---------------------------------------------------
  // INIT
  // ---------------------------------------------------
  ngOnInit() {
    this.loadAlertsFromStorage();
    this.startAlertWatcher();
  }

  // ---------------------------------------------------
  // CREAR ALERTA
  // ---------------------------------------------------
  addAlert() {
    if (!this.newAlert.target) return;

    this.alerts.push({
      ...this.newAlert,
      active: true,
      createdAt: new Date(),
      showPopup: false
    });

    this.saveAlertsToStorage();

    this.newAlert = { symbol: 'BTC', target: null, condition: 'above' };
  }

  // ---------------------------------------------------
  // ACTIVAR / DESACTIVAR ALERTA
  // ---------------------------------------------------
  toggleAlert(alert: any) {
    alert.active = !alert.active;
    this.saveAlertsToStorage();
  }

  // ---------------------------------------------------
  // ELIMINAR ALERTA
  // ---------------------------------------------------
  deleteAlert(index: number) {
    this.alerts.splice(index, 1);
    this.saveAlertsToStorage();
  }

  // ---------------------------------------------------
  // LOCAL STORAGE
  // ---------------------------------------------------
  saveAlertsToStorage() {
    localStorage.setItem('alerts', JSON.stringify(this.alerts));
  }

  loadAlertsFromStorage() {
    const saved = localStorage.getItem('alerts');
    if (saved) {
      this.alerts = JSON.parse(saved);
    }
  }

  // ---------------------------------------------------
  // WATCHER DE ALERTAS (cada 5s)
  // ---------------------------------------------------
  startAlertWatcher() {
    setInterval(() => {
      const activeAlerts = this.alerts.filter(a => a.active);

      activeAlerts.forEach(alert => {
        this.binance.getPrice(alert.symbol + 'USDT').subscribe((price: any) => {
          const current = parseFloat(price.price);

          const conditionMet =
            (alert.condition === 'above' && current >= alert.target) ||
            (alert.condition === 'below' && current <= alert.target);

          if (conditionMet) {
            this.triggerAlert(alert, current);
          }
        });
      });

    }, 5000);
  }

  // ---------------------------------------------------
  // DISPARAR ALERTA
  // ---------------------------------------------------
  triggerAlert(alert: any, currentPrice: number) {
    alert.active = false;
    this.saveAlertsToStorage();

    //this.playSound();

    alert.message = `⚡ ${alert.symbol} ha ${
      alert.condition === 'above' ? 'superado' : 'bajado de'
    } ${alert.target}$ (actual: ${currentPrice}$)`;

    alert.showPopup = true;

    setTimeout(() => alert.showPopup = false, 6000);
  }

  // ---------------------------------------------------
  // SONIDO
  // ---------------------------------------------------
  playSound() {
    const audio = new Audio('assets/sounds/alert.mp3');
    audio.play();
  }
}