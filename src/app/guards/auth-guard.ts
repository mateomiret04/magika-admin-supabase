import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('Guardia revisando acceso...');

  if (authService.isAuthenticated()) {
    console.log('Guardia: Acceso permitido');
    return true;
  } else {
    console.warn('Guardia: Acceso denegado, redirigiendo...');
    router.navigate(['/login']);
    return false;
  }
};