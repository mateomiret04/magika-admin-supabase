import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { NavbarComponent } from './navbar/navbar.component';
import { CardProductoComponent } from './card-producto/card-producto.component';
import { FormularioProductoComponent } from './formulario-producto/formulario-producto'; 
import { SupabaseService } from '../../services/supabase'; // Cambiado al nuevo servicio

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
  // Datos originales de Supabase
  listaProductos: any[] = []; 
  // Datos que se muestran tras aplicar filtros
  listaFiltrada: any[] = []; 
  
  // Control de Modales y Cargas
  mostrarModal: boolean = false; 
  productoSeleccionado: any = null; 
  loading: boolean = true; 
  isFirstLoad: boolean = true; 

  // Variables de Filtro
  terminoBusqueda: string = '';
  categoriasUnicas: string[] = [];
  categoriaSeleccionada: string = 'Todas';

  constructor(
    private _supabaseService: SupabaseService, // Inyectamos Supabase
    private _cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  // Cambiado a async para manejar la promesa de Supabase
  async obtenerProductos() {
    if (this.isFirstLoad) {
      this.loading = true;
    }

    try {
      const data = await this._supabaseService.obtenerProductos();
      this.listaProductos = data || [];
      
      // 1. Extraemos las categorías
      this.extraerCategorias();
      
      // 2. Aplicamos los filtros
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
    } catch (err) {
      console.error("Error al conectar con Supabase:", err);
      this.loading = false;
      this.isFirstLoad = false;
      this._cdr.detectChanges();
    }
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

  // Método de borrado adaptado a Supabase
  async borradoProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await this._supabaseService.eliminarProducto(id);
        console.log("Producto eliminado con éxito de Supabase");
        // Refrescamos la lista
        this.obtenerProductos();
      } catch (err) {
        console.error("Error al intentar borrar el producto:", err);
        alert("No se pudo eliminar el producto.");
      }
    }
  }

  // Métodos de control del Modal
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
    // Recargamos por si hubo cambios en el formulario
    this.obtenerProductos();
  }
}