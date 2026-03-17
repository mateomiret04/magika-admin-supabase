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
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // --- HERRAMIENTAS DE OPTIMIZACIÓN Y STORAGE ---

  async comprimirImagen(archivoOriginal: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivoOriginal);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1080;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Error al comprimir imagen'));
          }, 'image/webp', 0.75);
        };
      };
    });
  }

  async uploadImagen(file: Blob, nombre: string): Promise<string> {
    const nombreArchivo = `${Date.now()}_${nombre.replace(/\s+/g, '_')}.webp`;
    
    const { data, error } = await this.supabase.storage
      .from('productos-imagenes') // Nombre corregido
      .upload(nombreArchivo, file);

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('productos-imagenes') // Nombre corregido
      .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
  }

  async deleteImagenStorage(url: string): Promise<void> {
    const partes = url.split('/');
    const nombreArchivo = partes[partes.length - 1];
    const { error } = await this.supabase.storage
      .from('productos-imagenes') // Nombre corregido
      .remove([nombreArchivo]);
    
    if (error) console.error('Error al borrar archivo físico:', error);
  }

  // --- MÉTODOS DE BASE DE DATOS ---

  getListProductos(): Observable<any[]> {
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

  postProducto(producto: any): Observable<any> {
    return from(
      this.supabase
        .from('productos')
        .insert([producto])
    );
  }

  updateProducto(id: number, producto: any): Observable<any> {
    return from(
      this.supabase
        .from('productos')
        .update(producto)
        .eq('id', id)
    );
  }

  deleteProducto(id: number): Observable<any> {
    return from(
      this.supabase
        .from('productos')
        .delete()
        .eq('id', id)
    );
  }
}