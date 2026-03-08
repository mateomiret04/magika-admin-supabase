import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializamos el cliente de Supabase
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Método para obtener la lista de productos
  getListProductos(): Observable<any[]> {
    // Convertimos la promesa de Supabase en un Observable para que tus componentes sigan funcionando igual
    return from(
      this.supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      })
    );
  }

  // Método para enviar un nuevo producto (INSERT)
  postProducto(producto: any): Observable<any> {
    return from(
      this.supabase
        .from('productos')
        .insert([producto])
    );
  }

  // Método para actualizar un producto existente (UPDATE)
  updateProducto(id: number, producto: any): Observable<any> {
    return from(
      this.supabase
        .from('productos')
        .update(producto)
        .eq('id', id)
    );
  }

  // Método para eliminar un producto (DELETE)
  deleteProducto(id: number): Observable<any> {
    return from(
      this.supabase
        .from('productos')
        .delete()
        .eq('id', id)
    );
  }
}