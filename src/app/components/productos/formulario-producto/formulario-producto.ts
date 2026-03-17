import { Component, EventEmitter, Output, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';

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

  constructor(private _productoService: ProductoService) {}

  ngOnInit(): void {
    if (this.productoEditar) {
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

      // --- PASO CLAVE: OPTIMIZACIÓN Y SUBIDA ---
      if (this.archivoSeleccionado) {
        
        // 1. LIMPIEZA: Si estamos editando y hay una foto previa, la borramos del storage
        if (this.productoEditar && this.productoEditar.imagen_url) {
          console.log("🧹 Borrando imagen anterior del storage para evitar duplicados...");
          await this._productoService.deleteImagenStorage(this.productoEditar.imagen_url);
        }
        
        // 2. Comprimimos el archivo en el cliente (Efecto Squoosh)
        const imagenOptimizada = await this._productoService.comprimirImagen(this.archivoSeleccionado);
        
        // 3. Subimos el Blob optimizado al Storage
        urlImagen = await this._productoService.uploadImagen(imagenOptimizada, this.nuevoProducto.nombre);
      }

      const datosProducto = {
        nombre: this.nuevoProducto.nombre,
        precio_base: this.nuevoProducto.precio_base ?? 0,
        descuento: this.nuevoProducto.descuento ?? 0,
        stock: this.nuevoProducto.stock ?? 0,
        categoria: this.nuevoProducto.categoria || '',
        descripcion: this.nuevoProducto.descripcion || '',
        imagen_url: urlImagen 
      };

      // --- LÓGICA DE PERSISTENCIA ---
      if (this.productoEditar && this.productoEditar.id) {
        this._productoService.updateProducto(this.productoEditar.id, datosProducto).subscribe({
          next: () => this.finalizarExito(),
          error: (e) => this.finalizarError(e, "Error al actualizar")
        });
      } else {
        this._productoService.postProducto(datosProducto).subscribe({
          next: () => this.finalizarExito(),
          error: (e) => this.finalizarError(e, "Error al crear")
        });
      }

    } catch (error: any) {
      this.finalizarError(error, "Error al procesar la imagen u optimización");
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