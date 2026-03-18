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

  /**
   * OPTIMIZADOR UNIVERSAL (Compatible con iPhone/Móvil)
   * Redimensiona, decodifica y comprime a WebP < 150KB
   */
  async comprimirImagen(archivoOriginal: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivoOriginal);
      reader.onload = async (event: any) => {
        const img = new Image();
        img.src = event.target.result;

        try {
          // --- CLAVE PARA MÓVILES ---
          // Espera a que la imagen esté totalmente decodificada en memoria
          if ('decode' in img) {
            await img.decode();
          }

          const canvas = document.createElement('canvas');
          // Forzamos un máximo de 800px para garantizar bajo peso sin perder calidad visual
          const MAX_WIDTH = 800; 
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Suavizado de alta calidad para evitar pixelado al reducir
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
          }

          // Generamos el WebP con calidad 0.6 (Balance perfecto peso/calidad)
          canvas.toBlob((blob) => {
            if (blob) {
              console.log(`📏 Tamaño final optimizado: ${(blob.size / 1024).toFixed(2)} KB`);
              resolve(blob);
            }
            else reject(new Error('Error al generar el archivo optimizado'));
          }, 'image/webp', 0.6); 

        } catch (err) {
          console.error("Error procesando imagen:", err);
          reject(err);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async uploadImagen(file: Blob, nombre: string): Promise<string> {
    const nombreArchivo = `${Date.now()}_${nombre.replace(/\s+/g, '_')}.webp`;
    
    const { data, error } = await this.supabase.storage
      .from('productos-imagenes') // Nombre corregido sin tilde (según tu ajuste previo)
      .upload(nombreArchivo, file);

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('productos-imagenes')
      .getPublicUrl(nombreArchivo);

    return urlData.publicUrl;
  }

  async deleteImagenStorage(url: string): Promise<void> {
    const partes = url.split('/');
    const nombreArchivo = partes[partes.length - 1];
    const { error } = await this.supabase.storage
      .from('productos-imagenes')
      .remove([nombreArchivo]);
    
    if (error) console.error('Error al borrar archivo físico:', error);
  }

  // --- MÉTODOS DE BASE DE DATOS (MANTENIDOS) ---

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