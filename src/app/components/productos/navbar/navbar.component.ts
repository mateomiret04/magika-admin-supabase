import { Component, EventEmitter, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 1. Importación necesaria

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  menuAbierto = false;
  isScrolled = false;

  @Output() onAgregar = new EventEmitter<void>();

  // 2. Inyección del Router en el constructor
  constructor(
    private eRef: ElementRef,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  clickOut(event: MouseEvent) {
    if (this.menuAbierto && !this.eRef.nativeElement.contains(event.target)) {
      this.menuAbierto = false;
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuAbierto = !this.menuAbierto;
  }

  accionAgregar() {
    this.onAgregar.emit();
    this.menuAbierto = false;
  }

  // 3. Lógica de salida optimizada para evitar errores 404 en producción/celular
  salir() {
    localStorage.clear();
    sessionStorage.clear();
    
    // El replaceUrl: true es vital en móviles para limpiar el historial de navegación
    this.router.navigate(['/'], { replaceUrl: true }).then(() => {
      // No usamos reload() directo para no romper la ruta en Netlify
      // Si necesitas refrescar para limpiar estados, la navegación ya cumplió su parte
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }
}