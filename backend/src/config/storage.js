import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'chesky-productos';

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabase = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    realtime: {
      transport: ws,
    },
  });
}

/**
 * Sube un archivo (Buffer) a Supabase Storage y retorna la URL pública.
 * @param {Buffer} buffer - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 * @param {string} mimetype - Tipo MIME del archivo
 * @returns {Promise<{imagenUrl: string, imagenPublicId: string}>}
 */
export const uploadToStorage = async (buffer, filename, mimetype) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase Storage no está configurado.');
  }

  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `articulos/${Date.now()}_${cleanName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir imagen a Supabase: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    imagenUrl: urlData.publicUrl,
    imagenPublicId: data.path, // Guardamos el path para poder eliminarla después
  };
};

/**
 * Elimina una imagen de Supabase Storage por su path (publicId).
 * @param {string} imagenPublicId - Path de la imagen en el bucket
 */
export const deleteFromStorage = async (imagenPublicId) => {
  if (!isSupabaseConfigured || !supabase || !imagenPublicId) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([imagenPublicId]);

  if (error) {
    console.warn('No se pudo eliminar imagen de Supabase Storage:', error.message);
  }
};

export { supabase, isSupabaseConfigured, BUCKET_NAME };
