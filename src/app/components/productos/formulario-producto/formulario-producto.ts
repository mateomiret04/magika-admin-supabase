import { Component, EventEmitter, Output, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase'; 

@Component({
  selector: 'app-formulario-producto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-producto.html'
})
export class FormularioProductoComponent implements OnInit {
  @ViewChild('modalContainer') modalContainer!: ElementRef;

  @Input() productoEditar: any = null;

  nuevoProducto: any = {
    nombre: '',
    precio_base: null,
    descuento: null,
    stock: null,
    categoria: '',
    descripcion: '',
    imagen_url: ''
  };

  archivoSeleccionado: File | null = null;
  cargando: boolean = false;

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() productoAgregado = new EventEmitter<void>();

  constructor(private _supabaseService: SupabaseService) {}

  ngOnInit(): void {
    if (this.productoEditar) {
      // Cargamos los datos existentes para editar
      this.nuevoProducto = { ...this.productoEditar };
    }
  }

  onFileSelected(event: any) {
    this.archivoSeleccionado = event.target.files[0];
  }

  async guardar() {
    if (!this.nuevoProducto.nombre) {
      alert("Por favor, completa al menos el nombre del producto");
      return;
    }

    // Solo exigimos imagen si es un producto NUEVO
    if (!this.productoEditar && !this.archivoSeleccionado) {
      alert("Por favor, selecciona una imagen para el nuevo producto");
      return;
    }

    if (this.modalContainer) {
      this.modalContainer.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.cargando = true;

    try {
      let urlImagen = this.nuevoProducto.imagen_url;

      // 1. Si el usuario eligió una foto nueva, la subimos
      if (this.archivoSeleccionado) {
        urlImagen = await this._supabaseService.subirImagen(this.archivoSeleccionado);
      }

      // 2. Preparamos el objeto con los datos limpios
      const datosProducto = {
        nombre: this.nuevoProducto.nombre,
        precio_base: this.nuevoProducto.precio_base ?? 0,
        descuento: this.nuevoProducto.descuento ?? 0,
        stock: this.nuevoProducto.stock ?? 0,
        categoria: this.nuevoProducto.categoria || '',
        descripcion: this.nuevoProducto.descripcion || '',
        imagen_url: urlImagen 
      };

      // 3. Lógica de Supabase: ¿Editar o Crear?
      if (this.productoEditar && this.productoEditar.id) {
        // ACTUALIZAR PRODUCTO EXISTENTE
        await this._supabaseService.actualizarProducto(this.productoEditar.id, datosProducto);
        console.log("Producto actualizado con éxito");
      } else {
        // CREAR PRODUCTO NUEVO
        await this._supabaseService.crearProducto(datosProducto);
        console.log("Producto creado con éxito");
      }

      this.finalizarExito();
    } catch (error: any) {
      this.finalizarError(error, "Error al procesar el producto en Supabase");
    }
  }

  private finalizarExito() {
    this.cargando = false;
    this.productoAgregado.emit();
    this.cerrar();
  }

  private finalizarError(e: any, mensaje: string) {
    this.cargando = false;
    console.error(e);
    alert(mensaje);
  }

  cerrar() {
    this.cerrarModal.emit();
  }

  autoExpand(event: any): void {
    const element = event.target;
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  }
}