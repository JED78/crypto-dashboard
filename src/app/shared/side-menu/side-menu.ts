import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu',
  standalone: true,                 // ← NECESARIO para usar imports
  imports: [CommonModule],          // ← Habilita ngClass, ngIf, ngFor
  templateUrl: './side-menu.html',   // ← Nombre correcto
  styleUrls: ['./side-menu.css']    // ← Nombre correcto
})
export class SideMenuComponent {

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }
}