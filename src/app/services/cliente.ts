import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Producto } from '../models'; 

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private supabase: SupabaseClient;

  constructor() {
    // Inicializamos el cliente con las credenciales que ya tenemos en environment
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /**
   * GET: Obtener todos los productos para la tienda
   * Reemplaza al antiguo http.get
   */
  async getProductos(): Promise<Producto[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al obtener productos:', error.message);
      return [];
    }

    return data as Producto[];
  }

  /**
   * POST: Guardar un producto nuevo desde el Admin
   * Reemplaza al antiguo http.post
   */
  async agregarProducto(producto: Producto): Promise<any> {
    const { data, error } = await this.supabase
      .from('productos')
      .insert([producto]);

    if (error) {
      console.error('Error al agregar producto:', error.message);
      throw error;
    }

    return data;
  }
}