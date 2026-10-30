import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${new Date().toISOString()}:`, err);

  // Errores de Multer (subida de archivos)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. El límite máximo es de 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: `Error al subir la imagen: ${err.message}`,
    });
  }

  // Errores conocidos de Prisma
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'campo único';
    return res.status(409).json({
      success: false,
      error: `Conflicto de unicidad: ya existe un registro con ese valor en (${target}).`,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'El registro solicitado no fue encontrado en la base de datos.',
    });
  }

  // Error genérico o personalizado
  const status = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';

  return res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
