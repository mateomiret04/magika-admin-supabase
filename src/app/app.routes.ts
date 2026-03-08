import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Productos } from './components/productos/productos.component';
import { authGuard } from './guards/auth-guard'; // Importamos el guardia de seguridad

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: Login 
  },
  { 
    path: 'productos', 
    component: Productos,
    canActivate: [authGuard] // <--- EL CANDADO: Solo pasa si está logueado
  },
  { 
    path: '**', 
    redirectTo: 'login' 
  }
];