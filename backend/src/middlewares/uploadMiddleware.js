import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { uploadToStorage, deleteFromStorage, isSupabaseConfigured } from '../config/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Filtro de formatos de imagen permitidos
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|avif|heic/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype.startsWith('image/');

  if (allowedExtensions.test(ext) || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Formato no soportado. Por favor sube una imagen JPG, PNG o WEBP.'), false);
  }
};

// Usar memoria RAM para procesar con Supabase o guardar en disco
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter,
});

/**
 * Procesa la imagen subida en la petición:
 * 1. Si Supabase está configurado -> la sube al bucket de Supabase Storage en la nube.
 * 2. Si no -> la guarda localmente en /uploads/ como fallback para desarrollo offline.
 * 
 * @param {import('express').Request} req 
 * @returns {Promise<{imagenUrl: string, imagenPublicId: string|null}|null>}
 */
export const processUploadedImage = async (req) => {
  if (!req.file) return null;

  if (isSupabaseConfigured) {
    // Subida directa a Supabase Storage
    const result = await uploadToStorage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    return result;
  } else {
    // Almacenamiento local en disco
    const ext = path.extname(req.file.originalname) || '.jpg';
    const cleanName = path.parse(req.file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `art_${Date.now()}_${cleanName}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, req.file.buffer);

    const host = req.get('host');
    const protocol = req.protocol;
    return {
      imagenUrl: `${protocol}://${host}/uploads/${filename}`,
      imagenPublicId: null,
    };
  }
};

export { deleteFromStorage };
