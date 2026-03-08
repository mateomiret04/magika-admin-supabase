import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';   
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  // Variables vinculadas al formulario [(ngModel)]
  usuario: string = '';
  clave: string = '';
  
  // Variable para controlar la visibilidad de la contraseña
  verClave: boolean = false;

  constructor(
    private router: Router, 
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Nos aseguramos de que los campos nazcan vacíos
    this.usuario = '';
    this.clave = '';
  }

  // Método para alternar entre ver/ocultar contraseña
  toggleVerClave(): void {
    this.verClave = !this.verClave;
  }

  onLogin(): void {
    console.log('Validando acceso...');

    // Validación profesional: trim() elimina espacios accidentales
    const userValid = this.usuario.trim();
    const passValid = this.clave.trim();

    if (userValid === 'admin' && passValid === 'magika2026') {
      // 1. Guardamos la sesión en LocalStorage a través del servicio
      this.authService.login(); 
      
      // 2. Navegamos a la oficina
      console.log('Acceso concedido.');
      this.router.navigate(['/productos']);
    } else {
      // 3. Error si las credenciales no coinciden
      console.error('Acceso denegado.');
      alert('Usuario o contraseña incorrectos. Por favor, intenta de nuevo.');
      
      // Limpiar la clave si falla para que el usuario reintente
      this.clave = '';
    }
  }
}