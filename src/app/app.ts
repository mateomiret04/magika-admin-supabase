import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <--- ESTO ES VITAL

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <--- DEBE ESTAR AQUÍ
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'magika-admin';
}