import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async subirImagen(file: File | Blob) {
    const fileName = `${Date.now()}_${(file as File).name || 'archivo'}.webp`;
    
    const { data, error } = await this.supabase.storage
      .from('productos-imagenes') // Nombre corregido
      .upload(fileName, file);

    if (error) {
      console.error('Error al subir imagen:', error.message);
      throw error;
    }

    const { data: publicUrlData } = this.supabase.storage
      .from('productos-imagenes') // Nombre corregido
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  async crearProducto(producto: any) {
    const { data, error } = await this.supabase
      .from('productos')
      .insert([producto]); 

    if (error) throw error;
    return data;
  }

  async actualizarProducto(id: number, producto: any) {
    const { data, error } = await this.supabase
      .from('productos')
      .update(producto)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar producto:', error.message);
      throw error;
    }
    return data;
  }

  async eliminarProducto(id: number) {
    const { error } = await this.supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async obtenerProductos() {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}