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

  // 1. MÉTODO PARA SUBIR LA IMAGEN AL BUCKET
  async subirImagen(file: File) {
    const fileName = `${Date.now()}_${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('productos-fotos') 
      .upload(fileName, file);

    if (error) {
      console.error('Error al subir imagen:', error.message);
      throw error;
    }

    // 2. OBTENER LA URL PÚBLICA
    const { data: publicUrlData } = this.supabase.storage
      .from('productos-fotos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  // 3. MÉTODO PARA CARGAR UN PRODUCTO NUEVO
  async crearProducto(producto: any) {
    const { data, error } = await this.supabase
      .from('productos')
      .insert([producto]); 

    if (error) throw error;
    return data;
  }

  // ⭐ NUEVO: MÉTODO PARA ACTUALIZAR UN PRODUCTO EXISTENTE
  async actualizarProducto(id: number, producto: any) {
    const { data, error } = await this.supabase
      .from('productos')
      .update(producto)
      .eq('id', id); // Filtra por ID para asegurar que solo editamos ese producto

    if (error) {
      console.error('Error al actualizar producto:', error.message);
      throw error;
    }
    return data;
  }

  // 4. MÉTODO PARA BORRAR UN PRODUCTO
  async eliminarProducto(id: number) {
    const { error } = await this.supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // MÉTODO EXTRA: Para listar productos en el panel del Admin
  async obtenerProductos() {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}