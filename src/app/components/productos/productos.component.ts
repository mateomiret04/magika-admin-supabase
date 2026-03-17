import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { NavbarComponent } from './navbar/navbar.component';
import { CardProductoComponent } from './card-producto/card-producto.component';
import { FormularioProductoComponent } from './formulario-producto/formulario-producto'; 
import { ProductoService } from '../../services/producto.service'; // Cambiado al servicio optimizado

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    NavbarComponent, 
    CardProductoComponent, 
    FormularioProductoComponent
  ],
  templateUrl: './productos.component.html',
})
export class Productos implements OnInit {
  listaProductos: any[] = []; 
  listaFiltrada: any[] = []; 
  
  mostrarModal: boolean = false; 
  productoSeleccionado: any = null; 
  loading: boolean = true; 
  isFirstLoad: boolean = true; 

  terminoBusqueda: string = '';
  categoriasUnicas: string[] = [];
  categoriaSeleccionada: string = 'Todas';

  constructor(
    private _productoService: ProductoService, // Usamos el servicio con herramientas de Storage
    private _cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  async obtenerProductos() {
    if (this.isFirstLoad) {
      this.loading = true;
    }

    // Usamos subscribe porque el servicio devuelve Observable (vía from)
    this._productoService.getListProductos().subscribe({
      next: (data) => {
        this.listaProductos = data || [];
        this.extraerCategorias();
        this.filtrarProductos();
        
        if (this.isFirstLoad) {
          setTimeout(() => {
            this.loading = false;
            this.isFirstLoad = false;
            this._cdr.detectChanges(); 
          }, 1500);
        } else {
          this.loading = false;
          this._cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Error al conectar con Supabase:", err);
        this.loading = false;
        this.isFirstLoad = false;
        this._cdr.detectChanges();
      }
    });
  }

  extraerCategorias() {
    const cats = this.listaProductos
      .map(p => p.categoria)
      .filter(c => c && c.trim() !== '');
    
    this.categoriasUnicas = [...new Set(cats)].sort();
  }

  seleccionarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
    this.filtrarProductos();
  }

  filtrarProductos() {
    const term = this.terminoBusqueda.toLowerCase().trim();

    this.listaFiltrada = this.listaProductos.filter(p => {
      const coincideTexto = !term || 
        p.nombre.toLowerCase().includes(term) || 
        (p.categoria && p.categoria.toLowerCase().includes(term));

      const coincideCategoria = this.categoriaSeleccionada === 'Todas' || 
        p.categoria === this.categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });
  }

  // --- MÉTODO DE BORRADO SINCRONIZADO (DB + STORAGE) ---
  async borradoProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto e imagen?')) {
      try {
        // 1. Buscamos el producto localmente para obtener la URL de la imagen
        const productoABorrar = this.listaProductos.find(p => p.id === id);
        
        if (productoABorrar && productoABorrar.imagen_url) {
          console.log("Eliminando imagen del Storage...");
          // 2. Borramos el archivo físico del Storage
          await this._productoService.deleteImagenStorage(productoABorrar.imagen_url);
        }

        // 3. Borramos el registro de la Base de Datos
        this._productoService.deleteProducto(id).subscribe({
          next: () => {
            console.log("Producto eliminado con éxito de la DB");
            this.obtenerProductos(); // Refrescamos la lista
          },
          error: (err) => {
            console.error("Error al borrar de la DB:", err);
            alert("Error al eliminar el registro.");
          }
        });

      } catch (err) {
        console.error("Error en el proceso de borrado:", err);
        alert("Hubo un problema al eliminar el archivo físico.");
      }
    }
  }

  abrirModalNuevo() {
    this.productoSeleccionado = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(producto: any) {
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.productoSeleccionado = null;
    this.obtenerProductos();
  }
}