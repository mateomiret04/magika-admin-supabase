import { Component, Input, Output, EventEmitter } from '@angular/core'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-producto.component.html',
})
export class CardProductoComponent {
  // Recibe los datos del producto desde el padre (Productos)
  @Input() infoProducto: any; 

  // Emite el producto completo para abrir el modal de edición
  @Output() editar = new EventEmitter<any>();

  // Emite el ID del producto para ejecutar la eliminación en el padre
  @Output() borrar = new EventEmitter<number>();

  // Función para editar
  onEditar() {
    this.editar.emit(this.infoProducto);
  }

  // Función para borrar con validación de seguridad
  onBorrar() {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar "${this.infoProducto.nombre}"?`);
    if (confirmar) {
      this.borrar.emit(this.infoProducto.id);
    }
  }
}