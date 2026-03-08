import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal que se inicializa revisando el localStorage
  isLoggedSignal = signal<boolean>(localStorage.getItem('magika_session') === 'true');

  login() {
    console.log('Servicio: Guardando sesión...');
    localStorage.setItem('magika_session', 'true');
    this.isLoggedSignal.set(true);
  }

  logout() {
    localStorage.removeItem('magika_session');
    this.isLoggedSignal.set(false);
  }

  isAuthenticated(): boolean {
    const session = localStorage.getItem('magika_session') === 'true';
    console.log('¿Está autenticado?:', session);
    return session;
  }
}