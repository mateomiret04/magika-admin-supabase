export interface Producto {
  id?: number;
  nombre: string;
  precio_base: number;
  descuento: number;
  stock: number;
  categoria?: string;      // ? significa que es opcional
  descripcion?: string;
  imagen_url?: string;
  fecha_creacion?: string | Date; // Acepta ambos para evitar el error
}